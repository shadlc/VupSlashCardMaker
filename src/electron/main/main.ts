import { join } from "path";
import { app, BrowserWindow, ipcMain, dialog, FileFilter, globalShortcut } from "electron";
const os = require("os");

const isDev = process.env.npm_lifecycle_event === "app:dev" ? true : false;
let mainWindow: BrowserWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 580,
        minWidth: 800,
        minHeight: 580,
        show: false,
        icon: "../../../public/favicon.ico",
        frame: false,
        // titleBarStyle: "hidden",
        // titleBarOverlay: {
        //     color: "transparent",
        //     symbolColor: "#cacaca"
        // },
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: join(__dirname, "../preload/preload.js"),
        },
    });
    mainWindow.on("ready-to-show", () => {
        mainWindow.setMenu(null);
        mainWindow.show();
    })

    // and load the index.html of the app.
    if (isDev) {
        mainWindow.loadURL("http://localhost:3000");
    } else {
        mainWindow.loadFile(join(__dirname, "../../index.html"));
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

createWindow()
app.on("activate", function () {
    // On macOS it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
})
});

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
if (process.platform !== "darwin") {
    app.quit();
}
});


ipcMain.on("window-min", (event) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) win.minimize();
});
ipcMain.on("window-max", (event) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    }
});
ipcMain.on("window-fullScreen", (event) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) {
        win.setFullScreen(!win.isFullScreen());
    }
});
ipcMain.on("window-isMaximized", (event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) {
        if (win.isMaximized()) {
            event.returnValue = true;
        } else {
            event.returnValue = false;
        }
    }
});
ipcMain.on("window-isFullScreen", (event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) {
        if (win.isFullScreen()) {
            event.returnValue = true;
        } else {
            event.returnValue = false;
        }
    }
});
ipcMain.on("window-close", (event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) win.close();
});
ipcMain.on("window-reload", (event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) win.reload();
});
ipcMain.on("window-dev", (event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) {
        if (webContents.isDevToolsOpened()) {
            win.webContents.closeDevTools();
        } else {
            win.webContents.openDevTools();
        }
    }
});
ipcMain.on("window-about", (event) => {
    let json = require("../../../package.json");
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    let info = "软件版本: " + json.version;
    info += "\n作者: " + json.author;
    info += "\nElectron: " + process.versions["electron"];
    info += "\nNodeJS: " + process.versions["node"];
    info += "\nChromium: " + process.versions["chrome"];
    info += "\nV8: " + process.versions["v8"];
    info += "\nOS: " + process.env["OS"] + " " + process.arch + " " + os.release();
    if (win) {
        dialog.showMessageBox(win, {
            type: "info",
            title: "关于软件",
            message: "VUP杀卡牌制作器",
            detail: info
        });
    }
});

ipcMain.on("window-dialog", (event, title: string, msg: string, detail: string) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) {
        dialog.showMessageBox(win, {
            type: "info",
            title: title,
            message: msg,
            detail: detail
        });
    }
});

ipcMain.on("window-open-dialog", (event, title: string, defaultPath: string, buttonLabel: string, filters: FileFilter[], properties: any) => {
    let result = undefined;
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) {
        result = dialog.showOpenDialogSync(win, {
            title: title,
            defaultPath: defaultPath,
            buttonLabel: buttonLabel,
            filters: filters,
            properties: properties
        });
        
    }
    event.returnValue = result;
});