<script setup>
import { getUserInfoService } from '@/api/user';
import { onMounted, ref } from 'vue';
import { EditOutlined, GithubFilled } from '@ant-design/icons-vue';
import avatarImage from "@/assets/default-avatar.webp";

const user = ref({});
const avatar_url = ref(avatarImage);

onMounted(() => {
  getUser()
})

const getUser = async () => {
  await getUserInfoService().then(res => {
    user.value = res.data;
    if (user.value.avatar_url) {
      avatar_url.value = user.value.avatar_url;
    }
  })
}

</script>

<template>
  <div class="container">
    <!-- 用户信息 -->
    <div class="user-info">
      <a-card hoverable style="width: 300px">
        <template #actions>
          <edit-outlined key="edit" />
        </template>
        <!-- 用户名 -->
        <a-card-meta :title="user.username">
          <!-- 头像 -->
          <template #avatar>
            <a-avatar style="margin-bottom: 20px;" :src="avatar_url" />
          </template>
        </a-card-meta>

        <p>电话: {{ user.phone }}</p>
        <p>余额: {{ (user.balance / 100).toFixed(2) }} 元</p>
        <p v-if="user.provider === 'github'">已绑定：
          <GithubFilled style="margin-right: 10px;" />{{ user.oauth_name }}
        </p>

      </a-card>
    </div>

    <!-- 订单信息 -->
    <div class="order-info">
      订单信息
    </div>
  </div>
</template>

<style lang="less" scoped>
@import '@/styles/var';

.container {
  display: flex;
  justify-content: space-between;
  margin-top: 50px !important;
}

.user-info {
  width: 300px;
  /* 确保 user-info 容器的宽度与 a-card 一致 */
}

.order-info {
  flex: 1;
  margin-left: 20px;
}
</style>
