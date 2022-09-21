<script setup lang="ts">
import { ref, watch } from "vue";
import { Config } from "../components/config";
import Introduce from "./Introduce.vue";
import Setting from "./Setting.vue";


// 配置
const props = defineProps<{
  config: Config;
}>();

let timer;
// 监听配置改变
watch(
  () => props.config,
  () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      props.config.save();
    }, 500);
  }, {deep: true}
);

// 检测窗口大小
let isFullScreen = ref(window.electronAPI?.isFullScreen());
let isMaximized = ref(window.electronAPI?.isMaximized());
window.addEventListener("resize", () => {
  isMaximized.value = window.electronAPI?.isMaximized();
});

// exposeInMainWorld函数
function minimize() {
  window.electronAPI?.min();
}
function maximize() {
  isMaximized.value = window.electronAPI?.max();
}
function exit() {
  if (props.config.isChanged) {
    showDialog("你还有修改尚未保存，继续将会丢失修改", "警告", "exit");
  } else {
    window.electronAPI?.exit();
  }
}
function reload(force=false) {
  if (!force && props.config.isChanged) {
    showDialog("你还有修改尚未保存，继续将会丢失修改", "警告", "reload");
  } else {
    window.electronAPI?.reload();
  }
}
function dev() {
  window.electronAPI?.dev();
}
function about() {
  window.electronAPI?.about();
}
function fullScreen() {
  window.electronAPI?.fullScreen();
  isFullScreen.value = window.electronAPI?.isFullScreen();
}
function save() {
  let result = props.config.saveRes();
  if (result != true) {
    showDialog("写入数据集失败，失败原因为:\n" + result, "写入失败");
  } else {
    props.config.cardListFile = JSON.parse(JSON.stringify(props.config.cardList));
    props.config.partyListFile = JSON.parse(JSON.stringify(props.config.partyList));
  }
}
function openResDir() {
  window.electronAPI?.open("start " + props.config.resourceDir);
}
function openResXlsx() {
  window.electronAPI?.open(props.config.resourceXlsx);
}

// 显示弹窗
function showDialog(msg="", title="通知", type="") {
  const dialog = document.querySelector("#btn_dialog") as HTMLElement;
  dialog.setAttribute("msg", msg);
  dialog.setAttribute("title", title);
  dialog.setAttribute("type", type);
  dialog.click();
}

// 菜单控制
function toggleMenu(id: string, active: boolean | undefined = undefined) {
  let menu = document.getElementById(id);
  if (menu) {
    active = active??menu.classList.contains("active");
    document.querySelectorAll(".menu").forEach((each) => {
      each.classList.remove("active");
    })
    if (active) {
      menu.classList.remove("active");
    } else {
      menu.classList.add("active");
    }
  }
}
function toMenu(id: string) {
  let menu = document.getElementById(id);
  let isActivated = false;
  if (menu) {
    document.querySelectorAll(".menu").forEach((each) => {
      if (each.classList.contains("active")) {
        each.classList.remove("active");
        isActivated = true;
      }
    })
    if (isActivated) {
      menu.classList.add("active");
    }
  }
}

// 监听快捷键
window.addEventListener("keyup", handleKeyPress, true)
function handleKeyPress(event) {
  if (event.key === "F2") {
    const btnHelp = document.querySelector("#help") as HTMLElement;
    if (btnHelp) btnHelp.click();
  } else if (event.key === "F5") {
    if (event.shiftKey) reload(true);
    else reload();
  } else if (event.key === "F10") {
    about();
  } else if (event.key === "F11") {
    fullScreen();
  } else if (event.key === "F12") {
    dev();
  } else if (event.key === "Escape") {
    const btnClose = document.querySelector(".modal.show .btn-esc") as HTMLElement;
    if (btnClose) btnClose.click();
  } else if (event.ctrlKey && event.key === 'e') {
    openResXlsx();
  } else if (event.ctrlKey && event.key === 'd') {
    openResDir();
  } else if (event.ctrlKey && event.key === 's') {
    save();
  } else if (event.ctrlKey && event.key === 'o') {
    const setting = document.querySelector("a[data-bs-target='#modal_setting']") as HTMLElement;
    if (setting) setting.click();
  }
}
</script>
    
