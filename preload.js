const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    selectEncryptedFile: () => ipcRenderer.invoke('select-encrypted-file'),
    processFile: (filePath, encryptedPassword, key) => ipcRenderer.invoke('process-file', filePath, encryptedPassword, key)
});
