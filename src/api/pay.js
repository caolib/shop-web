import request from '@/utils/request'


/**
 * 创建支付单
 */
const createPayOrderService = (payParams) => {
    return request.post('/pays', payParams)
}



/**
 * 支付
 */
const payService = (id, pwd) => {
    // console.log('id', id)
    // console.log('pwd', pwd)
    return request.post(`/pays/${id}`, { id: id, pw: pwd })
}

export { createPayOrderService, payService }