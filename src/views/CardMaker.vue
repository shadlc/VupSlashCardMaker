<script setup lang="ts">
import BatchDownloader from "./BatchDownloader.vue";
import { Ref, ref, onMounted, watch, onBeforeMount } from "vue";
import * as cd from "../components/card";
import { Config } from "../components/config";
import { Card } from "../components/card";
import { Canvas } from "../components/canvas";
import { Mouse } from "../components/move";

// 配置
const props = defineProps<{
  config: Config;
}>();

// Canvas相关变量
const width = 600;
const height = 870;
let cardCvs: Ref<Canvas>;
let card = ref(new Card());
let isCardChanged = false;
let loopTimeout = false;

// 鼠标相关变量
const mouse: Ref<Mouse> = ref(new Mouse());
class oldPortrait {
  x = 0;
  y = 0;
  w = 0;
  h = 0;
}
let oldP = new oldPortrait();

// 载入数据
let portraitList = ref();
let logoList = ref();
let shadowList = ref();

// 动画循环
function loop() {
  if (isCardChanged || loopTimeout) {
    // console.log(!props.config.onlyEditNewParty || !props.config.partyListFile[card.value.party])
    // 清空画布
    cardCvs.value.clear();

    // 绘制卡牌
    card.value.draw(cardCvs.value.cvs);

    // 更改清晰度
    if (cardCvs.value.cvs.width != props.config.saveCardSize.w) {
      cardCvs.value.resize(props.config.saveCardSize.w, props.config.saveCardSize.h);
    }

    // 重置变量
    isCardChanged = false;
    loopTimeout = false;
  }

  // 绘制移动
  if (card.value.portrait.isLoad && mouse.value.isDown) {
    movePortrait(card.value, mouse.value , oldP);
  }

  // 下一帧
  window.requestAnimationFrame(loop);
}

// 初始化变量
function inputRes() {
  if (window.electronAPI) {
    let temp = window.electronAPI.readDir(props.config.resourceDir + "/立绘") ?? {};
    portraitList.value = JSON.parse(JSON.stringify(temp).replace(/.png/g, ""));
    temp = window.electronAPI.readDir(props.config.resourceDir + "/势力") ?? {};
    logoList.value = JSON.parse(JSON.stringify(temp).replace(/.png/g, ""));
    checkNewParty(props.config);
    temp = window.electronAPI.readDir(props.config.resourceDir + "/阴影") ?? {};
    shadowList.value = JSON.parse(JSON.stringify(temp).replace(/.png/g, ""));
  }
}

// 初始化Canvas
function initCanvas() {
  cardCvs = ref(
    new Canvas(
      document.getElementById("card_canvas") as HTMLCanvasElement,
      width,
      height
    )
  );
  toggleRatio(mouse.value);
  moveListen(cardCvs.value.cvs, card.value, mouse.value);
}

// 挂载时初始化
onBeforeMount(() => {
  inputRes();
});
onMounted(() => {

  card.value.code = portraitList.value[0];
  changeCharacter(card.value, props.config);

  initCanvas();
  setInterval(() => {
    loopTimeout = true;
  }, 1000);
  window.requestAnimationFrame(loop);
});

// 监听窗口缩放
window.addEventListener("resize", () => {
  toggleRatio(mouse.value);
});

// 监听资源文件夹目录
watch(() => props.config.resourceDir,
  (n) => {
    inputRes();
    changeCharacter(card.value, props.config);
});

// 监听卡牌缩放
watch(
  () => [
    card.value.portraitW,
    card.value.portraitH,
    card.value.portraitX,
    card.value.portraitY,
  ],
  () => {
    card.value.portraitW = Math.round(Math.abs(card.value.portraitW)) ?? 0;
    card.value.portraitH = Math.round(Math.abs(card.value.portraitH)) ?? 0;
    card.value.portraitX = Math.round(card.value.portraitX) ?? 0;
    card.value.portraitY = Math.round(card.value.portraitY) ?? 0;
  }
);
// 监听卡牌参数改变
let timer;
watch(
  () => JSON.parse(JSON.stringify(card.value)),
  (n, o) => {
    isCardChanged = true;
    if (n.code != o.code) {
      changeCharacter(card.value, props.config);
    }
    if (n.code == o.code) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        cd.syncCardList(card.value, props.config);
        cd.syncPartyList(card.value, props.config);
      }, 200);
    }
  }
);

