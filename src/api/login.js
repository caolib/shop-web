import request from '@/utils/request'
import { useUserStore } from '@/stores/userInfo.js'
import { jump } from '@/router/jump'
import { message } from 'ant-design-vue'
import { isLogin } from '@/api/app.js'


/**
 * 用户登录
 * @param user 用户信息 {username, password,identity}
 */
const loginService = (user) => {
  user.identity = 'user'
  return request.post('/users/login', user, { timeout: 5000 })
}
/**
 * github登录
 */
const githubLoginService = (code) => {
  // 获取 URL 中的授权码 code
  return request.get(`/oauth/github?code=${code}`, { timeout: 10000 })
}

/**
 * 用户注册
 * @param user 用户信息 {username, password,phone}
 */
const registerService = (user) => {
  return request.post('/users/register', user)
}

/**
 * 注销账号
 */
const cancelAccountServicce = () => {
  return request.delete('/users')
}

/**
 * 退出登录
 */
const logoutService = () => {
  return request.get('/users/logout')
}


// 退出登录
const logout = async (msg) => {
  // console.log(msg)
  const hide = message.loading('正在退出登录...', 0)
  await logoutService().then(() => {
    const userInfo = useUserStore()
    userInfo.clearUser()
    jump('/login')
    msg = msg !== '' ? msg : '成功退出登录'
    message.success(msg)
    isLogin.value = false
  }).finally(() => {
    hide()
  })
}

export {
  loginService,
  githubLoginService,
  registerService,
  cancelAccountServicce,
  logout
}
