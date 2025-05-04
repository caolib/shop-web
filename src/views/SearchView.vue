<script setup>
import { onMounted, reactive, ref, computed, h } from 'vue'
import { searchService } from '@/api/search.js'
import router from '@/router/index.js'
import { jumpToItem } from '@/router/jump'
import { CaretDownFilled, CaretUpFilled } from '@ant-design/icons-vue'
import { handleImageError } from '@/utils/handleImg.js'

const commodity = ref([]) // 商品列表
const total = ref(0) // 商品总数
const loading = ref(false) // 商品加载状态

// 搜索商品信息
const searchCommodity = async () => {
  loading.value = true
  const paramsCopy = Object.assign({}, searchParams);
  // console.log('params:', paramsCopy)
  await searchService(paramsCopy).then((res) => {
    commodity.value = res.list
    total.value = res.total
    // console.log(res)
  }).finally(() => {
    loading.value = false
  })
}

// 搜索参数
const searchParams = reactive({
  key: '',
  pageNo: 1,
  pageSize: 24,
  sortBy: '',
  isAsc: false,
  brand: '',
  category: '',
  minPrice: null,
  maxPrice: null,
})

// 输入框搜索条件
const inputKey = ref('')
const inputBrand = ref('')
const inputCategory = ref('')

onMounted(() => {
  // 解析路径参数
  const { key, category } = router.currentRoute.value.query;
  // 设置搜索参数
  if (key) {
    inputKey.value = key
    searchParams.key = key
  }
  if (category) searchParams.category = category

  searchCommodity()
})

// TODO 从数据库获取 预设数据
// TODO 可以多品牌搜索
const presetBrands = ['Apple', '华为', '小米', 'vivo', 'oppo', '魅族', '三星', '联想', '戴尔', '惠普', '华硕', '微软', '索尼', '中兴']
const presetCategories = ['手机', '电脑', '服装', '玩具', '文具', '食品', '酒类', '生鲜', '特产', '家居', '家具', '家装']

// 设置搜索关键字
const setKey = () => {
  searchParams.key = inputKey.value
  searchCommodity()
}

// 设置品牌
const setBrand = (brand) => {
  searchParams.brand = brand
  searchCommodity()
}

// 设置分类
const setCategory = (category) => {
  searchParams.category = category
  searchCommodity()
}

// 重置价格
const resetPrice = () => {
  searchParams.minPrice = null
  searchParams.maxPrice = null
  searchCommodity()
}

// 重置搜索条件
const resetCondition = () => {
  searchParams.brand = '';
  searchParams.category = '';
  resetPrice()
  searchCommodity()
}

// 计算价格标签内容
const priceTag = computed(() => {
  if (searchParams.minPrice !== null && searchParams.maxPrice !== null) {
    return `￥${searchParams.minPrice} - ${searchParams.maxPrice}`
  } else if (searchParams.minPrice !== null) {
    return `>= ￥${searchParams.minPrice}`
  } else if (searchParams.maxPrice !== null) {
    return `<= ￥${searchParams.maxPrice}`
  }
  return ''
})

// 检查是否有任何筛选条件
const hasFilters = computed(() => {
  return searchParams.brand !== '' ||
    searchParams.category !== '' ||
    searchParams.minPrice !== null ||
    searchParams.maxPrice !== null
})

// 切换排序
const toggleSort = (e) => {
  if (searchParams.sortBy === e)
    searchParams.isAsc = !searchParams.isAsc
  else {
    searchParams.sortBy = e
    searchParams.isAsc = false
  }
  console.log(`排序方式: ${searchParams.sortBy}, ${searchParams.isAsc ? '升序' : '降序'}`)
  searchCommodity()
}

// 排序选项
const sortOptions = [
  { label: '销量', value: 'sold' },
  { label: '价格', value: 'price' },
  { label: '评论数', value: 'comment_count' }
]
</script>

