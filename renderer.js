
const crypto = require('crypto');

const secretKey = '12345671234@KLIXLINK@12345671234'; 

function decryptBuffer(encryptedData, key) {
    const paddedKey = Buffer.from(key.padEnd(32, ' ').substring(0, 32), 'utf8');
    const iv = Buffer.alloc(16); 

    const decipher = crypto.createDecipheriv('aes-256-cbc', paddedKey, iv);
    const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
    ]);

    return decrypted;
}


function isPasswordCorrect(userInput, key) {
    try {
                const encryptedBytes = Buffer.from(userInput, 'base64');
                const aesKey = Buffer.from(key.padEnd(32).slice(0, 32), 'utf-8');
                const iv = Buffer.alloc(16, 0);
                const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
                const decrypted = Buffer.concat([decipher.update(encryptedBytes), decipher.final()]);
                const decryptedText = decrypted.toString('utf-8');
                const parts = decryptedText.split(',');
                return parts[2] ;
            } catch {
                return false;
            }
}



function displayPDF(buffer) {
    const contentEl = document.getElementById("content");
    const loadingTask = pdfjsLib.getDocument({data: buffer});
    loadingTask.promise.then(pdf => {
        const viewer = document.createElement("div");
        viewer.style.width = '100%';
        viewer.style.height = 'auto';
        contentEl.innerHTML = ""; 
        contentEl.appendChild(viewer);

        function renderPage(pageNum) {
            pdf.getPage(pageNum).then(function(page) {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext('2d');
                const scale = 1.5; // adjust the scale here if necessary
                const viewport = page.getViewport({ scale: scale });

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise.then(() => {
                    viewer.appendChild(canvas);
                    if (pageNum < pdf.numPages) {
                        renderPage(pageNum + 1);
                    }
                });
            });
        }

        renderPage(1);
    }).catch(error => {
        console.error("Error loading PDF:", error);
    });
}

document.getElementById('showBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('upload');
    const password = document.getElementById('password').value;
    const contentEl = document.getElementById('content');

    contentEl.innerHTML = '';

    if (!fileInput.files[0] || !password) {
        contentEl.innerHTML = `<div class="alert alert-warning">יש להזין קובץ וסיסמה</div>`;
        return;
    }

    try {
        const fileBuffer = Buffer.from(await fileInput.files[0].arrayBuffer());
        const signature = isPasswordCorrect(password, secretKey);
        const finalKey = (secretKey.substring(0, 32 - 12) + signature).substring(0, 32);

        const decryptedBuffer = decryptBuffer(fileBuffer, finalKey);

        if (!signature) {
            contentEl.innerHTML = `<div class="alert alert-danger">לא נמצאה חתימה בקובץ</div>`;
            return;
        }
    
        const blob = new Blob([decryptedBuffer], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
        displayPDF(decryptedBuffer);

    } catch (err) {
        console.error(err);
        contentEl.innerHTML = `<div class="alert alert-danger">שגיאה בפענוח: ${err.message}</div>`;
    }
});
