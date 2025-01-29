<script setup>
import { queryCommodityById } from '@/api/search'
import { addCartService } from '@/api/cart'
import { message, notification } from 'ant-design-vue'
import { onMounted, ref, h } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from 'ant-design-vue/es/radio'
import { useOrderStore } from '@/stores/order'
import { jump } from '@/router/jump'

const route = useRoute()
const commodity = ref(null)
const orderStore = useOrderStore()

onMounted(() => {
  // 解析路径参数id
  const id = route.query.id
  if (id) {
    console.log(`商品ID: ${id}`)
    queryCommodity(id)
  }
})

// 查询商品
const queryCommodity = async (id) => {
  await queryCommodityById(id).then((res) => {
    commodity.value = res
  })
}

// 加入购物车
const addToCart = async (commodity) => {
  const hide = message.loading('正在添加商品到购物车...', 0)
  await addCartService(commodity).then(() => {
    openNotification()
  }).finally(() => {
    hide()
  })
}

// 添加商品成功弹窗
const openNotification = () => {
  const key = `open${Date.now()}`;
  notification.open({
    type: 'success',
    message: '添加成功，点击前往查看！',
    duration: 3,
    placement: 'bottomRight',
    btn: h(
      Button,
      {
        type: 'primary',
        onClick: () => {
          notification.close(key);
          jump('/cart')
        },
      },
      { default: () => '前往购物车结算', }
    ),
    key,
  });
};


const selectedItems = ref([]) // 选中的的商品

// 立即购买
const buyNow = (commodity) => {
  console.log(commodity)
  commodity.num = 1;
  commodity.itemId = commodity.id;
  selectedItems.value.push(commodity);
  if (selectedItems.value.length === 0) {
    message.error('请选择要结算的商品')
    return
  }
  orderStore.setSelectedItems(selectedItems.value)
  jump('/order')
}

</script>

<template>
  <div class="commodity-page">
    <div v-if="commodity" class="commodity-container">
      <a-row :gutter="16">
        <a-col :span="10">
          <img :src="commodity.image" alt="商品图片" class="commodity-image" />
        </a-col>
        <a-col :span="14" class="commodity-details">
          <h1 class="commodity-title">{{ commodity.name }}</h1>
          <p class="commodity-price"><span class="label">价格</span> ￥{{ (commodity.price / 100).toFixed(2) }}
          </p>
          <p class="commodity-stock"><span class="label">库存</span> {{ commodity.stock }}</p>
          <p class="commodity-category"><span class="label">分类</span> {{ commodity.category }}</p>
          <p class="commodity-brand"><span class="label">品牌</span> {{ commodity.brand }}</p>
          <p class="commodity-spec">
            <span class="label">规格</span>
            <span v-for="(value, key) in JSON.parse(commodity.spec)" :key="key">
              <a-tag style="font-size: 16px;margin-left: 10px;">{{ value }}</a-tag>
            </span>
          </p>
          <p class="commodity-sold"><span class="label">销量</span> {{ commodity.sold }}</p>
          <p class="commodity-comments"><span class="label">评论</span> {{ commodity.commentCount }}</p>
          <div class="commodity-buttons">
            <a-button type="primary" size="large" @click="addToCart(commodity)">加入购物车</a-button>
            <a-button type="primary" @click="buyNow(commodity)" size="large" style="margin-left: 10px;">立即购买</a-button>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>






<style lang="less" scoped>
@import "@/styles/var";

.commodity-page {
  height: auto;
  padding: 20px;
}

.commodity-details {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.commodity-container {
  margin-top: 20px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.commodity-image {
  width: 100%;
  border-radius: 8px;
}

.commodity-title {
  color: gray;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.commodity-price,
.commodity-stock,
.commodity-category,
.commodity-brand,
.commodity-spec,
.commodity-sold,
.commodity-comments {
  font-size: 16px;
}

.commodity-price {
  color: red
}

.label {
  color: gray;
}

.commodity-buttons {
  margin-top: auto;
  padding-top: 20px;
}
</style>
