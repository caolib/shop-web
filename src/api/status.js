import request from '@/utils/request'

// 定义服务的健康检查端点
const services = ['carts', 'orders', 'users', 'commodity', 'pays', 'gateway']

// 发送请求获取健康状态并返回一个映射服务和状态的 Map 对象
async function checkServicesHealth() {
  const healthStatusMap = new Map()

  for (const service of services) {
    await request
      .get(`/${service}/health`)
      .then((response) => {
        // console.log(`response:`, response)
        healthStatusMap.set(service, response.status)
      })
      .catch(() => {
        healthStatusMap.set(service, 'error')
      })
  }

  return healthStatusMap
}

export { checkServicesHealth }
