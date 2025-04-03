<template>
  <div class="order-view-body">
    <h2>订单确认</h2>

    <!--商品卡片展示-->
    <div class="commodity-display">
      <a-row>
        <a-col :span="4" v-for="item in selectedItems" :key="item.id">
          <a-card class="commodity-card" hoverable @click="jumpToItem(item.itemId)">
            <!-- 封面 -->
            <template #cover>
              <div style="display: flex; justify-content: center; margin-top: 5px">
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
                <div style="margin-top: 10px">
                  <span style="color: #00b96b">{{ item.num }}件</span>
                </div>
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 收货地址列表 -->
    <div class="address-list">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <h3>收货人信息</h3>
        <a-button type="link" size="small" @click="openAddr">新增地址</a-button>
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
              <a-button type="link" size="small" class="actions-btn" @click.stop="openUpdateAddr(address)">编辑
              </a-button>
              <a-popconfirm title="确定删除吗?" ok-text="确定" cancel-text="我再想想" @confirm="deleteAddress(address)">
                <a-button type="link" size="small" class="actions-btn">删除</a-button>
              </a-popconfirm>
            </div>
          </div>
        </a-list-item>
      </a-list>
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
          <div v-if="selectedAddress" style="display: flex; gap: 10px; font-size: 12px; color: black">
            寄送至：
            <span>{{ selectedAddress.contact }}</span>
            <span>{{ selectedAddress.province }}</span>
            <span>{{ selectedAddress.city }}</span>
            <span>{{ selectedAddress.town }}</span>
            <span>{{ selectedAddress.street }}</span>
            收货人：{{ selectedAddress.contact }} {{ selectedAddress.mobile }}
          </div>
        </a-col>
        <a-col :span="4" style="text-align: right">
          <a-button type="primary" size="large" :loading="loading" @click="submitOrder">提交订单
          </a-button>
        </a-col>
      </a-row>
    </div>

    <!-- 地址表单 -->
    <a-modal v-model:open="visible" :title="title" ok-text="确定" cancel-text="取消" @ok="addOrUpdateAddr">
      <a-form ref="formRef" :model="addressData" layout="horizontal" name="form_in_modal">
        <a-form-item v-for="(label, key) in formFields" :key="key" :name="key" :label="label" :rules="key !== 'notes' ? [{ required: true, message: `请填写 ${label.toLowerCase()}!` }] : []
          ">
          <a-input v-model:value="addressData[key]" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

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
  formRef.value.validateFields().then(() => {
    console.log('表单信息', addressData)
    visible.value = false
    formRef.value.resetFields()
  })
  if (title.value === '新增地址') {
    await addAddressService(addressData).then(() => {
      queryAddress()
      message.success('新增成功')
    })
  } else if (title.value === '修改地址') {
    await updateAddressService(addressData).then(() => {
      queryAddress()
      message.success('修改成功')
    })
  }
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
  const orderDetails = selectedItems.value.map((item) => ({
    itemId: item.itemId,
    num: item.num,
  }))

  if (!selectedAddress.value) {
    message.error('请先选择收货地址')
    loading.value = false
    return
  }

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
  padding: 10px;
  border: @border;
}

.commodity-card {
  margin: 10px;
  box-shadow: @box-shadow;
}
</style>
