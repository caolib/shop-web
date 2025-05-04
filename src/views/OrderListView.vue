<script setup>
import { onMounted, ref, reactive } from 'vue';
import { getUserOrdersService, deleteOrdersService } from '@/api/order'
import { message } from 'ant-design-vue';
import { orderColumns, getStatusText, getStatusColor } from '@/config/columns/orderList/order';
import { commodityColumns } from '@/config/columns/orderList/commodity';
import { jumpToItem, jumpToPay } from '@/router/jump';
import { DeleteOutlined, WalletOutlined } from '@ant-design/icons-vue';

const orders = ref([]); // 订单信息
const expandedRowKeys = ref([]); // 展开的行

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
};

// 分页配置
const pagination = reactive({
  current: 1, // 当前页码
  pageSize: 5, // 每页显示条数
  total: 0, // 总记录数
  showSizeChanger: true, // 显示每页条数选择器
  showQuickJumper: true, // 显示快速跳转
  showTotal: (total) => `共 ${total} 条订单`, // 显示总数
  pageSizeOptions: ['5', '10', '20', '50'], // 每页条数选项
  onChange: (page, pageSize) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
  },
  onShowSizeChange: (current, size) => {
    pagination.current = current;
    pagination.pageSize = size;
  }
});

// 展开行变化时的回调
const onExpandedRowsChange = (expandedRows) => {
  expandedRowKeys.value = expandedRows;
};

