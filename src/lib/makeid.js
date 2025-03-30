import crypto from "crypto";

export const makeid = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export async function generateUserId(prefix = "JVN") {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");

  const randomChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const random = Array.from(
    { length: 4 },
    () => randomChars[Math.floor(Math.random() * randomChars.length)]
  ).join("");

  const timestamp = date.getTime().toString();
  const hash = crypto
    .createHash("sha256")
    .update(timestamp + random)
    .digest("hex")
    .slice(0, 4)
    .toUpperCase();

  return `${prefix}${year}${month}${random}${hash}`;
}

// export default generateUserId;

// console.log(await generateUserId());
