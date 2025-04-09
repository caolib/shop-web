import request from '@/utils/request.js'

// 获取支付单
const getPayOrderService = () => {
  return request.get('/pays')
}



export {
  getPayOrderService
}
