import {downloadMediaMessage, getContentType} from '@whiskeysockets/baileys';
import 'dotenv/config';
import {makeid} from './lib/makeid.js';
import dinero from 'dinero.js';
import crypto from 'crypto';
import fetch from 'node-fetch';
import axios from 'axios';
import {app} from './index.js';
import {testResponses} from './index.js';
export default async function handler(sock, m) {
  const senderNumber = m.key.remoteJid;
  const groupMetadata = await sock.groupMetadata(senderNumber).catch((e) => {});
  const isGroup = senderNumber.endsWith('@g.us');

  if (m.message) {
    m.mtype = getContentType(m.message);

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

  const replyWIthInfo = async (text) => {
    await sock.sendMessage(
      senderNumber,
      {
        text: text,
        contextInfo: {
          forwardingScore: 555,
          isForwarded: true,
          externalAdReply: {
            title: 'SELAMAT DATANG DI JAVAN SHOP ID\nSELAMAT BERBELANJA',
            body: 'ingin bergabung jadi resseler?',
            mediaType: 1,
            description: 'topup',
            previewType: 3,
            thumbnailUrl: 'https://i.postimg.cc/J0sPnypG/image.jpg',
            sourceUrl: 'https://wa.me/6289649178812',
            containsAutoReply: false,
            renderLargerThumbnail: true,
            showAdAttribution: false,
          },
        },
      },
      {quoted: m},
    );
  };

  const reply = async (text) => {
    await sock.sendMessage(
      senderNumber,
      {
        text,
      },
      {quoted: m},
    );
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
    m.args = body.replace(prefix, '').trim().split(/ +/).slice(1);
    console.log(m.args);
    let q = m.args.join(' ');

    if (firstmess) {
      let who = m.key.participant;
      const checking =
        who == process.env.OWNER1 ||
        who == process.env.OWNER2 ||
        who == process.env.OWNER3 ||
        who == process.env.OWNER4;
      switch (pesan) {
        case 'q':
          {
            console.log(testResponses);
          }
          break;
        case 'digi':
          if (!checking) return reply('ONLY OWNER');
          if (!isGroup) return reply('ONLY GROUP');
          {
            console.log(m.args.length);
            if (m.args.length <= 0) {
              return reply('contoh .digi kode_produk no_buyer_sku');
            }
            let order = '';
            let refId = makeid(7);
            const apiUrl = process.env.APIDIGI;
            const buyerSkuCode = m.args[0];
            const customerNo = m.args[1];
            order = buyerSkuCode;
            async function responseReply(data) {
              if (!data) {
                console.log('data kosong');
                console.log(data);
              }
              const {customer_no, buyer_sku_code, sn, message, ref_id, rc} =
                data;
              return `
┏━━ꕥ *「 DETAIL ORDERAN ${order.toUpperCase()}」* ꕥ━⬣
┃> *ID GAME:* ${customer_no}
┃> *PRODUK:* ${buyer_sku_code}
┃> *SN:* ${sn}
┃> *STATUS:* ${message}
┃> *Ref_Id:* ${ref_id}
┃> *RC STATUS:* ${rc}
┗━━━━━━━━━━━━━━━━━━━ꕥ`;
            }
            async function cekPending(refId) {
              try {
                const cekData = await axios.get(
                  'http://localhost:3030/test?refid=' + refId,
                );
                if (!cekData.data || cekData.data.data === 'Pending') {
                  await new Promise((resolve) => setTimeout(resolve, 5000));
                  cekPending(refId);
                } else if (cekData.data.data) {
                  const replyMessage = await responseReply(cekData.data.data);
                  console.log(replyMessage);
                  return replyWIthInfo(replyMessage);
                }
              } catch (error) {
                console.error('Error fetching data:', error);
              }
            }

            const signature = crypto
              .createHash('md5')
              .update(process.env.USERNAME_DIGI + process.env.APIKEY + refId)
              .digest('hex');

            const makeRequestBody = {
              username: process.env.USERNAME_DIGI,
              buyer_sku_code: buyerSkuCode,
              customer_no: customerNo,
              ref_id: refId,
              sign: signature,
            };
            console.log(makeRequestBody);
            reply('Transaksi dengan refid' + refId + 'sedang di proses');
            try {
              const response = await axios.post(apiUrl, makeRequestBody, {
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              console.log(response.data.data);

              if (response.data.data.status == 'Pending') {
                cekPending(refId);
              } else {
                const replyMessage = await responseReply(response.data.data);
                return replyWIthInfo(replyMessage);
              }
            } catch (error) {
              console.error('Error:', error.response.data.data.message);

              await sock.sendMessage(senderNumber, {
                text:
                  'Transaksi gagal dilakukan. Mohon coba lagi nanti.\n' +
                  error.response.data.data.message,
              });
            }
          }
          break;

        case 'saldo':
          {
            if (!isGroup) return reply('hanya group');
            if (
              who == process.env.OWNER1 ||
              who == process.env.OWNER2 ||
              who == process.env.OWNER3 ||
              who == process.env.OWNER4
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
              who == process.env.OWNER1 ||
              who == process.env.OWNER2 ||
              who == process.env.OWNER3 ||
              who == process.env.OWNER4
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
        case 'setkios':
          process.env.KIOSGAMER = m.args[0];

          // console.log(process.env.KIOSGAMER);
          break;
        case 'topup':
        case 'tp':
          {
            let order = '';
            if (!isGroup) return reply('hanya group');
            if (
              who == process.env.OWNER1 ||
              who == process.env.OWNER2 ||
              who == process.env.OWNER3 ||
              who == process.env.OWNER4
            ) {
              let retries = 0;
              const maxRetries = 36;
              let refId = makeid(7);
              const merchant_id = process.env.MERCHANT_ID;

              const signatureInput = `${merchant_id}:${process.env.SIGNATUREAPI}:${refId}`;
              const signature = crypto
                .createHash('md5')
                .update(signatureInput)
                .digest('hex');
              const kode_produk = m.args[0];
              const id = m.args[1];
              const server = m.args[2] == true ? m.args[2] : '';
              reply(`*TUNGGU SEBENTAR YAK*`);
              async function lesgo() {
                try {
                  const data = await axios.get(
                    `https://v1.apigames.id/v2/transaksi?ref_id=${refId}&merchant_id=${process.env.MERCHANT_ID}&produk=${kode_produk}&tujuan=${id}&signature=${signature}&server_id=${server}`,
                  );

                  console.log(data.data);
                  // console.log(data.data.status);
                  if (data.data.data.status === 'Sukses') {
                    const balas = `
┏━━ꕥ *「 DETAIL ORDERAN ${kode_produk.toUpperCase()}」* ꕥ━⬣
┃> *ID GAME:* ${data.data.data.destination}
┃> *PRODUK:* ${data.data.data.product_code}
┃> *SN:* ${data.data.data.sn}
┃> *STATUS:* ${data.data.data.status}
┃> *Ref_Id:* ${data.data.data.ref_id}
┗━━━━━━━━━━━━━━━━━━━ꕥ`;
                    replyWIthInfo(balas);
                  } else if (data.data.data.status == 'Pending') {
                    if (retries < maxRetries) {
                      retries++;
                      await new Promise((resolve) => setTimeout(resolve, 5000));
                      lesgo();
                    } else {
                      setReply('Bentar status masih pending harap tunggu');
                      lesgo();
                    }
                  } else {
                    let error =
                      data.data.error_msg == true
                        ? data.data.error_msg
                        : data.data.data.message;
                    reply(`ERROR!!!!! \n ${error}`);
                  }
                  // const apiUrl = process.env.APIGAMES;
                  // const buyerSkuCode = m.args[0]; // Replace this with the product code
                  // const customerNo = m.args[1]; // Replace this with the customer's phone number
                  // const serverID = m.args.length == 3 ? m.args[2] : '';

                  // const makeRequestBody = {
                  //   ref_id: refId,
                  //   merchant_id: merchant_id,
                  //   produk: buyerSkuCode,
                  //   tujuan: customerNo,
                  //   server_id: serverID,
                  //   signature: signature,
                  // };
                  // console.log(makeRequestBody);
                  // reply(`*TUNGGU SEBENTAR YAK*`);
                  // async function checkTransactionStatus() {
                  //   // Make the POST request to initiate the transaction
                  //   try {
                  //     const response = await axios.post(
                  //       apiUrl,
                  //       JSON.stringify(makeRequestBody),
                  //     );
                  //     console.log(response.data);
                  //     const status =
                  //       response.data.data.status == true
                  //         ? response.data.data.status
                  //         : response.data.status;
                  //     console.log(status);
                  //     //                   const balas = `
                  //     // ┏━━ꕥ *「 DETAIL ORDERAN ${order.toUpperCase()}」* ꕥ━⬣
                  //     // ┃> *ID GAME:* ${response.data.destination}
                  //     // ┃> *PRODUK:* ${response.data.product_code}
                  //     // ┃> *SN:* ${response.data.sn}
                  //     // ┃> *STATUS:* ${response.data.message}
                  //     // ┃> *Ref_Id:* ${response.data.sdfsdx2}
                  //     // ┃> *Trx_Id:* ${response.data.sdfsdx2}
                  //     // ┃> *RC STATUS:* ${response.data.rc}
                  //     // ┗━━━━━━━━━━━━━━━━━━━ꕥ`;
                  //     if (status === 'Pending') {
                  //       // Wait for a few seconds before checking the status again
                  //       setTimeout(() => {
                  //         checkTransactionStatus(); // Call the function again to check the status
                  //       }, 5000);
                  //     } else if (status == 0) {
                  //       // If the status is not 'Pending' or 'Failed', set the reply
                  //       reply(
                  //         'Gagal memproses permintaan, silakan coba lagi nanti.' +
                  //           response.data.error_msg,
                  //       );
                  //     }
                  //   } catch (error) {
                  //     // Handle any errors that occur during the API request
                  //     console.error('Error:', error);
                  //     reply(
                  //       'kjjkj Gagal memproses permintaan, silakan coba lagi nanti.',
                  //       +error,
                  //     );
                  //   }
                  // }

                  // // Call the function to initiate the API request and check the status
                  // checkTransactionStatus();
                } catch (err) {
                  console.log(err);
                }
              }
              lesgo();
            } else {
              let penyusub = m.key.participant.split('@')[0];
              var kirimke = '6289649178812@s.whatsapp.net';
              sock.sendMessage(kirimke, {
                text: `penyusub ki ${penyusub}`,
              });
            }
          }
          break;
      }
    }
  } catch (error) {
    console.log(error);
  }
}
