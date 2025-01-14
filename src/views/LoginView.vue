<script setup>
import { reactive, computed, h, onMounted, ref } from 'vue'
import { UserOutlined, LockOutlined, GithubFilled } from '@ant-design/icons-vue'
import { githubLoginService, loginService } from '@/api/login.js'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/userInfo.js'
import router from '@/router/index.js'

const userInfo = useUserStore() //用户信息
// 定义表单
const formState = reactive({
  username: '',
  password: '',
  remember: true,
})

// 账号密码登录
const onFinish = async () => {
  await loginService(formState).then((res) => {
    // 保存到pinia
    userInfo.setUser({
      id: res.userId,
      username: res.username,
      balance: res.balance,
      avatar: res.avatar,
      token: res.token,
    })
  })
  await router.push({ path: '/' })
  // 打印用户信息
  // console.log(userInfo.user)
  message.success('登录成功!')
}

// 表单提交失败时的处理函数
const onFinishFailed = (errorInfo) => {
  message.error('失败:', errorInfo)
}

// 计算属性，判断表单是否禁用
const disabled = computed(() => {
  return !(formState.username && formState.password)
})

onMounted(() => {
  // GitHub 授权成功后，获取 code 并调用登录接口
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  if (code) {
    githubLoginService(code).then((res) => {
      // console.log(res.data)
      const data = res.data
      // 保存到pinia
      userInfo.setUser({
        id: data.userId,
        username: data.username,
        balance: data.balance,
        avatar: data.avatar,
        token: data.token,
      })
      message.success('github登录成功!')
      router.push({ path: '/' })
    })
  }
})

// github 登录
const loginByGithub = async () => {
  // 跳转到 GitHub 授权页面
  const clientId = 'Ov23liaxpXWclT4EZOKg'
  const redirectUri = 'http://localhost:5173/login'
  const scope = 'read:user user:email'
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}}`
}
</script>

<template>
  <div class="login-form">
    <!-- 表单组件 -->
    <a-form
      :model="formState"
      name="normal_login"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <!-- 用户名表单项 -->
      <a-form-item
        label="账号"
        name="username"
        :rules="[{ required: true, message: '请输入用户名!' }]"
      >
        <a-input v-model:value="formState.username">
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <!-- 密码表单项 -->
      <a-form-item
        label="密码"
        name="password"
        :rules="[{ required: true, message: '请输入密码!' }]"
      >
        <a-input-password v-model:value="formState.password">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <!-- 记住我和忘记密码 -->
      <a-form-item>
        <a-form-item name="remember" no-style>
          <a-checkbox v-model:checked="formState.remember">记住我</a-checkbox>
        </a-form-item>
        <a class="login-form-forgot" href="">忘记密码</a>
      </a-form-item>

      <!-- 登录按钮和注册链接 -->
      <a-form-item>
        <a-button :disabled="disabled" type="primary" html-type="submit" class="login-form-button">
          登录
        </a-button>
        或
        <a href="">立即注册</a>
      </a-form-item>

      <!-- 社交账号登录 -->
      <a-form-item>
        <a-space>
          <!--github 登录按钮-->
          <a-button shape="circle" :icon="h(GithubFilled)" @click="loginByGithub" />
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped>
.login-form {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px;
  border-radius: 10px;
  background: #f8f8f8;
  padding: 50px;
  width: auto;
}
</style>
