import request from '@/utils/request'


const getAddressService = () => {
  return request.get('/addresses')
}


export { getAddressService }
