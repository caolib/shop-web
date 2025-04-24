<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue'
import { checkSrv, getServiceStatus } from '@/api/status.js'
import { useRoute } from 'vue-router'
import { logout } from '@/api/login.js'
import { flushUser, isLogin, user } from '@/api/app.js'
import { goPage, jump } from './router/jump'

const route = useRoute()
const isActive = (path) => route.path === path

const serviceStatus = ref(new Map())
const allServicesUp = computed(() => {
  return Array.from(serviceStatus.value.values()).every((status) => status)
})

onMounted(() => {
  flushUser()
  getServiceStatus(serviceStatus)
  const intervalId = setInterval(() => getServiceStatus(serviceStatus), 60000)
  onUnmounted(() => clearInterval(intervalId))
})

</script>

<template>
  <!--顶部导航栏-->
  <div class="top-navbar">
    <div class="breadcrumb-container">
      <div class="breadcrumb-left">
        <a-breadcrumb separator=" ">
          <!--首页-->
          <a-breadcrumb-item :class="['route-link', { active: isActive('/') }]" @click="jump('/')">
            <home-outlined />
            首页
          </a-breadcrumb-item>

          <!--登录-->
          <a-breadcrumb-item :class="['route-link', { active: isActive(isLogin ? '/user' : '/login') }]"
            @click="jump(isLogin ? '/user' : '/login')">
            <user-outlined />
            <span v-if="isLogin">你好,{{ user.username }}</span>
            <span v-else>请登录</span>
          </a-breadcrumb-item>

          <!--注册-->
          <a-breadcrumb-item v-if="!isLogin" :class="['route-link', { active: isActive('/') }]" @click="jump('/')">
            注册
          </a-breadcrumb-item>

          <!--搜索商品-->
          <a-breadcrumb-item :class="['route-link', { active: isActive('/search') }]" @click="jump('/search')">
            <SearchOutlined />
            搜索
          </a-breadcrumb-item>

          <!--购物车-->
          <a-breadcrumb-item :class="['route-link', { active: isActive('/cart') }]" @click="jump('/cart')">
            <ShoppingCartOutlined />
            购物车
          </a-breadcrumb-item>

          <!--我的订单-->
          <a-breadcrumb-item :class="['route-link', { active: isActive('/order-list') }]" @click="jump('/order-list')">
            <FileTextOutlined />
            我的订单
          </a-breadcrumb-item>

          <!--关于-->
          <a-breadcrumb-item :class="['route-link', { active: isActive('/about') }]" @click="jump('/about')">
            <FileTextOutlined />
            关于
          </a-breadcrumb-item>

          <!--退出登录-->
          <a-breadcrumb-item v-if="isLogin" :class="['logout', 'route-link']" @click="logout('')">
            <LogoutOutlined />
            退出登录
          </a-breadcrumb-item>


        </a-breadcrumb>
      </div>
      <div class="breadcrumb-right">
        <a-breadcrumb separator=" ">
          <!--服务状态-->
          <a-breadcrumb-item class="actions">
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
          </a-breadcrumb-item>

          <!--回退-->
          <a-breadcrumb-item class="actions" @click="goPage(-1)">
            <ArrowLeftOutlined />
          </a-breadcrumb-item>

          <!--前进-->
          <a-breadcrumb-item class="actions" @click="goPage(1)">
            <ArrowRightOutlined />
          </a-breadcrumb-item>

        </a-breadcrumb>
      </div>
    </div>
  </div>

  <!--路由页面-->
  <a-config-provider :theme="{ token: { colorPrimary: '#00b96b' } }">
    <RouterView style="margin-top: 40px" />
    <a-back-top />
  </a-config-provider>
</template>

<style scoped lang="less">
@import '@/styles/var';

.top-navbar {
  padding: 5px;
  height: auto;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  background: #e7e7e7;
}

.breadcrumb-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ant-breadcrumb li:last-child {
  color: grey;
}

.logout:hover {
  color: @red !important;
}

.route-link:hover,
a:hover {
  color: @primary-color;
  cursor: pointer;
  border-radius: 5px;
}

.actions {
  margin-right: 5px;
  color: grey !important;
}

.actions:hover {
  border-radius: 5px;
  cursor: pointer;
  color: @primary-color !important;
}

.active {
  color: @primary-color !important;
}
</style>
