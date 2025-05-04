<script setup>
import { queryCommodityById } from '@/api/search'
import { addCartService } from '@/api/cart'
import { message, notification } from 'ant-design-vue'
import { onMounted, ref, h } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from 'ant-design-vue/es/radio'
import { useOrderStore } from '@/stores/order'
import { jump } from '@/router/jump'
import { ShoppingCartOutlined, ThunderboltOutlined } from '@ant-design/icons-vue'

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
    <a-row class="commodity-container">
      <a-col :span="22" :offset="1">
        <!-- 页面内容卡片 -->
        <div class="commodity-card" v-if="commodity">
          <a-row :gutter="32">
            <!-- 商品图片区域 -->
            <a-col :span="10" class="image-container">
              <div class="image-wrapper">
                <img :src="commodity.image" alt="商品图片" class="commodity-image" />
              </div>
            </a-col>

            <!-- 商品详情区域 -->
            <a-col :span="14" class="commodity-details">
              <h1 class="commodity-title">{{ commodity.name }}</h1>

              <div class="price-section">
                <div class="price-label">价格</div>
                <div class="price-value">￥{{ (commodity.price / 100).toFixed(2) }}</div>
              </div>

              <a-divider class="divider" />

              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">库存</div>
                  <div class="info-value">
                    <a-tag :color="commodity.stock > 10 ? 'success' : (commodity.stock > 0 ? 'warning' : 'error')">
                      {{ commodity.stock }}
                    </a-tag>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-label">销量</div>
                  <div class="info-value">{{ commodity.sold }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">分类</div>
                  <div class="info-value">
                    <a-tag color="processing">{{ commodity.category }}</a-tag>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-label">品牌</div>
                  <div class="info-value">
                    <a-tag color="processing">{{ commodity.brand }}</a-tag>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-label">评论数</div>
                  <div class="info-value">{{ commodity.commentCount }}</div>
                </div>
              </div>

              <div class="specs-section" v-if="commodity.spec && commodity.spec !== '{}'">
                <div class="specs-label">规格</div>
                <div class="specs-tags">
                  <a-tag v-for="(value, key) in JSON.parse(commodity.spec)" :key="key" color="blue" class="spec-tag">
                    {{ value }}
                  </a-tag>
                </div>
              </div>

              <a-divider class="divider" />

              <div class="actions-section">
                <a-button type="primary" size="large" class="cart-button" @click="addToCart(commodity)">
                  <template #icon><shopping-cart-outlined /></template>
                  加入购物车
                </a-button>
                <a-button type="primary" danger size="large" class="buy-button" @click="buyNow(commodity)">
                  <template #icon><thunderbolt-outlined /></template>
                  立即购买
                </a-button>
              </div>
            </a-col>
          </a-row>
        </div>

        <!-- 加载状态 -->
        <div class="loading-container" v-else>
          <a-spin tip="加载商品信息中..." />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<style lang="less" scoped>
@import "@/styles/var";

.commodity-page {
  min-height: 95vh;
  padding: 30px 0;
  background-color: #f7f9fc;
}

.commodity-container {
  margin-top: 10px;
}

.commodity-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: @box-shadow;
  padding: 30px;
  margin-bottom: 30px;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.image-wrapper {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

.commodity-image {
  width: 100%;
  transition: all 0.5s;
  object-fit: cover;

  &:hover {
    transform: scale(1.03);
  }
}

.commodity-details {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.commodity-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.4;
  word-break: break-word;
}

.price-section {
  display: flex;
  align-items: baseline;
  margin-bottom: 20px;
}

.price-label {
  font-size: 16px;
  color: #666;
  margin-right: 10px;
}

.price-value {
  font-size: 28px;
  font-weight: 600;
  color: @red;
}

.divider {
  margin: 20px 0;
  border-color: #eee;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: #666;
  min-width: 60px;
  margin-right: 10px;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.specs-section {
  margin-bottom: 30px;
}

.specs-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.specs-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-tag {
  font-size: 14px;
  padding: 4px 12px;
  margin: 0;
}

.actions-section {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.cart-button,
.buy-button {
  min-width: 160px;
  height: 46px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: @box-shadow;
}
</style>
