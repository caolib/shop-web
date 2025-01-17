import axios from 'axios'
import router from '@/router'

import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/userInfo'

// const baseURL = 'http://localhost:8080'
const baseURL = '/api'
const instance = axios.create({ baseURL })

// 延迟获取 store
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
    if (code === 200 || code === undefined) return result.data
    // 异常处理
    switch (code) {
      case 400:
        message.error(msg)
        break
      case 401:
        message.error('请先登录！')
        router.push('/login')
        break
      case 500:
        message.error(msg)
        console.log(msg)
        break
      default:
        message.error('未知异常！' + code)
    }
    return Promise.reject(result)
  },
  //失败回调
  (error) => {
    const code = error.response.status
    const msg = error.response.msg
    switch (code) {
      case 400:
        message.error(msg)
        router.push('/login')
        break
      case 401:
        message.error('请先登录！')
        router.push('/login')
        break
      case 499:
        message.error('身份过期,请重新登录！')
        router.push('/login')
        break
      case 500:
        message.error(msg)
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
    //登录请求不需要token
    if (config.url.endsWith('/login') || config.url.endsWith('/register')) {
      return config
    }

    const userInfo = getUserStore()
    const user = userInfo.user

    // 获取token
    const token = user.token

    if (user == null || token == null) {
      message.error('请先登录！')
      router.push('/login')
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
