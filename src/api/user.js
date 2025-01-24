import request from '@/utils/request'

/**
 * 获取用户信息
 */
const getUserInfoService = () => {
    return request.get('/users')
}


export { getUserInfoService }
