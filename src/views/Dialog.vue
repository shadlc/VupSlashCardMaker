<script setup lang="ts">
  defineProps<{
    dialog: {title: string, msg: string, type: string};
  }>();
  
  // 关闭窗口
  function exit() {
    window.electronAPI.exit();
  }

  // 刷新窗口
  function reload() {
    window.electronAPI.reload();
  }

  // 关闭此dialog
  function close() {
    const modalDialog = document.getElementById("modal_dialog") as HTMLElement;
    modalDialog.classList.remove("show");
    setTimeout(() => {
      modalDialog.style.display = "none";
    }, 200);
  }
</script>

<template>
  <div class="modal fade" id="modal_dialog">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white shadow-lg rounded-1rem" >
        <div class="modal-header border-vup p-2">
          <h4 class="modal-title mx-auto fw-bold">{{ dialog.title }}</h4>
        </div>
        <div class="modal-body center p-5">
          <pre>
            {{ dialog.msg }}
          </pre>
        </div>
        <div class="modal-footer center border-0">
          <div v-if="dialog.type == 'reload'">
            <a class="btn btn-danger" @click="reload">刷新</a>
            <a id="btn_close" class="btn btn-esc" @click="close">返回</a>
          </div>
          <div v-if="dialog.type == 'exit'">
            <a class="btn btn-danger" @click="exit">退出</a>
            <a id="btn_close" class="btn btn-esc" @click="close">返回</a>
          </div>
          <div v-if="!dialog.type">
            <a id="btn_close" class="btn btn-esc" @click="close">确定</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
  .modal {
    background: rgba(0, 0, 0, 0.2);
  }
  .display {
    display: block !important;
  }
</style>
  