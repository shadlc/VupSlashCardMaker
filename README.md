# VupSlashCardMaker

- VUP杀卡牌制作器(VupSlashCardMaker)是一款基于Electron和Vue3的桌面应用，用以制作VUP杀游戏内展示卡牌。
- 游戏官网(https://vupslash.icu)

## Get Started

### 1. clone this repository

```bash
git clone https://github.com/shadlc/VupSlashCardMaker.git
```

### 2. install packages

```bash
npm i
```

### 3. run

```bash
npm run app:dev
```

## Run

### dev mode

```bash
npm run app:dev  
```

### preview mode

```bash
npm run app:preview  
```

### build app

```bash
npm run app:build
```

### debug main process

1. Add a break point in the main process `src/electron/main/main.ts`.
2. Open the `Run and Debug (Ctrl+Shift+D)` tool, and select `Debug Main Process`.
*Note: Before using the debug tool to debug the main process, you should run the preview script `npm run app:preview` first to build the Vue app.*

## Thanks

- Thanks to Yukun-Guo's repository [vite-vue3-electron-ts-template](https://github.com/Yukun-Guo/vite-vue3-electron-ts-template) which this based on.
- Thanks to [Electron](https://github.com/electron/electron).
- Thanks to [Vue3](https://github.com/vuejs/core).
- Thanks to [Bootstrap](https://github.com/twbs/bootstrap).
- Thanks to [JsZip](https://github.com/Stuk/jszip).
- Thanks to [node-xlsx](https://github.com/mgcrea/node-xlsx).