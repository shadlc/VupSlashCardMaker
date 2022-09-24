declare const window: Window & { electronAPI: any };
import { Config } from "./config";

// 立绘
class Portrait {
  img: HTMLImageElement;
  isLoad = false;
  tp: any = undefined;

  constructor() {
    this.img = new Image();
  }

  import(url: string, card: Card) {
    this.isLoad = false;
    clearTimeout(this.tp);
    this.tp = setTimeout(() => {
      this.img.src = window.electronAPI.readPic(url);
    }, 0);
    this.img.onload = () => {
      this.isLoad = true;
      if (!card.portraitW) {
        card.portraitW = this.img.width;
        card.portraitH = this.img.height;
      }
    }
  }
}

// 遮罩阴影
class Shadow {
  img: HTMLImageElement;
  isLoad = false;
  tp: any = undefined;

  constructor() {
    this.img = new Image();
  }

  import(url: string) {
    this.isLoad = false;
    clearTimeout(this.tp);
    this.tp = setTimeout(() => {
      this.img.src = window.electronAPI.readPic(url);
    }, 0);
      this.img.onload = () => {
        this.isLoad = true;
      }
  }
}

// 势力图标
class Logo {
  img: HTMLImageElement;
  isLoad = false;
  tp: any = undefined;

  constructor() {
    this.img = new Image();
  }

  import(url: string, card: Card) {
    this.isLoad = false;
    clearTimeout(this.tp);
    this.tp = setTimeout(() => {
      this.img.src = window.electronAPI.readPic(url);
    }, 0);
    this.img.onload = () => {
      this.isLoad = true;
      if (!card.logoW) {
        card.logoW = card.logo.img.width;
        card.logoH = card.logo.img.height;
      }
    }
  }
}

// 卡牌
export class Card {
  portrait: Portrait = new Portrait();
  portraitX = 0;
  portraitY = 0;
  portraitW = 0;
  portraitH = 0;

  shadow: Shadow = new Shadow();
  shadowType = "苍穹";
  isShine = false;
  isOverflow = true;
  shadowDistance = 0;

  logo: Logo = new Logo();
  logoX = 30;
  logoY = 30;
  logoW = 0;
  logoH = 0;

  code = "";
  name = "";
  nameEng = "";
  label = "";
  party = "undefined";

  shineColor = "#000000";
  themeColor = "#999999";
  nameColor = "#000000";
  labelColor = "#dddddd";
  borderColor = "#333333";

  // 导入立绘
  importPortrait(url: string) {
    this.portrait.import(url, this);
  }
  // 导入阴影
  importShadow(url: string) {
    this.shadow.import(url);
  }
  // 导入势力图标
  importLogo(url: string) {
    this.logo.import(url, this);
  }
  // 生成卡牌
  draw(cvs: HTMLCanvasElement) {
    // 绘制背景
    drawBackground(cvs, this);
    // 绘制立绘
    drawPortrait(cvs, this);
    // 绘制上层
    drawCover(cvs, this);
    // 绘制称号
    drawLabel(cvs, this);
    // 绘制名称
    drawName(cvs, this);
    // 绘制势力符号
    drawPartyLogo(cvs, this);
    // 绘制圆角
    drawRadius(cvs, 60);
  }

  drawEmpty(cvs: HTMLCanvasElement) {
    // 绘制背景
    drawBackground(cvs, this);
    // 绘制上层
    drawCover(cvs, this);
    // 绘制圆角
    drawRadius(cvs, 60);
  }
}

