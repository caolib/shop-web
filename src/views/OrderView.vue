<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';

const route = useRoute();
const selectedItems = ref([]);

onMounted(() => {
  const items = route.query.items;
  if (items) {
    selectedItems.value = JSON.parse(items);
  }
});
</script>
<!--TODO -->
<template>
  <div>
    <h1>订单确认</h1>
    <div v-for="item in selectedItems" :key="item.id">
      <p>{{ item.name }} - 数量: {{ item.num }}</p>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
