<script setup>
import { ref, onMounted, computed, reactive, toRaw } from 'vue'
import { useOrderStore } from '@/stores/order.js'
import {
  addAddressService,
  deleteAddressService,
  getAddressService,
  setDefaultAddrService,
  updateAddressService,
} from '@/api/address.js'
import { jumpToItem, jumpToPay } from '@/router/jump.js'
import { createOrderService } from '@/api/order.js'
import { message } from 'ant-design-vue'
import { formFields } from '@/config/address/index.js'
import { PlusOutlined } from '@ant-design/icons-vue'

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
  const hide = message.loading('查询地址中...', 0)
  await getAddressService().then((res) => {
    addresses.value = res
    selectedAddress.value =
      addresses.value.find((address) => address.isDefault) || addresses.value[0]
  }).finally(() => {
    hide()
  })
}

// 地址表单数据
const addressData = reactive({
  province: '',
  city: '',
  town: '',
  street: '',
  mobile: '',
  contact: '',
  isDefault: 0,
  notes: '',
})

const title = ref('新增地址')

// 选择地址
const selectAddress = (address) => {
  selectedAddress.value = address
  // console.log('选择地址', selectedAddress.value)
}

// 设为默认地址
const setDefaultAddress = async (address) => {
  if (address.isDefault) return
  await setDefaultAddrService(address.id).then(() => {
    queryAddress()
    message.success('设置成功')
  })
}

// 新增或修改地址
const addOrUpdateAddr = async () => {
  // 表单校验
  console.log('表单信息', addressData)

  // 新增地址
  if (title.value === '新增地址') {
    await addAddressService(addressData).then(() => {
      queryAddress()
      message.success('新增成功')
    }).finally(() => {
      visible.value = false
      formRef.value.resetFields()
    })
    return
  }

  // 修改地址
  await updateAddressService(addressData).then(() => {
    queryAddress()
    message.success('修改成功')
  }).finally(() => {
    visible.value = false
    formRef.value.resetFields()
  })
}


const formRef = ref()
const visible = ref(false)

// 打开新增地址表单
const openAddr = () => {
  title.value = '新增地址'
  visible.value = true
}

// 打开更新地址表单
const openUpdateAddr = (address) => {
  console.log('修改地址:', address)
  visible.value = true
  title.value = '修改地址'
  Object.assign(addressData, address)
}

// 删除地址
const deleteAddress = async (address) => {
  // console.log('删除地址', address)
  await deleteAddressService(address.id).then(() => {
    queryAddress()
    message.success('删除成功')
  })
}

const loading = ref(false) // 提交订单,按钮loading状态

