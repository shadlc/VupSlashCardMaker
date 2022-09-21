<script setup lang="ts">
import { ref } from "vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Config } from "./components/config";
import Dialog from "./views/Dialog.vue";
import TitleBar from "./views/TitleBar.vue";
import CardMaker from "./views/CardMaker.vue";

// 配置
const config = ref(new Config());
config.value.read();

// 设置资源文件夹
function setResourceDir(event: any) {
  config.value.resetResourceDir(String(event.dataTransfer.files[0].path));
  if (!config.value.readRes()) {
    const dialog = document.querySelector("#btn_dialog") as HTMLElement;
    dialog.setAttribute("msg", "导入资源文件夹失败，请注意选择文件夹以及资源是否正确");
    dialog.setAttribute("title", "导入失败");
    dialog.click();
  };
}

// 选择资源文件夹
function chooseResDir() {
  const result = window.electronAPI.openDialog("选择资源文件", "", "选择此文件夹", "", ["openDirectory"]);
  if (result) {
    config.value.resetResourceDir(result[0]);
    if (!config.value.readRes()) {
      const dialog = document.querySelector("#btn_dialog") as HTMLElement;
      dialog.setAttribute("msg", "导入资源文件夹失败，请注意选择文件夹以及资源是否正确");
      dialog.setAttribute("title", "导入失败");
      dialog.click();
    };
  }
}

// 显示导入资源文件夹提示
function showInfo(isShow: boolean) {
  let makerDiv = document.querySelector(".res-info");
  if (isShow) makerDiv?.classList.add("show");
  else makerDiv?.classList.remove("show");
}

// 弹窗相关
const dialog = ref({ title: "", msg: "", type: "" });
function showDialog() {
  const btnDialog = document.querySelector("#btn_dialog") as HTMLElement;
  dialog.value.title = btnDialog.getAttribute("title") as string;
  dialog.value.msg = btnDialog.getAttribute("msg") as string;
  dialog.value.type = btnDialog.getAttribute("type") as string;
  btnDialog.removeAttribute("title");
  btnDialog.removeAttribute("msg");
  btnDialog.removeAttribute("type");

  const modalDialog = document.querySelector("#modal_dialog") as HTMLElement;
  modalDialog.style.display = "block";
    setTimeout(() => {
      modalDialog.classList.add("show");
    }, 10);
}

// 动态背景
setTimeout(() => {
  let deg = 320;
  let body = document.querySelector("body") as HTMLElement;
  setInterval(() => {
    if (deg <= 680) {
      body.style.background =
        "linear-gradient(" + deg + "deg, #211f2f, #001010) no-repeat fixed";
    } else deg = 320;
    deg++;
  }, 10);
  deg = 320;
}, 1000);

// 关闭所有菜单
function closeMenu() {
  document.querySelectorAll(".menu").forEach((each) => {
    each.classList.remove("active");
  })
}
</script>
<template>
  <Dialog :dialog="dialog" style="z-index:9999"></Dialog>
  <TitleBar :config="config"></TitleBar>
  <a id="btn_dialog" @click="showDialog()"></a>
  <div class="res-dir-div p-5 center text-center"
    v-if="!config.isResLoaded"
    @dragenter.prevent
    @dragover.prevent
    @drop.prevent="setResourceDir($event)"
    @click="chooseResDir()"
  >
    <p class="fs-1">将文件夹拖入或点击此处</p>
    <p class="fs-5 px-5">导入资源文件夹即可进行卡牌制作,按下F2获取软件帮助</p>
  </div>
  <div class="w-100 h-100 card-maker"
    @click="closeMenu"
    @dragenter.prevent
    @dragover.prevent="showInfo(true)"
    @drop.prevent="setResourceDir($event)"
    v-if="config.isResLoaded"
  >
    <div class="res-info" @dragleave.prevent="showInfo(false)" @drop="showInfo(false)"></div>
    <CardMaker :config="config"></CardMaker>
  </div>
</template>
  
