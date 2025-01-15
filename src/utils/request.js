import axios from 'axios'
import router from '@/router'

import { message } from 'ant-design-vue'

// const baseURL = 'http://localhost:8080'
const baseURL = '/api'
const instance = axios.create({ baseURL })

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
    // 检查config和config.url是否存在
    if (!config || !config.url) {
      return Promise.reject('config or config.url 未定义')
    }

    //登录请求不需要token
    if (config.url.endsWith('/login') || config.url.endsWith('/register')) {
      return config
    }

    let token = ''

    if (localStorage.getItem('reader') != null) {
      // const readerStore = useReaderStore()
      // token = readerStore.reader.token
    } else if (localStorage.getItem('admin') != null) {
      // const adminStore = useAdminStore()
      // token = adminStore.admin.token
    }

    //如果有token，将token放入请求头中
    if (token != null) {
      config.headers['token'] = token
    } else {
      router.push('/login')
      message.error('请先登录！')
      return Promise.reject('token不存在！')
    }

    return config
  },
  (err) => {
    //请求错误的回调
    return Promise.reject(err)
  },
)

export default instance