// 查询订单信息
const initOrders = async () => {
  const hide = message.loading('查询订单中...', 0)
  await getUserOrdersService().then((response) => {
    orders.value = response.data
    // 更新总记录数
    pagination.total = orders.value.length;
    // 设置所有订单默认展开
    expandedRowKeys.value = orders.value.map(order => order.id);
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
  <div class="order-list-page">
    <a-row class="order-container">
      <a-col :span="22" :offset="1">
        <!-- 页面标题和操作按钮 -->
        <div class="page-header">
          <div class="page-title">
            <h2>我的订单</h2>
            <div class="title-divider"></div>
          </div>
          <div class="header-actions">
            <!-- 分页信息 -->
            <div v-if="orders.length > 0" class="pagination-info">
              <a-select v-model:value="pagination.pageSize" style="width: 120px; margin-right: 16px;" @change="(size) => {
                pagination.pageSize = size;
                pagination.current = 1;
              }">
                <a-select-option v-for="size in pagination.pageSizeOptions" :key="size" :value="Number(size)">
                  {{ size }} 条/页
                </a-select-option>
              </a-select>
              <span class="pagination-text">共 {{ pagination.total }} 条数据</span>
            </div>

            <!-- 删除按钮 -->
            <a-button v-if="selectedRowKeys.length > 0" type="primary" danger @click="deleteOrders(selectedRowKeys)"
              class="delete-button">
              <template #icon><delete-outlined /></template>
              删除选中 ({{ selectedRowKeys.length }})
            </a-button>
          </div>
        </div>

        <!-- 订单卡片和表格 -->
        <div class="order-content">
          <!-- 订单信息表格 -->
          <a-table :key="tableKey" class="order-table" :columns="orderColumns" :dataSource="orders" row-key="id"
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" bordered
            :expandedRowKeys="expandedRowKeys" @expandedRowsChange="onExpandedRowsChange" :pagination="{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: pagination.showSizeChanger,
              showQuickJumper: pagination.showQuickJumper,
              showTotal: pagination.showTotal,
              pageSizeOptions: pagination.pageSizeOptions,
              onChange: (page, pageSize) => {
                pagination.current = page;
                pagination.pageSize = pageSize;
              },
              onShowSizeChange: (current, size) => {
                pagination.current = current;
                pagination.pageSize = size;
              }
            }" :expandIconColumnIndex="1" row-class-name="tb-row">

            <!-- 自定义渲染格式 -->
            <template #bodyCell="{ column, text, record }">
              <!-- 状态 -->
              <template v-if="column.key === 'status'">
                <a-tag :color="getStatusColor(text)" class="status-tag">
                  {{ getStatusText(text) }}
                </a-tag>
              </template>

              <!-- 操作 -->
              <template v-if="column.key === 'action'">
                <div class="action-buttons">
                  <a-button v-if="record.status === '1'" type="primary" size="small" class="pay-button"
                    @click="jumpToPay(record.id)">
                    <template #icon><wallet-outlined /></template>
                    去支付
                  </a-button>
                  <a-popconfirm title="确定删除该订单吗？" @confirm="deleteOrders([record.id])" ok-text="确定" cancel-text="取消"
                    placement="left">
                    <a-button danger type="primary" size="small" class="delete-single-button">
                      <template #icon><delete-outlined /></template>
                      删除
                    </a-button>
                  </a-popconfirm>
                </div>
              </template>
            </template>

            <!-- 商品子表格 -->
            <template #expandedRowRender="{ record }">
              <div class="order-details-card">
                <div class="details-header">
                  <span class="details-title">订单详情</span>
                  <span class="order-id">订单号: {{ record.id }}</span>
                </div>
                <a-table class="commodity-table" :columns="commodityColumns" :dataSource="record.orderDetails" bordered
                  :pagination="false">
                  <template #bodyCell="{ record, column, text }">
                    <!-- 商品图片 -->
                    <template v-if="column.dataIndex === 'image'">
                      <div class="product-image-container">
                        <img :src="text" alt="商品图片" class="commodity-image" />
                      </div>
                    </template>

                    <!-- 商品名称 -->
                    <template v-if="column.dataIndex === 'name'">
                      <a @click="jumpToItem(record.itemId)" class="item-name">{{ text }}</a>
                    </template>

                    <!-- 商品价格 -->
                    <template v-if="column.dataIndex === 'price'">
                      <span class="item-price">￥{{ (text / 100).toFixed(2) }}</span>
                    </template>
                  </template>
                </a-table>
              </div>
            </template>
          </a-table>

          <!-- 空状态 -->
          <div v-if="orders.length === 0" class="empty-state">
            <a-empty description="暂无订单记录" />
            <router-link to="/search">
              <a-button type="primary">去购物</a-button>
            </router-link>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<style lang="less" scoped>
@import '@/styles/var';

.order-list-page {
  min-height: 90vh;
  padding: 20px 0 30px;
  background-color: #f7f9fc;
}

.order-container {
  margin-top: 10px;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
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
  display: flex;
  align-items: center;
  gap: 16px;
}

.pagination-info {
  display: flex;
  align-items: center;
}

.pagination-text {
  color: #666;
  font-size: 14px;
}

.delete-button {
  display: flex;
  align-items: center;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
  }
}

.order-content {
  background: #fff;
  border-radius: 16px;
  box-shadow: @box-shadow;
  padding: 15px;
  margin-bottom: 20px;
  overflow: hidden;
  width: 100%;
}

