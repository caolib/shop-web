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
  ArrowRightOutlined,
  MenuOutlined,
  SyncOutlined
} from '@ant-design/icons-vue'
import { checkSrv, getServiceStatus } from '@/api/status.js'
import { useRoute } from 'vue-router'
import { logout } from '@/api/login.js'
import { flushUser, isLogin, user } from '@/api/app.js'
import { goPage, jump } from './router/jump'

const route = useRoute()
const isActive = (path) => route.path === path

// 用于存储从API获取的原始Map数据
const serviceStatusMap = ref(new Map())
// 用于模板渲染的服务列表数组
const serviceList = ref([])
const isRefreshing = ref(false)

const allServicesUp = computed(() => {
  if (serviceList.value.length === 0 && !isRefreshing.value) { // 如果列表为空且不在刷新，则认为正常（或无服务）
    return true;
  }
  return serviceList.value.length > 0 && serviceList.value.every(item => item.status)
})

// 刷新服务状态
const refreshServices = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await getServiceStatus(serviceStatusMap) // getServiceStatus 会直接修改 serviceStatusMap.value

    if (serviceStatusMap.value && typeof serviceStatusMap.value.entries === 'function') {
      const newList = []
      for (const [name, status] of serviceStatusMap.value.entries()) {
        newList.push({ name, status })
      }
      serviceList.value = newList
    } else {
      console.error('getServiceStatus did not populate serviceStatusMap.value correctly or it is not a Map.')
      serviceList.value = [] // 清空列表或显示错误提示
    }
  } catch (error) {
    console.error('刷新服务状态失败:', error)
    serviceList.value = [] // 发生错误时清空列表
  } finally {
    isRefreshing.value = false
  }
}

onMounted(() => {
  flushUser()
  refreshServices() // 初始加载
  const intervalId = setInterval(refreshServices, 60000) // 定时刷新
  onUnmounted(() => clearInterval(intervalId))
})
</script>

<template>
  <!--顶部导航栏-->
  <div class="top-navbar">
    <div class="navbar-container">
      <!-- 左侧导航 -->
      <div class="navbar-left">
        <div class="logo-area" @click="jump('/')">
          <ShoppingCartOutlined class="logo-icon" />
          <span class="logo-text">网上商店</span>
        </div>

        <div class="main-nav">
          <div :class="['nav-item', { active: isActive('/') }]" @click="jump('/')">
            <HomeOutlined class="nav-icon" />
            <span class="nav-text">首页</span>
          </div>

          <div :class="['nav-item', { active: isActive('/search') }]" @click="jump('/search')">
            <SearchOutlined class="nav-icon" />
            <span class="nav-text">搜索</span>
          </div>

          <div :class="['nav-item', { active: isActive('/cart') }]" @click="jump('/cart')">
            <ShoppingCartOutlined class="nav-icon" />
            <span class="nav-text">购物车</span>
          </div>

          <div :class="['nav-item', { active: isActive('/order-list') }]" @click="jump('/order-list')">
            <FileTextOutlined class="nav-icon" />
            <span class="nav-text">我的订单</span>
          </div>

          <div :class="['nav-item', { active: isActive('/about') }]" @click="jump('/about')">
            <FileTextOutlined class="nav-icon" />
            <span class="nav-text">关于</span>
          </div>
        </div>
      </div>

      <!-- 右侧用户区和功能区 -->
      <div class="navbar-right">
        <!-- 服务状态 -->
        <div class="status-indicator">
          <a-dropdown placement="bottomRight" trigger="hover">
            <div class="status-icon-wrapper" :title="allServicesUp ? '所有服务正常' : '部分服务异常'">
              <CheckCircleFilled class="status-icon status-up" v-if="allServicesUp" />
              <ExclamationCircleFilled class="status-icon status-down" v-else />
              <span class="status-text-brief">{{ allServicesUp ? '服务正常' : '服务异常' }}</span>
            </div>
            <template #overlay>
              <a-menu class="status-menu">
                <div v-if="isRefreshing && serviceList.length === 0" class="status-menu-loading">
                  <a-spin size="small" />
                  <span>&nbsp;加载中...</span>
                </div>
                <div v-else-if="!isRefreshing && serviceList.length === 0" class="status-menu-empty">
                  <span>暂无服务或获取失败</span>
                </div>
                <template v-else>
                  <a-menu-item v-for="serviceItem in serviceList" :key="serviceItem.name" class="service-status-item">
                    <div @click="checkSrv(serviceItem.name)" class="service-item-content">
                      <CheckCircleFilled v-if="serviceItem.status" class="status-icon status-up" />
                      <ExclamationCircleFilled v-else class="status-icon status-down" />
                      <span class="service-name">{{ serviceItem.name }}</span>
                    </div>
                  </a-menu-item>
                </template>
                <a-menu-divider />
                <a-menu-item @click="refreshServices" class="status-menu-refresh">
                  <SyncOutlined :spin="isRefreshing" />
                  <span>&nbsp;{{ isRefreshing ? '刷新中...' : '刷新状态' }}</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>

        <!-- 导航历史 -->
        <div class="nav-history">
          <a-button type="text" class="history-btn" @click="goPage(-1)">
            <ArrowLeftOutlined />
          </a-button>
          <a-button type="text" class="history-btn" @click="goPage(1)">
            <ArrowRightOutlined />
          </a-button>
        </div>

        <!-- 用户区域 -->
        <div class="user-area">
          <a-dropdown v-if="isLogin" placement="bottomRight">
            <div class="user-info">
              <UserOutlined class="user-icon" />
              <span class="username">{{ user.username }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile" @click="jump('/user')">
                  <UserOutlined /> 个人中心
                </a-menu-item>
                <a-menu-item key="orders" @click="jump('/order-list')">
                  <FileTextOutlined /> 我的订单
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="logout('')" danger>
                  <LogoutOutlined /> 退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <div v-else class="login-btns">
            <a-button type="link" class="login-btn" @click="jump('/login')">登录</a-button>
          </div>
        </div>
      </div>

      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu-btn">
        <a-button type="text">
          <template #icon>
            <MenuOutlined />
          </template>
        </a-button>
      </div>
    </div>
  </div>

  <!--路由页面-->
  <a-config-provider :theme="{ token: { colorPrimary: '#00b96b' } }">
    <RouterView class="main-content" />
    <a-back-top />
  </a-config-provider>
</template>

<style scoped lang="less">
@import '@/styles/var';

.top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 40px;
  display: flex;
  align-items: center;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 20px;
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
}

