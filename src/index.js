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
import fs from "fs/promises";

let botStartTime = null;
let isConnected = false;
let notifiedChats = new Set();

export const app = express();
export const port = process.env.PORT || 3030;
export let testResponses = {};

app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(bodyParser.urlencoded({ extended: false }));

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("src/login");
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    syncFullHistory: false,
    markOnlineOnConnect: true,
  });

  // Pass app instance to callback handler
  await createCallbackHandler(sock, app);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log("Scan QR above via WhatsApp → Linked devices");
    }
    if (connection === "close") {
      isConnected = false;
      notifiedChats.clear();

      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(
        "connection closed due to",
        lastDisconnect.error,
        ", reconnecting",
        shouldReconnect
      );

      // Handle 401 error (logout) - clear session and reconnect
      if (statusCode === 401 || statusCode === DisconnectReason.loggedOut) {
        console.log("Session expired/logged out. Clearing session data...");
        try {
          await fs.rm("src/login", { recursive: true, force: true });
          await fs.mkdir("src/login", { recursive: true });
          console.log("Session cleared. Reconnecting for new QR...");
        } catch (err) {
          console.error("Error clearing session:", err);
        }
        connectToWhatsApp();
      } else if (shouldReconnect) {
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

app.listen(port, () => {
  console.log(`Express running on port ${port}`);
});

connectToWhatsApp();
