import request from '@/utils/request'
import { message } from 'ant-design-vue'

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


// FIXME: 改为分页
/**
 * 获取用户所有订单
 */
const getUserOrdersService = () => {
  return request.get('/orders')
}

// FIXME: 改为分页
/**
 * 获取用户订单详情列表
 */
const getUserOrderDetailsService = () => {
  return request.get('/orders/details')
}

/**
 * 批量删除订单
 * @param ids 订单id数组
 */
const deleteOrdersService = (ids) => {
  console.log(ids);

  return request.delete('/orders', { data: ids });

}


export {
  createOrderService,
  getOrderByIdService,
  getUserOrderDetailsService,
  getUserOrdersService,
  deleteOrdersService
}
