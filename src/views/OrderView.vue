<template>
  <div class="order-view-body">
    <h1>订单确认</h1>

    <!-- 收货地址列表 -->
    <div class="address-list" v-if="addresses.length > 0">
      <div>
        <h3>收货人信息</h3>
      </div>
      <a-list>
        <!--地址行-->
        <a-list-item class="address-row" v-for="address in addresses" :key="address.id" @click="selectAddress(address)"
          :class="{ selected: address.id === selectedAddress.id }">
          <!--地址信息-->
          <div class="address-info">
            <div>
              {{ address.notes }}
              {{ address.contact }} {{ address.province }} {{ address.city }} {{ address.town }}
              {{ address.street }} {{ address.mobile }}
              <a-tag v-if="address.isDefault" class="default-tag">默认地址</a-tag>
            </div>
            <!--地址操作-->
            <div class="address-actions">
              <a-button type="link" size="small" class="actions-btn" v-if="!address.isDefault"
                @click.stop="setDefaultAddress(address)">设为默认地址
              </a-button>
              <a-button type="link" size="small" class="actions-btn" @click.stop="editAddress(address)">编辑
              </a-button>
              <a-button type="link" size="small" class="actions-btn" @click.stop="deleteAddress(address)">删除
              </a-button>
            </div>
          </div>
        </a-list-item>
      </a-list>
    </div>
    <!--商品卡片展示-->
    <div class="commodity-display">
      <a-row>
        <a-col :span="4" v-for="item in selectedItems" :key="item.id">
          <a-card class="commodity-card" hoverable @click="jumpToItem(item.itemId)">
            <!-- 封面 -->
            <template #cover>
              <div style="display: flex;justify-content: center;margin-top: 5px;">
                <img :src="item.image" style="width: 100px" alt="" />
              </div>
            </template>
            <a-card-meta>
              <!-- 价格 -->
              <template #title>
                <span class="price">￥{{ (item.price / 100).toFixed(2) }}</span>
              </template>
              <!-- 商品描述 -->
              <template #description>
                <span class="commodity-desc">{{ item.name }}</span>
                <div>
                  <span style="margin-top: 5px; color: #00b96b">{{ item.num }}件</span>
                </div>
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!--结算栏-->
    <div class="order-footer">
      <!--总价格行-->
      <a-row>
        <a-col :span="12" style="color: grey">
          应付总额：<span class="price">￥{{ total }}</span>
        </a-col>
      </a-row>
      <!--选择的地址信息行-->
      <a-row style="margin-top: 10px">
        <a-col :span="20" style="color: grey">
          <div v-if="selectedAddress" style="display: flex; gap: 10px; font-size: 12px;color:black">
            寄送至：
            <span>{{ selectedAddress.contact }}</span>
            <span>{{ selectedAddress.province }}</span>
            <span>{{ selectedAddress.city }}</span>
            <span>{{ selectedAddress.town }}</span>
            <span>{{ selectedAddress.street }}</span>
            收货人：{{ selectedAddress.contact }} {{ selectedAddress.mobile }}
          </div>
        </a-col>
        <a-col :span="4">
          <a-button type="primary" size="large" :loading="loading" @click="submitOrder">提交订单
          </a-button>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useOrderStore } from '@/stores/order.js'
import { getAddressService } from '@/api/address.js'
import { jumpToItem, jumpToPay } from '@/router/jump.js'
import { createOrderService } from '@/api/order.js'
import { message } from 'ant-design-vue'

const orderStore = useOrderStore()
const selectedItems = ref([]) // 选中的商品

// 计算总额
const total = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.price * item.num, 0) / 100
})

onMounted(() => {
  selectedItems.value = orderStore.selectedItems
  queryAddress()
})

const addresses = ref([]) // 用户地址列表
const selectedAddress = ref(null) // 选择的地址

// 查询用户地址
const queryAddress = async () => {
  await getAddressService().then((res) => {
    addresses.value = res
    selectedAddress.value =
      addresses.value.find((address) => address.isDefault) || addresses.value[0]
  })
}

// 选择地址
const selectAddress = (address) => {
  selectedAddress.value = address
  console.log('选择地址', selectedAddress.value)
}

// 设为默认地址
const setDefaultAddress = async (address) => {
  console.log('设为默认地址', address)
  // TODO
}

// 编辑地址
const editAddress = (address) => {
  // 这里可以添加编辑地址的逻辑
  console.log('编辑地址', address)
}

// 删除地址
const deleteAddress = (address) => {
  // 这里可以添加删除地址的逻辑
  console.log('删除地址', address)
}

const loading = ref(false) // 提交订单,按钮loading状态

// 提交订单
const submitOrder = async () => {
  loading.value = true
  const orderDetails = selectedItems.value.map((item) => ({
    itemId: item.itemId,
    num: item.num,
  }))

  const orderForm = {
    addressId: selectedAddress.value.id,
    paymentType: 3, // 假设支付类型为1
    details: orderDetails,
  }
  // 创建订单
  await createOrderService(orderForm)
    .then((res) => {
      console.log('订单号:', res)
      message.success('订单创建成功')
      orderStore.clearSelectedItems() // 清除选择的商品信息
      jumpToPay(res)// 跳转到订单列表页
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style scoped lang="less">
@import '@/styles/var';

.order-view-body {
  margin-top: 20px;
  margin-left: 20px;
  margin-right: 20px;
  padding: 20px;
}

.address-list {
  padding: 10px;
  border: @border;
}

.address-row {
  font-size: 12px;
  height: fit-content;
  cursor: pointer;
}

.address-row.selected {
  color: clack;
  background-color: @light-primary-color;
}

.address-info {
  color: grey;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
}

.address-row:hover {
  background: #efefef;
}

.default-tag {
  color: white;
  background-color: grey;
  margin-left: 20px;
}

.address-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.actions-btn {
  font-size: 12px;
  color: grey;
}

.price {
  color: @red;
}

.order-footer {
  border: @border;
}

.commodity-card {
  margin: 10px
}
</style>
