<template>
    <div class="test-container">
        <div class="test-header">
            <h1 class="test-title">
                <ExperimentOutlined />
                组件测试展示
            </h1>
            <p class="test-description">这个页面用于测试和展示网上商店应用中的各种UI组件</p>
        </div>

        <a-tabs v-model:activeKey="activeTab" class="test-tabs">
            <a-tab-pane key="components" tab="UI组件">
                <div class="component-grid">
                    <!-- 基础组件测试区 -->
                    <div class="component-card">
                        <h3>按钮组件</h3>
                        <div class="component-demo">
                            <a-space direction="vertical">
                                <a-space>
                                    <a-button type="primary">主要按钮</a-button>
                                    <a-button>默认按钮</a-button>
                                    <a-button type="dashed">虚线按钮</a-button>
                                    <a-button type="link">链接按钮</a-button>
                                </a-space>
                                <a-space>
                                    <a-button type="primary" shape="circle">
                                        <template #icon>
                                            <SearchOutlined />
                                        </template>
                                    </a-button>
                                    <a-button type="primary">
                                        <template #icon>
                                            <SearchOutlined />
                                        </template>
                                        搜索
                                    </a-button>
                                    <a-button type="primary" danger>危险按钮</a-button>
                                    <a-button type="primary" :loading="loading" @click="handleButtonClick">
                                        {{ loading ? '加载中' : '点击加载' }}
                                    </a-button>
                                </a-space>
                            </a-space>
                        </div>
                    </div>

                    <!-- 表单组件测试区 -->
                    <div class="component-card">
                        <h3>表单组件</h3>
                        <div class="component-demo">
                            <a-form :model="formState" layout="vertical">
                                <a-form-item label="用户名" required>
                                    <a-input v-model:value="formState.username" placeholder="请输入用户名">
                                        <template #prefix>
                                            <UserOutlined />
                                        </template>
                                    </a-input>
                                </a-form-item>
                                <a-form-item label="密码" required>
                                    <a-input-password v-model:value="formState.password" placeholder="请输入密码" />
                                </a-form-item>
                                <a-form-item label="年龄">
                                    <a-input-number v-model:value="formState.age" style="width: 100%" />
                                </a-form-item>
                                <a-form-item label="性别">
                                    <a-radio-group v-model:value="formState.gender" :options="genderOptions" />
                                </a-form-item>
                                <a-form-item>
                                    <a-checkbox v-model:checked="formState.agree">同意用户协议</a-checkbox>
                                </a-form-item>
                                <a-form-item>
                                    <a-button type="primary" @click="handleSubmit">提交</a-button>
                                </a-form-item>
                            </a-form>
                        </div>
                    </div>

                    <!-- 表格组件测试区 -->
                    <div class="component-card full-width">
                        <h3>表格组件</h3>
                        <div class="component-demo">
                            <a-table :columns="tableColumns" :data-source="tableData" :pagination="{ pageSize: 5 }"
                                bordered>
                                <template #headerCell="{ column }">
                                    <template v-if="column.key === 'name'">
                                        <span>
                                            <ShopOutlined />
                                            商品名称
                                        </span>
                                    </template>
                                </template>
                            </a-table>
                        </div>
                    </div>

                    <!-- 卡片和通知组件测试区 -->
                    <div class="component-card">
                        <h3>卡片组件</h3>
                        <div class="component-demo">
                            <a-card title="商品信息" style="width: 300px" hoverable>
                                <template #cover>
                                    <img alt="商品图片"
                                        src="https://img.alicdn.com/imgextra/i1/O1CN01bwzUgs1RcUYI0UQE7_!!6000000002133-0-yinhe.jpg"
                                        style="height: 150px; object-fit: cover;" />
                                </template>
                                <template #actions>
                                    <ShoppingCartOutlined key="cart" />
                                    <ShopOutlined key="shop" />
                                    <SettingOutlined key="setting" />
                                </template>
                                <a-card-meta title="超值商品" description="这是一个商品描述...">
                                    <template #avatar>
                                        <a-avatar src="https://joeschmoe.io/api/v1/random" />
                                    </template>
                                </a-card-meta>
                            </a-card>
                        </div>
                    </div>

                    <!-- 弹窗和警告组件测试区 -->
                    <div class="component-card">
                        <h3>通知和提示组件</h3>
                        <div class="component-demo">
                            <a-space direction="vertical">
                                <a-space>
                                    <a-button type="primary" @click="() => $message.success('操作成功!')">成功提示</a-button>
                                    <a-button @click="() => $message.error('操作失败!')">错误提示</a-button>
                                    <a-button @click="() => $message.warning('警告信息!')">警告提示</a-button>
                                </a-space>
                                <a-space>
                                    <a-button type="primary" @click="() => $notification.open({
                                        message: '通知标题',
                                        description: '这是通知描述内容，用于展示更多信息。',
                                        icon: h(BellOutlined, { style: 'color: #00b96b' }),
                                    })">
                                        显示通知
                                    </a-button>
                                    <a-button @click="() => $modal.confirm({
                                        title: '确认操作',
                                        content: '你确定要执行此操作吗？',
                                        okText: '确定',
                                        cancelText: '取消',
                                    })">
                                        显示对话框
                                    </a-button>
                                </a-space>
                            </a-space>
                        </div>
                    </div>

                    <!-- 状态按钮测试区 -->
                    <div class="component-card">
                        <h3>状态按钮组件</h3>
                        <div class="component-demo">
                            <status-button />
                            <p class="component-description">此组件用于显示系统各服务的状态</p>
                        </div>
                    </div>
                </div>
            </a-tab-pane>
            <a-tab-pane key="layout" tab="布局测试">
                <div class="layout-demo">
                    <a-row :gutter="[16, 16]">
                        <a-col :span="24">
                            <div class="layout-block layout-header">头部区域</div>
                        </a-col>
                        <a-col :span="6">
                            <div class="layout-block layout-sidebar">侧边栏</div>
                        </a-col>
                        <a-col :span="18">
                            <div class="layout-block layout-content">
                                <h3>主内容区域</h3>
                                <p>这里是主要内容区域，可以放置各种组件和页面内容</p>
                                <a-divider />
                                <a-row :gutter="[16, 16]">
                                    <a-col :span="8">
                                        <div class="layout-block layout-inner">内容块 1</div>
                                    </a-col>
                                    <a-col :span="8">
                                        <div class="layout-block layout-inner">内容块 2</div>
                                    </a-col>
                                    <a-col :span="8">
                                        <div class="layout-block layout-inner">内容块 3</div>
                                    </a-col>
                                </a-row>
                            </div>
                        </a-col>
                        <a-col :span="24">
                            <div class="layout-block layout-footer">底部区域</div>
                        </a-col>
                    </a-row>
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup>
import { ref, reactive, h } from 'vue'
import StatusButton from '@/components/StatusButton.vue'
import {
    UserOutlined,
    SettingOutlined,
    AppstoreOutlined,
    ShopOutlined,
    ShoppingCartOutlined,
    BellOutlined,
    SearchOutlined,
    ExperimentOutlined
} from '@ant-design/icons-vue'

