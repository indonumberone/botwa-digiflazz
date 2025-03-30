import {
  downloadMediaMessage,
  generateWAMessageFromContent,
  getContentType,
} from "@whiskeysockets/baileys";
import "dotenv/config";
import { replyWIthInfo, reply } from "./lib/messageHandle.js";
import { createDigiTRX, createDeposit, checkSaldo } from "./lib/createTRX.js";
import { testResponses } from "./index.js";
import { generateUserId } from "./lib/makeid.js";
import { OWNER_NUMBER } from "./utils/owner.js";
import { parseResMessage } from "./utils/parseResMessage.js";
import { parse } from "path";
export default async function handler(sock, m) {
  const senderNumber = m.key.remoteJid;
  const isGroup = senderNumber.endsWith("@g.us");
  const groupMetadata = isGroup
    ? await sock.groupMetadata(senderNumber).catch(() => {})
    : null;

  if (m.message) {
    m.mtype = getContentType(m.message);

    try {
      var body =
        m.mtype === "conversation"
          ? m.message.conversation
          : m.mtype == "imageMessage"
          ? m.message.imageMessage.caption
          : m.mtype == "videoMessage"
          ? m.message.videoMessage.caption ||
            m.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage
          : m.mtype == "extendedTextMessage"
          ? m.message.extendedTextMessage.text ||
            m.message.extendedTextMessage.contextInfo.quotedMessage.conversation
          : m.mtype == "ephemeralMessage"
          ? m.message.ephemeralMessage.message.extendedTextMessage.text
          : m.mtype == "buttonsResponseMessage"
          ? m.message.buttonsResponseMessage.selectedButtonId
          : m.mtype == "listResponseMessage"
          ? m.message.listResponseMessage.singleSelectReply.selectedRowId
          : m.mtype == "templateButtonReplyMessage"
          ? m.message.templateButtonReplyMessage.selectedId
          : m.mtype === "messageContextInfo"
          ? m.message.buttonsResponseMessage?.selectedButtonId ||
            m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
            m.text
          : "";
    } catch (e) {
      console.log(e);
    }
  }

  try {
    let prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";
    const firstmess = body.startsWith(prefix);
    let pesan = body
      .replace(prefix, "")
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase();
    m.args = body.replace(prefix, "").trim().split(/ +/).slice(1);
    console.log(m.args);
    let q = m.args.join(" ");

    if (firstmess) {
      let who = m.key.participant;
      switch (pesan) {
        case "q":
          {
            await reply(sock, m, "halo tes");

            console.log(testResponses);
          }
          break;
        case "digi":
          if (!OWNER_NUMBER.includes(who)) {
            await reply(
              sock,
              m,
              "perintah hanya untuk Owner\n Kamu bukan owner !!!"
            );
            return;
          }
          if (m.args.length < 2)
            return await reply(sock, m, "Masukan nomor dan nominal!!!");
          let refId = await generateUserId();
          let results = await createDigiTRX(refId, m.args[0], m.args[1], m);
          if (results === "Sukses") {
            const responseMessage = await parseResMessage(
              results,
              refId,
              m.args[0],
              m.args[1],
              global.ResponseTemp[refId].data.price,
              global.ResponseTemp[refId].data.sn
            );
            await replyWIthInfo(sock, m, responseMessage);
            delete global.ResponseTemp[refId];
          } else if (results === "Pending") {
            const responseMessage = await parseResMessage(
              results,
              refId,
              m.args[0],
              m.args[1],
              global.ResponseTemp[refId].data.price,
              global.ResponseTemp[refId].data.sn
            );
            await replyWIthInfo(sock, m, responseMessage);
          }
          break;
        case "deposit":
          {
            if (!OWNER_NUMBER.includes(who)) {
              await reply(
                sock,
                m,
                "perintah hanya untuk Owner\n Kamu bukan owner !!!"
              );
              return;
            }
            if (m.args.length < 1 && m.args[0] != parseInt(m.args[0]))
              return await reply(sock, m, "Masukan nominal deposit!!!");
            const amount = parseInt(m.args[0]);
            let results = await createDeposit(amount);
            console.log("reuslt", results);
            const resultAmount = parseInt(results.data.amount);
            const responseMessage =
              "Silahkan melakukan deposit dengan nominal " +
              resultAmount +
              "\n*" +
              results.data.notes +
              "*";

            console.log(responseMessage);
            await reply(sock, m, responseMessage);

            await reply(sock, m, String(results.data.amount));
            console.log(results);
          }
          break;
        case "saldo":
          {
            if (!OWNER_NUMBER.includes(who)) {
              await reply(
                sock,
                m,
                "perintah hanya untuk Owner\n Kamu bukan owner !!!"
              );
              return;
            }
            let results = await checkSaldo();
            console.log("saldo", results);
            const responseMessage = "Saldo anda saat ini " + results;
            console.log(responseMessage);
            await reply(sock, m, responseMessage);
          }

          break;
      }
    }
  } catch (error) {
    console.log(error);
  }
}