// 监听数据列表改变
watch(
  () => [props.config.cardList, props.config.partyList, props.config.cardListFile, props.config.partyListFile],
  () => {
    if (
      JSON.stringify(props.config.cardListFile) != JSON.stringify(props.config.cardList) ||
      JSON.stringify(props.config.partyListFile) != JSON.stringify(props.config.partyList)
    ) {
      props.config.isChanged = true;
    } else {
      props.config.isChanged = false;
    }
  },
  { deep: true }
);

// 监听立绘移动
function moveListen(cvs: HTMLCanvasElement, card: Card, mouse: Mouse) {
  const addEL = cvs.addEventListener;
  addEL("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  addEL("mousedown", (e) => {
    if (mouse.isDown) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.startX = mouse.x;
      mouse.startY = mouse.y;
      oldP.x = card.portraitX;
      oldP.y = card.portraitY;
    }
  });

  addEL("mouseup", () => {
    mouse.isDown = false;
  });

  addEL("touchmove", (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    if (e.touches.length >= 2) {
      mouse.x2 = e.touches[1].clientX;
      mouse.y2 = e.touches[1].clientY;
    }
  });

  addEL("touchstart", (e) => {
    if (mouse.isDown) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.startX = mouse.x;
      mouse.startY = mouse.y;
      oldP.x = card.portraitX;
      oldP.y = card.portraitY;
      if (e.touches.length >= 2) {
        mouse.isMoveable = true;
        mouse.x2 = e.touches[1].clientX;
        mouse.y2 = e.touches[1].clientY;
        mouse.startX2 = mouse.x2;
        mouse.startY2 = mouse.y2;
        mouse.distance = Math.hypot(
          mouse.startX - mouse.startX2,
          mouse.startY - mouse.startY2
        );
        oldP.w = card.portraitW;
        oldP.h = card.portraitH;
      }
    }
  });

  addEL("touchend", (e) => {
    if (e.touches.length == 0) {
      mouse.isDown = false;
    } else if (e.touches.length <= 1) {
      mouse.isMoveable = false;
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.startX = mouse.x;
      mouse.startY = mouse.y;
      oldP.x = card.portraitX;
      oldP.y = card.portraitY;
    }
  });
}

// 修改操作比例
function toggleRatio(mouse: Mouse) {
  mouse.screenRatio = parseInt(window.getComputedStyle(document.getElementById("card_canvas") as HTMLElement).width) / width;
}
// 移动立绘
function movePortrait(card: Card, mouse: Mouse, oldP: oldPortrait) {
  let newP = new class { w = card.portraitW; h = card.portraitH; x = card.portraitX; y = card.portraitY; }
  if (mouse.isMoveable) {
    newP.x = oldP.x + (mouse.x - mouse.startX + (mouse.x2 - mouse.startX2)) / mouse.screenRatio / 2;
    newP.y = oldP.y + (mouse.y - mouse.startY + (mouse.y2 - mouse.startY2)) / mouse.screenRatio / 2;
    let distance = Math.hypot(mouse.x - mouse.x2, mouse.y - mouse.y2);
    newP.w = Math.round(oldP.w * (distance / mouse.distance));
    newP.h = Math.round(oldP.h * (distance / mouse.distance));
    newP.x += (oldP.w - card.portraitW) / 2;
    newP.y += (oldP.h - card.portraitH) / 2;
  } else {
    newP.x = oldP.x + (mouse.x - mouse.startX) / mouse.screenRatio;
    newP.y = oldP.y + (mouse.y - mouse.startY) / mouse.screenRatio;
  }

  newP.x = Math.round(newP.x);
  newP.y = Math.round(newP.y);
  if (newP.x != card.portraitX || newP.y != card.portraitY) {
    card.portraitW = newP.w;
    card.portraitH = newP.h;
    card.portraitX = newP.x;
    card.portraitY = newP.y;
  }
}

// 缩放立绘
function zoomPortrait(card: Card, event: WheelEvent) {
  if (card.portrait.isLoad) {
    let direction: number = event.deltaY;
    let oldPW = card.portraitW;
    let oldPH = card.portraitH;
    if (direction < 0) {
      card.portraitW *= 1.020408;
      card.portraitH *= 1.020408;
    } else if (direction > 0) {
      card.portraitW *= 0.98;
      card.portraitH *= 0.98;
    }
    card.portraitX += (oldPW - card.portraitW) / 2;
    card.portraitY += (oldPH - card.portraitH) / 2;
  }
}

