import axios from 'axios'
import router from '@/router'

import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/userInfo'
import { jumpToLogin } from '@/router/jump'

const baseURL = import.meta.env.VITE_APP_BASE_API
const instance = axios.create({ baseURL })


// 获取用户存储
const getUserStore = () => {
  return useUserStore()
}

/**
 * 响应拦截器，状态码为2xx时执行成功回调，否则执行失败回调
 */
instance.interceptors.response.use(
  //成功回调
  (result) => {
    // 如果状态码为200
    const code = result.data.code
    const msg = result.data.msg
    if (code === undefined || code === 200 || code >= 1000) return result.data

    // 使用 switch 替换 if-else 语句
    switch (code) {
      case 400:
        message.error(msg);
        break;
      case 401:
        jumpToLogin('请先登录！');
        break;
      case 499:
        jumpToLogin('身份过期,请重新登录！');
        break;
      case 500:
        message.error(msg);
        console.log(msg);
        break;
      default:
        message.error('未知异常！' + code);
        break;
    }
    return Promise.reject(result)
  },
  //失败回调
  (error) => {
    // 如果请求路径以/health结尾，直接返回错误
    if (error.config.url.endsWith('/health')) {
      return Promise.reject(error)
    }

    const code = error.response.status
    const msg = error.response.data.msg
    switch (code) {
      case 400:
        message.error(msg)
        break
      case 401:
        jumpToLogin('请先登录！')
        break
      case 403:
        message.error('禁止访问！')
        break
      case 499:
        jumpToLogin('身份过期,请重新登录！')
        break
      case 500:
      case 503:
        message.error('服务器繁忙！')
        console.log(msg)
        break
      default:
        message.error('未知异常！' + code)
        break
    }
    // 将异步的状态设置为失败状态
    return Promise.reject(error)
  },
)

/**
 * 请求拦截器
 */
instance.interceptors.request.use(
  (config) => {
    // console.log('baseURL:', config.baseURL)

    const noAuthUrls = ['/login', '/register', 'health']
    // 如果是不需要认证的url直接放行
    if (noAuthUrls.some(url => config.url.endsWith(url))) {
      return config
    }
    const userInfo = getUserStore()
    const user = userInfo.user

    // 获取token
    const token = user.token
    // 未登录
    if (user == null || token == null) {
      jumpToLogin('未登录！')
      return Promise.reject('token不存在！')
    }

    // 请求头设置令牌
    config.headers['Authorization'] = token

    return config
  },
  (err) => {
    //请求错误的回调
    return Promise.reject(err)
  },
)

export default instance
