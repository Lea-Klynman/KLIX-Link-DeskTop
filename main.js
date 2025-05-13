const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "KLIX-Link-DeskTop",
    icon: path.join(__dirname, "assets", "logo.ico"), 
        webPreferences: {
      nodeIntegration: true,      
      contextIsolation: false     
    }
  });
  
  mainWindow.setContentProtection(true);

  mainWindow.loadFile('index.html');

}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});