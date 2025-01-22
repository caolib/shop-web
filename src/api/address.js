import request from '@/utils/request'

/**
 * 获取用户地址
 */
const getAddressService = () => {
  return request.get('/addresses')
}


/**
 * 更新地址
 * @param address 更新地址信息
 */
const updateAddressService = (address) => {
  // console.log(address)
  return request.put(`/addresses`, address)
}

/**
 * 新增地址
 * @param address 新增地址信息 
 */
const addAddressService = (address) => {
  console.log(address)
  return request.post(`/addresses`, address)
}

/**
 * 删除地址
 * @param addressId 地址id
 */
const deleteAddressService = (addressId) => {
  return request.delete(`/addresses/${addressId}`)
}


/**
 * 设置默认地址
 * @param addressId 地址id
 */
const setDefaultAddrService = (addressId) => {
  return request.put(`/addresses/${addressId}`)
}

export {
  getAddressService,
  addAddressService,
  deleteAddressService,
  updateAddressService,
  setDefaultAddrService
}
