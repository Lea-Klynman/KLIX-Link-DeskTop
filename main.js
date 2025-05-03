const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");

function createMainWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        title: "KLIX-Link-DeskTop",
        icon: path.join(__dirname, "assets", "logo.ico"), 
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        }
    });

    win.setContentProtection(true);
    win.loadFile("index.html");
}

app.whenReady().then(() => {
    protocol.registerFileProtocol("klix", (request, callback) => {
        const url = request.url.replace("klix://", "");
        const filePath = path.join(__dirname, decodeURIComponent(url));
        callback({ path: filePath });
    });

    createMainWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
