const crypto = require('crypto');

const secretKey = '12345671234@KLIXLINK@12345671234'; 
const ivLength = 16;
const SIGNATURE_MARKER = '##SIGNATURE:';
const SIGNATURE_END = '##';

function splitEncryptedAndSignature(buffer) {
    const marker = Buffer.from('##SIGNATURE:');
    const endMarker = Buffer.from('##');

    const markerIndex = buffer.lastIndexOf(marker);
    if (markerIndex === -1) return { encrypted: buffer, signature: null };

    const endIndex = buffer.indexOf(endMarker, markerIndex + marker.length);
    if (endIndex === -1) return { encrypted: buffer, signature: null };

    const signatureBuffer = buffer.slice(markerIndex + marker.length, endIndex);
    const encryptedBuffer = buffer.slice(0, markerIndex);

    return {
        encrypted: encryptedBuffer,
        signature: signatureBuffer.toString('utf-8')
    };
}

function decryptFile(encryptedBuffer) {
    const iv = encryptedBuffer.slice(0, ivLength);
    const content = encryptedBuffer.slice(ivLength);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);
    return decrypted;
}

function isPasswordAuthorized(userInput, uniquePassword, key) {
    try {
        const encryptedBytes = Buffer.from(userInput, 'base64');
        const aesKey = Buffer.from(key.padEnd(32).slice(0, 32), 'utf-8');
        const iv = Buffer.alloc(16, 0); // כמו ב־C#
        const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedBytes), decipher.final()]);
        const decryptedText = decrypted.toString('utf-8');
        const parts = decryptedText.split(',');
        return parts[2] === uniquePassword;
    } catch {
        return false;
    }
}

function displayPDFWithPDFJS(pdfBuffer) {
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const container = document.getElementById('content');
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const loadingTask = window.pdfjsLib.getDocument({ url });
    loadingTask.promise.then((pdf) => {
        pdf.getPage(1).then((page) => {
            const viewport = page.getViewport({ scale: 1.5 });
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            page.render({ canvasContext: context, viewport: viewport });
        });
    });
}

document.getElementById('showBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('upload');
    const passwordInput = document.getElementById('password').value;
    const contentEl = document.getElementById('content');

    if (!fileInput.files[0] || !passwordInput) {
        contentEl.innerHTML = `<div class="alert alert-warning">יש להזין קובץ וסיסמה</div>`;
        return;
    }

    try {
        const rawBuffer = Buffer.from(await fileInput.files[0].arrayBuffer());
        const { encrypted, signature } = splitEncryptedAndSignature(rawBuffer);

        if (!signature) {
            contentEl.innerHTML = `<div class="alert alert-danger">לא נמצאה חתימה בקובץ</div>`;
            return;
        }

        if (!isPasswordAuthorized(passwordInput, signature, secretKey)) {
            contentEl.innerHTML = `<div class="alert alert-danger">סיסמה שגויה או אין הרשאה</div>`;
            return;
        }

        const decryptedBuffer = decryptFile(encrypted);
        displayPDFWithPDFJS(decryptedBuffer);

    } catch (err) {
        contentEl.innerHTML = `<div class="alert alert-danger">שגיאה בפענוח: ${err.message}</div>`;
    }
});