// 设定卡牌
export function setCard(card: Card, config: Config) {
  card.importPortrait(config.resourceDir + "/立绘/" + card.code + ".png");
  let dCard = new Card();
  const d = config.cardList[card.code];
  card.name = d?.name ? d?.name : dCard.name;
  card.nameEng = d?.nameEng ? d?.nameEng : dCard.nameEng;
  card.label = d?.label ? d?.label : dCard.label;
  card.party = d?.party ? getPartyCode(d?.party, config.partyList) : dCard.party;
  card.isShine = d?.isShine ? d?.isShine : dCard.isShine;
  card.isOverflow = d?.isOverflow ? d?.isOverflow : dCard.isOverflow;
  card.shadowDistance = d?.shadowDistance ? d?.shadowDistance : dCard.shadowDistance;
  card.portraitX = d?.portraitX ? d?.portraitX : dCard.portraitX;
  card.portraitY = d?.portraitY ? d?.portraitY : dCard.portraitY;
  card.portraitW = d?.portraitW ? d?.portraitW : dCard.portraitW;
  card.portraitH = d?.portraitH ? d?.portraitH : dCard.portraitH;
  card.shineColor = d?.shineColor ? d?.shineColor : dCard.shineColor;
}

// 设定势力
export function setParty(card: Card, config: Config) {
  card.importLogo(config.resourceDir + "/势力/" + card.party + ".png");
  let dCard = new Card();
  const p = config.partyList[card.party];
  card.logoX = p?.logoX ? p?.logoX : dCard.logoX;
  card.logoY = p?.logoY ? p?.logoY : dCard.logoY;
  card.logoW = p?.logoW ? p?.logoW : dCard.logoW;
  card.logoH = p?.logoH ? p?.logoH : dCard.logoH;
  card.themeColor = p?.themeColor ? p?.themeColor : dCard.themeColor;
  card.nameColor = p?.nameColor ? p?.nameColor : dCard.nameColor;
  card.labelColor = p?.labelColor ? p?.labelColor : dCard.labelColor;
  card.borderColor = p?.borderColor ? p?.borderColor : dCard.borderColor;
}

// 设定阴影
export function setShadow(card: Card, config: Config) {
  card.importShadow(config.resourceDir + "/阴影/" + card.shadowType + ".png");
}

// 获取势力代码
export function getPartyCode(name: string, partyList: any): string {
  for (let p in partyList) {
    if (partyList[p].name == name) {
      return p;
    }
  }
  return "undefined";
}

// 同步到卡牌列表
export function syncCardList(card: Card, config: Config) {
  if (!config.cardList[card.code]) { config.cardList[card.code] = {} }
  let c = config.cardList[card.code];
  c.name = card?.name;
  c.nameEng = card?.nameEng;
  c.label = card?.label;
  c.party = config.partyList[card.party]?.name;
  c.shadowType = card?.shadowType;
  c.isShine = card?.isShine;
  c.isOverflow = card?.isOverflow;
  c.shadowDistance = card?.shadowDistance;
  c.portraitX = card?.portraitX;
  c.portraitY = card?.portraitY;
  c.portraitW = card?.portraitW;
  c.portraitH = card?.portraitH;
  c.shineColor = card?.shineColor;
}

// 同步到势力列表
export function syncPartyList(card: Card, config: Config) {
  if (config.partyList[card.party]) {
    let p = config.partyList[card.party];
    p.themeColor = card?.themeColor;
    p.nameColor = card?.nameColor;
    p.labelColor = card?.labelColor;
    p.borderColor = card?.borderColor;
  }
}

function drawBackground(cvs: HTMLCanvasElement, card: Card) {
  const ctx = cvs.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, cvs.width, cvs.height)
  for(let i=5; i<cvs.width; i+=30){
    for(let j=5; j<cvs.height; j+=30){
      draw_cross(ctx, i, j, card.themeColor);
    }
  }
  
  if (card.isOverflow) {
    ctx.beginPath();
    ctx.fillStyle = card.themeColor;
    ctx.moveTo(0, 0);
    ctx.lineTo(cvs.width, 0);
    ctx.lineTo(cvs.width, cvs.height / 10);
    ctx.lineTo(0, cvs.height / 5);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
  }
}

function draw_cross(ctx: CanvasRenderingContext2D, x: number, y: number, color: string){
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(x + 10, y + 5);
  ctx.lineTo(x + 10, y + 15);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(x + 5, y + 10);
  ctx.lineTo(x + 15, y + 10);
  ctx.closePath();
  ctx.stroke();
}

function drawPartyLogo(cvs: HTMLCanvasElement, card: Card) {
  const ctx = cvs.getContext("2d") as CanvasRenderingContext2D;
  if (card.logo.isLoad) {
    ctx.drawImage(card.logo.img, card.logoX, card.logoY, card.logoW, card.logoH);
  }
  
}