// 更改角色
function changeCharacter(card: Card, config: Config) {
  cd.setCard(card, config);
  cd.setShadow(card, config);
  cd.setParty(card, config);
}
// 更改势力
function changeParty(card: Card, config: Config) {
  cd.setParty(card, config);
}
// 更改阴影
function changeShadow(card: Card, config: Config) {
  cd.setShadow(card, config);
}

// 是否可编辑势力
function disabledEditParty(): boolean {
  return props.config.onlyEditNewParty && props.config.partyListFile[card.value.party];
}

// 检测是否有新势力导入
function checkNewParty(config: Config) {
  const l = logoList.value;
  for (let i in l) {
    if (!config.partyList[l[i]]) {
      config.partyList[l[i]] = {};
      config.partyList[l[i]].name = l[i];
      showDialog("检测到新导入势力，已默认将势力名称与势力代码同步，如需修改请先按[Ctrl+S]保存后按[Ctrl+E]打开数据集修改势力名称，之后使用[F5]刷新页面重载数据", "新势力导入");
    }
  }
}

// 获取卡牌名称
function getCardName(card: Card, type: string) {
  let name = "";
  if (type == "code" && card.code) {
    name += card.code;
  } else if (type == "name&label" && card.name && card.label) {
    name += card.name + " " + card.label;
  } else if (type == "label&name" && card.name && card.label) {
    name += card.label + " " + card.name;
  } else {
    name += "unknown";
  }
  return name += ".png";
}
// 下载卡牌
function downloadCard(card: Card) {
  const fileName = getCardName(card, props.config.saveNameType);
  cardCvs.value.cvs.toBlob((blob) => {
    if (blob) {
      if (props.config.isAutoDownload) {
        let result = window.electronAPI.saveFile(props.config.resourceDir + "/卡牌/" + fileName, blob);
        if (result) {
          showDialog("成功保存文件至" + props.config.resourceDir + "/卡牌，使用快捷键[Ctrl+D]打开资源文件夹查看");
          return;
        }
        showDialog("保存失败，请手动保存");
      }
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("download", fileName);
      link.setAttribute("href", url);
      link.click();
    }
  });
}

// 重置配置
function reset(card: Card, event: MouseEvent) {
  if (props.config.cardListFile[card.code] && props.config.partyListFile[card.party]) {
    if (event.shiftKey) {
      props.config.cardList = JSON.parse(JSON.stringify(props.config.cardListFile));
      props.config.partyList = JSON.parse(JSON.stringify(props.config.partyListFile));
    } else {
      props.config.cardList[card.code] = JSON.parse(JSON.stringify(props.config.cardListFile[card.code]));
      props.config.partyList[card.party] = JSON.parse(JSON.stringify(props.config.partyListFile[card.party]));
    }
      changeCharacter(card, props.config);
  } else {
    showDialog("未保存原数据！");
  }
}

