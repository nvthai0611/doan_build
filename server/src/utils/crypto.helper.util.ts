import * as CryptoJS from 'crypto-js';

export const decrypt = <T = any>(cipherText: string): T | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, process.env.SECRET_KEY_RES);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted ? JSON.parse(decrypted) : null;
  } catch (e) {
    console.error('Decrypt error:', e);
    return null;
  }
};

export const encrypt = (data: any): string => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    process.env.SECRET_KEY_RES,
  ).toString();
};
