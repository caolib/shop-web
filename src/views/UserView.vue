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
  <div>
    <div>
      <a-card hoverable style="width: 300px">
        <template #actions>
          <edit-outlined key="edit" />
        </template>

        <a-card-meta :title="user.username">
          <template #avatar>
            <a-avatar style="margin-bottom: 20px;" :src="avatar_url" />
          </template>
        </a-card-meta>

        <p>电话: {{ user.phone }}</p>
        <p>余额: {{ (user.balance / 100).toFixed(2) }} 元</p>
        <p v-if="user.provider === 'github'">已绑定：
          <GithubFilled />{{ user.oauth_name }}
        </p>

      </a-card>
    </div>
  </div>
</template>

<style scoped></style>