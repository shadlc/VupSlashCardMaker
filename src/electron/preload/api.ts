const fs = require("fs");
import XLSX from "node-xlsx";
import cp from "child_process";

// 打开文件或软件
export function open(file: string) {
  cp.exec(file);
}

// 读取文件
export function readFile(file: string, encode: string): any {
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, encode);
  }
};

// 保存文件
export function saveFile(file: string, data: any, type="Blob", index = 1): any {
  let dir = file.split(/\/(?=[^\/]+$)/)[0];
  let temp = file.split(/\.(?=[^.]+$)/);
  let filename = temp[0] + "(" + index + ")." + temp[1];
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if (index <= 1) filename = file;
  if (index != 0 && fs.existsSync(filename)) {
    return saveFile(file, data, type, index + 1);
  } else {
    try {
      if (type == "Blob") {
        let fr = new FileReader();
        fr.onload = function (e: any) {
          let buffer = Buffer.from(e.target.result)
          fs.writeFileSync(filename, buffer);
        }
        fr.readAsArrayBuffer(data);
      } else {
        fs.writeFileSync(filename, data);
      }
    } catch (error) {
      return error;
    }
  }
  return true;
};

// 读取表格
export function readXlsx(file: string): any {
  if (fs.existsSync(file)) {
    try {
      return XLSX.parse(fs.readFileSync(file));
    } catch (error) {
      return false;
    }
  }
  return true;
};

// 保存表格
export function saveXlsx(file: string, data: any): any {
  const xlsx = XLSX.build(data, { writeOptions: {compression: true} });
  return saveFile(file, xlsx, "Buffer", 0);
};

// 读取图片
export function readPic(file: string): any {
  if (fs.existsSync(file)) {
    return "data:image/jpg;base64," + fs.readFileSync(file).toString("base64");
  }
};

// 读取目录下文件
export function readDir(dir: string): any {
  if (fs.existsSync(dir)) {
    return fs.readdirSync(dir);
  }
}

// 获取占用内存
export function getMemory() {
  let info = process.memoryUsage();
  let ram = formatSize(info.rss);
  return ram;
}

// 格式化文件大小
export function formatSize(size: number){
  if(!size){ return "0 Bytes"; }
  let unitArr = ["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"];
  let index=0;
  index = Math.floor(Math.log(size) / Math.log(1024));
  var srcSize = size / Math.pow(1024, index);
  return srcSize.toFixed(2)+unitArr[index];
}