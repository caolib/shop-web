import request from '@/utils/request'


/**
 * 分页搜索商品
 */
const searchService = (searchParams) => {
  return request.get('/search/list', { params: searchParams })
}


const queryCommodityById = (id) => {
  return request.get('/commodity/' + id);
}


export { searchService, queryCommodityById }
