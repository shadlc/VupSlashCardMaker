import { log } from "console";
import YAML from "yaml";

declare const window: Window & { electronAPI: any, var: any };

export class Config {
  configUrl: string;
  isChanged: boolean;
  onlyEditNewParty: boolean;
  resourceDir: string;
  resourceXlsx: string;
  saveNameType: string;
  saveCardSize: { w: number, h: number };
  isAutoDownload: boolean;
  isResLoaded = false;
  cardListFile: Map<any, any>;
  cardList: Map<any, any>;
  partyListFile: Map<any, any>;
  partyList: Map<any, any>;
  constructor() {
    this.configUrl = window.var?.path + "/config.yml";
    this.isChanged = false;
    this.onlyEditNewParty = true;
    this.resourceDir = "./资源";
    this.resourceXlsx = "./资源/数据集.xlsx";
    this.saveNameType = "code";
    this.saveCardSize = {w: 600, h: 870};
    this.isAutoDownload = true;
    this.cardListFile = new Map;
    this.partyListFile = new Map;
    this.cardList = new Map;
    this.partyList = new Map;
  }

  read(file=this.configUrl) {
    const configFile = window.electronAPI?.readFile(file, "utf-8");
    const config = YAML.parse(String(configFile));
    this.resourceDir = config?.resourceDir ? config?.resourceDir : this.resourceDir;
    this.onlyEditNewParty = config?.onlyEditNewParty ? config?.onlyEditNewParty : this.onlyEditNewParty;
    this.resourceXlsx = config?.resourceDir ? this.resourceDir + "/数据集.xlsx" : this.resourceXlsx;
    this.saveNameType = config?.saveNameType ? config?.saveNameType : this.saveNameType;
    this.isAutoDownload = config?.isAutoDownload ? config?.isAutoDownload : this.isAutoDownload;
    this.saveCardSize = config?.saveCardSize ? config?.saveCardSize : this.saveCardSize;
    if (!this.readRes()) {
      this.resourceDir = window.var?.path;
      this.readRes(window.var?.path);
    }
  }

  save(file=this.configUrl) {
    let data = YAML.stringify({
      resourceDir: this.resourceDir,
      onlyEditNewParty: this.onlyEditNewParty,
      saveNameType: this.saveNameType,
      isAutoDownload: this.isAutoDownload,
      saveCardSize: { w: this.saveCardSize.w, h: this.saveCardSize.h },
    });
    return window.electronAPI?.saveFile(file, data, "Text", 0);
  }

  readRes(path = this.resourceXlsx): boolean {
    this.cardListFile = {};
    this.partyListFile = {};
    const xlsxData = window.electronAPI?.readXlsx(path);
    if (xlsxData) {
      let list = xlsxData[0]?.data;
      for (let i = 1; i < list?.length; i++) {
        this.cardListFile[list[i][0]] = {
          name: list[i][1],
          nameEng: list[i][2],
          label: list[i][3],
          party: list[i][4],
          shadowType: list[i][5],
          isShine: list[i][6],
          isOverflow: list[i][7],
          shadowDistance: list[i][8],
          portraitX: list[i][9],
          portraitY: list[i][10],
          portraitW: list[i][11],
          portraitH: list[i][12],
          shineColor: list[i][13],
        }
      }
      list = xlsxData[1]?.data;
      for (let i = 1; i < list?.length; i++) {
        this.partyListFile[list[i][0]] = {
          name: list[i][1],
          themeColor: list[i][2],
          nameColor: list[i][3],
          labelColor: list[i][4],
          borderColor: list[i][5],
        }
      }
      this.cardList = JSON.parse(JSON.stringify(this.cardListFile));
      this.partyList = JSON.parse(JSON.stringify(this.partyListFile));
    }
    if (JSON.stringify(this.cardList) != "{}" && JSON.stringify(this.partyList) != "{}") {
      this.isResLoaded = true;
      return true;
    }
    this.isResLoaded = false;
    return false;
  }
  
  saveRes(file = this.resourceXlsx): any {
    let cardList = this.cardList;
    let partyList = this.partyList;
  
    const cardSheet = [
      ["code", "name", "nameEng", "label", "party", "shadowType", "isShine", "isOverflow", "shadowDistance", "portraitX", "portraitY", "portraitW", "portraitH", "shineColor"],
    ];
    for( let i in cardList) {
      cardSheet.push([
        i,
        cardList[i]["name"],
        cardList[i]["nameEng"],
        cardList[i]["label"],
        cardList[i]["party"],
        cardList[i]["shadowType"],
        cardList[i]["isShine"],
        cardList[i]["isOverflow"],
        cardList[i]["shadowDistance"],
        cardList[i]["portraitX"],
        cardList[i]["portraitY"],
        cardList[i]["portraitW"],
        cardList[i]["portraitH"],
        cardList[i]["shineColor"]
      ]);
    }
    const partySheet = [
      ["name", "code", "themeColor", "nameColor", "labelColor", "borderColor"],
    ];
    for( let i in partyList) {
      partySheet.push([
        i,
        partyList[i]["name"],
        partyList[i]["themeColor"],
        partyList[i]["nameColor"],
        partyList[i]["labelColor"],
        partyList[i]["borderColor"]
      ]);
    }
    let data = [
      {
        name: "卡牌",
        data: cardSheet,
        options: {
          "!cols": [{ width: 36 }, { width: 15 }, { width: 20 }, { width: 20 }, { width: 15 }, { width: 12 }, { width: 12 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }],
          "!autofilter": { ref: "A1:N1" },
        }
      },
      {
        name: "势力",
        data: partySheet,
        options: {
          "!cols": [{ width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }],
          "!autofilter": { ref: "A1:F1" },
        }
      },
    ];
    return window.electronAPI?.saveXlsx(file, data);
  }

  resetResourceDir(dir: string) {
    this.resourceDir = dir.replace(/\\/g, "/");
    this.resourceXlsx = this.resourceDir + "/数据集.xlsx";
  }

  getProjectDir(dir = this.resourceDir): string {
    return dir.replace(/.*\//, "");
  }

  getListItem(list: {}): [] {
    let item = [];
    for (let i in list) {
      item.push(i)
    }
    return item;
  }
}