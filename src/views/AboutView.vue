<script setup>

import { checkServicesHealth } from '@/api/status.js'
import { onMounted } from 'vue'

const getServiceStatus = () => {
  checkServicesHealth().then((res)=>{
    console.log(res)
  })
}

onMounted(() => {
  getServiceStatus()
})

</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<style scoped></style>