.navbar-left {
  display: flex;
  align-items: center;
  height: 100%;
}

.logo-area {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 30px;

  .logo-icon {
    font-size: 24px;
    color: @primary-color;
  }

  .logo-text {
    margin-left: 10px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
}

.main-nav {
  display: flex;
  height: 100%;
}

.nav-item {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 15px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  color: #666;

  &:hover {
    color: @primary-color;
    background-color: rgba(0, 185, 107, 0.05);
  }

  &.active {
    color: @primary-color;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 15%;
      width: 70%;
      height: 3px;
      background-color: @primary-color;
      border-radius: 2px 2px 0 0;
    }
  }

  .nav-icon {
    font-size: 16px;
    margin-right: 5px;
  }

  .nav-text {
    font-size: 14px;
  }
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-indicator {
  .status-icon-wrapper {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.3s;

    &:hover {
      background-color: #f5f5f5;
    }
  }

  .status-icon {
    font-size: 16px; // 调整图标大小
  }

  .status-text-brief {
    margin-left: 6px;
    font-size: 13px; // 调整文字大小
    color: #555;
  }

  .status-up {
    color: @primary-color !important;
  }

  .status-down {
    color: @red !important;
  }
}

.status-menu {
  width: fit-content;
  min-width: 160px;
  padding: 4px 0;

  .status-menu-loading,
  .status-menu-empty {
    padding: 10px 12px;
    color: #888;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    white-space: nowrap;
  }

  .service-status-item {
    padding: 0;

    .service-item-content {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      white-space: nowrap;
      cursor: pointer;

      &:hover {
        background-color: #f5f5f5;
      }

      .status-icon {
        margin-right: 8px;
        font-size: 14px;
      }

      .status-up {
        color: @primary-color !important;
      }

      .status-down {
        color: @red !important;
      }

      .service-name {
        flex-grow: 1;
        font-size: 13px;
        color: #333;
      }
    }
  }

  .status-menu-refresh {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    font-size: 13px;
    color: @primary-color;
    white-space: nowrap;

    &:hover {
      background-color: tint(@primary-color, 90%) !important;
      color: @primary-color !important;
    }

    .anticon-sync {
      margin-right: 6px;
    }
  }
}

.nav-history {
  display: flex;
  gap: 5px;

  .history-btn {
    color: #999;

    &:hover {
      color: @primary-color;
      background-color: transparent;
    }
  }
}

.user-area {
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #f5f5f5;
    }

    .user-icon {
      color: @primary-color;
    }

    .username {
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .login-btns {
    display: flex;
    align-items: center;

    .login-btn {
      padding: 0 5px;
      height: auto;
      font-size: 14px;
    }

    .divider {
      color: #ccc;
      margin: 0 2px;
    }
  }
}

.mobile-menu-btn {
  display: none;
}

.main-content {
  margin-top: 70px; // 顶部导航栏高度 + 一些间距
  min-height: calc(100vh - 70px);
}

/* 移动端适配 */
@media (max-width: 768px) {

  .main-nav,
  .nav-history,
  .status-text-brief {
    // 在移动端隐藏简要状态文字
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .logo-text,
  .username {
    display: none;
  }

  .logo-area {
    margin-right: 10px;
  }

  .navbar-container {
    padding: 0 10px;
  }

  .status-indicator {
    .status-icon-wrapper {
      padding: 4px; // 减少移动端padding
    }
  }

  .navbar-right {
    gap: 8px;
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .nav-text {
    display: none;
  }

  .nav-item {
    padding: 0 10px;

    .nav-icon {
      font-size: 18px;
      margin-right: 0;
    }
  }

  .username {
    display: none;
  }

  .status-text-brief {
    // 在平板也隐藏简要状态文字
    display: none;
  }
}
</style>
