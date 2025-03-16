<script setup>
import { onMounted, ref } from 'vue';
import { getUserOrdersService, deleteOrdersService } from '@/api/order'
import { message } from 'ant-design-vue';
import { orderColumns, getStatusText, getStatusColor } from '@/config/columns/orderList/order';
import { commodityColumns } from '@/config/columns/orderList/commodity';
import { jumpToItem, jumpToPay } from '@/router/jump';

const orders = ref([]); // 订单信息

// 删除订单
const deleteOrders = async (ids) => {
  const hide = message.loading('删除中...', 0);
  await deleteOrdersService(ids).then(() => {
    message.success('删除成功');
    initOrders();
    selectedRowKeys.value = []; // 清空选中项
  }).finally(() => {
    hide();
  });
};

const tableKey = ref(Date.now());
const selectedRowKeys = ref([]); // 选中的行

// 更新选中项
const onSelectChange = (newSelectedRowKeys) => {
  selectedRowKeys.value = newSelectedRowKeys;
  console.log(selectedRowKeys.value);
};

// 查询订单信息
const initOrders = async () => {
  const hide = message.loading('查询订单中...', 0)
  await getUserOrdersService().then((response) => {
    orders.value = response.data
    tableKey.value = Date.now()
  }).finally(() => {
    hide()
  })
}

onMounted(async () => {
  await initOrders();
});


</script>

<template>
  <div class="container">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2>用户订单</h2>
      <a-button v-if="selectedRowKeys.length > 1" danger @click="deleteOrders(selectedRowKeys)">
        删除选中
      </a-button>
    </div>
    <!-- 订单信息表格 -->
    <a-table :key="tableKey" class="order-tb" :columns="orderColumns" :dataSource="orders" row-key="id"
      :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" bordered
      :defaultExpandAllRows="true" :expandIconAsCell="false" :expandIconColumnIndex="-1" row-class-name="tb-row">

      <!-- 自定义渲染格式 -->
      <template #bodyCell="{ column, text, record }">
        <!-- 状态 -->
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(text)">{{ getStatusText(text) }}</a-tag>
        </template>

        <!-- 操作 -->
        <template v-if="column.key === 'action'">
          <div style="display:flex;padding: 5px;gap:10px;">
            <a-button v-if="record.status === '1'" type="primary" size="small"
              @click="jumpToPay(record.id)">支付</a-button>
            <a-popconfirm title="确定删除该订单吗?" @confirm="deleteOrders([record.id])" ok-text="确定" cancel-text="取消">
              <a-button danger type="link" size="small">删除</a-button>
            </a-popconfirm>
          </div>
        </template>

      </template>

      <!-- 商品子表格 -->
      <template #expandedRowRender="{ record }">
        <a-table class="commodity-tb" :columns="commodityColumns" :dataSource="record.orderDetails" bordered
          :pagination="false">

          <template #bodyCell="{ record, column, text }">

            <!-- 商品图片 -->
            <template v-if="column.dataIndex === 'image'">
              <img :src="text" alt="商品图片" class="commodity-image" />
            </template>

            <!-- 商品名称 -->
            <template v-if="column.dataIndex === 'name'">
              <a @click="jumpToItem(record.itemId)" class="item-name">{{ text }}</a>
            </template>

          </template>
        </a-table>
      </template>

    </a-table>

  </div>
</template>

<style lang="less" scoped>
@import '@/styles/var';

.order-info-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.order-info-table {
  border: @border;
}

.container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  margin-top: 50px !important;
}

.user-info {
  width: 300px;
  box-shadow: @box-shadow;
  border-radius: 0 0 8px 8px;
}

/* 商品图片 */
img.commodity-image {
  width: 50px;
}

/* 表格中文本 */
td.ant-table-cell {
  font-size: 10px;
}

.ant-typography,
a.item-name {
  font-size: 12px;
}

/* 表格行 */
:deep(.tb-row:hover) td,
:deep(.tb-row) td {
  background-color: @tb-row-bg !important;
}

.hidden-column {
  display: none;
}

.commodity-tb>th {
  color: gray;
}
</style>
