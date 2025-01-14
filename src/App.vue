<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { HomeOutlined, UserOutlined } from '@ant-design/icons-vue'
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/userInfo.js'

const userInfo = useUserStore()

onMounted(() => {
  const user = userInfo.getUser()
  if (user) {
    console.log(user)
  }
})
</script>

<template>
  <!--顶部导航栏-->
  <div class="top-navbar">
    <a-breadcrumb style="margin-left: 100px">
      <!--首页-->
      <a-breadcrumb-item>
        <router-link to="/">
          <home-outlined />
          <span>首页</span>
        </router-link>
      </a-breadcrumb-item>
      <!--登录-->
      <a-breadcrumb-item>
        <router-link to="/login" class="route-link">
          <user-outlined />
          <span>你好，请登录</span>
        </router-link>
      </a-breadcrumb-item>
      <!--注册-->
      <a-breadcrumb-item href="/login">
        <span>注册</span>
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
  <!--路由页面-->
  <a-config-provider :theme="{ token: { colorPrimary: '#00b96b' } }">
    <RouterView />
  </a-config-provider>
</template>

<style scoped>
.top-navbar {
  padding: 10px 20px;
  height: auto;
  background-color: #f0f2f5;
}

a :hover{
  color: #00b96b !important;
}
</style>
