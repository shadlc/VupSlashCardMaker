// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");
const api = require("./api");

declare interface Window {
  electronAPI: any
  var: any
};

contextBridge.exposeInMainWorld("electronAPI", {
  min: () => ipcRenderer.send("window-min"),
  max: () => ipcRenderer.send("window-max"),
  fullScreen: () => { return ipcRenderer.send("window-fullScreen") },
  isMaximized: () => { return ipcRenderer.sendSync("window-isMaximized") },
  isFullScreen: () => { return ipcRenderer.sendSync("window-isFullScreen") },
  exit: () => ipcRenderer.send("window-close"),
  reload: () => ipcRenderer.send("window-reload"),
  dev: () => ipcRenderer.send("window-dev"),
  about: () => ipcRenderer.send("window-about"),
  dialog: (title: string, msg: string, detail: string) => ipcRenderer.send("window-dialog", title, msg, detail),
  openDialog: (title: string, defaultPath: string, buttonLabel: string, filters: any, properties: any) => ipcRenderer.sendSync("window-open-dialog", title, defaultPath, buttonLabel, filters, properties),
  readFile: (file: string, encode: string) => { return api.readFile(file, encode) },
  readPic: (file: string) => { return api.readPic(file) },
  readXlsx: (file: string) => { return api.readXlsx(file) },
  readDir: (dir: string) => { return api.readDir(dir) },
  saveFile: (file: string, data: any, type: string, index: number) => { return api.saveFile(file, data, type, index) },
  saveXlsx: (file: string, data: string) => { return api.saveXlsx(file, data) },
  open: (file: string) => { return api.open(file) },
  memory: () => { return api.getMemory()},
});

contextBridge.exposeInMainWorld("var", {
  path: process.env.NODE_ENV === "development" ? __dirname : process.cwd(),
});