// 显示弹窗
function showDialog(msg="", title="通知") {
  const dialog = document.querySelector("#btn_dialog") as HTMLElement;
  dialog.setAttribute("msg", msg);
  dialog.setAttribute("title", title);
  dialog.click();
}
// 点击HTML元素
function click(element: string) {
  const htmlElement = document.querySelector(element) as HTMLElement;
  htmlElement?.click();
}
// select向上移动
function selectUp(element: string, card: Card) {
  const select = document.querySelector(element) as HTMLSelectElement;
  const i = select.selectedIndex;
  if (i >= 0 &&  i - 1 >= 0) {
    card.code = select.options[i - 1].value;
  }
}
// select向下移动
function selectDown(element: string, card: Card) {
  const select = document.querySelector(element) as HTMLSelectElement;
  const i = select.selectedIndex;
  if (i >= 0 && select.options.length >= i + 1) {
    card.code = select.options[i + 1].value;
  }
}
</script>
  
  <template>
    <div
      id="card_maker"
      class="container-fluid text-light"
    >
      <div id="card_view" class="text-center center">
        <canvas
          id="card_canvas"
          tabindex=0
          autofocus="autofocus"
          @mousedown="mouse.isDown = true"
          @touchstart.passive="mouse.isDown = true"
          @touchmove.prevent
          @wheel.prevent="zoomPortrait(card, $event)"
          @keydown.up="selectUp('.select-code', card)"
          @keydown.down="selectDown('.select-code', card)"
        ></canvas>
        <div id="card_control" class="center">
          <a
            class="btn"
            @click="reset(card, $event)"
            title="如需重置全部卡牌请按住Shift再点击"
          >
            重置
          </a>
          <a
            class="btn"
            data-bs-toggle="modal"
            data-bs-target="#modal_batch_downloader"
          >
          批量导出
          </a>
          <a class="btn" @click="downloadCard(card)">导出</a>
        </div>
      </div>
      <div id="card_editor" class="center">
        <div class="center">
          <div class="col-12 fw-bold my-2 center border-vup">
            <span>基础信息</span>
          </div>
          <div class="col-12 center">
            <div class="input-group">
              <span class="input-group-text">角色代码</span>
              <select
                class="form-select select-code"
                data-live-search="true"
                v-model="card.code"
              >
                <option
                  v-for="(code, index) in portraitList"
                  :key="index"
                  :value="code"
                >
                  {{ code }}
                </option>
              </select>
            </div>
          </div>
          <div class="input-group">
            <span class="input-group-text">角色名称</span>
            <input type="text" v-model="card.name" />
          </div>
          <div class="input-group">
            <span class="input-group-text">英文名称</span>
            <input type="text" v-model="card.nameEng" />
          </div>
          <div class="input-group">
            <span class="input-group-text">角色称号</span>
            <input type="text" v-model="card.label" />
          </div>
          <div class="input-group">
            <span class="input-group-text">角色势力</span>
            <select
              class="form-select select-party"
              v-model="card.party"
              @change="changeParty(card, config)"
            >
              <option value="undefined" disabled>未知势力</option>
              <option
                v-for="(party, index) in logoList"
                :key="index"
                :value="party"
              >
                {{ config.partyList[party]?.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="center">
          <div class="col-12 fw-bold my-2 center border-vup">
            <span>可调参数</span>
          </div>
          <div class="input-group">
            <span class="input-group-text">立绘可溢出边缘</span>
            <div class="div-checkbox">
              <input
                id="is-overflow"
                type="checkbox"
                v-model="card.isOverflow"
              />
              <label for="is-overflow"></label>
            </div>
          </div>
          <div class="input-group">
            <span class="input-group-text">立绘发光</span>
            <div class="div-checkbox div-shine">
              <input id="is-shine" type="checkbox" v-model="card.isShine" />
              <label for="is-shine"></label>
            </div>
            <div class="center mx-2">
              <input
                id="shine-color"
                class="input-color"
                type="color"
                v-model="card.shineColor"
                :disabled="!card.isShine"
              />
              <input
                class="input-color-text"
                type="text"
                v-model="card.shineColor"
                readonly
                @click="click('#shine-color')"
                :disabled="!card.isShine"
              />
            </div>
          </div>
          <div class="input-group">
            <span class="input-group-text">立绘坐标</span>
            <input
              class="input-coord"
              type="number"
              v-model="card.portraitX"
            />
            <input
              class="input-coord"
              type="number"
              v-model="card.portraitY"
            />
          </div>
          <div class="input-group">
            <span class="input-group-text">立绘尺寸</span>
            <input
              class="input-size"
              type="number"
              v-model="card.portraitW"
            />
            <input
              class="input-size"
              type="number"
              v-model="card.portraitH"
            />
          </div>
          <div class="input-group">
            <span class="input-group-text">阴影图案</span>
            <select
              class="form-select select-shadow"
              data-live-search="true"
              v-model="card.shadowType"
              @change="changeShadow(card, config)"
            >
              <option
                v-for="(shadow, index) in shadowList"
                :key="index"
                :value="shadow"
              >
                {{ shadow }}
              </option>
            </select>
          </div>
          <div class="input-group col-12 my-2 center">
            <span class="input-group-text">阴影距离</span>
            <input
              class="input-range"
              type="range"
              min="0"
              max="100"
              step="1"
              v-model="card.shadowDistance"
            />
          </div>
        </div>
        <div class="center">
          <div class="center">
            <div class="col-12 fw-bold my-2 center border-vup">
              <span>势力图标与主题</span>
            </div>
            <div class="input-group">
              <span class="input-group-text">图标坐标</span>
              <input
                class="input-coord"
                type="number"
                v-model="card.logoX"
                :disabled="disabledEditParty()"
              />
              <input
                class="input-coord"
                type="number"
                v-model="card.logoY"
                :disabled="disabledEditParty()"
              />
            </div>
            <div class="input-group">
              <span class="input-group-text">图标尺寸</span>
              <input
                class="input-size"
                type="number"
                v-model="card.logoW"
                :disabled="disabledEditParty()"
              />
              <input
                class="input-size"
                type="number"
                v-model="card.logoH"
                :disabled="disabledEditParty()"
              />
            </div>
          </div>
          <div class="input-group">
            <span class="input-group-text">主题颜色</span>
            <div class="center mx-2">
              <input
                id="theme-color"
                class="input-color"
                type="color"
                v-model="card.themeColor"
                :disabled="disabledEditParty()"
              />
              <input
                class="input-color-text"
                type="text"
                v-model="card.themeColor"
                readonly
                @click="click('#theme-color')"
                :disabled="disabledEditParty()"
              />
            </div>
          </div>
          <div class="input-group">
            <span class="input-group-text">名称颜色</span>
            <div class="center mx-2">
              <input
                id="name-color"
                class="input-color"
                type="color"
                v-model="card.nameColor"
                :disabled="disabledEditParty()"
              />
              <input
                class="input-color-text"
                type="text"
                v-model="card.nameColor"
                readonly
                @click="click('#name-color')"
                :disabled="disabledEditParty()"
              />
            </div>
          </div>
          <div class="input-group">
            <span class="input-group-text">称号颜色</span>
            <div class="center mx-2">
              <input
                id="label-color"
                class="input-color"
                type="color"
                v-model="card.labelColor"
                :disabled="disabledEditParty()"
              />
              <input
                class="input-color-text"
                type="text"
                v-model="card.labelColor"
                readonly
                @click="click('#label-color')"
                :disabled="disabledEditParty()"
              />
            </div>
          </div>
          <div class="input-group">
            <span class="input-group-text">轮廓颜色</span>
            <div class="center mx-2">
              <input
                id="border-color"
                class="input-color"
                type="color"
                v-model="card.borderColor"
                :disabled="disabledEditParty()"
              />
              <input
                class="input-color-text"
                type="text"
                v-model="card.borderColor"
                readonly
                @click="click('#border-color')"
                :disabled="disabledEditParty()"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <BatchDownloader :config="config" :card="card"></BatchDownloader>
  </template>
  
<style scoped>
#card_maker {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-around;
  align-items: center;
}
#card_view {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  height: 80%;
  padding-top: 1rem;
}
#card_canvas {
  height: 90%;
  margin: 0 1rem;
  border-radius: 12%/8.2%;
  box-shadow: 0 0 2vh 1vh #999;
  cursor: grab;
}
#card_control {
  margin: 1rem;
}
#card_canvas:active {
  cursor: move;
}
#card_editor {
  width: 340px;
  min-width: 340px;
  padding-bottom: 2rem;
}
select {
  background-color: #393e44;
  background-image: url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3e%3cpath fill=%27none%27 stroke=%27%23f8f9fa%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m2 5 6 6 6-6%27/%3e%3c/svg%3e");
  color: #f8f9fa;
}

