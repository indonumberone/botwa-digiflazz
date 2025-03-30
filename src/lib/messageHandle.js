export const replyWIthInfo = async (sock, m, text) => {
  const senderNumber = m.key.remoteJid;
  await sock.sendMessage(
    senderNumber,
    {
      text: text,
      contextInfo: {
        forwardingScore: 555,
        isForwarded: true,
        externalAdReply: {
          title: "SELAMAT DATANG DI JAVAN SHOP ID\nSELAMAT BERBELANJA",
          body: "ingin bergabung jadi resseler?",
          mediaType: 1,
          description: "topup",
          previewType: 3,
          thumbnailUrl: "https://i.postimg.cc/J0sPnypG/image.jpg",
          sourceUrl: "https://wa.me/6289649178812",
          containsAutoReply: false,
          renderLargerThumbnail: true,
          showAdAttribution: false,
        },
      },
    },
    { quoted: m }
  );
};

export const reply = async (sock, m, text) => {
  const senderNumber = m.key.remoteJid;
  await sock.sendMessage(
    senderNumber,
    {
      text,
    },
    { quoted: m }
  );
};