function drawPortrait(cvs: HTMLCanvasElement, card: Card) {
  const ctx = cvs.getContext("2d") as CanvasRenderingContext2D;
  if (card.portrait.isLoad && card.shadow.isLoad) {
    const temp_cvs = document.createElement("canvas");
    temp_cvs.width = cvs.width;
    temp_cvs.height = cvs.height;
    const temp_ctx = temp_cvs.getContext("2d") as CanvasRenderingContext2D;

    if (card.shadowDistance != 0) {
      temp_ctx.save();
      if (card.isShine) {
        temp_ctx.shadowColor = card.shineColor;
        temp_ctx.shadowBlur = 40;
      }
      temp_ctx.drawImage(card.portrait.img, card.portraitX + card.portraitW * 0.05 + card.shadowDistance * 1.2, card.portraitY + card.portraitH * 0.05 - card.shadowDistance * 1, card.portraitW * 0.9, card.portraitH * 0.9);
      temp_ctx.globalCompositeOperation = "source-in";
      temp_ctx.drawImage(card.shadow.img, 0, 0);
      temp_ctx.restore();
    }
    if (card.isShine) {
      temp_ctx.shadowColor = card.shineColor;
      temp_ctx.shadowBlur = 40;
    }
    temp_ctx.drawImage(card.portrait.img, card.portraitX, card.portraitY, card.portraitW, card.portraitH);
    ctx.drawImage(temp_cvs, 0, 0);
  }
}

function drawCover(cvs: HTMLCanvasElement, card: Card) {
  const ctx = cvs.getContext("2d") as CanvasRenderingContext2D;
  const temp_cvs = document.createElement("canvas");
  const temp_ctx = temp_cvs.getContext("2d") as CanvasRenderingContext2D;
  temp_cvs.width = cvs.width;
  temp_cvs.height = cvs.height;

  if (!card.isOverflow) {
    temp_ctx.beginPath();
    temp_ctx.fillStyle = card.themeColor;
    temp_ctx.moveTo(0, 0);
    temp_ctx.lineTo(cvs.width, 0);
    temp_ctx.lineTo(cvs.width, cvs.height / 10);
    temp_ctx.lineTo(0, cvs.height / 5);
    temp_ctx.lineTo(0, 0);
    temp_ctx.closePath();
    temp_ctx.fill();
  }

  temp_ctx.beginPath();
  temp_ctx.fillStyle = card.themeColor;
  temp_ctx.moveTo(0, cvs.height);
  temp_ctx.lineTo(cvs.width, cvs.height);
  temp_ctx.lineTo(cvs.width, cvs.height / 100 * 78);
  temp_ctx.lineTo(0, cvs.height / 100 * 86);
  temp_ctx.lineTo(0, cvs.height);
  temp_ctx.closePath();
  temp_ctx.fill();
  temp_ctx.translate(0, cvs.height / 100 * 96);
  temp_ctx.font = "46px zhengkuchaojihei";
  temp_ctx.fillStyle = card.nameColor + "11";
  temp_ctx.fillText(repeat(card.name, 100), 0, 0);
  temp_ctx.fillRect(0, cvs.height * 0.01, cvs.width, cvs.height);
  temp_ctx.font = "32px zhengkuchaojihei";
  temp_ctx.fillStyle = card.themeColor;
  temp_ctx.fillText(repeat(card.nameEng, 100), 0, cvs.height * 0.035);
  ctx.drawImage(temp_cvs, 0, 0);
}

