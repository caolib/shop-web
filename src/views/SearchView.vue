<script setup>
import { onMounted, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { searchService } from '@/api/search.js'
import router from '@/router/index.js'

const searchParams = reactive({
  key: '',
  pageNo: 1,
  pageSize: 20,
  sortBy: '',
  isAsc: false,
})

onMounted(() => {
  // 解析路径参数
  const category = router.query.category
  if (category) {
    searchParams.key = category
    message.success(`分类: ${category}`)
  }
})

// 搜索商品
const searchCommodity = async () => {
  message.success(searchParams.key)
  await searchService(searchParams).then((res) => {
    console.log(res)
  })
}
</script>

<template>
  <div class="layout-main">
    <!--搜索框-->
    <div class="search-input">
      <a-input-search
        enter-button
        size="large"
        placeholder="搜索商品"
        style="width: 60vw; margin-top: 20px"
      />
    </div>

    <!--商品展示区-->
    <div class="commodity-display">
      <a-row>
        <a-col :span="6" v-for="item in commodity" :key="item.id">
          <a-card class="commodity-card" hoverable>
            <template #cover>
              <img :src="item.image" alt="" />
            </template>
            <a-card-meta>
              <template #title>
                <span class="price">￥{{ item.price }}</span>
              </template>
              <template #description>
                <span style="color: black">{{ item.name }}</span>
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
      </a-row>
    </div>


  </div>
</template>

<style scoped lang="less">
@import '@/styles/var';

.layout-main {
  height: 99vh;
  width: 99vw;
}

/* 搜索框 */
.search-input {
  //background: @primary-color;
  width: 100%;
  height: 100px;
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
</style>
