import request from '@/utils/request'

/**
 * 添加商品到购物车
 * @param commodity 商品信息
 */
const addCartService = (commodity) => {
  console.log(`加入购物车: ${JSON.stringify(commodity)}`)
  const cartForm = {
    itemId: commodity.id,
    name: commodity.name,
    spec: commodity.spec,
    price: commodity.price,
    image: commodity.image,
  }
  return request.post('/carts', cartForm)
}

/**
 * 获取购物车列表
 */
const getCartService = () => {
  return request.get('/carts')
}

/**
 * 更新购物车中商品数量
 * @param  id 购物车条目id
 * @param  num 数量
 */
const updateCartItemService = (id, num) => {
  return request.put(`/carts/${id}/${num}`)
}

/**
 * 删除购物车中商品（删除购物车条目）
 * @param id 购物车条目
 */
const deleteCartItemService = (id) => {
  return request.delete(`/carts/${id}`)
}

/**
 * 批量删除购物车中商品
 * @param ids 购物车条目id数组
 */
const deleteCartItemsService = (ids) => {
  return request.delete(`/carts/batch`, { data: ids })
}

export {
  addCartService,
  getCartService,
  updateCartItemService,
  deleteCartItemService,
  deleteCartItemsService,
}