function drawLabel(cvs: HTMLCanvasElement, card: Card) {
  const ctx = cvs.getContext("2d") as CanvasRenderingContext2D;
  const temp_cvs = document.createElement("canvas");
  const temp_ctx = temp_cvs.getContext("2d") as CanvasRenderingContext2D;
  temp_cvs.width = cvs.width;
  temp_cvs.height = cvs.height;

  let fontSize = 60;
  let temp = computeText(card.label, "zhengkuchaojihei", fontSize, card.labelColor, card.borderColor);
  let text_cvs = temp[0];
  let fontBoxWidth = Math.max(160, temp[1]);
  while (fontBoxWidth > (cvs.width * 2 / 3)) {
    fontSize -= 1;
    temp = computeText(card.label, "zhengkuchaojihei", fontSize, card.labelColor, card.borderColor);
    text_cvs = temp[0];
    fontBoxWidth = Math.max(160, temp[1]);
  }
  
  temp_ctx.transform(1, -0.12, 0, 1, 0, cvs.height * 0.865 - fontSize * 1.43);
  
  temp_ctx.fillStyle = hexToRgba(card.themeColor + "aa");
  temp_ctx.beginPath();
  temp_ctx.moveTo(cvs.width, 0);
  temp_ctx.lineTo(cvs.width, fontSize * 1.4);
  temp_ctx.lineTo(cvs.width - fontBoxWidth - 32, fontSize * 1.4);
  temp_ctx.lineTo(cvs.width - fontBoxWidth - 32, 0);
  temp_ctx.closePath();
  temp_ctx.fill();
  temp_ctx.beginPath();
  temp_ctx.moveTo(cvs.width - fontBoxWidth - 46, 0);
  temp_ctx.lineTo(cvs.width - fontBoxWidth - 44, fontSize * 1.4);
  temp_ctx.lineTo(cvs.width - fontBoxWidth - 56, fontSize * 1.4);
  temp_ctx.lineTo(cvs.width - fontBoxWidth - 54, 0);
  temp_ctx.closePath();
  temp_ctx.fill();
  temp_ctx.beginPath();
  temp_ctx.moveTo(cvs.width - fontBoxWidth - 66, 0);
  temp_ctx.lineTo(cvs.width - fontBoxWidth - 64, fontSize * 1.4);
  temp_ctx.lineTo(cvs.width - fontBoxWidth - 76, fontSize * 1.4);
  temp_ctx.lineTo(cvs.width - fontBoxWidth - 74, 0);
  temp_ctx.closePath();
  temp_ctx.fill();
  temp_ctx.beginPath();
  temp_ctx.moveTo(cvs.width - fontBoxWidth - 86, 0);
  temp_ctx.lineTo(cvs.width - fontBoxWidth - 84, fontSize * 1.4);
  temp_ctx.lineTo(cvs.width - fontBoxWidth - 156, fontSize * 1.4);
  temp_ctx.lineTo(cvs.width - fontBoxWidth - 150, 0);
  temp_ctx.closePath();
  temp_ctx.fill();
  
  temp_ctx.drawImage(text_cvs, cvs.width - fontBoxWidth - 16, 0);


  ctx.drawImage(temp_cvs, 0, 0);
}

function drawName(cvs: HTMLCanvasElement, card: Card) {
  const ctx = cvs.getContext("2d") as CanvasRenderingContext2D;
  const temp_cvs = document.createElement("canvas");
  const temp_ctx = temp_cvs.getContext("2d") as CanvasRenderingContext2D;
  temp_cvs.width = cvs.width;
  temp_cvs.height = cvs.height;
  
  temp_ctx.transform(1, -0.12, 0, 1, 0, cvs.height * 0.84);

  let fontSize = 80;
  let temp = computeText(card.name, "zhengkuchaojihei", fontSize, card.nameColor, "#FFFFFF");
  let text_cvs = temp[0];
  let fontBoxWidth = Math.max(160, temp[1]);
  while (fontBoxWidth > (cvs.width * 2 / 3)) {
    fontSize -= 1;
    temp = computeText(card.name, "zhengkuchaojihei", fontSize, card.nameColor, "#FFFFFF");
    text_cvs = temp[0];
    fontBoxWidth = Math.max(160, temp[1]);
  }
  temp_ctx.drawImage(text_cvs, cvs.width - fontBoxWidth - 16, fontSize * 0.1);

  let fontSizeEng = 40;
  temp = computeText(card.nameEng, "zhengkuchaojihei", fontSizeEng, card.nameColor, "#FFFFFF");
  text_cvs = temp[0];
  let fontBoxWidthEng = temp[1];
  while (fontBoxWidthEng > (cvs.width * 2 / 3)) {
    fontSizeEng -= 1;
    temp = computeText(card.nameEng, "zhengkuchaojihei", fontSizeEng, card.nameColor, "#FFFFFF");
    text_cvs = temp[0];
    fontBoxWidthEng = Math.max(160, temp[1]);
  }
  temp_ctx.drawImage(text_cvs, cvs.width - fontBoxWidthEng - 16, fontSize * 1.2);


  ctx.drawImage(temp_cvs, 0, 0);
}

