<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchServiceList } from '@/api/nacos'

// 保存服务状态，假设接口返回一个服务名称数组
const serviceStatus = ref({})

onMounted(() => {
    fetchServiceList()
        .then(res => {
            // 假设 res.data 为服务名称数组
            const status = {}
            res.data.forEach(service => {
                // 这里假定每个服务均处于正常状态，可根据实际情况调整状态值
                status[service] = [service, true]
            })
            serviceStatus.value = status
        })
        .catch(error => {
            console.error(error)
        })
})

const allServicesUp = computed(() => {
    return Object.values(serviceStatus.value).every(item => item[1])
})

function checkSrv(serviceName) {
    console.log('Checked service:', serviceName)
}
</script>

<template>
    <a-dropdown>
        <CheckCircleFilled style="color: #00b96b" v-if="allServicesUp" />
        <ExclamationCircleFilled style="color: #f30213" v-else />
        <template #overlay>
            <a-menu>
                <a-menu-item v-for="(status, service) in serviceStatus" :key="service">
                    <span @click="checkSrv(status[0])" :style="{ color: status[1] ? '#00b96b' : '#f30213' }">{{
                        status[0]
                        }}</span>
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
</template>