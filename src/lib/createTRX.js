import axios from "axios";
import {
  DIGIFLAZZ_BASE_URL,
  DIGIFLAZZ_API_KEY,
  USERNAME_DIGIFLAZZ,
} from "../utils/digiflazz.js";
import crypto from "crypto";

export async function createDigiTRX(refId, produk_sku, customer_no, m) {
  const sign = crypto
    .createHash("md5")
    .update(USERNAME_DIGIFLAZZ + DIGIFLAZZ_API_KEY + refId)
    .digest("hex");
  try {
    const data = {
      username: USERNAME_DIGIFLAZZ,
      buyer_sku_code: produk_sku,
      ref_id: refId,
      customer_no: customer_no,
      sign: sign,
      testing: true,
      cb_url: "https://tes.javanshopid.biz.id/webhookdigi",
    };
    const res = await axios.post(`${DIGIFLAZZ_BASE_URL}v1/transaction`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("ID wa neee ");
    console.log("respon transaksi:", res.data.data);

    const { ref_id, status, rc, price, sn, buyer_sku_code } = res.data.data;
    // return status;
    if (status === "Pending") {
      global.ResponseTemp[refId] = {
        jenis: "Transaksi",
        data: {
          ref_id: refId,
          status: status,
          rc: rc,
          price: price,
          sn: sn,
          buyer_sku_code: buyer_sku_code,
        },
        m: m,
      };
      return "Pending";
    } else if (status === "Sukses") {
      global.ResponseTemp[refId] = {
        jenis: "Transaksi",
        data: {
          ref_id: ref_id,
          status: status,
          rc: rc,
          price: price,
          sn: sn,
          buyer_sku_code: buyer_sku_code,
        },

        m: m,
      };
      return "Sukses";
    } else if (status === "Gagal") {
      global.ResponseTemp[refId] = {
        jenis: "Transaksi",
        data: {
          ref_id: ref_id,
          status: status,
          rc: rc,
          price: price,
          sn: sn,
          buyer_sku_code: buyer_sku_code,
        },

        m: m,
      };
      return "Gagal";
    }
  } catch (error) {
    console.error("Error transaksi:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

/*
respon transaksi: {
  ref_id: 'TX202502110828104562',
  customer_no: '08780000123',
  buyer_sku_code: 'xld10',
  message: '',
  status: 'Pending',
  rc: '',
  buyer_last_saldo: 990000,
  sn: '',
  price: 10000,
  tele: '@telegram',
  wa: '081234512345'
}
*/
// const digiflazzTrx = new DigiflazzTrx();
// await digiflazzTrx.transaksi(generateReffId(), "xld10", "087800001233");
