const crypto = require('crypto');

const secretKey = crypto.randomBytes(32); 
const iv = crypto.randomBytes(16); 

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encryptedData: encrypted, iv: iv.toString('hex') };
}

function decrypt(encryptedData, ivHex) {
  const ivBuffer = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, ivBuffer);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const userPassword = 'mySuperSecretPassword';
console.log('Original Password:', userPassword);

const { encryptedData, iv: encryptionIv } = encrypt(userPassword);
console.log('Encrypted Password:', encryptedData);

const decryptedPassword = decrypt(encryptedData, encryptionIv);
console.log('Decrypted Password:', decryptedPassword);
