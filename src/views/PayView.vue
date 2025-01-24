<script setup>
import { getOrderByIdService } from '@/api/order'
import { createPayOrderService, payService } from '@/api/pay'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'

const route = useRoute()
const orderId = route.query.orderId
const activeKey = ref('1'); // 默认使用第一种支付方式
const visible = ref(false)
const payOrder = ref() // 支付单号
const paySuccess = ref(false) // 支付成功

const order = ref(null) // 订单
const countdown = ref('') // 倒计时
const password = ref('') // 支付密码
const loading = ref(false) // 提交订单,按钮loading状态

// 更新倒计时
const updateCountdown = (deadline) => {
    const now = dayjs()
    const diff = deadline.diff(now)
    if (diff <= 0) {
        countdown.value = '订单已取消'
        clearInterval(interval)
    } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        countdown.value = `${hours}小时${minutes}分钟${seconds}秒`
    }
}

let interval

onMounted(async () => {
    if (orderId) {
        // 获取订单信息
        await getOrderByIdService(orderId).then((res) => {
            order.value = res
            console.log('订单详情', order.value)
        })
        // 创建支付单
        createPayOrder()
    }
    const createTime = order.value.createTime
    console.log('订单创建时间', createTime)
    const deadline = dayjs(createTime).add(12, 'hour')
    updateCountdown(deadline)
    interval = setInterval(() => updateCountdown(deadline), 1000)
})

// 创建支付单
const createPayOrder = async () => {
    const form = {
        bizOrderNo: orderId,
        amount: order.value.totalFee,
        payChannelCode: 'balance',
        payType: 5,
        orderInfo: '商品订单余额支付'
    }
    // 创建支付订单
    await createPayOrderService(form).then((res) => {
        if (res.code === 1001) {
            paySuccess.value = true
            message.success('订单已支付')
        }
        payOrder.value = res.data;
        console.log('支付单：', payOrder.value)
    })
}

// 余额支付
const pay = async () => {
    await payService(payOrder.value.id, password.value).then(res => {
        if (res.code === 200) {
            message.success('支付成功')
            paySuccess.value = true
        }
    })
}
</script>

<template>
    <div class="pay-view">
        <!-- 待支付状态 -->
        <a-result status="info" v-if="!paySuccess" title="订单创建成功">
            <template #subTitle>
                <div>
                    订单号:
                    <a-typography-paragraph style="display: inline;" :copyable="{ tooltip: false }">
                        {{ orderId }}
                    </a-typography-paragraph>
                    <span style="margin-left: 10px;">请尽快支付，订单支付剩余时间: <span class="time-text">{{ countdown
                            }}</span></span>
                </div>
            </template>
            <template #extra>
                <div class="pay-tabs">
                    <a-tabs v-model:activeKey="activeKey">
                        <a-tab-pane key="1" tab="余额支付">
                            <a-space>
                                <a-input-password v-model:value="password" v-model:visible="visible"
                                    placeholder="输入你的支付密码" />
                                <a-button type="primary" :loading="loading" @click="pay">确认支付</a-button>
                            </a-space>
                        </a-tab-pane>
                    </a-tabs>
                </div>
            </template>
        </a-result>
        <!--TODO 支付成功状态,添加其他按钮 -->
        <a-result status="success" v-else title="支付成功">
            <template #subTitle>
                <div>
                    订单号:
                    <a-typography-paragraph style="display: inline;" :copyable="{ tooltip: false }">
                        {{ orderId }}
                    </a-typography-paragraph>
                </div>
            </template>
        </a-result>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/var';

/* 倒计时文本 */
.time-text {
    color: @primary-color;
    width: auto;
}

/* 支付方式标签页 */
.pay-tabs {
    margin-top: 20px;
    width: 70vw;
    display: flex;
    justify-content: center;
}

.pay-view {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70vh;
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
    display: none;
}

html,
body {
    overflow: hidden;
}
</style>