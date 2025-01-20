import request from '@/utils/request.js'


const getPayOrderService = ()=>{
  return request.get('/pays')
}

export {
  getPayOrderService
}
