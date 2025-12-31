import axios from "axios";
import {
  DIGIFLAZZ_BASE_URL,
  DIGIFLAZZ_API_KEY,
  USERNAME_DIGIFLAZZ,
} from "../utils/digiflazz.js";
import { OWNER_NAME } from "../utils/owner.js";
import crypto from "crypto";
import dinero from "dinero.js";

// Inisialisasi global.ResponseTemp jika belum ada
if (!global.ResponseTemp) {
  global.ResponseTemp = {};
}

if (!DIGIFLAZZ_BASE_URL || !DIGIFLAZZ_API_KEY || !USERNAME_DIGIFLAZZ) {
  console.error("Missing required environment variables:");
  console.error("DIGIFLAZZ_BASE_URL:", DIGIFLAZZ_BASE_URL);
  console.error("DIGIFLAZZ_API_KEY:", DIGIFLAZZ_API_KEY ? "SET" : "NOT SET");
  console.error("USERNAME_DIGIFLAZZ:", USERNAME_DIGIFLAZZ);
  throw new Error("Required environment variables are not set");
}

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
      cb_url: "https://javansolo.muqsith.me/webhookdigi",
    };
    const res = await axios.post(`${DIGIFLAZZ_BASE_URL}v1/transaction`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { ref_id, status, rc, price, sn, buyer_sku_code } = res.data.data;
    // return status;
    // console.log("res transaksi", res.data);
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

export async function createDeposit(amount) {
  const sign = crypto
    .createHash("md5")
    .update(USERNAME_DIGIFLAZZ + DIGIFLAZZ_API_KEY + "deposit")
    .digest("hex");

  try {
    const data = {
      username: USERNAME_DIGIFLAZZ,
      amount: amount,
      Bank: "BCA", //ubah aja sesuai bank yang diinginkan
      owner_name: OWNER_NAME,
      sign: sign,
    };
    const res = await axios.post(`${DIGIFLAZZ_BASE_URL}v1/deposit`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("res deposit", res.data);
    return res.data;
  } catch (error) {
    console.error("Error deposit:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

export async function checkSaldo(params) {
  const sign = crypto
    .createHash("md5")
    .update(USERNAME_DIGIFLAZZ + DIGIFLAZZ_API_KEY + "depo")
    .digest("hex");

  try {
    const data = {
      username: USERNAME_DIGIFLAZZ,
      sign: sign,
    };
    const res = await axios.post(`${DIGIFLAZZ_BASE_URL}v1/cek-saldo`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("res deposit", res.data);
    const depositAmount = parseInt(res.data.data.deposit, 10);
    let saldo = await dinero({
      amount: depositAmount,
      currency: "IDR",
      precision: 0,
    }).toFormat();
    return saldo;
  } catch (error) {
    console.error("Error deposit:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
}
// await digiflazzTrx.transaksi(generateReffId(), "xld10", "087800001233");

// Test transaksi
// await createDigiTRX("test12345", "xld10", "087800001233");
