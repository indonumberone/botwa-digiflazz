import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../../.env") });

const isDevelopment = process.env.NODE_ENV === "development";
export const DIGIFLAZZ_API_KEY = isDevelopment
  ? process.env.DIGIFLAZZ_API_KEY_DEV
  : process.env.DIGIFLAZZ_API_KEY;

export const DIGIFLAZZ_BASE_URL = process.env.DIGIFLAZZ_BASE_URL;
export const USERNAME_DIGIFLAZZ = process.env.USERNAME_DIGIFLAZZ;
export const DIGIFLAZZ_SECRET_KEY = process.env.DIGIFLAZZ_SECRET_KEY;

console.log(
  `[Digiflazz] Running in ${isDevelopment ? "DEVELOPMENT" : "PRODUCTION"} mode`
);
console.log(
  `[Digiflazz] Using API Key: ${DIGIFLAZZ_API_KEY?.substring(0, 10)}...`
);