<template>
  <div id="title_bar" v-if="!isFullScreen">
    <img id="icon" src="../assets/img/favicon.png" />
    <button class="btn-menu" tabindex="-1" @click="toggleMenu('menu_setting')" @mouseover="toMenu('menu_setting')">选项</button>
    <menu id="menu_setting" class="menu" @click="toggleMenu('menu_setting', true)">
      <a class="sub-menu" data-bs-toggle="modal" data-bs-target="#modal_setting">配置<span class="short-cut">(Ctrl+O)</span></a>
      <a class="sub-menu" @click="save()">保存<span class="short-cut">(Ctrl+S)</span></a>
      <div class="border-top border-secondary"></div>
      <a class="sub-menu" @click="openResDir()">打开资源文件夹<span class="short-cut">(Ctrl+D)</span></a>
      <a class="sub-menu" @click="openResXlsx()">打开数据集<span class="short-cut">(Ctrl+E)</span></a>
    </menu>
    <button class="btn-menu" tabindex="-1" @click="toggleMenu('menu_about')" @mouseover="toMenu('menu_about')">帮助</button>
    <menu id="menu_about" class="menu" @click="toggleMenu('menu_about', true)">
      <a id="help" class="sub-menu" data-bs-toggle="modal" data-bs-target="#modal_introduce">使用说明<span class="short-cut">(F2)</span></a>
      <a class="sub-menu" @click="reload()">刷新<span class="short-cut">(F5)</span></a>
      <a class="sub-menu" @click="fullScreen()">全屏<span class="short-cut">(F11)</span></a>
      <a class="sub-menu" @click="dev()">调试<span class="short-cut">(F12)</span></a>
      <div class="border-top border-secondary"></div>
      <a class="sub-menu" @click="about()">关于<span class="short-cut">(F10)</span></a>
    </menu>
    <span id="title">VUP杀卡牌制作器<span v-if="config.resourceDir && config.isResLoaded">-{{ config.getProjectDir() }}</span><span class="no-save" v-if="config.isChanged">*</span></span>
    <div class="btn-group">
      <button class="btn-control btn-win-mize" tabindex="-1" @click="minimize()"></button>
      <button class="btn-control btn-win-mize" tabindex="-1" @click="maximize()" v-show="!isMaximized"></button>
      <button class="btn-control btn-win-mize" tabindex="-1" @click="maximize()" v-show="isMaximized"></button>
      <button class="btn-control btn-win-close" tabindex="-1" @click="exit()"></button>
    </div>
  </div>
  <Setting :config="config" />
  <Introduce />
</template>
    
<style scoped>
  .no-save {
    position: absolute;
    font-size: 2rem;
    top: 0;
  }
  .short-cut {
    margin-left: 2rem;
    float: right;
  }
  #title_bar {
    -webkit-app-region: drag;
    position: absolute;
    position: relative;
    width: 100%;
    height: 30px;
    color: #cacaca;
    background: rgba(255, 255, 255, 0.1);
    flex-wrap: nowrap;
    white-space: nowrap;
    z-index: 100;
  }
  #icon {
    display: inline;
    height: 20px;
    width: 20px;
    margin: 5px;
  }
  #title {
    position: absolute;
    display: block;
    height: fit-content;
    width: fit-content;
    padding: 6px;
    top: 0;
    left: 0;
    right: 0;
    margin:auto;
  }
  .btn-group {
    position: absolute;
    right: 0;
    top: 0;
  }
  .btn-control {
    -webkit-app-region: no-drag;
    width: 30px;
    height: 30px;
    margin: 0;
    padding: 0;
    border: none;
    font-family: "iconfont";
    background: transparent;
    color: #cacaca;
    cursor: unset;
    transition: all 0.2s ease;
  }
  .btn-win-mize:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #f8f9fa;
  }
  .btn-win-close:hover {
    background: rgba(243, 113, 126, 0.6);
    color: #f8f9fa;
  }
  .btn-menu {
    -webkit-app-region: no-drag;
    height: 26px;
    margin: 2px;
    padding: 0 1rem;
    border: none;
    border-radius: 5px;
    background: transparent;
    color: #cacaca;
    cursor: unset;
  }
  .btn-menu:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f8f9fa;
  }
  .menu {
    position: absolute;
    background: #323233;
    top: 26px;
    margin: 0;
    padding: 0.5rem 0;
    border-radius: 5px;
    padding-inline-start: 0 !important;
    overflow: hidden;
    transform: scaleY(0);
    opacity: 0;
    transform-origin: top center;
    transition: all 0.2s ease;
  }
  .menu.active {
    transform: scaleY(100%);
    opacity: 1 !important;
  }
  #menu_setting {
    left: 30px;
  }
  #menu_about {
    left: 85px;
  }
  .sub-menu {
    display: block;
    position: relative;
    padding: 0.4rem 2rem;
    text-decoration: none;
    color: #cacaca;
    background: #323233;
    cursor: pointer;
  }
  .sub-menu:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #f8f9fa;
  }
</style>
