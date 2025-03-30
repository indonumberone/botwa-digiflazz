export async function parseResMessage(
  status,
  ref_id,
  buyer_sku_code,
  customer_no,
  price,
  sn
) {
  if (status == "Sukses") {
    const responseMessage =
      `✅ *Transaksi Sukses*\n\n` +
      `📋 *Ref ID:* ${ref_id}\n` +
      `📱 *Produk:* ${buyer_sku_code}\n` +
      `👤 *Nomor:* ${customer_no}\n` +
      `💰 *Harga:* Rp ${price.toLocaleString("id-ID")}\n` +
      `🔢 *SN:* ${sn || "-"}\n` +
      `⏱️ *Waktu:* ${new Date().toLocaleString("id-ID")}`;
    return responseMessage;
  } else if (status == "Gagal") {
    const responseMessage =
      `❌ *Transaksi Gagal*\n\n` +
      `📋 *Ref ID:* ${ref_id}\n` +
      `📱 *Produk:* ${buyer_sku_code}\n` +
      `👤 *Nomor:* ${customer_no}\n` +
      `💰 *Harga:* Rp ${price.toLocaleString("id-ID")}\n` +
      `🔢 *SN:* ${sn || "-"}\n` +
      `⏱️ *Waktu:* ${new Date().toLocaleString("id-ID")}`;
    return responseMessage;
  } else if (status == "Pending") {
    const responseMessage =
      `⏳ *Transaksi Pending*\n\n` +
      `📋 *Ref ID:* ${ref_id}\n` +
      `📱 *Produk:* ${buyer_sku_code}\n` +
      `👤 *Nomor:* ${customer_no}\n` +
      `💰 *Harga:* Rp ${price.toLocaleString("id-ID")}\n` +
      `🔢 *SN:* ${sn || "-"}\n` +
      `⏱️ *Waktu:* ${new Date().toLocaleString("id-ID")}`;
    return responseMessage;
  }
}
