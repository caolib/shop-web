import request from '@/utils/request.js'

// TODO
const getPayOrderService = () => {
  return request.get('/pays')
}



export {
  getPayOrderService
}
