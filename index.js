import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import handler from './handler.js';
import express from 'express';
import bodyParser from 'body-parser';
import 'dotenv/config';
import axios from 'axios';

async function connectToWhatsApp() {
  const {state, saveCreds} = await useMultiFileAuthState('login');
  const {version, isLatest} = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('connection.update', async (update) => {
    const {connection, lastDisconnect} = update;
    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log(
        'connection closed due to',
        lastDisconnect.error,
        ', reconnecting',
        shouldReconnect,
      );

      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('opened connection');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    m.messages.forEach(async (message) => {
      await handler(sock, message, m);
    });
  });
}
export const app = express();
export const port = 3030;
export let testResponses = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});
app.post('/webhook', (req, res) => {
  // console.log(req);
  const refid = req.body.data.ref_id;
  testResponses[refid] = req.body;
  // console.log(testResponses[refid]);
  res.status(200).send('rcti ok');
});
app.get('/test', (req, res) => {
  const refid = req.query.refid;
  if (!refid) {
    return res.status(400).send({
      status: 'failed',
      error_msg: 'query salah',
    });
  }
  const data = testResponses[refid];
  res.status(200).send(data);
});

// app.get('/kirim', (req, res) => {});

app.listen(port, () => {
  console.log('express berjalan');
});

connectToWhatsApp();
