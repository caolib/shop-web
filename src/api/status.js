import request from '@/utils/request'

// 定义服务的健康检查端点
const services = ['carts', 'orders', 'users', 'commodity', 'pays']

/**
 * 检查后端服务的健康状态
 */
const checkServicesHealth = async () => {
  const status = new Map()

  for (const service of services)
    status.set(service, await checkService(service))

  return status
}


/**
 * 检查服务是否健康
 * @param service 服务名称
 */
const checkService = (service) => {
  return request.get(`/${service}/health`).then(() => {
    return true;
  }).catch(() => {
    return false;
  });
}


export { checkServicesHealth, checkService }
