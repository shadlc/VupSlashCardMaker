<script setup lang="ts">
import { Ref, ref, watch, onMounted } from "vue";
import JSZip from "jszip";
import * as cd from "../components/card";
import { Config } from "../components/config";
import { Card } from "../components/card";
import { Canvas } from "../components/canvas";

const props = defineProps<{
  config: Config;
  card: Card;
}>();

// Canvas相关变量
let batchCard: Ref<Card> = ref(new Card());
let batchCvs: Ref<Canvas>;

// 过程变量
let process: Ref<string> = ref("setting");
let processText: Ref<string> = ref("");
let cardIndex: Ref<number> = ref(0);
let codeDict: string[];
let imgFileList: { [key: string]: string } = {};
let cardsZip: Promise<Blob>;

// 挂载时初始化
onMounted(() => {
  batchCvs = ref(
    new Canvas( document.getElementById("batch_canvas") as HTMLCanvasElement, 600, 870)
  );
  // 绘制Canvases
  drawCanvases(batchCard.value);
  // 获取卡牌列表
  codeDict = getCodeIndex();
});

// 保证宽高比一致
watch(
  () => [props.config.saveCardSize.w, props.config.saveCardSize.h],
  ([nw, nh], [ow, oh]) => {
    if (ow == nw) {
      props.config.saveCardSize.w = Math.round((props.config.saveCardSize.h / 870) * 600);
    } else if (oh == nh) {
      props.config.saveCardSize.h = Math.round((props.config.saveCardSize.w / 600) * 870);
    }
  }
);
// 当图片加载完毕则绘制
watch(
  () => [
    batchCard.value.portrait.isLoad,
    batchCard.value.logo.isLoad,
    batchCard.value.shadow.isLoad,
  ],
  ([np, nl, ns]) => {
    if (np == true && nl == true && ns == true) {
      draw();
      if (process.value == "drawing") {
        step();
        if (cardIndex.value + 1 >= codeDict.length) {
          done();
        }
        cardIndex.value++;
      }
    }
  }
);
// 当选择角色变化时绘制
watch(
  () => props.card.code,
  () => {
    batchCard.value.code = props.card.code;
    cd.setCard(batchCard.value, props.config);
    cd.setShadow(batchCard.value, props.config);
    cd.setParty(batchCard.value, props.config);
    processInfo(processText, process.value, batchCard.value);
  }
);
// 当输出名称或者过程变化时重绘阶段提示
watch(
  () => [props.config.saveNameType, process.value],
  () => {
    processInfo(processText, process.value, batchCard.value);
    toggleProgress();
  }
);

// 绘制多张Canvas
function drawCanvases(card: Card) {
  document.querySelectorAll(".canvases .canvas_copy").forEach((each) => {
    const c = each as HTMLCanvasElement;
    const parities = props.config.getListItem(props.config.partyList);
    const party: {themeColor: string} = props.config.partyList[parities[Math.floor(Math.random() * parities.length)]];
    card.themeColor = party.themeColor;
    card.drawEmpty(c);
  });
}

// 开始处理
function startProcess() {
  setTimeout(() => {
    if (process.value == "setting") {
      process.value = "drawing";
      cardIndex.value = 0;
      imgFileList = {};
      step();
    } else if (process.value == "succeed") {
      process.value = "setting";
    }
  }, 0);
}

// 绘制卡牌
function draw() {
  // 清空画布
  batchCvs.value.clear();

  // 绘制卡牌
  batchCard.value.draw(batchCvs.value.cvs);

  // 更改清晰度
  if (batchCvs.value.cvs.width != props.config.saveCardSize.w) {
    batchCvs.value.resize(props.config.saveCardSize.w, props.config.saveCardSize.h);
  }
}

// 处理步骤
function step() {
  // 输出处理信息
  processInfo(processText, process.value, batchCard.value);
  toggleProgress();
  //存入图片列表
  if (process.value == "drawing") {
    saveCardImg(batchCvs.value, batchCard.value);
  }
  // 设定卡牌
  batchCard.value.code = codeDict[cardIndex.value];
  cd.setCard(batchCard.value, props.config);
}

