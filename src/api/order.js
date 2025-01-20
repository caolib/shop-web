import request from '@/utils/request'

const createOrderService = (form) => {
  return request.post('/orders', form)
}

export { createOrderService }
