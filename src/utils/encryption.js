import CryptoJS from "crypto-js";

const AES_KEY = process.env.AES_KEY || "default_aes_key";

// Encrypt password dengan AES-256
export function encryptPassword(password) {
  return CryptoJS.AES.encrypt(password, AES_KEY).toString();
}

// Decrypt password AES
export function decryptPassword(encrypted) {
  const bytes = CryptoJS.AES.decrypt(encrypted, AES_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}