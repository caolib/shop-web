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
const presetBrands = ['Apple', '华为', '小米', 'vivo', 'oppo', '魅族', '三星', '联想', '戴尔', '惠普', '华硕', '微软', '索尼', '中兴', '一加', '努比亚', '酷派', '锤子', '360']
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
const setCategory = (gategory) => {
  searchParams.category = gategory
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
  <div class="layout-main">
    <!--搜索框-->
    <div class="search-input">
      <a-input-search v-model:value="inputKey" enter-button @search="setKey" size="large" placeholder="搜索商品"
        style="width: 60vw; margin-top: 20px" />
    </div>

    <!--搜索条件-->
    <div class="search-condition">
      <!-- 分类 -->
      <a-row class="condition-row">
        <span>分类</span>
        <a-input v-model:value="inputCategory" allow-clear placeholder="输入分类" @pressEnter="setBrand(inputBrand)"
          style="width: 10vw;" />
        <div>
          <span v-for="cate in presetCategories" :key="cate" @click="setCategory(cate)" class="condition-row-item">{{
            cate
            }}</span>
        </div>
      </a-row>

      <!-- 品牌 -->
      <a-row class="condition-row">
        <span>品牌</span>
        <a-input v-model:value="inputBrand" allow-clear placeholder="输入品牌名" @pressEnter="setBrand(inputBrand)"
          style="width: 10vw;" />
        <div>
          <span v-for="brand in presetBrands" :key="brand" @click="setBrand(brand)" class="condition-row-item">{{ brand
          }}</span>
        </div>
      </a-row>

      <!-- 第三行 -->
      <a-row class="condition-row" align="middle">
        <!-- 排序条件 -->
        <a-col>
          <span>排序</span>
        </a-col>
        <a-col style="display:flex;gap:10px;">
          <a-button v-for="sortOption in sortOptions" :key="sortOption.value" @click="toggleSort(sortOption.value)"
            :type="searchParams.sortBy === sortOption.value ? 'primary' : 'default'">
            {{ sortOption.label }}
            <caret-up-filled v-if="searchParams.isAsc" />
            <caret-down-filled v-else />
          </a-button>
        </a-col>
        <a-col style="margin-left:auto;">
          <a-row align="middle">
            <!-- 价格区间 -->
            <a-col>
              <span style="margin-right: 10px">价格</span>
            </a-col>
            <a-col>
              <a-input-number v-model:value="searchParams.minPrice" @pressEnter="searchCommodity" prefix="￥" min="0"
                placeholder="最低价格" style="width: 10vw;margin-right: 10px;" />
              <a-input-number v-model:value="searchParams.maxPrice" @pressEnter="searchCommodity" prefix="￥"
                placeholder="最高价格" style="width: 10vw;margin-right: 10px;" />
            </a-col>
            <!-- 分页条 默认每页大小为24 -->
            <a-col><span>共 {{ total }} 件商品</span></a-col>
            <a-col>
              <a-pagination v-model:current="searchParams.pageNo" @change="searchCommodity" :total="Number(total)"
                :page-size=searchParams.pageSize simple />
            </a-col>
          </a-row>
        </a-col>
      </a-row>

      <!-- 条件标签 -->
      <a-row class="condition-row">
        <a-col>
          <span>条件</span>
        </a-col>
        <a-col>
          <!-- 条件标签 -->
          <a-tag v-if="searchParams.brand" closable @close="setBrand('')">{{ searchParams.brand }}</a-tag>
          <a-tag v-if="searchParams.category" closable @close="setCategory('')">{{ searchParams.category
          }}</a-tag>
          <a-tag v-if="priceTag" closable @close="resetPrice">
            {{ priceTag }}
          </a-tag>
          <!-- 清空标签 -->
          <a-tag color='red' style="cursor: pointer;font-size: 14px;" @click="resetCondition">清除</a-tag>
        </a-col>
      </a-row>

    </div>

    <!--商品卡片展示-->
    <div class="commodity-display">
      <a-spin :spinning="loading" tip="加载中...">
        <a-row>
          <a-empty style="width: 90vw;" v-if="commodity.length === 0" />
          <a-col :span="4" v-for="item in commodity" :key="item.id">
            <a-card class="commodity-card" hoverable @click="jumpToItem(item.id)">
              <!-- 封面 -->
              <template #cover>
                <img :src="item.image" :alt="item.name" @error="handleImageError" />
              </template>
              <a-card-meta>
                <!-- 价格 -->
                <template #title>
                  <span class="price">￥{{ (item.price / 100).toFixed(2) }}</span>
                </template>
                <!-- 商品描述 -->
                <template #description>
                  <span class="commodity-desc">{{ item.name }}</span>
                  <div style="margin-top: 5px;">
                    <span>已售出：{{ item.sold }}</span>
                  </div>
                  <div style="margin-top: 5px;">
                    <span>{{ item.commentCount }} 条评论</span>
                  </div>
                </template>

              </a-card-meta>
            </a-card>
          </a-col>
        </a-row>
      </a-spin>
    </div>

  </div>
</template>

<style scoped lang="less">
@import '@/styles/var';

/* 预设条件 */
.condition-row-item {
  margin-left: 15px;
  color: @blue;
  cursor: pointer;
}

.commodity-desc {
  color: black;
  font-size: 12px;
}

.condition-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.layout-main {
  height: 99vh;
  width: 99vw;
}

/* 搜索框 */
.search-input {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
}

/* 商品分类菜单 */
.commodity-classify {
  background: #f0f2f5;
  height: auto;
  width: 20vw;
  float: left;
}

ul.ant-menu.ant-menu-root.ant-menu-inline {
  border: 1px solid #dedede;
  border-radius: 10px;
}

/* 商品分类悬浮高亮 */
.ant-breadcrumb li:last-child:hover,
.commodity-item:hover {
  color: @primary-color;
}

.commodity-item {
  color: #000;
}

/* 面包屑前图标间隔 */
.breadcrumb-icon {
  margin-right: 5px;
}

/* 商品卡片 */
.commodity-card {
  margin-top: 10px;
  margin-left: 5px;
  width: auto;
}

/* 价格文本 */
span.price {
  color: @red;
}

/* 搜索条件 */
.search-condition {
  margin: 10px;
  padding: 20px;
  border: 1px solid #e6e6e6;
}

/* 商品展示 */
.commodity-display {
  margin: 10px;
}
</style>
