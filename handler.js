import {downloadMediaMessage, getContentType} from '@whiskeysockets/baileys';
import 'dotenv/config';
import {makeid} from './lib/makeid.js';
import dinero from 'dinero.js';
import crypto from 'crypto';
import fetch from 'node-fetch';

export default async function (sock, m) {
  const senderNumber = m.key.remoteJid;
  const groupMetadata = await sock.groupMetadata(senderNumber).catch((e) => {});
  const isGroup = senderNumber.endsWith('@g.us');
  let iki = m.args;
  console.log(m);
  // console.log('sdjsd;', groupMetadata);
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

  try {
    let prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : '/';
    const firstmess = body.startsWith(prefix);
    let pesan = body
      .replace(prefix, '')
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase();
    m.args = body.trim().split(/ +/).slice(1);
    let q = m.args.join('');
    if (firstmess) {
      let who = m.key.participant;
      switch (pesan) {
        case 'digi':
          {
            let order = '';
            if (!isGroup) return reply('hanya group');
            if (
              who == '6289649178812@s.whatsapp.net' ||
              who == '6281533852623@s.whatsapp.net' ||
              who == '6285293001966@s.whatsapp.net' ||
              who == '6285742736537@s.whatsapp.net'
            ) {
              let refId = makeid(7);
              const apiUrl = 'https://api.digiflazz.com/v1/transaction';
              const buyerSkuCode = m.args[0]; // Replace this with the product code
              const customerNo = m.args[1]; // Replace this with the customer's phone number
              order = buyerSkuCode;
              // Calculate the signature using the specified formula: md5(username + apiKey + ref_id)
              const signature = crypto
                .createHash('md5')
                .update(process.env.USERNAME_DIGI + process.env.APIKEY + refId)
                .digest('hex');
              console.log(signature);
              // Prepare the request body for initiating the transaction
              const makeRequestBody = {
                username: process.env.USERNAME_DIGI,
                buyer_sku_code: buyerSkuCode,
                customer_no: customerNo,
                ref_id: refId,
                sign: signature,
              };
              console.log(makeRequestBody);
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
┏━━ꕥ *「 DETAIL ORDERAN ${order.toUpperCase()}」* ꕥ━⬣
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
                      reply(`*Transaction failed.* ${data.data.rc}`);
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
                      +error,
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
        case 'saldo':
          {
            if (!isGroup) return reply('hanya group');
            if (
              who == '6289649178812@s.whatsapp.net' ||
              who == '6285293001966@s.whatsapp.net' ||
              who == '6285742736537@s.whatsapp.net'
            ) {
              const apiUrl = 'https://api.digiflazz.com/v1/cek-saldo';
              const signature = crypto
                .createHash('md5')
                .update(process.env.USERNAME_DIGI + process.env.APIKEY + 'depo')
                .digest('hex');
              console.log(signature);
              // Prepare the request body for initiating the transaction
              const makeRequestBody = {
                cmd: 'deposit',
                username: process.env.USERNAME_DIGI,
                sign: signature,
              };
              console.log(makeRequestBody);
              reply(`*PENGECEKAN SALDO*`);
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
                    let convert = dinero({
                      amount: data.data.deposit,
                      currency: 'IDR',
                      precision: 0,
                    }).toFormat();
                    console.log(convert);

                    let balas = `
┏━━ꕥ *「 SALDO YANG DIMILIKI 」* ꕥ━⬣
┃> *SISA SALDO:* ${convert}
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
        case 'list':
          {
            if (!isGroup) return reply('hanya group');
            if (
              who == '6289649178812@s.whatsapp.net' ||
              who == '6285293001966@s.whatsapp.net' ||
              who == '6285742736537@s.whatsapp.net'
            ) {
              const apiUrl = 'https://api.digiflazz.com/v1/price-list';
              const signature = crypto
                .createHash('md5')
                .update(
                  process.env.USERNAME_DIGI + process.env.APIKEY + 'pricelist',
                )
                .digest('hex');
              console.log(signature);
              // Prepare the request body for initiating the transaction
              const makeRequestBody = {
                cmd: 'prepaid',
                username: process.env.USERNAME_DIGI,
                sign: signature,
              };
              // console.log(makeRequestBody);
              reply(`*LIST HARGA SEDANG DIMUAT*`);
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
                    console.log(data);
                    let iki = '';
                    let balas = `
┏━━ꕥ *「 LIST HARGA 」* ꕥ━⬣
┃> *LIST SEMUA HARGA:* ${data.data.map(
                      (list) => `
┃>KATEGORI ${list.category}
┃>PRODUK ${list.product_name}
┃>NAMA SELLER ${list.seller_name}
┃>HARGA ${dinero({
                        amount: list.price,
                        currency: 'IDR',
                        precision: 0,
                      }).toFormat()}
┃>STATUS BUYER ${list.buyer_product_status}
┃>STATUS SELLER ${list.seller_product_status}
┃>CUT OFF ${list.start_cut_off}-${list.end_cut_off}
`,
                    )}┗━━━━━━━━━━━━━━━━━━━ꕥ`;
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
        case 'deposit':
          {
            let q = parseInt(m.args.join());
            if (!isGroup) return reply('hanya group');
            if (
              who == '6289649178812@s.whatsapp.net' ||
              who == '6285293001966@s.whatsapp.net' ||
              who == '6285742736537@s.whatsapp.net'
            ) {
              const apiUrl = 'https://api.digiflazz.com/v1/deposit';
              const signature = crypto
                .createHash('md5')
                .update(
                  process.env.USERNAME_DIGI + process.env.APIKEY + 'deposit',
                )
                .digest('hex');
              console.log(signature);
              // if (q != int) return reply('masukan nominal');
              console.log(typeof q);
              const makeRequestBody = {
                username: process.env.USERNAME_DIGI,
                amount: q,
                Bank: 'BCA',
                owner_name: 'ADYSTI EREN FATTAAH NURRIZQI',
                sign: signature,
              };
              console.log(makeRequestBody);
              reply(`*WAIT A MINUTE*`);
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
                    console.log(data);
                    const status = data.data.status;
                    if (data.data.rc != '00')
                      return reply(
                        `
┏━━ꕥ *「 DEPOSIT SALDO GAGAL 」* ꕥ━⬣
┃> *DEPOSIT:* ${data.data.deposit}
┃> *MESSAGE:* ${data.data.message}
┗━━━━━━━━━━━━━━━━━━━ꕥ;
                   `,
                      );

                    let balas = `
┏━━ꕥ *「 SALDO YANG DIMILIKI 」* ꕥ━⬣
┃> *NAMA BANK:* BCA
┃> *JUMLAH TRANSFER:* ${data.data.amount}
┃> *CATATAN:* ${data.data.notes}
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
        case 'digi2':
          {
            let order = '';
            if (!isGroup) return reply('hanya group');
            if (
              who == '6289649178812@s.whatsapp.net' ||
              who == '6281533852623@s.whatsapp.net' ||
              who == '6285293001966@s.whatsapp.net' ||
              who == '6285742736537@s.whatsapp.net'
            ) {
              let refId = makeid(7);
              const apiUrl = 'https://api.digiflazz.com/v1/transaction';
              const buyerSkuCode = m.args[0]; // Replace this with the product code
              const customerNo = m.args[1]; // Replace this with the customer's phone number
              order = buyerSkuCode;
              // Calculate the signature using the specified formula: md5(username + apiKey + ref_id)
              const signature = crypto
                .createHash('md5')
                .update(process.env.USERNAME_DIGI + process.env.APIKEY + refId)
                .digest('hex');
              console.log(signature);
              // Prepare the request body for initiating the transaction
              const makeRequestBody = {
                commands: 'pay-pasca',
                username: process.env.USERNAME_DIGI,
                buyer_sku_code: buyerSkuCode,
                customer_no: customerNo,
                ref_id: refId,
                sign: signature,
              };
              console.log(makeRequestBody);
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
                    console.log(data.data);

                    if (status === 'Pending') {
                      // Wait for a few seconds before checking the status again
                      setTimeout(() => {
                        checkTransactionStatus(); // Call the function again to check the status
                      }, 5000);
                    } else if (status === 'Gagal') {
                      reply(`*Transaction failed.* ${data.data.message}`);
                    } else {
                      let balas = `
┏━━ꕥ 「 DETAIL ORDERAN ${order.toUpperCase()}」 ꕥ━⬣
┃> NO ID PLN: ${data.data.customer_no}
┃> NAMA ${data.data.customer_name}
┃> BIAYA ADMIN ${data.data.admin}
┃> TARIF ${data.data.desc.tarif}
┃> DAYA ${data.data.desc.daya}
┃> LEMBAR TAGIHAN ${data.data.desc.lembar_tagihan}
┃> PERIODE BULAN ${data.data.desc.detail[0].periode}
┃> NILAI TAGIHAN ${data.data.desc.detail[0].nilai_tagihan}
┃> DENDA ${data.data.desc.detail[0].denda}
┃> METERAN AWAL ${data.data.desc.detail[0].meter_awal}
┃> METERAN AKHIR ${data.data.desc.detail[0].meter_akhir}
┃> STATUS: ${data.data.message}
┃> Ref_Id: ${data.data.ref_id}
┃> RC STATUS: ${data.data.rc}
┗━━━━━━━━━━━━━━━━━━━ꕥ`;
                      reply(balas);
                    }
                  })
                  .catch((error) => {
                    // Handle any errors that occur during the API request
                    console.error('Error:', error);
                    reply(
                      'Gagal memproses permintaan, silakan coba lagi nanti.',
                      +error,
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
        // case 'lop':
        //   {
        //     // for (var i = 0; i < 10; i++) {
        //     function anu() {
        //       if (!(iki = [])) {
        //         setTimeout(() => {
        //           // console.log(m);
        //           reply('dshldjds slknkndks snld');
        //           anu();
        //           // console.log(iki);
        //         }, 1000);
        //         // }
        //       } else {
        //         setTimeout(() => {
        //           // console.log(m.message.ephemeralMessage.message);
        //           // console.log(m);
        //           reply('zz  zz zzz');
        //           anu();
        //           // console.log(iki);
        //         }, 1000);
        //       }
        //     }
        //     anu();
        //   }

        //   break;
      }
    }
  } catch (error) {
    console.log(error);
  }
}
