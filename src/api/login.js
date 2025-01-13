import request from '@/utils/request'
import { message } from 'ant-design-vue'

/**
 * 用户登录
 * @param user 用户信息 {username, password}
 */
const loginService = (user) => {
  return request.post('/users/login', user)
}

/**
 * 获取github授权码
 */
const getCode = () => {
  // 跳转到 GitHub 授权页面
  const clientId = 'Ov23liaxpXWclT4EZOKg'
  const redirectUri = 'http://localhost:5173/login'
  const scope = 'read:user user:email'
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}}`
}

/**
 * github登录
 */
const githubLoginService = (code) => {
  // 获取 URL 中的授权码 code
  return request.get(`/oauth/github?code=${code}`)
}

export { loginService, githubLoginService }
