<script setup>
import {
  deleteCartItemService,
  deleteCartItemsService,
  getCartService,
  updateCartItemService,
} from '@/api/cart'
import { jump, jumpToItem } from '@/router/jump'
import { message } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import { useOrderStore } from '@/stores/order.js'
import { columns } from '@/config/columns/cart'

const cartData = ref([]) // 购物车数据
const isCartEmpty = computed(() => cartData.value.length === 0) // 购物车是否为空
const orderStore = useOrderStore() // 订单 store

// 查询用户购物车
const queryCart = async () => {
  const hide = message.loading('查询购物车中...', 0)
  await getCartService().then((res) => {
    // console.log(res);
    cartData.value = res
  }).finally(() => {
    hide()
  })
}


onMounted(() => {
  queryCart()
})

// 选中的的商品id和商品
const selectedItems = ref([])
const selectedIds = ref([])

// 表格行选择
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
    selectedIds.value = selectedRowKeys
    selectedItems.value = selectedRows
  },
  getCheckboxProps: (record) => ({
    disabled: record.stock === 0, // 设置 stock 为 0 的行不可选中
  }),
}

// 删除购物车商品
const removeItem = async (id) => {
  await deleteCartItemService(id).then(() => {
    message.success('删除成功')
    queryCart()
  })
}

// 更新购物车商品数量
const updateItemNum = async (id, num, stock) => {
  // 判断商品数量是否合法
  if (num === null) return
  if (num > stock) {
    message.error('库存不足！')
    return
  }
  if (num > 200) {
    message.error('单次购买数量不能超过200！')
    return
  }
  // 更新商品数量的逻辑
  await updateCartItemService(id, num).then(() => {
    // 更新 selectedItems 中对应商品的数量
    const item = selectedItems.value.find((item) => item.id === id)
    if (item) item.num = num
    queryCart()
  })
}

// 计算总价
const totalPrice = computed(() => {
  return (
    selectedItems.value.reduce((total, item) => {
      const price = item.newPrice !== null ? item.newPrice : item.price
      return total + price * item.num
    }, 0) / 100
  )
})

// 删除选中的商品
const removeSelectedItems = async () => {
  console.log('删除选中的商品:', selectedIds.value)
  if (selectedIds.value.length === 0) {
    message.error('请选择要删除的商品')
    return
  }
  // 转化为数字类型列表
  await deleteCartItemsService(selectedIds.value).then(() => {
    message.success('删除成功')
    queryCart()
  })
}

// 清空购物车
const clearCart = () => {
  console.log('清空购物车')
  if (cartData.value.length === 0) {
    message.error('购物车为空')
    return
  }
  // 清空购物车的逻辑
  deleteCartItemsService(cartData.value.map((item) => item.id)).then(() => {
    message.success('清空成功')
    queryCart()
  })
}

// 去结算
const checkout = () => {
  if (selectedItems.value.length === 0) {
    message.error('请选择要结算的商品')
    return
  }
  orderStore.setSelectedItems(selectedItems.value)
  jump('/order')
}
</script>

