<script setup lang="ts">
</script>

<template>
  <div class="modal fade" id="modal_introduce">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white shadow-lg rounded-1rem">
        <div class="modal-header border-vup p-2">
          <h4 class="modal-title mx-auto fw-bold">食用手册</h4>
        </div>
        <div class="modal-body center mx-4 scroll">
          <pre>
            <p class="fs-5 text-center w-100 my-2">操作简述</p>
        初次打开请点击软件选择资源文件夹或将其拖入，此文件夹相当于本软件的单个项目文件，导入成功后即可通过左侧进行多角色的卡牌和势力数据的选择与修改，使用期间可拖入或在菜单栏内选择其他资源文件夹更换项目，当修改完毕之后务必保存文件，最终卡牌成品通过左下角按钮进行单张或者批量导出。

            <p class="fs-5 text-center w-100 my-2">注意事项</p>
1. 立绘以及势力图标等文件请按[Ctrl+D]打开资源文件夹之后自行添加和修改，图片数据放在各自子文件夹内，相关数据全部存放于数据集中。

2. 请注意，新增势力名只能在资源文件夹内的数据集内修改，默认与文件名相同；为保护共同使用势力和主题数据，新增势力的logo编辑和主题修改只可在初次导入以及未保存前执行，该功能可在设置内配置。

3. 点击立绘后使用小键盘上下键可快速切换角色，使用鼠标拖拽卡牌预览处移动立绘，滚轮缩放立绘；触屏设备单指移动立绘，双指缩放立绘。

4. 输入文字之前使用[^]符号生成大一号文字，使用[_]符号生成小一号文字(如"中^大_小"将生成中等字号的"中"，大字号的"大"，小字号的"小")。
          </pre>
        </div>
        <div class="modal-footer center border-0">
          <button class="btn btn-esc" data-bs-dismiss="modal">我已知晓</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
</style>
  