<script setup>
import { onMounted, ref } from 'vue'
import { getPayOrderService } from '@/api/pay-order.js'

const payOrders = ref([])

const getPayOrders = async () => {
  await getPayOrderService().then((res) => {
    console.log(res)
    payOrders.value = res.data
  })
}

onMounted(() => {
  getPayOrders()
})

</script>

<template>
  <div>
    <!--TODO-->
    订单信息页面
  </div>
</template>

<style scoped lang="less"></style>