// 提交订单
const submitOrder = async () => {
  loading.value = true
  // 判断选中商品的数量和收货地址是否存在
  if (selectedItems.value.length == 0 || !selectedAddress.value) {
    message.error(selectedItems.value.length == 0 ? '请先选择商品!' : '请先选择收货地址')
    loading.value = false
    return
  }

  const orderDetails = selectedItems.value.map((item) => ({
    itemId: item.itemId,
    num: item.num,
  }))

  const orderForm = {
    addressId: selectedAddress.value.id,
    paymentType: 5,
    details: orderDetails,
  }

  // 创建订单
  await createOrderService(orderForm)
    .then((res) => {
      console.log('订单号:', res)
      message.success('订单创建成功')
      orderStore.clearSelectedItems() // 清除选择的商品信息
      jumpToPay(res) // 跳转到订单列表页
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <div class="order-view-body">
    <div class="order-container">
      <div class="page-header">
        <div class="page-title">
          <h2>订单确认</h2>
          <div class="title-divider"></div>
        </div>
      </div>

      <!--商品卡片展示-->
      <div class="content-card">
        <div class="card-header">
          <h3>商品信息</h3>
          <span class="item-count">共 {{ selectedItems.length }} 件商品</span>
        </div>
        <div class="commodity-display">
          <a-row :gutter="[16, 16]">
            <a-col :xs="12" :sm="8" :md="6" :lg="6" :xl="4" v-for="item in selectedItems" :key="item.id">
              <a-card class="commodity-card" hoverable @click="jumpToItem(item.itemId)">
                <!-- 封面 -->
                <template #cover>
                  <div class="image-container">
                    <img :src="item.image" class="product-image" alt="" />
                  </div>
                </template>
                <a-card-meta>
                  <!-- 价格 -->
                  <template #title>
                    <span class="price">￥{{ (item.price / 100).toFixed(2) }}</span>
                  </template>
                  <!-- 商品描述 -->
                  <template #description>
                    <div class="product-name">{{ item.name }}</div>
                    <div class="product-quantity">
                      <span class="quantity-tag">× {{ item.num }}</span>
                    </div>
                  </template>
                </a-card-meta>
              </a-card>
            </a-col>
          </a-row>
        </div>
      </div>

      <!-- 收货地址列表 -->
      <div class="content-card">
        <div class="card-header">
          <h3>收货人信息</h3>
          <a-button type="primary" size="middle" @click="openAddr" class="add-address-btn">
            <template #icon>
              <PlusOutlined />
            </template>
            新增地址
          </a-button>
        </div>

        <div class="address-list">
          <a-empty v-if="addresses.length === 0" description="暂无收货地址" />
          <div v-else class="address-grid">
            <div v-for="address in addresses" :key="address.id" class="address-card"
              :class="{ 'address-selected': address.id === selectedAddress?.id }" @click="selectAddress(address)">
              <div class="address-card-content">
                <div class="address-header">
                  <span class="contact-name">{{ address.contact }}</span>
                  <span class="contact-phone">{{ address.mobile }}</span>
                  <a-tag v-if="address.isDefault" class="default-tag">默认</a-tag>
                </div>
                <div class="address-detail">
                  {{ address.province }} {{ address.city }} {{ address.town }} {{ address.street }}
                </div>
                <div v-if="address.notes" class="address-notes">
                  备注：{{ address.notes }}
                </div>
              </div>
              <div class="address-actions">
                <a-button type="link" size="small" class="actions-btn" v-if="!address.isDefault"
                  @click.stop="setDefaultAddress(address)">设为默认
                </a-button>
                <a-button type="link" size="small" class="actions-btn" @click.stop="openUpdateAddr(address)">编辑
                </a-button>
                <a-popconfirm title="确定删除吗?" ok-text="确定" cancel-text="取消" @confirm="deleteAddress(address)">
                  <a-button type="link" size="small" danger class="actions-btn">删除</a-button>
                </a-popconfirm>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--结算栏-->
      <div class="order-footer">
        <div class="order-summary">
          <div class="summary-item">
            <span class="summary-label">商品总额：</span>
            <span class="summary-value">￥{{ total }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">运费：</span>
            <span class="summary-value">￥0.00</span>
          </div>
          <div class="summary-divider"></div>
          <div class="total-amount">
            <span class="total-label">应付总额：</span>
            <span class="price total-price">￥{{ total }}</span>
          </div>
        </div>

        <div class="shipping-info">
          <div v-if="selectedAddress" class="selected-address">
            <div class="info-label">寄送至：</div>
            <div class="info-content">
              {{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.town }} {{
                selectedAddress.street
              }}
            </div>
          </div>
          <div v-if="selectedAddress" class="receiver-info">
            <div class="info-label">收货人：</div>
            <div class="info-content">
              {{ selectedAddress.contact }} {{ selectedAddress.mobile }}
            </div>
          </div>
          <a-button type="primary" size="large" :loading="loading" @click="submitOrder" class="submit-btn"
            :disabled="!selectedAddress || selectedItems.length === 0">
            提交订单
          </a-button>
        </div>
      </div>
    </div>

    <!-- 地址表单 -->
    <a-modal v-model:open="visible" :title="title" ok-text="确定" cancel-text="取消" @ok="addOrUpdateAddr">
      <a-form ref="formRef" :model="addressData" layout="horizontal" name="form_in_modal">
        <a-form-item v-for="(label, key) in formFields" :key="key" :name="key" :label="label" :rules="key !== 'notes' ? [{ required: true, message: `请填写${label}!` }] : []
          ">
          <a-input v-model:value="addressData[key]" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped lang="less">
@import '@/styles/var';

.order-view-body {
  background-color: #f7f9fc;
  min-height: 90vh;
  padding: 30px 0;
}

.order-container {
  width: 95%;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
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

.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: @box-shadow;
  padding: 20px;
  margin-bottom: 20px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .item-count {
    color: #999;
    font-size: 14px;
  }

  .add-address-btn {
    background-color: @primary-color;
    border-color: @primary-color;

    &:hover {
      background-color: darken(@primary-color, 10%);
      border-color: darken(@primary-color, 10%);
    }
  }
}

.commodity-display {
  padding-bottom: 10px;
}

.commodity-card {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  height: 100%;
  border: 1px solid #f0f0f0;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  }
}

.image-container {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  overflow: hidden;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-name {
  color: #333;
  font-size: 14px;
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 42px;
}

.product-quantity {
  margin-top: 8px;
}

.quantity-tag {
  background-color: rgba(0, 185, 107, 0.1);
  color: @primary-color;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.price {
  color: @red;
  font-weight: bold;
  font-size: 18px;
}

.address-list {
  padding: 10px 0;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.address-card {
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s;
  position: relative;
  cursor: pointer;

  &:hover {
    border-color: @primary-color;
    background-color: rgba(0, 185, 107, 0.03);
  }

  &.address-selected {
    border-color: @primary-color;
    background-color: rgba(0, 185, 107, 0.05);
    box-shadow: 0 0 0 2px rgba(0, 185, 107, 0.2);

    &::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      background-color: @primary-color;
      right: -1px;
      top: -1px;
      border-top-right-radius: 12px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E");
      background-size: 12px;
      background-repeat: no-repeat;
      background-position: center;
    }
  }
}

.address-card-content {
  margin-bottom: 10px;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.contact-name {
  font-weight: 600;
  font-size: 16px;
  margin-right: 10px;
}

.contact-phone {
  color: #666;
  font-size: 14px;
}

.default-tag {
  margin-left: auto;
  color: white;
  background-color: @primary-color;
  border: none;
}

.address-detail {
  color: #666;
  line-height: 1.5;
  margin-bottom: 5px;
}

.address-notes {
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.address-actions {
  display: flex;
  margin-top: 10px;
  border-top: 1px dashed #f0f0f0;
  padding-top: 10px;
  justify-content: flex-end;
}

.actions-btn {
  font-size: 12px;
  padding: 0 8px;
}

.order-footer {
  background: white;
  border-radius: 16px;
  box-shadow: @box-shadow;
  overflow: hidden;
}

.order-summary {
  padding: 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #666;
}

.summary-divider {
  height: 1px;
  background-color: #e8e8e8;
  margin: 15px 0;
}

.total-amount {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 500;
}

.total-price {
  font-size: 24px;
}

.shipping-info {
  padding: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.selected-address,
.receiver-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-label {
  color: #999;
  white-space: nowrap;
}

.info-content {
  color: #333;
  font-weight: 500;
}

.submit-btn {
  margin-left: auto;
  min-width: 150px;
  height: 46px;
  font-size: 16px;
  background-color: @primary-color;
  border-color: @primary-color;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background-color: darken(@primary-color, 10%);
    border-color: darken(@primary-color, 10%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 185, 107, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .order-container {
    width: 95%;
    padding: 0 10px;
  }

  .shipping-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .submit-btn {
    margin-left: 0;
    width: 100%;
  }
}
</style>
