import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import handler from "./handler.js";
import qrcode from "qrcode-terminal";
import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import { createCallbackHandler } from "./lib/callbackHandler.js";

let botStartTime = null;
let isConnected = false;
let notifiedChats = new Set();

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("src/login");
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    syncFullHistory: false,
    markOnlineOnConnect: true,
  });
  await createCallbackHandler(sock);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log("Scan QR above via WhatsApp → Linked devices");
    }
    if (connection === "close") {
      isConnected = false;
      notifiedChats.clear();
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log(
        "connection closed due to",
        lastDisconnect.error,
        ", reconnecting",
        shouldReconnect
      );

      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("opened connection");
      botStartTime = Date.now();
      isConnected = true;
      notifiedChats.clear();
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async (m) => {
    for (const message of m.messages) {
      if (message.key.fromMe) {
        continue;
      }

      if (message.key.remoteJid === "status@broadcast") {
        continue;
      }

      const messageTimestamp = message.messageTimestamp
        ? parseInt(message.messageTimestamp) * 1000
        : Date.now();
      if (isConnected && botStartTime && messageTimestamp >= botStartTime) {
        await handler(sock, message, m);
      } else {
        if (message.key && message.key.remoteJid) {
          const chatId = message.key.remoteJid;

          if (!notifiedChats.has(chatId)) {
            notifiedChats.add(chatId);
            await sock.sendMessage(chatId, {
              text: "Bot sedang melakukan Sycronisasi, silakan tunggu sebentar yaa...",
            });
          }

          await sock.readMessages([message.key]);
          console.log(
            `Skipped old message from ${chatId} (received before bot started)`
          );
        }
      }
    }
  });
}
export const app = express();
export const port = process.env.PORT || 3030;
export let testResponses = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(port, () => {
  console.log("express berjalan");
});

connectToWhatsApp();