<template>
  <div class="search-page">
    <a-row class="search-container">
      <a-col :span="22" :offset="1">
        <!-- 搜索头部 -->
        <div class="search-header">
          <div class="search-input-container">
            <a-input-search v-model:value="inputKey" placeholder="搜索商品" enter-button size="large" class="search-input"
              @search="setKey" />
          </div>
        </div>

        <!-- 搜索条件卡片 -->
        <div class="filter-card">
          <!-- 分类筛选 -->
          <div class="filter-row">
            <div class="filter-label">分类</div>
            <div class="filter-content">
              <div class="filter-options">
                <div class="filter-input">
                  <a-input v-model:value="inputCategory" placeholder="输入分类" allow-clear class="category-input"
                    @pressEnter="setCategory(inputCategory)" />
                </div>
                <div class="preset-options">
                  <a-tag v-for="cate in presetCategories" :key="cate"
                    :color="searchParams.category === cate ? 'blue' : null" class="preset-tag"
                    @click="setCategory(cate)">
                    {{ cate }}
                  </a-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 品牌筛选 -->
          <div class="filter-row">
            <div class="filter-label">品牌</div>
            <div class="filter-content">
              <div class="filter-options">
                <div class="filter-input">
                  <a-input v-model:value="inputBrand" placeholder="输入品牌名" allow-clear class="brand-input"
                    @pressEnter="setBrand(inputBrand)" />
                </div>
                <div class="preset-options">
                  <a-tag v-for="brand in presetBrands" :key="brand"
                    :color="searchParams.brand === brand ? 'blue' : null" class="preset-tag" @click="setBrand(brand)">
                    {{ brand }}
                  </a-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 排序和价格筛选 -->
          <div class="filter-row">
            <div class="filter-label">排序</div>
            <div class="filter-content">
              <div class="filter-options">
                <div class="sort-buttons">
                  <a-button v-for="sortOption in sortOptions" :key="sortOption.value"
                    :type="searchParams.sortBy === sortOption.value ? 'primary' : 'default'" class="sort-button"
                    @click="toggleSort(sortOption.value)">
                    {{ sortOption.label }}
                    <caret-up-filled v-if="searchParams.sortBy === sortOption.value && searchParams.isAsc" />
                    <caret-down-filled v-if="searchParams.sortBy === sortOption.value && !searchParams.isAsc" />
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <div class="filter-row">
            <div class="filter-label">价格</div>
            <div class="filter-content">
              <div class="filter-options">
                <div class="price-inputs">
                  <a-input-number v-model:value="searchParams.minPrice" placeholder="最低价" prefix="￥" min="0"
                    class="price-input" @pressEnter="searchCommodity" />
                  <span class="price-separator">-</span>
                  <a-input-number v-model:value="searchParams.maxPrice" placeholder="最高价" prefix="￥" min="0"
                    class="price-input" @pressEnter="searchCommodity" />
                  <a-button type="primary" size="small" class="price-button" @click="searchCommodity">确定</a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 已选条件和分页 -->
          <div class="filter-row results-row">
            <div class="active-filters">
              <div class="filter-label">筛选:</div>
              <div class="filter-tags">
                <a-tag v-if="searchParams.brand" closable color="blue" class="filter-tag" @close="setBrand('')">
                  品牌: {{ searchParams.brand }}
                </a-tag>
                <a-tag v-if="searchParams.category" closable color="blue" class="filter-tag" @close="setCategory('')">
                  分类: {{ searchParams.category }}
                </a-tag>
                <a-tag v-if="priceTag" closable color="blue" class="filter-tag" @close="resetPrice">
                  价格: {{ priceTag }}
                </a-tag>
                <a-button v-if="hasFilters" type="primary" danger size="small" class="clear-button"
                  @click="resetCondition">
                  清除全部
                </a-button>
              </div>
            </div>

            <div class="result-pagination">
              <span class="result-count">共 {{ total }} 件商品</span>
              <a-pagination v-model:current="searchParams.pageNo" :total="Number(total)"
                :page-size="searchParams.pageSize" simple @change="searchCommodity" />
            </div>
          </div>
        </div>

        <!-- 商品展示区域 -->
        <div class="products-container">
          <a-spin :spinning="loading" tip="加载商品中...">
            <template v-if="commodity.length > 0">
              <div class="products-grid">
                <div class="product-item" v-for="item in commodity" :key="item.id" @click="jumpToItem(item.id)">
                  <div class="product-card">
                    <div class="product-image">
                      <img :src="item.image" :alt="item.name" @error="handleImageError" />
                    </div>
                    <div class="product-info">
                      <div class="product-price">￥{{ (item.price / 100).toFixed(2) }}</div>
                      <div class="product-name">{{ item.name }}</div>
                      <div class="product-meta">
                        <span class="product-sold">已售 {{ item.sold }}</span>
                        <span class="product-comments">{{ item.commentCount }} 评论</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="empty-results">
                <a-empty description="暂无符合条件的商品" />
              </div>
            </template>
          </a-spin>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped lang="less">
