import request from '@/utils/request'

/**
 * 获取用户地址
 */
const getAddressService = () => {
  return request.get('/addresses')
}


export { getAddressService }
