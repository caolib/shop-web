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
  <div class="cart-view">
    <!-- 购物车表格 -->
    <a-table :row-selection="rowSelection" :columns="columns" :data-source="cartData" :pagination="false" rowKey="id">
      <template #bodyCell="{ column, text, record }">
        <!-- 商品图片 -->
        <template v-if="column.dataIndex === 'image'">
          <img :src="text" alt="商品图片" class="commodity-image" />
        </template>

        <!-- 商品名 -->
        <template v-if="column.dataIndex === 'name'">
          <a class="item-name" @click="jumpToItem(record.itemId)">{{ text }}<a-tag color="red"
              style="margin-left: 10px;" v-if="record.stock <= 0">库存不足</a-tag></a>
        </template>

        <!-- 商品规格 -->
        <template v-if="column.dataIndex === 'spec'">
          <template v-if="text && text !== '{}'">
            <span v-for="(value, key) in JSON.parse(text)" :key="key">
              <a-tag style="font-size: 12px; margin-left: 10px">{{ value }}</a-tag>
            </span>
          </template>
          <template v-else>
            <span></span>
          </template>
        </template>

        <!-- 单价,单位为分 -->
        <template v-if="column.key === 'price'">
          <div>
            <template v-if="record.newPrice !== null && record.newPrice < record.price">
              <span style="text-decoration: line-through">
                ¥{{ (record.price / 100).toFixed(2) }}</span><br />
              <span>¥{{ (record.newPrice / 100).toFixed(2) }}</span>
            </template>
            <template v-else-if="record.newPrice !== null">
              <span>¥{{ (record.newPrice / 100).toFixed(2) }}</span>
            </template>
            <template v-else>
              <span>¥{{ (record.price / 100).toFixed(2) }}</span>
            </template>
          </div>
        </template>

        <!-- 数量 -->
        <template v-if="column.key === 'num'">
          <a-input-number :min="1" :value="record.num"
            @change="(value) => updateItemNum(record.id, value, record.stock)" />
        </template>

        <!-- 操作 -->
        <template v-if="column.key === 'action'">
          <a-popconfirm title="确定从购物车删除这个商品吗？" ok-text="确定" cancel-text="取消" @confirm="removeItem(record.id)">
            <a-button type="text" size="small">删除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <!-- 操作按钮 -->
    <div class="cart-actions">
      <div class="left-actions">
        <a-popconfirm title="确定删除?" ok-text="确定" cancel-text="取消" @confirm="removeSelectedItems">
          <span class="actions">删除选中商品</span>
        </a-popconfirm>
        <a-popconfirm title="确定清空购物车?" ok-text="确定" cancel-text="取消" @confirm="clearCart">
          <span class="actions">清空购物车</span>
        </a-popconfirm>
        <router-link v-if="isCartEmpty" to="/search">
          <span class="actions">您的购物车空空如也，去逛逛吧</span>
        </router-link>
      </div>
      <div class="right-actions">
        <span class="total-price">总价: ¥{{ totalPrice }}</span>
        <a-button type="primary" @click="checkout">去结算</a-button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import '@/styles/var';

/* 购物车视图 */
.cart-view {
  margin-left: 30px;
  margin-right: 30px;
  margin-top: 50px;
}

/* 商品图片 */
img.commodity-image {
  width: 80px;
}

/* 表格中文本 */
td.ant-table-cell {
  font-size: 10px;
}

/* 操作 */
.cart-actions {
  padding: 10px;
  border: @border;
  color: gray;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions {
  cursor: pointer;
  display: flex;
  gap: 10px;
  font-size: 14px;
}

.actions:hover {
  color: @red;
}

.right-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.total-price {
  color: @red;
}

/* 商品名 */
.item-name {
  color: black;
  font-size: 12px;
}

.item-name:hover {
  color: @primary-color;
}
</style>
