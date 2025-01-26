<script setup>
import { reactive, computed, h, onMounted, ref } from 'vue'
import { UserOutlined, LockOutlined, GithubFilled, GitlabFilled, WechatFilled, QqCircleFilled, PhoneOutlined } from '@ant-design/icons-vue'
import { githubLoginService, loginService, registerService } from '@/api/login.js'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/userInfo.js'
import router from '@/router/index.js'
import { jump } from '@/router/jump'
import { validateUsername, validatePassword, validatePhone } from '@/utils/validation.js'

const isRegister = ref(false)


// 加载中
const spinning = ref(false)
const registerSpinning = ref(false);

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
  console.log(registerForm)
  await registerService(registerForm).then((res) => {
    message.success('注册成功!')
    isRegister.value = false
  })
}

// 账号密码登录
const onFinish = async () => {
  spinning.value = true
  await loginService(formState).then((res) => {
    // 保存到pinia
    userInfo.setUser({
      id: res.userId,
      username: res.username,
      balance: res.balance,
      avatar: res.avatar,
      token: res.token,
    })
  }).finally(() => {
    spinning.value = false
  })
  spinning.value = false
  window.location.reload()
  await router.push({ path: '/' }).then(() => { window.location.reload() })
  message.success('登录成功!')
}


// 判断登录表单是否禁用
const disabled = computed(() => {
  return !(formState.username && formState.password)
})

// 判断注册表单是否禁用
const disabled2 = computed(() => {
  return !(registerForm.username && registerForm.password && registerForm.phone)
})

onMounted(() => {
  // GitHub 授权成功后，获取 code 并调用登录接口
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  if (code) {
    spinning.value = true
    githubLoginService(code).then(async (res) => {
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
      spinning.value = false
      // 跳转到首页并刷新页面
      await router.push({ path: '/' }).then(() => window.location.reload())
    }).finally(() => {
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

// 忘记密码
const getBackPassword = () => {
  // TODO: 忘记密码
  message.info('暂不支持找回密码')
}


</script>

<template>
  <a-spin :spinning="spinning" size="large">
    <div class="login-body">
      <div class="login-form">
        <!-- 登录表单 -->
        <a-form v-if="!isRegister" :model="formState" name="normal_login" @finish="onFinish">
          <div class="form-header">
            <h2 class="form-title">登录</h2>
            <h2 class="form-title" @click="isRegister = true"><a>注册</a></h2>
          </div>

          <!-- 用户名表单项 -->
          <a-form-item label="账号" name="username" :rules="[{ required: true, message: '请输入用户名!' }]">
            <a-input v-model:value="formState.username">
              <template #prefix>
                <UserOutlined class="site-form-item-icon" />
              </template>
            </a-input>
          </a-form-item>

          <!-- 密码表单项 -->
          <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码!' }]">
            <a-input-password v-model:value="formState.password">
              <template #prefix>
                <LockOutlined class="site-form-item-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <!-- 登录按钮和注册链接 -->
          <a-form-item>
            <a-button :disabled="disabled" :loading="spinning" type="primary" html-type="submit"
              class="login-form-button">
              登录
            </a-button>
            或
            <a @click="() => { isRegister = true }">立即注册</a>
          </a-form-item>

          <!-- 社交账号登录 -->
          <a-form-item style="margin-top: 30px">

            <!--github 登录按钮-->
            <a-space>
              <a-button :class="['social-login-btn', 'github-btn']" shape="circle" :icon="h(GithubFilled)"
                @click="loginByGithub" />
            </a-space>

            <!--微信登录按钮-->
            <a-space>
              <a-button :class="['social-login-btn', 'wechat-btn']" shape="circle" :icon="h(WechatFilled)"
                @click="loginByWeiXin" />
            </a-space>

            <!--QQ登录按钮-->
            <a-space>
              <a-button :class="['social-login-btn', 'qq-btn']" shape="circle" :icon="h(QqCircleFilled)"
                @click="loginByQQ" />
            </a-space>

            <!--gitlab 登录按钮-->
            <a-space>
              <a-button :class="['social-login-btn', 'gitlab-btn']" shape="circle" :icon="h(GitlabFilled)"
                @click="loginByGitlab" />
            </a-space>

          </a-form-item>

        </a-form>

        <!-- 注册表单 -->
        <a-form v-else :model="registerForm" name="normal_register" @finish="register">
          <div class="form-header">
            <h2 class="form-title" @click="isRegister = false"><a>登录</a></h2>
            <h2 class="form-title">注册</h2>
          </div>
          <!-- 用户名表单项 -->
          <a-form-item label="账号" name="username"
            :rules="[{ required: true, message: '请输入用户名!' }, { validator: validateUsername }]">
            <a-input v-model:value="registerForm.username" @blur="() => validateUsername(null, registerForm.username)">
              <template #prefix>
                <UserOutlined class="site-form-item-icon" />
              </template>
            </a-input>
          </a-form-item>

          <!-- 密码表单项 -->
          <a-form-item label="密码" name="password"
            :rules="[{ required: true, message: '请输入密码!' }, { validator: validatePassword }]">
            <a-input-password v-model:value="registerForm.password"
              @blur="() => validatePassword(null, registerForm.password)">
              <template #prefix>
                <LockOutlined class="site-form-item-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <!-- 电话 -->
          <a-form-item label="电话" name="phone"
            :rules="[{ required: true, message: '请输入电话!' }, { validator: validatePhone }]">
            <a-input v-model:value="registerForm.phone" :maxlength="11"
              @blur="() => validatePhone(null, registerForm.phone)">
              <template #prefix>
                <PhoneOutlined class="site-form-item-icon" />
              </template>
            </a-input>
          </a-form-item>

          <!-- 登录按钮和注册链接 -->
          <a-form-item>
            <a-button :disabled="disabled2" :loading="registerSpinning" type="primary" html-type="submit"
              class="login-form-button">
              注册
            </a-button>
          </a-form-item>
        </a-form>

      </div>
    </div>
  </a-spin>
</template>

<style scoped lang="less">
@import '@/styles/var';

/* 背景图片 */
.login-body {
  height: 100vh;
  background-image: url('@/assets/login-bg.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
}

.login-body {
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-header {
  display: flex;
  justify-content: center;
}

.form-title {
  cursor: pointer;
  margin: 10px 10px;
}

.form-title:hover {
  color: @primary-color;
}

/* 登录表单 */
.login-form {
  background: #fff;
  border: 1px #e8e8e8 solid;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  padding: 30px 50px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
}

/* 社交登录按钮 */
.social-login-btn {
  margin-right: 10px;
}

.social-login-btn:hover {
  color: white;
}

.github-btn {
  background-color: #333;
  color: #fff;
}

.wechat-btn {
  background-color: #1AAD19;
  color: #fff;
}

.gitlab-btn {
  background-color: #FC6D26;
  color: #fff;
}

.qq-btn {
  background-color: #12B7F5;
  color: #fff;
}
</style>