.order-table {
  margin-bottom: 20px;

  :deep(.ant-table) {
    border-radius: 12px;
    overflow: hidden;

    &.ant-table-bordered .ant-table-cell {
      border-right: none;
    }
  }

  :deep(.ant-table-thead > tr > th) {
    background-color: #f5f7fa;
    font-weight: 600;
    border-bottom: 2px solid rgba(0, 185, 107, 0.2);
    border-top: 1px solid #f0f0f0;
    text-align: center;

    &:first-child {
      border-top-left-radius: 8px;
    }

    &:last-child {
      border-top-right-radius: 8px;
    }
  }

  :deep(.ant-pagination) {
    margin-top: 16px;
    text-align: center;
  }

  // 为表格行添加分割线和美化效果
  :deep(.ant-table-tbody > tr) {
    position: relative;
    transition: all 0.3s ease;

    td {
      padding: 14px 8px;
      transition: all 0.3s ease;
      text-align: center;
      border-bottom: none;
    }

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20px;
      right: 20px;
      height: 1px;
      background: linear-gradient(to right,
          rgba(240, 240, 240, 0),
          rgba(220, 220, 220, 1) 20%,
          rgba(220, 220, 220, 1) 80%,
          rgba(240, 240, 240, 0));
      pointer-events: none;
    }

    &.ant-table-row-level-0 {
      margin: 8px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        background-color: rgba(0, 185, 107, 0.04) !important;
        z-index: 1;

        &::after {
          background: linear-gradient(to right,
              rgba(240, 240, 240, 0),
              rgba(0, 185, 107, 0.2) 20%,
              rgba(0, 185, 107, 0.2) 80%,
              rgba(240, 240, 240, 0));
        }

        td {
          background-color: rgba(0, 185, 107, 0.04) !important;
        }
      }
    }
  }

  // 父行样式
  :deep(.ant-table-row-level-0) {
    border-radius: 8px;
    overflow: hidden;

    // 每两行交替背景色
    &:nth-child(odd) {
      background-color: #fafafa;
    }
  }

  // 相邻展开行样式
  :deep(.ant-table-expanded-row)+ :deep(.ant-table-row-level-0) {
    margin-top: 16px;
  }

  // 展开图标样式
  :deep(.ant-table-row-expand-icon) {
    color: @primary-color;
    font-size: 12px;
    transition: all 0.3s;

    &:hover {
      background-color: rgba(0, 185, 107, 0.1);
      border-color: @primary-color;
    }
  }

  // 去除展开行背景色
  :deep(.ant-table-expanded-row)>td {
    background: transparent !important;
    padding: 0 8px 16px !important;
  }
}

.status-tag {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 80px;
  display: inline-block;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.pay-button,
.delete-single-button {
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.order-details-card {
  background-color: rgba(250, 250, 250, 0.6);
  border-radius: 12px;
  padding: 15px;
  margin: 6px 0 12px;
  border: 1px solid rgba(240, 240, 240, 0.8);
  box-shadow: inset 0 1px 8px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(4px);
  animation: fadeInUp 0.4s ease;

  .details-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px dashed rgba(0, 185, 107, 0.2);
  }

  .details-title {
    font-weight: 600;
    font-size: 16px;
    color: @primary-color;
    position: relative;
    padding-left: 12px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background-color: @primary-color;
      border-radius: 2px;
    }
  }

  .order-id {
    color: #888;
    font-size: 14px;
    background-color: rgba(0, 0, 0, 0.03);
    padding: 4px 10px;
    border-radius: 12px;
  }

  // 商品表格样式优化
  .commodity-table {
    :deep(.ant-table-thead > tr > th) {
      background-color: rgba(0, 185, 107, 0.06);
      font-weight: 500;
      color: #666;
      font-size: 14px;
      border-bottom: 1px solid rgba(0, 185, 107, 0.1);
      border-top: none;
    }

    :deep(.ant-table-tbody > tr > td) {
      border-bottom: 1px dashed rgba(0, 0, 0, 0.05);
    }

    :deep(.ant-table-tbody > tr:last-child > td) {
      border-bottom: none;
    }
  }
}

// 动画定义
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-image-container {
  display: flex;
  justify-content: center;
}

.commodity-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  transition: all 0.3s;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  border: 3px solid white;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
}

.item-name {
  color: #333;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
  padding: 4px 0;
  border-bottom: 1px dashed transparent;
  transition: all 0.3s;

  &:hover {
    color: @primary-color;
    border-bottom-color: @primary-color;
  }
}

.item-price {
  color: @red;
  font-weight: 600;
  font-size: 16px;
  display: inline-block;
  background: rgba(243, 2, 19, 0.05);
  padding: 2px 10px;
  border-radius: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;

  button {
    margin-top: 20px;
  }
}

/* 表格行 */
:deep(.tb-row:hover) td,
:deep(.tb-row) td {
  background-color: #fafafa !important;
}

:deep(.ant-table-expanded-row) td {
  background-color: transparent !important;
  padding: 12px 24px;
}
</style>
