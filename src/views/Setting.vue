<script setup lang="ts">
import { watch } from "vue";
import { Config } from "../components/config";

// 相关变量

const props = defineProps<{
  config: Config;
}>();

// 保证宽高比一致
watch(
  () => [props.config.saveCardSize?.w, props.config.saveCardSize?.h],
  ([nw, nh], [ow, oh]) => {
    if (props.config.saveCardSize?.w)
    if (ow == nw) {
        props.config.saveCardSize.w = Math.round((props.config.saveCardSize.h / 870) * 600);
    } else if (oh == nh) {
      props.config.saveCardSize.h = Math.round((props.config.saveCardSize.w / 600) * 870);
    }
  }
);

// 选择资源文件夹
function chooseResDir() {
  const result = window.electronAPI.openDialog("选择资源文件", "", "选择此文件夹", "", ["openDirectory"]);
  if (result) {
    props.config.resetResourceDir(result[0]);
    if (!props.config.readRes()) {
      showDialog("导入资源文件夹失败，请注意资源是否正确", "导入失败");
    };
  }
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
  <div class="modal fade" id="modal_setting">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white shadow-lg rounded-1rem">
        <div class="modal-header border-vup p-2">
          <h4 class="modal-title mx-auto fw-bold">配置</h4>
        </div>
        <div class="modal-body center">
          <div class="setting center">
            <div class="col-12 fw-bold my-3 center border-vup">
              <span>资源配置</span>
            </div>
            <div class="input-group">
              <span class="input-group-text">资源文件夹</span>
              <input class="input-dir" type="text" v-model="config.resourceDir" readonly :title="config.resourceDir"/>
              <a class="btn-dir" @click="chooseResDir" title="选择资源文件夹"></a>
            </div>
            <div class="col-12 fw-bold my-3 center border-vup">
              <span>导出配置</span>
            </div>
            <div class="input-group">
              <label class="input-group-text" for="auto_output">卡牌自动导出至资源文件夹</label>
              <div class="div-radio width-2">
                <input id="auto_output" type="checkbox" v-model="config.isAutoDownload" />
                <label for="auto_output"></label>
              </div>
            </div>
            <div class="input-group">
              <label class="input-group-text" for="edit_party_only_new">仅新增势力可修改</label>
              <div class="div-radio width-2">
                <input id="edit_party_only_new" type="checkbox" v-model="config.onlyEditNewParty" />
                <label for="edit_party_only_new"></label>
              </div>
            </div>
            <div class="input-group">
              <span class="input-group-text">导出卡牌名称</span>
              <div class="div-radio" title="如“qihaiyouxian_zhuangzhilingyun”">
                <input name="nameType" id="name_code" type="radio" value="code" v-model="config.saveNameType" />
                <label for="name_code"></label>
                <label for="name_code">游戏内代码</label>
              </div>
              <div class="div-radio" title="如“七海幽娴 幽海鸢行”">
                <input name="nameType" id="name_label" type="radio" value="name&label" v-model="config.saveNameType" />
                <label for="name_label"></label>
                <label for="name_label">名称+称号</label>
              </div>
              <div class="div-radio" title="如“幽海鸢行 七海幽娴”">
                <input name="nameType" id="label_name" type="radio" value="label&name" v-model="config.saveNameType" />
                <label for="label_name"></label>
                <label for="label_name">称号+名称</label>
              </div>
            </div>
            <div class="input-group" v-if="config.saveCardSize">
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
            <div class="info mx-3" v-if="config.saveCardSize?.w > 600">
              <span class="text-warning">请注意:由于卡牌渲染大小为600x870，因此图片大小大于此数值将无法更加清晰</span>
            </div>
          </div>
        </div>
        <div class="modal-footer center border-0">
          <button class="btn btn-esc" data-bs-dismiss="modal">返回</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
  .modal-body {
    padding: 2rem;
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
    padding: 0 0.2rem;
    color: #f8f9fa;
    background: #393e44;
    border: none;
  }
  .input-size {
    text-align: center;
  }
  .input-dir {
    padding: 0 1rem !important;
    width: 21rem;
  }
  .btn-dir {
    padding: 0.3rem 1rem;
    font-weight: bolder;
    color: #f8f9fa;
    border-left: 1px solid #fafafa;
    text-decoration: none;
    cursor: pointer;
  }
  .btn-dir::before {
    content: "...";
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
  .width-2 {
    width: 2.3rem;
  }
</style>
  