<template>
  <div class="cart-page">
    <a-row class="cart-container">
      <a-col :span="22" :offset="1">
        <!-- 页面标题 -->
        <div class="page-header">
          <div class="page-title">
            <h2>我的购物车</h2>
            <div class="title-divider"></div>
          </div>
          <div class="header-actions" v-if="!isCartEmpty">
            <span class="cart-count">共 {{ cartData.length }} 件商品</span>
          </div>
        </div>

        <!-- 购物车内容 -->
        <div class="cart-content">
          <!-- 购物车表格 -->
          <a-table :row-selection="rowSelection" :columns="columns" :data-source="cartData" :pagination="false"
            rowKey="id" :bordered="false" class="cart-table">
            <template #bodyCell="{ column, text, record }">
              <!-- 商品图片 -->
              <template v-if="column.dataIndex === 'image'">
                <div class="product-image-container">
                  <img :src="text" alt="商品图片" class="commodity-image" />
                </div>
              </template>

              <!-- 商品名 -->
              <template v-if="column.dataIndex === 'name'">
                <div class="product-info">
                  <a class="item-name" @click="jumpToItem(record.itemId)">
                    {{ text }}
                  </a>
                  <a-tag color="red" v-if="record.stock <= 0" class="stock-tag">库存不足</a-tag>
                </div>
              </template>

              <!-- 商品规格 -->
              <template v-if="column.dataIndex === 'spec'">
                <div class="spec-container">
                  <template v-if="text && text !== '{}'">
                    <a-tag v-for="(value, key) in JSON.parse(text)" :key="key" class="spec-tag">
                      {{ value }}
                    </a-tag>
                  </template>
                </div>
              </template>

              <!-- 单价,单位为分 -->
              <template v-if="column.key === 'price'">
                <div class="price-container">
                  <template v-if="record.newPrice !== null && record.newPrice !== record.price">
                    <span class="original-price">¥{{ (record.price / 100).toFixed(2) }}</span>
                    <span class="current-price">¥{{ (record.newPrice / 100).toFixed(2) }}</span>
                  </template>
                  <template v-else>
                    <span class="current-price">¥{{ (record.price / 100).toFixed(2) }}</span>
                  </template>
                </div>
              </template>

              <!-- 数量 -->
              <template v-if="column.key === 'num'">
                <a-input-number :min="1" :value="record.num" class="quantity-input" :disabled="record.stock <= 0"
                  @change="(value) => updateItemNum(record.id, value, record.stock)" />
              </template>

              <!-- 操作 -->
              <template v-if="column.key === 'action'">
                <a-popconfirm title="确定从购物车删除这个商品吗？" ok-text="确定" cancel-text="取消" @confirm="removeItem(record.id)">
                  <a-button type="primary" danger size="small" class="delete-btn">删除</a-button>
                </a-popconfirm>
              </template>
            </template>

            <!-- 空状态 -->
            <template #emptyText>
              <div class="empty-cart">
                <a-empty description="购物车空空如也" />
                <router-link to="/search">
                  <a-button type="primary" class="go-shopping-btn">去购物</a-button>
                </router-link>
              </div>
            </template>
          </a-table>

          <!-- 底部操作栏 -->
          <div class="cart-footer" v-if="!isCartEmpty">
            <div class="left-actions">
              <a-checkbox :checked="selectedIds.length === cartData.length && cartData.length > 0"
                :indeterminate="selectedIds.length > 0 && selectedIds.length < cartData.length" @change="(e) => {
                  rowSelection.onChange(
                    e.target.checked ? cartData.filter(item => item.stock > 0).map(item => item.id) : [],
                    e.target.checked ? cartData.filter(item => item.stock > 0) : []
                  )
                }">
                全选
              </a-checkbox>
              <a-popconfirm title="确定删除选中的商品吗？" ok-text="确定" cancel-text="取消" @confirm="removeSelectedItems"
                :disabled="selectedIds.length === 0">
                <a-button type="link" class="batch-action-btn" :disabled="selectedIds.length === 0">
                  删除选中商品
                </a-button>
              </a-popconfirm>
              <a-popconfirm title="确定清空购物车吗？" ok-text="确定" cancel-text="取消" @confirm="clearCart">
                <a-button type="link" class="batch-action-btn">清空购物车</a-button>
              </a-popconfirm>
            </div>
            <div class="right-actions">
              <div class="checkout-info">
                <div class="selected-count">已选择 <span>{{ selectedItems.length }}</span> 件商品</div>
                <div class="total-price-container">
                  总计: <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
                </div>
              </div>
              <a-button type="primary" size="large" class="checkout-btn" :disabled="selectedItems.length === 0"
                @click="checkout">
                去结算
              </a-button>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<style lang="less" scoped>
@import '@/styles/var';

.cart-page {
  min-height: 95vh;
  padding: 30px 0;
  background-color: #f7f9fc;
}

.cart-container {
  margin-top: 10px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  position: relative;

  h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 0;
  }

  .title-divider {
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 4px;
    background-color: @primary-color;
    border-radius: 2px;
  }
}

.header-actions {
  .cart-count {
    font-size: 14px;
    color: #666;
  }
}

.cart-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: @box-shadow;
  padding: 20px;
  margin-bottom: 20px;
}

.cart-table {
  margin-bottom: 20px;

  :deep(.ant-table-thead > tr > th) {
    background-color: #f5f7fa;
    font-weight: 600;
    border-bottom: 2px solid rgba(0, 185, 107, 0.2);
    padding: 16px 12px;
    text-align: center;
    font-size: 14px;
  }

  :deep(.ant-table-tbody > tr > td) {
    padding: 20px 12px;
    text-align: center;
    font-size: 14px;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.3s;
  }

  :deep(.ant-table-tbody > tr) {
    transition: all 0.3s;

    &:hover {
      background-color: rgba(0, 185, 107, 0.05);

      td {
        background-color: transparent;
      }
    }
  }

  :deep(.ant-table-row-selected) td {
    background-color: rgba(0, 185, 107, 0.1) !important;
  }
}

.product-image-container {
  display: flex;
  justify-content: center;
  padding: 5px;
}

.commodity-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
}

.product-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.item-name {
  color: #333;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 250px;

  &:hover {
    color: @primary-color;
  }
}

.stock-tag {
  margin-top: 5px;
}

.spec-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;

  .spec-tag {
    font-size: 12px;
    margin: 0;
  }
}

.price-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;

  .original-price {
    text-decoration: line-through;
    color: #999;
    font-size: 12px;
  }

  .current-price {
    color: @red;
    font-weight: 600;
    font-size: 16px;
  }
}

.quantity-input {
  width: 100px;
}

.delete-btn {
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.empty-cart {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  .go-shopping-btn {
    margin-top: 20px;
  }
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
  margin-top: 20px;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 16px;

  .batch-action-btn {
    padding: 0;
    font-size: 14px;
    color: #666;

    &:hover:not(:disabled) {
      color: @red;
    }

    &:disabled {
      color: #ccc;
    }
  }
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 20px;

  .checkout-info {
    text-align: right;

    .selected-count {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;

      span {
        color: @primary-color;
        font-weight: 600;
      }
    }

    .total-price-container {
      font-size: 14px;

      .total-price {
        color: @red;
        font-size: 20px;
        font-weight: 600;
      }
    }
  }

  .checkout-btn {
    min-width: 120px;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 185, 107, 0.25);
    }
  }
}
</style>
