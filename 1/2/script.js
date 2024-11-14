const crypto = require('crypto');

function generateRSAKeyPair() {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair('rsa', {
      modulusLength: 2048, 
      publicKeyEncoding: {
        type: 'spki', 
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8', 
        format: 'pem', 
      },
    }, (err, publicKey, privateKey) => {
      if (err) {
        reject(err);
      } else {
        resolve({ publicKey, privateKey });
      }
    });
  });
}

function encryptWithPublicKey(publicKey, text) {
  return crypto.publicEncrypt(publicKey, Buffer.from(text)).toString('hex');
}

function decryptWithPrivateKey(privateKey, encryptedText) {
  const buffer = Buffer.from(encryptedText, 'hex');
  return crypto.privateDecrypt(privateKey, buffer).toString('utf8');
}

async function run() {
  try {
    const { publicKey, privateKey } = await generateRSAKeyPair();
    console.log('Публичный ключ:', publicKey);
    console.log('Приватный ключ:', privateKey);

    const userPassword = 'mySuperSecretPassword';
    console.log('Original Password:', userPassword);

    const encryptedPassword = encryptWithPublicKey(publicKey, userPassword);
    console.log('Encrypted Password:', encryptedPassword);

    const decryptedPassword = decryptWithPrivateKey(privateKey, encryptedPassword);
    console.log('Decrypted Password:', decryptedPassword);

  } catch (err) {
    console.error('Ошибка:', err);
  }
}

run();
