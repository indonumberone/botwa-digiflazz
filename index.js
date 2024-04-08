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
const port = 3000;

// export const pendingTransactions = new Map();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

app.get('/kirim', (req, res) => {});
export let testResponses = {};
// app.post('/test', (req, res) => {
//   let data = req.body;
// });
app.listen(3030, () => {
  console.log('express berjalan');
});
// run in main file
connectToWhatsApp();
