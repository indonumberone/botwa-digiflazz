import express from "express";
import bodyParser from "body-parser";
import { DIGIFLAZZ_SECRET_KEY } from "../utils/digiflazz.js";
import createHmac from "create-hmac";
import { replyWIthInfo, reply } from "./messageHandle.js";
import { parseResMessage } from "../utils/parseResMessage.js";
global.ResponseTemp = {};

async function isValidSecretFun(xHubSignature, rawBody) {
  if (!xHubSignature) return false;
  const [algo, signed] = xHubSignature.split("=");
  if (algo !== "sha1") return false;

  // Create a signature using the raw body
  const computed = createHmac("sha1", DIGIFLAZZ_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  return computed === signed;
}

export async function createCallbackHandler(sock) {
  const app = express();
  const port = 9999;

  // Raw body buffer for signature verification
  app.use(
    express.json({
      verify: (req, res, buf) => {
        req.rawBody = buf.toString();
      },
    })
  );

  app.use(bodyParser.urlencoded({ extended: false }));

  app.listen(port, () => {
    if (sock) {
      console.log("express berjalan dan sock ada");
    } else {
      console.log("express berjalan dan sock tidak ada");
    }
  });

  app.get("/muncul", (req, res) => {
    res.status(200).send(global.ResponseTemp);
  });

  app.post("/webhookdigi", async (req, res) => {
    console.log("digi " + JSON.stringify(req.body.data));

    const isValidSecret = await isValidSecretFun(
      req.headers["x-hub-signature"],
      req.rawBody
    );

    if (!isValidSecret) {
      console.error("Invalid secret");
      return res.status(400).send("Invalid secret");
    } else {
      console.log("Valid secret");
      const {
        trx_id,
        ref_id,
        customer_no,
        buyer_sku_code,
        message,
        status,
        rc,
        buyer_last_saldo,
        sn,
        price,
        tele,
        wa,
      } = req.body.data;
      console.log("Response Status", status);

      console.log("Ref ID", ref_id);
      if (
        global.ResponseTemp[ref_id] &&
        global.ResponseTemp[ref_id].data.ref_id === ref_id
      ) {
        const { m } = global.ResponseTemp[ref_id];

        if (status === "Sukses") {
          console.log("Transaksi Sukses");
          const responseMessage = await parseResMessage(
            status,
            ref_id,
            buyer_sku_code,
            customer_no,
            price,
            sn
          );
          replyWIthInfo(sock, m, responseMessage);
          delete global.ResponseTemp[ref_id];
        } else if (status === "Gagal") {
          console.log("Transaksi Gagal");
          const responseMessage = await parseResMessage(
            status,
            ref_id,
            buyer_sku_code,
            customer_no,
            price,
            sn
          );
          replyWIthInfo(sock, m, responseMessage);
          delete global.ResponseTemp[ref_id];
        } else if (status === "Pending") {
          console.log("Transaksi Pending");
          const responseMessage = await parseResMessage(
            status,
            ref_id,
            buyer_sku_code,
            customer_no,
            price,
            sn
          );
          replyWIthInfo(sock, m, responseMessage);
          // Don't delete from ResponseTemp for pending transactions
        } else {
          console.log(`Transaksi status: ${status}`);
          replyWIthInfo(
            sock,
            m,
            `Status transaksi: ${status} dengan Ref ID ${ref_id}`
          );
        }
      } else {
        console.log("Data tidak ada atau format tidak sesuai");
      }
    }
    res.status(200).send("OK");
  });
}