// 绘制完成
function done() {
  process.value = "drew";
  setTimeout(() => {
    zipImages();
  }, 100);
}

// 停止处理
function stopProcess() {
  process.value = "setting";
  cardIndex.value = 0;
  imgFileList = {};
}

// 从Canvas获取图片Base64
function saveCardImg(canvas: Canvas, card: Card) {
  let fileName = getCardName(card, props.config.saveNameType);
  imgFileList[fileName] = canvas.cvs.toDataURL();
}

// 生成图片包
async function zipImages() {
  process.value = "zipping";
  let zip = new JSZip();
  for (let key in imgFileList) {
    let file = imgFileList[key];
    zip.file(key, file.substring(file.indexOf(",") + 1), {
      base64: true,
    });
  }
  cardsZip = zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 9,
    },
  });
  cardsZip.then(() => {
    process.value = "zipped";
    setTimeout(() => {
      process.value = "succeed";
    }, 100);
  });
}

// 下载图片包
async function batchDownload() {
  cardsZip.then((content) => {
    let d = new Date();
    const time = d.toLocaleDateString().replace(/\//g,"-");
    const fileName = props.config.getProjectDir() + "卡牌包_" + time + ".zip";
    if (props.config.isAutoDownload) {
      let result = window.electronAPI.saveFile(props.config.resourceDir + "/卡牌/" + fileName, content);
      if (result) {
        showDialog("成功保存文件至" + props.config.resourceDir + "/卡牌，使用快捷键[Ctrl+D]打开资源文件夹查看");
        return;
      }
      showDialog("保存失败，请手动保存");
    }
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.setAttribute("download", fileName);
    link.setAttribute("href", url);
    link.click();
  });
}

// 获取所有角色的代码数组
function getCodeIndex(): Array<string> {
  let array: Array<string> = [];
  for (let index in props.config.cardList) {
    array.push(index);
  }
  return array;
}

// 获取卡牌名称
function getCardName(card: Card, index: string): string {
  if (index == "code") return card.code + ".png";
  else if (index == "name&label") return card.name + " " + card.label + ".png";
  else if (index == "label&name") return card.label + " " + card.name + ".png";
  return "unknown" + ".png";
}

//输出处理信息
function processInfo(text: Ref<string>, code: string, card: Card) {
  if (code == "drawing") {
    text.value =
      "正在处理第" +
      String(cardIndex.value + 1) +
      "张(共" +
      codeDict.length +
      "张)...";
  } else if (code == "drew") {
    text.value = "绘制完成";
  } else if (code == "zipping") {
    text.value = "正在打包...";
  } else if (code == "zipped") {
    text.value = "打包完成";
  } else if (code == "succeed") {
    text.value = "处理完成，点击按钮导出卡牌包";
  } else {
    text.value = "预览名：" + getCardName(card, props.config.saveNameType);
  }
}

// 获取处理状态
function isProcessing(proc: string): boolean {
  if (
    proc == "drawing" ||
    proc == "drew" ||
    proc == "zipping" ||
    proc == "zipped"
  ) {
    return true;
  }
  return false;
}

// 更改进度条
function toggleProgress() {
  let bar = document.getElementsByClassName("progress-bar")[0] as HTMLElement;
  let text = document.getElementsByClassName("progress-text")[0] as HTMLElement;
  let percent = Math.round((cardIndex.value / codeDict.length) * 90);
  if (process.value == "zipping") percent += 2;
  else if (process.value == "zipped" || process.value == "succeed")
    percent += 10;
  bar.style.width = percent + "%";
  text.innerText = percent + "%";
}

// 界面洗牌
function shuffle() {
  document.querySelectorAll(".canvases canvas").forEach((each) => {
    let c = each as HTMLCanvasElement;
    c.style.animation = "Restore 0.5s ease infinite";
    setTimeout(() => {
      drawCanvases(batchCard.value);
    }, 750);
    setTimeout(() => {
      c.style.animation = "";
    }, 1000);
  });
}

// 显示弹窗
function showDialog(msg="", title="通知") {
  const dialog = document.querySelector("#btn_dialog") as HTMLElement;
  dialog.setAttribute("msg", msg);
  dialog.setAttribute("title", title);
  dialog.click();
}
</script>

<template>
  <div class="modal fade" id="modal_batch_downloader">
    <div class="modal-dialog modal-dialog-centered">
      <div
        class="modal-content bg-dark text-white shadow-lg rounded-1rem"
      >
        <div class="modal-header border-vup p-2">
          <h4 class="modal-title mx-auto fw-bold">批量下载</h4>
        </div>
        <div class="modal-body">
          <div class="batch-content">
            <div class="canvas-preview">
              <div class="canvases" @click="shuffle">
                <canvas class="canvas_copy" width="600" height="870"></canvas>
                <canvas class="canvas_copy" width="600" height="870"></canvas>
                <canvas class="canvas_copy" width="600" height="870"></canvas>
                <canvas class="canvas_copy" width="600" height="870"></canvas>
                <canvas id="batch_canvas" width="600" height="870"></canvas>
              </div>
              <div class="p-2 text-center">
                <span>{{ processText }}</span>
              </div>
            </div>
            <div class="batch-setting" v-if="process == 'setting'">
              <div class="input-group">
                <span class="input-group-text">导出卡牌名称</span>
                <div class="div-radio">
                  <input
                    name="cardName"
                    id="name1"
                    type="radio"
                    value="code"
                    v-model="config.saveNameType"
                  />
                  <label for="name1"></label>
                  <label for="name1">游戏内代码</label>
                </div>
                <div class="div-radio">
                  <input
                    name="cardName"
                    id="name2"
                    type="radio"
                    value="name&label"
                    v-model="config.saveNameType"
                  />
                  <label for="name2"></label>
                  <label for="name2">名称+称号</label>
                </div>
                <div class="div-radio">
                  <input
                    name="cardName"
                    id="name3"
                    type="radio"
                    value="label&name"
                    v-model="config.saveNameType"
                  />
                  <label for="name3"></label>
                  <label for="name3">称号+名称</label>
                </div>
              </div>
              <div class="input-group">
                <span class="input-group-text">图片大小</span>
                <div class="center mx-auto">
                  <input class="input-size" v-model="config.saveCardSize.w" disabled />
                  <span class="center ms-2">×</span>
                  <input class="input-size" v-model="config.saveCardSize.h" disabled />
                </div>
                <input
                  class="input-range"
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  v-model="config.saveCardSize.w"
                />
              </div>
              <div class="info mx-3" v-if="config.saveCardSize.w > 600">
                <span class="text-warning">请注意:由于卡牌渲染大小为600x870，因此图片大小大于此数值将无法更加清晰</span>
              </div>
            </div>
            <div
              class="batch-processing"
              v-show="isProcessing(process) || process == 'succeed'"
            >
              <div class="progress w-75">
                <span class="progress-text">0%</span>
                <div
                  class="progress-bar bg-success progress-bar-striped progress-bar-animated"
                  style="width: 0%"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer center border-0">
          <div class="batch-btn">
            <a class="btn btn-esc" data-bs-dismiss="modal">关闭界面</a>
            <a
              class="btn btn-danger"
              v-show="isProcessing(process)"
              :disabled="process != 'drawing'"
              @click="stopProcess"
            >
              终止
            </a>
            <a
              class="btn btn-success"
              v-show="process == 'succeed'"
              @click="batchDownload"
            >
              导出卡牌包
            </a>
            <a class="btn btn-danger" v-show="process == 'failed'" disabled>
              失败
            </a>
            <a class="btn" :disabled="isProcessing(process)" @click="startProcess">
              <span
                class="spinner-border spinner-border-sm"
                v-if="isProcessing(process)"
              ></span>
              <span v-if="isProcessing(process)"> 处理中</span>
              <span v-if="process == 'setting'">开始生成</span>
              <span v-if="process == 'succeed'">重新生成</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes Restore {
  50% {
    top: 0;
    left: 0;
  }
}
</style>

<style scoped>
  *[disabled=false] {
    cursor: pointer !important;
  }
  *[disabled=true] {
    cursor: not-allowed !important;
    opacity: 0.5 !important;
  }
  .canvases {
    position: relative;
    width: 300px;
    height: 220px;
    margin: 3vh;
    transform-origin: top center;
    transform: scale(0.5, 0.5);
  }
  .canvases canvas {
    position: absolute;
    height: 435px;
    border-radius: 12%/8.2%;
    background: #f8f9fa;
    box-shadow: 0 0 1vh 0.2vh #999;
  }
  .canvases canvas:nth-child(1) {
    top: -2vh;
    left: -2vh;
  }
  .canvases canvas:nth-child(2) {
    top: -1vh;
    left: -1vh;
  }
  .canvases canvas:nth-child(3) {
    top: 0;
    left: 0;
  }
  .canvases canvas:nth-child(4) {
    top: 1vh;
    left: 1vh;
  }
  .canvases canvas:nth-child(5) {
    top: 2vh;
    left: 2vh;
  }
  .batch-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .canvas-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .batch-setting {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .batch-processing {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .progress {
    position: relative;
    height: 1.3rem;
    background: #4f555c;
    border-radius: 0.3rem;
    overflow: unset;
  }
  .progress-text {
    position: absolute;
    width: fit-content;
    height: 1rem;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    z-index: 2;
  }
  @keyframes Blink {
    50% {
      box-shadow: 0 0 5px 1px #f8f9fa;
    }
  }
  .progress-bar {
    position: relative;
    border-radius: 0.3rem;
    overflow: visible;
  }
  .progress-bar::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 0.3rem;
    box-shadow: 0 0 10px 3px #f8f9fa;
    animation: Blink 2s ease infinite;
    animation-fill-mode: forwards;
  }
  .batch-btn {
    display: flex;
    justify-content: center;
  }
  .input-group {
    width: fit-content;
    height: 2.4rem;
    margin: 0.5rem;
    overflow: hidden;
    border-radius: 0.4rem;
    border: #f8f9fa solid 1px;
  }
  .input-group-text {
    color: #f8f9fa;
    background: #212529;
    border: none;
    border-right: 1px solid #fafafa;
    z-index: 10;
  }
  .input-group input {
    width: 8rem;
    padding: 0 0.2rem;
    color: #f8f9fa;
    background: #393e44;
    text-align: center;
    border: none;
  }
  .input-size {
    width: 3rem !important;
    margin: auto 0 auto 0.5rem !important;
    border-radius: 0.5rem !important;
    cursor: text;
  }
  .input-range {
    width: 15.6rem !important;
    margin: 0 0.5rem !important;
  }

  .div-radio {
    margin: 0 0.5rem !important;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .div-radio input {
    display: none;
  }
  .div-radio label:nth-child(2) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 100%;
    border: 2px solid #fafafa;
    cursor: pointer;
    background: transparent;
    transition: all cubic-bezier(0, 1, 0.5, 3) 0.3s;
  }
  .div-radio label:nth-child(3) {
    padding-left: 0.4rem;
  }

  .div-radio input:checked + label:nth-child(2) {
    width: 1.6rem;
    height: 1.6rem;
    top: 0.35rem;
    right: 0.35rem;
  }
  .div-radio label:nth-child(2)::after {
    content: "";
    display: block;
    width: 0;
    height: 0;
    border-radius: 100%;
    background: #fafafa;
    transition: all cubic-bezier(0, 1, 0.5, 2) 0.3s;
  }

  .div-radio input:checked + label:nth-child(2)::after {
    width: 0.6rem;
    height: 0.6rem;
  }
</style>
