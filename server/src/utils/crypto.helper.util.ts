import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-secret-key'; // phải trùng với client

export const decrypt = <T = any>(cipherText: string): T | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted ? JSON.parse(decrypted) : null;
  } catch (e) {
    console.error('Decrypt error:', e);
    return null;
  }
};

export const encrypt = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};