// 测试数据
const activeTab = ref('components')
const loading = ref(false)
const formState = reactive({
    username: '',
    password: '',
    description: '',
    age: undefined,
    gender: undefined,
    agree: false
})

// 测试表格数据
const tableData = ref([
    {
        key: '1',
        name: '商品1',
        price: 9900,
        category: '电子产品',
        stock: 100
    },
    {
        key: '2',
        name: '商品2',
        price: 4500,
        category: '服装',
        stock: 56
    },
    {
        key: '3',
        name: '商品3',
        price: 2000,
        category: '食品',
        stock: 200
    }
])

const tableColumns = [
    {
        title: '商品名称',
        dataIndex: 'name',
        key: 'name'
    },
    {
        title: '价格',
        dataIndex: 'price',
        key: 'price',
        customRender: ({ text }) => `¥${(text / 100).toFixed(2)}`
    },
    {
        title: '分类',
        dataIndex: 'category',
        key: 'category'
    },
    {
        title: '库存',
        dataIndex: 'stock',
        key: 'stock'
    },
    {
        title: '操作',
        key: 'action',
        customRender: () => {
            return h('div', {}, [
                h('a-button', { type: 'link', innerHTML: '编辑', style: { marginRight: '8px' } }),
                h('a-button', { type: 'link', danger: true, innerHTML: '删除', style: { marginLeft: '8px' } })
            ])
        }
    }
]

// 单选按钮组选项
const genderOptions = [
    { label: '男', value: 'male' },
    { label: '女', value: 'female' },
    { label: '其他', value: 'other' }
]

// 事件处理
const handleButtonClick = () => {
    loading.value = true
    setTimeout(() => {
        loading.value = false
    }, 1500)
}

const handleSubmit = () => {
    console.log('表单提交', formState)
}
</script>

<style scoped lang="less">
@import '@/styles/var';

.test-container {
    padding: 24px;
    background-color: #f0f2f5;
    min-height: 100vh;
}

.test-header {
    margin-bottom: 24px;
    background-color: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: @box-shadow;
}

.test-title {
    color: @primary-color;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.test-description {
    color: #666;
    margin-bottom: 0;
}

.test-tabs {
    background-color: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: @box-shadow;
}

.component-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 24px;
}

.component-card {
    background-color: #fafafa;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    border: 1px solid #f0f0f0;
    transition: all 0.3s;

    &:hover {
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
    }

    h3 {
        margin-bottom: 16px;
        color: #333;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 8px;
    }

    &.full-width {
        grid-column: 1 / -1;
    }
}

.component-demo {
    padding: 16px;
    background-color: white;
    border-radius: 4px;
    border: 1px dashed #e8e8e8;
}

.component-description {
    margin-top: 12px;
    color: #999;
    font-size: 13px;
}

/* 布局演示样式 */
.layout-demo {
    margin-top: 16px;
}

.layout-block {
    padding: 16px;
    background-color: #fafafa;
    border-radius: 4px;
    border: 1px dashed #d9d9d9;
    text-align: center;
    color: #666;
    transition: all 0.3s;

    &:hover {
        background-color: #f0f0f0;
        color: #333;
    }
}

.layout-header {
    background-color: #e6f7ff;
    border-color: #91d5ff;
}

.layout-sidebar {
    background-color: #f6ffed;
    border-color: #b7eb8f;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.layout-content {
    background-color: #fffbe6;
    border-color: #ffe58f;
    height: 400px;
    text-align: left;
    overflow: auto;
}

.layout-footer {
    background-color: #fff2e8;
    border-color: #ffbb96;
}

.layout-inner {
    background-color: #fff0f6;
    border-color: #ffadd2;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>