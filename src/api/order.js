import request from '@/utils/request'

/**
 * 创建订单
 * @returns 订单号
 */
const createOrderService = (form) => {
  return request.post('/orders', form)
}

/**
 * 根据订单号获取订单
 * @param id  订单号
 * @returns   订单信息
 */
const getOrderByIdService = (id) => {
  return request.get(`/orders/${id}`)
}

export {
  createOrderService,
  getOrderByIdService
}