function drawRadius(cvs: HTMLCanvasElement , radius: number) {
  const ctx = cvs.getContext("2d") as CanvasRenderingContext2D;
  const temp_cvs = document.createElement("canvas");
  const temp_ctx = temp_cvs.getContext("2d") as CanvasRenderingContext2D;
  temp_cvs.width = cvs.width;
  temp_cvs.height = cvs.height;
  
  temp_ctx.drawImage(cvs, 0, 0);
  temp_ctx.globalCompositeOperation = "destination-in";
  temp_ctx.fillStyle = "white";
  temp_ctx.beginPath();
  temp_ctx.moveTo(radius, 0);
  temp_ctx.arcTo(cvs.width, 0, cvs.width, cvs.height, radius);
  temp_ctx.arcTo(cvs.width, cvs.height, 0, cvs.height, radius);
  temp_ctx.arcTo(0, cvs.height, 0, 0, radius);
  temp_ctx.arcTo(0, 0, cvs.width, 0, radius);
  temp_ctx.closePath();
  temp_ctx.fill();
  clearCanvas(cvs);
  ctx.drawImage(temp_cvs, 0, 0);
}

function computeText(text:string, font: string, fontSize: number, fontColor: string, borderColor: string): [HTMLCanvasElement, number] {

  const temp_cvs = document.createElement("canvas");
  const temp_ctx = temp_cvs.getContext("2d") as CanvasRenderingContext2D;
  if (!text) return [temp_cvs, 0];
  if (text.length) temp_cvs.width = fontSize * text.length;
  else temp_cvs.width = fontSize;
  temp_cvs.height = fontSize * 1.3;
  if (text.indexOf("^") != -1) {
    temp_cvs.height *= 1.05;
  }

  temp_ctx.textAlign = "left";
  temp_ctx.textBaseline = "bottom";
  temp_ctx.lineWidth = fontSize / 10;
  if (borderColor) temp_ctx.strokeStyle = borderColor;
  if (fontColor) temp_ctx.fillStyle = fontColor;
  font = "px " + font;
  temp_ctx.font = fontSize + font;
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] != "^" && text[i] != "_") {
      if (borderColor) temp_ctx.strokeText(text[i], width, temp_cvs.height * 0.92);
      if (fontColor) temp_ctx.fillText(text[i], width, temp_cvs.height * 0.92);
      width += temp_ctx.measureText(text[i]).width;
      temp_ctx.font = fontSize + font;
    } else if (text[i] == "^") {
      temp_ctx.font = (fontSize * 1.2) + font;
    } else if (text[i] == "_") {
      temp_ctx.font = (fontSize * 0.8) + font;
    }
  }
  return [temp_cvs, width];
}

// 复读机
function repeat(str: string, num: number): string{
  if (!str) return "";
  return num > 1 ? str += repeat(str, --num) : str;
}

// 清空画布
export function clearCanvas(cvs: HTMLCanvasElement) {
  const w = cvs.width;
  const h = cvs.height;
  const ctx = cvs.getContext("2d") as CanvasRenderingContext2D;
  ctx.clearRect(0,0, w, h);
}

// 16进制颜色转化为RGBA方法
function hexToRgba(hex: string) {
  const rgba = "rgba(" + parseInt("0x" + hex.slice(1, 3)) + "," +
    parseInt("0x" + hex.slice(3, 5)) + "," +
    parseInt("0x" + hex.slice(5, 7)) + "," +
    parseInt("0x" + hex.slice(7, 9)) / 255 + ")";
  return rgba;
}