@import '@/styles/var';

.search-page {
  min-height: 95vh;
  padding: 30px 0;
  background-color: #f7f9fc;
}

.search-container {
  margin-top: 10px;
}

.search-header {
  margin-bottom: 20px;
}

.search-input-container {
  display: flex;
  justify-content: center;
}

.search-input {
  width: 60%;
  max-width: 700px;

  :deep(.ant-input) {
    height: 46px;
    font-size: 16px;
  }

  :deep(.ant-btn) {
    height: 46px;
    font-size: 16px;
  }
}

.filter-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: @box-shadow;
  padding: 20px;
  margin-bottom: 20px;
}

.filter-row {
  padding: 12px 0;
  display: flex;
  flex-wrap: nowrap;

  &:not(:last-child) {
    border-bottom: 1px dashed #eee;
  }
}

.filter-label {
  font-weight: 500;
  color: #666;
  margin-right: 20px;
  min-width: 60px;
  padding-top: 5px;
  flex-shrink: 0;
}

.filter-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.filter-options {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  gap: 12px;
}

.filter-input {

  .category-input,
  .brand-input {
    width: 200px;
  }
}

.preset-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.preset-tag {
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
  }
}

.sort-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sort-button {
  display: flex;
  align-items: center;
  transition: all 0.3s;
  margin-right: 8px;
  margin-bottom: 8px;

  &:hover {
    transform: translateY(-2px);
  }
}

.price-inputs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  .price-input {
    width: 120px;
  }

  .price-separator {
    margin: 0 8px;
    color: #999;
  }

  .price-button {
    margin-left: 8px;
    background-color: @primary-color;
    border-color: @primary-color;
  }
}

.results-row {
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
}

.active-filters {
  display: flex;
  align-items: center;

  .filter-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-tag {
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .clear-button {
    margin-left: 8px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
    }
  }
}

.result-pagination {
  display: flex;
  align-items: center;
  gap: 16px;

  .result-count {
    color: #666;
    font-size: 14px;
  }
}

.products-container {
  margin-top: 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.product-item {
  cursor: pointer;
}

.product-card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

.product-image {
  width: 100%;
  padding-top: 100%; // 1:1 aspect ratio
  position: relative;
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;

    &:hover {
      transform: scale(1.05);
    }
  }
}

.product-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-price {
  font-size: 18px;
  font-weight: 600;
  color: @red;
  margin-bottom: 8px;
}

.product-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  color: #999;
  font-size: 12px;
  margin-top: auto;
}

.empty-results {
  background-color: #fff;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: @box-shadow;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-input {
    width: 90%;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .filter-row {
    flex-direction: column;

    &.results-row {
      gap: 16px;
    }
  }

  .filter-label {
    margin-bottom: 8px;
  }

  .result-pagination {
    width: 100%;
    justify-content: space-between;
  }

  .filter-options {
    flex-direction: column;
    align-items: flex-start;
  }
}

.main-content {
  margin-top: 20px;
}
</style>
