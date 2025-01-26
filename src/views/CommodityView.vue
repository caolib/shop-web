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
            <a-button type="primary" size="large" :loading="loading" @click="addToCart(commodity)">加入购物车</a-button>
            <a-button type="primary" size="large" style="margin-left: 10px;">立即购买</a-button>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<!-- TODO立即购买等功能 -->

<script setup>
import { queryCommodityById } from '@/api/search'
import { addCartService } from '@/api/cart'
import { message, notification } from 'ant-design-vue'
import { onMounted, ref, h } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from 'ant-design-vue/es/radio'
import router from '@/router'

const route = useRoute()
const commodity = ref(null)
const loading = ref(false)

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
    // console.log(res)
    commodity.value = res
  })
}

// 加入购物车
const addToCart = async (commodity) => {
  loading.value = true
  await addCartService(commodity).then(() => {
    loading.value = false
    openNotification()
  }).finally(() => {
    loading.value = false
  })
}

// 添加成功
const openNotification = () => {
  const key = `open${Date.now()}`;
  notification.open({
    type: 'success',
    message: '添加成功，点击前往查看！',
    duration: 3,
    placement: 'topRight',
    btn: h(
      Button,
      {
        type: 'primary',
        size: 'small',
        onClick: () => {
          notification.close(key);
          router.push('/cart');
        },
      },
      { default: () => '前往购物车结算', }
    ),
    key,
  });
};

</script>



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
