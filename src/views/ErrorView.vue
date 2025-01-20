<script setup>

import { jump } from '@/router/jump.js'
</script>

<template>
  <a-result status="404" title="404" sub-title="你访问页面不存在">
    <template #extra>
      <a-button type="primary" @click="jump('/')">返回主页</a-button>
    </template>
  </a-result>
</template>

<style scoped lang="less">

</style>
