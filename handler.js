import {downloadMediaMessage, getContentType} from '@whiskeysockets/baileys';
import 'dotenv/config';
import {makeid} from './lib/makeid.js';
import fs from 'fs';
import crypto from 'crypto';

export default async function (sock, m) {
  const senderNumber = m.key.remoteJid;
  // const body =
  //   message.message.conversation ||
  //   (message.message.extendedTextMessage &&
  //     message.message.extendedTextMessage.text) ||
  //   (message.imageMessage && message.imageMessage.caption) ||
  //   (message.videoMessage && message.videoMessage.caption);

  if (m.message) {
    m.mtype = getContentType(m.message);

    // console.log(m);
    // console.log('tewstttsdttd ini yang anuu');
    // m.mtype.imageMessage
    //   ? console.log("ini conversation")
    //   : console.log("ini nganuuu", m.message.extendedTextMessage.quotedMessage);

    try {
      var body =
        m.mtype === 'conversation'
          ? m.message.conversation
          : m.mtype == 'imageMessage'
          ? m.message.imageMessage.caption
          : m.mtype == 'videoMessage'
          ? m.message.videoMessage.caption ||
            m.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage
          : m.mtype == 'extendedTextMessage'
          ? m.message.extendedTextMessage.text ||
            m.message.extendedTextMessage.contextInfo.quotedMessage.conversation
          : m.mtype == 'ephemeralMessage'
          ? m.message.ephemeralMessage.message.extendedTextMessage.text
          : m.mtype == 'buttonsResponseMessage'
          ? m.message.buttonsResponseMessage.selectedButtonId
          : m.mtype == 'listResponseMessage'
          ? m.message.listResponseMessage.singleSelectReply.selectedRowId
          : m.mtype == 'templateButtonReplyMessage'
          ? m.message.templateButtonReplyMessage.selectedId
          : m.mtype === 'messageContextInfo'
          ? m.message.buttonsResponseMessage?.selectedButtonId ||
            m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
            m.text
          : '';
    } catch (e) {
      console.log(e);
    }
  }

  const reply = async (text) => {
    await sock.sendMessage(senderNumber, {text}, {quoted: m});
  };

  let prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : '/';
  const firstmess = body.startsWith(prefix);
  let pesan = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase();
  m.args = body.trim().split(/ +/).slice(1);

  try {
    if (firstmess) {
      let who = m.key.participant;
      switch (pesan) {
        case 'digi':
          {
            if (who == '6289649178812@s.whatsapp.net') {
              let refId = makeid(7);
              const apiUrl = 'https://api.digiflazz.com/v1/transaction';
              const buyerSkuCode = m.args[0]; // Replace this with the product code
              const customerNo = m.args[1]; // Replace this with the customer's phone number

              // Calculate the signature using the specified formula: md5(username + apiKey + ref_id)
              const signature = crypto
                .createHash('md5')
                .update(username + process.env.APIKEY + refId)
                .digest('hex');

              // Prepare the request body for initiating the transaction
              const makeRequestBody = {
                username: process.env.USERNAME,
                buyer_sku_code: buyerSkuCode,
                customer_no: customerNo,
                ref_id: process.env.APIKEY,
                sign: signature,
              };
              reply(`*TUNGGU SEBENTAR YAK*`);
              function checkTransactionStatus() {
                // Make the POST request to initiate the transaction
                fetch(apiUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(makeRequestBody),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    const status = data.data.status;
                    let balas = `
              ┏━━ꕥ *「 DETAIL ORDERAN 」* ꕥ━⬣
              ┃> *ID GAME:* ${data.data.customer_no}
              ┃> *PRODUK:* ${data.data.buyer_sku_code}
              ┃> *SN:* ${data.data.sn}
              ┃> *STATUS:* ${data.data.message}
              ┃> *Ref_Id:* ${data.data.ref_id}
              ┃> *RC STATUS:* ${data.data.rc}
              ┗━━━━━━━━━━━━━━━━━━━ꕥ`;

                    if (status === 'Pending') {
                      // Wait for a few seconds before checking the status again
                      setTimeout(() => {
                        checkTransactionStatus(); // Call the function again to check the status
                      }, 5000);
                    } else if (status === 'Gagal') {
                      reply(`*Transaction failed.* ${data.data.message}`);
                    } else {
                      // If the status is not 'Pending' or 'Failed', set the reply
                      reply(balas);
                    }
                  })
                  .catch((error) => {
                    // Handle any errors that occur during the API request
                    console.error('Error:', error);
                    reply(
                      'Gagal memproses permintaan, silakan coba lagi nanti.',
                    );
                  });
              }

              // Call the function to initiate the API request and check the status
              checkTransactionStatus();
            } else {
              let penyusub = m.key.participant.split('@')[0];
              var kirimke = '6289649178812@s.whatsapp.net';
              sock.sendMessage(kirimke, {
                text: `penyusub ki ${penyusub}`,
              });
            }
          }
          break;
        case 'test':
          reply(process.env.APIKEY);
      }
    }
  } catch (error) {
    console.log(error);
  }
}