<style>
  @font-face {
    font-family: "iconfont";
    src: url("./assets/fonts/iconfont.ttf");
  }
  @font-face {
    font-family: "zhengkuchaojihei";
    src: url("./assets/fonts/zhengkuchaojihei.ttf");
  }
  input[type=number]::-webkit-outer-spin-button,
  input[type=number]::-webkit-inner-spin-button {
    display: none;
  }
  *[disabled] {
    cursor: not-allowed !important;
    opacity: 0.5;
  }
  :focus-visible {
    outline: none;
  }
  .hide {
    display: none !important;
  }
  .center {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    align-content: center;
  }
  .info {
    width: 29rem;
  }
  pre {
    font-size: 12px;
    font-family: unset;
    white-space: pre-line;
    word-wrap: break-word;
    margin: 0;
  }
  html,
  body {
    -webkit-user-select: none;
    position: relative;
    margin: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    font-size: 12px;
  }
  body {
    background: #211f2f;
    background: -webkit-linear-gradient(320deg, #211f2f, #001010) fixed;
    background: linear-gradient(320deg, #211f2f, #001010) fixed;
  }
  #app {
    height: 100%;
    font-family: Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .border-vup {
    border-bottom: 1px solid;
    border-image: linear-gradient(to right, #212529 10%, #fafafa, #212529 90%) 20
      20;
    border-image: -webkit-linear-gradient(
        to right,
        #212529 10%,
        #fafafa,
        #212529 90%
      )
      20 20;
  }

  .modal {
    overflow: hidden;
  }
  .modal-dialog {
    max-width: 60%;
  }
  .modal-body {
    min-width: 200px;
    max-height: 75vh;
    overflow: auto;
  }
  .modal-content {
    width: fit-content;
    margin: auto;
  }
  .modal.fade .modal-dialog {
    opacity: 0;
    transform: scale(0.9, 0.9);
    transition: all 0.2s;
  }
  .modal.fade.show .modal-dialog {
    opacity: 1;
    transform: scale(1, 1);
    transition: all 0.2s cubic-bezier(0, 1, 0.5, 1.6);
  }
  .modal.fade .modal-header::before {
    content: "";
    position: absolute;
    width: 50%;
    height:3.4rem;
    top: 0;
    left: 0;
    border-radius: 10px 0 0 0;
    background: #212529;
    transform-origin: center left;
    transition: all 0.3s ease-out 0.1s;
  }
  .modal.fade .modal-header::after {
    content: "";
    position: absolute;
    width: 50%;
    height:3.4rem;
    top: 0;
    right: 0;
    border-radius: 0 10px 0 0;
    background: #212529;
    transform-origin: center right;
    transition: all 0.3s ease-out 0.1s;
  }
  .modal.fade.show .modal-header::before,
  .modal.fade.show .modal-header::after {
    transform: scaleX(0);
  }
  .modal.fade .modal-content * {
    opacity: 0;
    transition: all 0.3s ease 0.1s;
  }
  .modal.fade.show .modal-content * {
    opacity: 1;
  }

  .btn {
    background: #212529;
    color: #f8f9fa;
    margin: 0.5rem;
    padding: 0.4rem 0.5rem;
    border: 1px solid #f8f9fa;
    border-radius: 1rem;
    box-shadow: 0 0 3px 2px #f8f9fadd;
    transition: all 0.15s ease-in-out;
  }
  .btn:hover {
    box-shadow: 0 0 5px 4px #f8f9fadd;
    border-color: #f8f9fadd;
    background-color: #212529 !important;
  }
  .btn:active {
    transform: scale(0.9, 0.9) !important;
    background-color: #212529 !important;
    border-color: #f8f9fadd !important;
  }
  button:focus:not(:focus-visible) {
    box-shadow: none;
  }
  .btn-check:focus + .btn,
  .btn:focus,
  .accordion-button:focus {
    outline: none;
    box-shadow: 0 0 5px 4px #f8f9fadd;
  }
  .btn-outline-secondary {
    background: transparent;
    color: #6c757d;
    border-color: #6c757d;
  }
  .btn-danger {
    color: #f3717e !important;
    border-color: #f3717e;
    box-shadow: 0 0 3px 2px #f3717e;
  }
  .btn-danger:focus,
  .btn-danger:hover {
    background: #212529;
    box-shadow: 0 0 5px 4px #f3717e !important;
  }
  .btn-success {
    color: #8ef682 !important;
    border-color: #8ef682;
    box-shadow: 0 0 3px 2px #8ef682;
  }
  .btn-success:focus,
  .btn-success:hover {
    background: #212529;
    box-shadow: 0 0 5px 4px #8ef682 !important;
  }
  
  .scroll-hide::-webkit-scrollbar {
    visibility: hidden;
  }
  .scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .scroll::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 3px;
    margin: 10px 0;
  }
  .scroll::-webkit-scrollbar-thumb {
    background-color: #858585;
    border-radius: 3px;
    transition: all 0.2s ease-in-out !important;
  }
  .scroll::-webkit-scrollbar-thumb:hover {
    background-color: #b3b3b3;
  }

  .rounded-1rem {
    border-radius: 1rem;
  }
  .res-dir-div {
    position: absolute;
    width: 100%;
    height: 100%;
    color: #999999;
    font-weight: bolder;
    flex-direction: column;
  }
  .res-info::before {
    content: "松开导入资源文件夹";
    display: none;
    position: absolute;
    width: 100%;
    height: 100%;
    font-size: 4rem;
    font-weight: bolder;
    text-align: center;
    padding: calc(50vh - 5rem) 0;
    color: #f8f9fa;
    background: black;
    opacity: 0.5;
    z-index: 100;
    transition: all 0.5s ease-in-out;
  }
  .res-info.show::before {
    display: block;
  }
</style>
  