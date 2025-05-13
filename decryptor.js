const crypto = require('crypto');
const fs = require('fs');

const IV = Buffer.alloc(16, 0); // אותו IV כמו בצד שרת

function decryptAES(encryptedBase64, key) {
    const key32 = Buffer.from(key.padEnd(32, ' ')).slice(0, 32);
    const encryptedData = Buffer.from(encryptedBase64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key32, IV);
    return Buffer.concat([decipher.update(encryptedData), decipher.final()]).toString();
}

function decryptFile(fileBuffer, key) {
    const key32 = Buffer.from(key.padEnd(32, ' ')).slice(0, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key32, IV);
    return Buffer.concat([decipher.update(fileBuffer), decipher.final()]);
}

function extractSignature(buffer) {
    const str = buffer.toString('utf8');
    const match = str.match(/##SIGNATURE:(.*?)##/);
    return match ? match[1] : null;
}

function stripSignature(buffer) {
    const str = buffer.toString('utf8');
    const markerIndex = str.lastIndexOf("##SIGNATURE:");
    if (markerIndex === -1) return buffer;
    return Buffer.from(str.slice(0, markerIndex), 'utf8');
}

module.exports = {
    decryptAES,
    decryptFile,
    extractSignature,
    stripSignature
};