<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useUserStore } from '@/stores/userInfo.js'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
} from '@ant-design/icons-vue'
import { checkServicesHealth } from '@/api/status.js'
import { jump } from './router/jump'
import { useRoute } from 'vue-router'

const userInfo = useUserStore()
const user = userInfo.user
const isLogin = ref(false) // 是否登录

const route = useRoute()
const isActive = (path) => route.path === path

const serviceStatus = ref(new Map()) // 服务状态
const allServicesUp = computed(() => {
  return Array.from(serviceStatus.value.values()).every((status) => status === 'UP')
})
// 获取服务状态
const getServiceStatus = async () => {
  serviceStatus.value = await checkServicesHealth()
  // console.log('serviceStatus', serviceStatus.value)
}

onMounted(() => {
  if (user.token != '') isLogin.value = true
  getServiceStatus()
  const intervalId = setInterval(getServiceStatus, 60000) // 10s执行一次
  onUnmounted(() => clearInterval(intervalId))
})
// 退出登录
const logout = () => {
  //TODO 退出登录后端删除用户相关信息和token
  userInfo.clearUser()
  jump('/login')
  onMounted()
  window.location.reload()
  message.success('已经退出登录')
}
</script>

<template>
  <!--顶部导航栏-->
  <div class="top-navbar">
    <a-breadcrumb style="margin-left: 100px">
      <!--首页-->
      <a-breadcrumb-item>
        <router-link to="/" :class="['route-link', { active: isActive('/') }]">
          <home-outlined />
          首页
        </router-link>
      </a-breadcrumb-item>

      <!--登录-->
      <a-breadcrumb-item>
        <router-link to="/user" :class="['route-link', { active: isActive('/user') }]">
          <user-outlined />
          <span v-if="isLogin"> 你好,{{ user.username }} </span>
          <span v-else>
            <router-link to="/login" :class="['route-link', { active: isActive('/login') }]">&nbsp;请登录 </router-link>
          </span>
        </router-link>
      </a-breadcrumb-item>

      <!--注册-->
      <a-breadcrumb-item v-if="!isLogin">
        <router-link to="/register" :class="['route-link', { active: isActive('/register') }]">
          <span>注册</span>
        </router-link>
      </a-breadcrumb-item>

      <!--购物车-->
      <a-breadcrumb-item>
        <router-link to="/cart" :class="['route-link', { active: isActive('/cart') }]">
          <ShoppingCartOutlined />
          购物车
        </router-link>
      </a-breadcrumb-item>

      <!--我的订单-->
      <a-breadcrumb-item>
        <router-link to="/order-info" :class="['route-link', { active: isActive('/order-info') }]">
          <FileTextOutlined />
          我的订单
        </router-link>
      </a-breadcrumb-item>

      <!--搜索商品-->
      <a-breadcrumb-item>
        <router-link to="/search" :class="['route-link', { active: isActive('/search') }]">
          <SearchOutlined />
          搜索商品
        </router-link>
      </a-breadcrumb-item>

      <!--退出登录-->
      <a-breadcrumb-item v-if="isLogin" class="logout" @click="logout">
        <LogoutOutlined />
        退出登录
      </a-breadcrumb-item>

      <!--服务状态-->
      <a-breadcrumb-item>
        <a-dropdown>
          <CheckCircleFilled style="color: #00b96b" v-if="allServicesUp" />
          <ExclamationCircleFilled style="color: #f30213" v-else />
          <template #overlay>
            <a-menu>
              <a-menu-item v-for="(status, service) in serviceStatus" :key="service">
                <span :style="{ color: status[1] === 'UP' ? '#00b96b' : '#f30213' }">{{ status[0] }}</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-breadcrumb-item>
    </a-breadcrumb>
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
  padding: 10px 20px;
  height: auto;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  background: #e7e7e7;
}

.route-link:hover,
a:hover {
  color: @primary-color !important;
}

.logout:hover {
  cursor: pointer;
  color: @red;
}

.active {
  font-weight: bold;
  color: @primary-color !important;
}
</style>