.select-shadow {
  width: 5.2rem !important;
}
.select-code {
  width: 22rem !important;
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
  padding: 0.4rem;
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
.input-group input:focus-visible {
  outline: none;
}
.input-group select {
  width: 8rem;
  padding: 0 1rem;
  border: none;
}
.input-group select:hover {
  border: none;
}
.input-coord,
.input-size {
  width: 4rem !important;
}
.input-color {
  height: 1.5rem !important;
  width: 1.5rem !important;
  padding: 0 !important;
  background: #393e44;
  border-radius: 1rem;
  cursor: pointer;
  margin: auto 0;
}
.input-color-text {
  width: 5rem !important;
  margin: auto 0 auto 0.4rem !important;
  border-radius: 0.5rem;
  cursor: pointer;
}
.input-range {
  width: 8.5rem !important;
  margin: 0 1rem !important;
}
.btn-help {
  position: absolute;
  font-size: 10px;
  height: 18px;
  width: 18px;
  margin: 0 0.5rem;
  padding: 0;
  border: 1px solid white;
  border-radius: 100%;
  vertical-align: text-top;
}
.btn-save {
  margin-left: 6rem;
}
.btn-save-batch {
  margin-left: 4rem;
}

.div-shine {
  border: none;
  border-right: 1px solid #fafafa;
}
.div-checkbox {
  width: 2.4rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.div-checkbox input {
  display: none;
}
.div-checkbox label {
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

.div-checkbox input:checked + label {
  width: 1.6rem;
  height: 1.6rem;
  top: 0.35rem;
  right: 0.35rem;
}
.div-checkbox label::after {
  content: "";
  display: block;
  width: 0;
  height: 0;
  border-radius: 100%;
  background: #fafafa;
  transition: all cubic-bezier(0, 1, 0.5, 2) 0.3s;
}

.div-checkbox input:checked + label::after {
  width: 0.6rem;
  height: 0.6rem;
}
</style>
  