<script setup>
import { message } from 'ant-design-vue'
import router from '@/router/index.js'
import {
  BgColorsOutlined,
  CarOutlined,
  DesktopOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  MobileOutlined,
  ScissorOutlined,
  ShoppingOutlined,
  SkinOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { searchService } from '@/api/search.js'
import { onMounted, reactive, ref } from 'vue'

const commodity = ref([])

// 搜索商品
const search = async () => {
  await searchService(reactive({ pageSize: 24 })).then((res) => {
    // console.log(res)
    commodity.value = res.list
  })
}

onMounted(() => {
  search()
})

// 商品分类菜单
const menuItems = [
  { key: 1, icon: ThunderboltOutlined, items: ['家用电器'] },
  { key: 2, icon: MobileOutlined, items: ['手机', '运营商', '数码'] },
  { key: 3, icon: DesktopOutlined, items: ['电脑', '办公', '文具用品'] },
  { key: 4, icon: HomeOutlined, items: ['家居', '家具', '家装', '厨具'] },
  { key: 5, icon: SkinOutlined, items: ['男装', '女装', '童装', '内衣'] },
  { key: 6, icon: ScissorOutlined, items: ['美妆', '个护清洁', '宠物'] },
  { key: 7, icon: ShoppingOutlined, items: ['女鞋', '箱包', '钟表', '珠宝'] },
  { key: 8, icon: UserOutlined, items: ['男鞋', '运动', '户外'] },
  { key: 9, icon: CarOutlined, items: ['房产', '汽车', '汽车用品'] },
  { key: 10, icon: MedicineBoxOutlined, items: ['母婴', '玩具乐器'] },
  { key: 11, icon: BgColorsOutlined, items: ['食品', '酒类', '生鲜', '特产'] },
]

// 商品分类点击事件
const handleClick = (item) => {
  message.success(`商品分类: ${item}`)
  router.push({ path: '/search', query: { category: item } })
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

    <!--商品展示-->
    <div class="commodity-body">
      <!--侧边商品分类栏-->
      <div class="commodity-classify">
        <a-menu mode="inline" theme="light" default-selected-keys="1">
          <a-menu-item v-for="menuItem in menuItems" :key="menuItem.key">
            <a-breadcrumb>
              <component :is="menuItem.icon" class="breadcrumb-icon" />
              <a-breadcrumb-item
                class="commodity-item"
                v-for="item in menuItem.items"
                :key="item"
                @click="handleClick(item)"
              >
                {{ item }}
              </a-breadcrumb-item>
            </a-breadcrumb>
          </a-menu-item>
        </a-menu>
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
