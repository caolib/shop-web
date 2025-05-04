<script setup>
import { reactive, computed, h, onMounted, ref } from 'vue'
import {
  UserOutlined,
  LockOutlined,
  GithubFilled,
  GitlabFilled,
  WechatFilled,
  QqCircleFilled,
  PhoneOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue'
import { githubLoginService, loginService, registerService } from '@/api/login.js'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/userInfo.js'

import { jump } from '@/router/jump.js'
import { flushUser } from '@/api/app.js'

const isRegister = ref(false)

const jumpToHome = () => {
  jump('/')
  flushUser()
}

// 加载中
const spinning = ref(false)
const registerSpinning = ref(false)

const userInfo = useUserStore() //用户信息
// 登录表单
const formState = reactive({
  username: '',
  password: '',
})

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  phone: '',
})

// 用户注册
const register = async () => {
  registerSpinning.value = true
  const hide = message.loading('注册中...', 0)
  await registerService(registerForm).then(() => {
    message.success('注册成功!')
    isRegister.value = false
  }).finally(() => {
    hide()
    registerSpinning.value = false
  })
}

// 账号密码登录
const onFinish = async () => {
  spinning.value = true
  const hide = message.loading('登录中...', 0)
  await loginService(formState)
    .then((res) => {
      // 保存到pinia
      userInfo.setUser({
        id: res.userId,
        username: res.username,
        balance: res.balance,
        avatar: res.avatar,
        token: res.token,
      })
    })
    .finally(() => {
      hide()
      spinning.value = false
    })
  // 跳转到首页
  jumpToHome()
}

// 判断登录表单是否禁用
const disabled = computed(() => {
  return !(formState.username && formState.password)
})

// 判断注册表单是否禁用
const disabled2 = computed(() => {
  return !(registerForm.username && registerForm.password && registerForm.phone)
})

// github 登录
onMounted(() => {
  // GitHub 授权成功后，获取 code 并调用登录接口
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  if (code) {
    spinning.value = true
    githubLoginService(code)
      .then(async (res) => {
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
        // 跳转到首页
        jumpToHome()
      })
      .finally(() => {
        spinning.value = false
      })
  }
})

// github 登录
const loginByGithub = async () => {
  spinning.value = true
  const ghAuthUrl = import.meta.env.VITE_Gh_AUTH_URL
  console.log(ghAuthUrl)
  // 跳转到 GitHub 授权页面
  window.location.href = ghAuthUrl
}

// 微信登录
const loginByWeiXin = async () => {
  // TODO: 微信登录
  message.info('暂不支持微信登录')
}

// QQ登录
const loginByQQ = async () => {
  // TODO: QQ登录
  message.info('暂不支持QQ登录')
}

// gitlab 登录
const loginByGitlab = () => {
  // TODO: gitlab登录
  message.info('暂不支持Gitlab登录')
}
</script>

<template>
  <a-spin :spinning="spinning" size="large">
    <div class="login-body">
      <div class="login-container">
        <div class="login-content">
          <!-- 左侧品牌区域 -->
          <div class="brand-section">
            <div class="brand-content">
              <h1 class="brand-title">网上商店</h1>
              <p class="brand-slogan">购物，就是这么简单</p>
              <div class="brand-features">
                <div class="feature-item">
                  <div class="feature-icon">🛒</div>
                  <div class="feature-text">丰富商品</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">🚚</div>
                  <div class="feature-text">快速配送</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">💯</div>
                  <div class="feature-text">优质服务</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧表单区域 -->
          <div class="form-section">
            <div class="login-form">
              <!-- 登录表单 -->
              <a-form v-if="!isRegister" :model="formState" name="normal_login" @finish="onFinish"
                class="form-container">
                <div class="form-header">
                  <h2 class="form-title active">登录</h2>
                  <div class="form-title-divider"></div>
                  <h2 class="form-title" @click="isRegister = true">注册</h2>
                </div>

                <!-- 用户名表单项 -->
                <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名!' }]">
                  <a-input v-model:value="formState.username" placeholder="用户名" size="large" class="custom-input">
                    <template #prefix>
                      <UserOutlined class="input-icon" />
                    </template>
                  </a-input>
                </a-form-item>

                <!-- 密码表单项 -->
                <a-form-item name="password" :rules="[{ required: true, message: '请输入密码!' }]">
                  <a-input-password v-model:value="formState.password" placeholder="密码" size="large"
                    class="custom-input">
                    <template #prefix>
                      <LockOutlined class="input-icon" />
                    </template>
                  </a-input-password>
                </a-form-item>

                <!-- 登录按钮和注册链接 -->
                <a-form-item>
                  <a-button :disabled="disabled" :loading="spinning" type="primary" html-type="submit" class="login-btn"
                    size="large">
                    登录
                    <ArrowRightOutlined />
                  </a-button>
                  <div class="form-footer">
                    还没有账号？ <a @click="isRegister = true">立即注册</a>
                  </div>
                </a-form-item>

                <!-- 社交账号登录 -->
                <div class="social-login">
                  <div class="social-divider">
                    <span>使用其他方式登录</span>
                  </div>
                  <div class="social-buttons">
                    <a-button class="social-btn github-btn" shape="circle" :icon="h(GithubFilled)"
                      @click="loginByGithub" />
                    <a-button class="social-btn wechat-btn" shape="circle" :icon="h(WechatFilled)"
                      @click="loginByWeiXin" />
                    <a-button class="social-btn qq-btn" shape="circle" :icon="h(QqCircleFilled)" @click="loginByQQ" />
                    <a-button class="social-btn gitlab-btn" shape="circle" :icon="h(GitlabFilled)"
                      @click="loginByGitlab" />
                  </div>
                </div>
              </a-form>

              <!-- 注册表单 -->
              <a-form v-else :model="registerForm" name="normal_register" @finish="register" class="form-container">
                <div class="form-header">
                  <h2 class="form-title" @click="isRegister = false">登录</h2>
                  <div class="form-title-divider"></div>
                  <h2 class="form-title active">注册</h2>
                </div>

                <!-- 用户名表单项 -->
                <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名!' }]">
                  <a-input v-model:value="registerForm.username" placeholder="用户名" size="large" class="custom-input">
                    <template #prefix>
                      <UserOutlined class="input-icon" />
                    </template>
                  </a-input>
                </a-form-item>

                <!-- 密码表单项 -->
                <a-form-item name="password" :rules="[{ required: true, message: '请输入密码!' }]">
                  <a-input-password v-model:value="registerForm.password" placeholder="密码" size="large"
                    class="custom-input">
                    <template #prefix>
                      <LockOutlined class="input-icon" />
                    </template>
                  </a-input-password>
                </a-form-item>

                <!-- 电话 -->
                <a-form-item name="phone" :rules="[{ required: true, message: '请输入电话!' }]">
                  <a-input v-model:value="registerForm.phone" :maxlength="11" placeholder="手机号码" size="large"
                    class="custom-input">
                    <template #prefix>
                      <PhoneOutlined class="input-icon" />
                    </template>
                  </a-input>
                </a-form-item>

                <!-- 注册按钮 -->
                <a-form-item>
                  <a-button :disabled="disabled2" :loading="registerSpinning" type="primary" html-type="submit"
                    class="login-btn" size="large">
                    注册
                    <ArrowRightOutlined />
                  </a-button>
                  <div class="form-footer">
                    已有账号？ <a @click="isRegister = false">返回登录</a>
                  </div>
                </a-form-item>
              </a-form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-spin>
