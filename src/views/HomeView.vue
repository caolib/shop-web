<script setup>
import { menuItems } from '@/config/home'
import { searchHomeService } from '@/api/search.js'
import { onMounted, ref } from 'vue'
import { jumpToItem, jumpWithQuery } from '@/router/jump'

const commodity = ref([]) // 商品列表
const key = ref('') // 搜索关键字
const loading = ref(false) // 商品加载状态

// 搜索主页商品
const search = async () => {
  loading.value = true
  await searchHomeService().then((res) => {
    // console.log(res)
    commodity.value = res.list
  }).finally(() => {
    loading.value = false
  })
}

// 初始化商品信息
onMounted(() => {
  search()
})

// 商品分类点击事件
const handleClick = (item) => {
  // message.success(`商品分类: ${item}`)
  jumpWithQuery('/search', { category: item })
}

// 搜索按钮点击事件
const handleSearchClick = () => {
  // message.success(`关键字: ${key.value}`)
  jumpWithQuery('/search', { key: key.value })
}
</script>

<template>
  <div class="layout-main">
    <!-- 头部搜索区域 -->
    <div class="header-area">
      <div class="search-input">
        <a-input-search v-model:value="key" enter-button @search="handleSearchClick" size="large" placeholder="搜索你喜欢的商品"
          class="search-box">
          <template #enterButton>
            <span>搜索</span>
          </template>
        </a-input-search>
      </div>
    </div>

    <!-- 商品展示 -->
    <div class="commodity-body">
      <!-- 侧边商品分类栏 -->
      <div class="commodity-classify">
        <div class="category-title">商品分类</div>
        <a-menu mode="inline" theme="light" class="category-menu">
          <a-menu-item v-for="menuItem in menuItems" :key="menuItem.key" class="category-menu-item">
            <div class="menu-item-content">
              <div class="menu-item-icon">
                <component :is="menuItem.icon" class="breadcrumb-icon" />
              </div>
              <div class="breadcrumb-container">
                <a-tag class="commodity-item" v-for="item in menuItem.items" :key="item" @click.stop="handleClick(item)"
                  color="default">
                  {{ item }}
                </a-tag>
              </div>
            </div>
          </a-menu-item>
        </a-menu>
      </div>

      <!-- 商品展示卡片 -->
      <div class="commodity-display">
        <div class="section-title">推荐商品</div>
        <a-spin :spinning="loading" tip="加载中...">
          <div class="products-grid">
            <div v-for="item in commodity" :key="item.id" class="product-item-wrapper">
              <a-card class="commodity-card" hoverable @click="jumpToItem(item.id)">
                <template #cover>
                  <div class="image-container">
                    <img :src="item.image" alt="" class="product-image" />
                  </div>
                </template>
                <a-card-meta>
                  <template #title>
                    <span class="price">￥{{ (item.price / 100).toFixed(2) }}</span>
                  </template>
                  <template #description>
                    <div class="product-name">{{ item.name }}</div>
                  </template>
                </a-card-meta>
              </a-card>
            </div>
          </div>
        </a-spin>
      </div>
    </div>

    <!-- 底部区域 -->
    <div class="home-footer">
      <p>© 2025 网上商店 - <a ref="https://github.com/caolib">caolib</a></p>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/styles/var';

.layout-main {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* 头部区域 */
.header-area {
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* 搜索框 */
.search-input {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-box {
  width: 60%;
  max-width: 800px;
  transition: all 0.3s;

  &:hover,
  &:focus {
    width: 65%;
  }
}

/* 商品展示区域 */
.commodity-body {
  display: flex;
  padding: 0 10px;
  margin: 20px auto 0;
  width: 95%;
  max-width: 1400px;
  gap: 20px;
  flex: 1;
}

.section-title,
.category-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  position: relative;
  padding-left: 12px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 18px;
    background-color: @primary-color;
    border-radius: 2px;
  }
}

/* 商品分类菜单 */
.commodity-classify {
  width: 300px;
  position: sticky;
  top: 85px;
  align-self: flex-start;
}

.category-menu {
  background-color: white;
  border-radius: 12px;
  box-shadow: @box-shadow;
  padding: 10px 0;

  :deep(.ant-menu-item) {
    height: auto;
    line-height: 1.5;
    padding: 12px 16px;
  }
}

.category-menu-item {
  margin: 5px 0;
  transition: all 0.3s;

  &:hover {
    background-color: @light-primary-color;
  }
}

.menu-item-content {
  display: flex;
  width: 100%;
}

.menu-item-icon {
  padding-top: 5px;
  margin-right: 10px;
}

.breadcrumb-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: calc(100% - 30px);
}

/* 商品分类标签 */
.commodity-item {
  cursor: pointer;
  margin-bottom: 5px;
  transition: all 0.3s;
  border-color: #e8e8e8;

  &:hover {
    color: @primary-color;
    background-color: @light-primary-color;
  }
}

/* 面包屑前图标间隔 */
.breadcrumb-icon {
  font-size: 18px;
  color: @primary-color;
}

/* 商品展示区域 */
.commodity-display {
  flex: 1;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
}

.product-item-wrapper {
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
}

/* 商品卡片 */
.commodity-card {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: @box-shadow;
  }
}

.image-container {
  height: 180px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;

  &:hover {
    transform: scale(1.05);
  }
}

/* 商品名称 */
.product-name {
  color: #333;
  font-size: 14px;
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 42px;
}

/* 价格文本 */
.price {
  color: @red;
  font-weight: bold;
  font-size: 18px;
}

/* 底部区域 */
.home-footer {
  text-align: center;
  color: #666;
  padding-top: 10px;
  margin-top: 20px;
  background-color: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .commodity-body {
    flex-direction: column;
    width: 98%;
    padding: 0 5px;
  }

  .commodity-classify {
    width: 100%;
    position: static;
  }

  .search-box {
    width: 90%;
  }
}
</style>
