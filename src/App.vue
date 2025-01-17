<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/userInfo.js'
import { message } from 'ant-design-vue'

const userInfo = useUserStore()
const user = userInfo.user
const isLogin = ref(false)

onMounted(() => {
  if (user) {
    isLogin.value = true
    // console.log(user)
  }
})

// 退出登录
const logout = () => {
  //TODO 退出登录删除用户相关信息和token
  message.success('退出登录')
}
</script>

<template>
  <!--顶部导航栏-->
  <div class="top-navbar">
    <a-breadcrumb style="margin-left: 100px">
      <!--首页-->
      <a-breadcrumb-item>
        <router-link to="/">
          <home-outlined />
          首页
        </router-link>
      </a-breadcrumb-item>

      <!--登录-->
      <a-breadcrumb-item>
        <router-link to="/user" class="route-link">
          <user-outlined />
          <span v-if="isLogin"> 你好,{{ user.username }} </span>
          <span v-else>
            <router-link to="/login" class="route-link"> 请登录 </router-link>
          </span>
        </router-link>
      </a-breadcrumb-item>

      <!--注册-->
      <a-breadcrumb-item v-if="!isLogin">
        <span>注册</span>
      </a-breadcrumb-item>

      <!--退出登录-->
      <a-breadcrumb-item v-if="isLogin" @click="logout">
        <router-link to="/login" class="route-link">
          <LogoutOutlined />
          退出登录
        </router-link>
      </a-breadcrumb-item>

      <!--购物车-->
      <a-breadcrumb-item>
        <router-link to="/cart" class="route-link">
          <ShoppingCartOutlined />
          我的购物车
        </router-link>
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
</style>