</template>

<style scoped lang="less">
@import '@/styles/var';

/* 背景样式 */
.login-body {
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-container {
  width: 900px;
  max-width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-out;
}

.login-content {
  display: flex;
  height: 600px;
}

/* 左侧品牌区域 */
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, @primary-color 0%, darken(@primary-color, 20%) 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.brand-section:before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 60%);
  animation: rotate 30s linear infinite;
}

.brand-content {
  position: relative;
  z-index: 1;
}

.brand-title {
  font-size: 42px;
  margin-bottom: 10px;
  font-weight: bold;
}

.brand-slogan {
  font-size: 18px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
  animation: slideIn 0.6s ease-out forwards;
  opacity: 0;
}

.feature-item:nth-child(1) {
  animation-delay: 0.2s;
}

.feature-item:nth-child(2) {
  animation-delay: 0.4s;
}

.feature-item:nth-child(3) {
  animation-delay: 0.6s;
}

.feature-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-text {
  font-size: 16px;
}

/* 右侧表单区域 */
.form-section {
  flex: 1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form {
  width: 100%;
  max-width: 360px;
}

.form-container {
  animation: fadeIn 0.5s ease-out;
}

.form-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.form-title {
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  color: #999;
  transition: all 0.3s;

  &:hover {
    color: @primary-color;
  }

  &.active {
    color: #333;
  }
}

.form-title-divider {
  height: 20px;
  width: 1px;
  background-color: #ddd;
  margin: 0 15px;
}

.custom-input {
  height: 50px;
  border-radius: 8px;
}

.input-icon {
  color: #bbb;
}

.login-btn {
  width: 100%;
  height: 50px;
  border-radius: 8px;
  font-size: 16px;
  background: @primary-color;
  border-color: @primary-color;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: darken(@primary-color, 10%);
    border-color: darken(@primary-color, 10%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 185, 107, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

.form-footer {
  text-align: center;
  margin-top: 16px;
  color: #999;

  a {
    color: @primary-color;
    transition: all 0.3s;

    &:hover {
      text-decoration: underline;
    }
  }
}

/* 社交登录部分 */
.social-login {
  margin-top: 40px;
}

.social-divider {
  position: relative;
  text-align: center;
  margin-bottom: 20px;

  &:before,
  &:after {
    content: '';
    position: absolute;
    top: 50%;
    width: calc(50% - 70px);
    height: 1px;
    background-color: #eee;
  }

  &:before {
    left: 0;
  }

  &:after {
    right: 0;
  }

  span {
    display: inline-block;
    padding: 0 10px;
    background: white;
    position: relative;
    color: #999;
    font-size: 14px;
  }
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-btn {
  width: 40px;
  height: 40px;
  transition: all 0.3s;
  border: none;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.github-btn {
  background-color: #333;
  color: #fff;
}

.wechat-btn {
  background-color: #1aad19;
  color: #fff;
}

.gitlab-btn {
  background-color: #fc6d26;
  color: #fff;
}

.qq-btn {
  background-color: #12b7f5;
  color: #fff;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .login-content {
    flex-direction: column;
    height: auto;
  }

  .brand-section {
    padding: 30px;
    min-height: 200px;
  }

  .form-section {
    padding: 30px 20px;
  }

  .login-container {
    width: 100%;
  }
}
</style>
