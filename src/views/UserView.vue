<script setup>
import { getUserInfoService, updatePwdService } from '@/api/user';
import { onMounted, reactive, ref } from 'vue';
import { GithubFilled } from '@ant-design/icons-vue';
import avatarImage from "@/assets/default-avatar.webp";
import { message } from 'ant-design-vue';
import { cancelAccountServicce, logout } from '@/api/login';


const user = ref({}); // 用户信息
const avatarUrl = ref(avatarImage);

const pwdForm = reactive({
  oldPwd: '',
  newPwd: ''
})

onMounted(() => {
  fetchUser()
})

// 获取用户信息
const fetchUser = async () => {
  await getUserInfoService().then(res => {
    user.value = res.data;
    if (user.value.avatar_url) {
      avatarUrl.value = user.value.avatar_url;
    }
  })
}

const visible = ref(false); // 对话框是否显示

// 显示修改密码对话框
const openPwdForm = () => {
  visible.value = true;
}

// 修改密码
const updatePwd = async () => {
  if (pwdForm.oldPwd === pwdForm.newPwd) {
    message.error('新密码不能与原密码相同');
    return;
  }
  await updatePwdService(pwdForm).then(() => {
    logout();
    message.success('修改成功,请重新登录');
  }).catch((err) => {
    message.error('修改失败', err);
  }).finally(() => {
    visible.value = false;
  })
}

const visible2 = ref(false); // 注销账号对话框是否显示
const loading = ref(false); // 注销账号按钮加载状态

// 账号注销
const cancelAccount = async () => {
  visible2.value = false;
  loading.value = true;
  await cancelAccountServicce().then(() => {
    logout();
    message.success('账号注销成功');
  }).catch((err) => {
    message.error('账号注销失败', err);
  }).finally(() => {
    loading.value = false;
  })
}


</script>

<template>
  <div class="container">
    <!-- 用户信息 -->
    <a-card hoverable class="user-card">
      <!-- 用户名 -->
      <a-card-meta :title="user.username">
        <!-- 头像 -->
        <template #avatar>
          <a-avatar style="margin-bottom: 20px;" :src="avatarUrl" />
        </template>
      </a-card-meta>

      <p>电话: {{ user.phone }}</p>
      <p>余额: {{ (user.balance / 100).toFixed(2) }} 元</p>
      <p v-if="user.provider === 'github'">已绑定：
        <GithubFilled style="margin-right: 10px;" />{{ user.oauth_name }}
      </p>
      <a-button @click="openPwdForm" size="small">修改密码</a-button>
      <a-button @click="visible2 = true" :loading="loading" danger style="margin-left: 10px;" size="small"
        type="primary">注销账号</a-button>
    </a-card>

    <!-- 修改密码对话框 -->
    <a-modal v-model:open="visible" @ok="updatePwd" title="修改密码" centered>
      <a-form>
        <a-form-item label="原密码" name="oldPwd">
          <a-input v-model:value="pwdForm.oldPwd" />
        </a-form-item>
        <a-form-item label="新密码" name="newPwd">
          <a-input v-model:value="pwdForm.newPwd" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 账号注销对话框 -->
    <a-modal v-model:open="visible2" title="确定注销账号？" centered @ok="cancelAccount">
      <p style="color: red">注销账号后，您的所有数据将被清空，且无法恢复！</p>
    </a-modal>
  </div>




</template>

<style lang="less" scoped>
@import '@/styles/var';

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  padding: 20px;
  overflow: hidden;
}

.user-card {
  padding: 20px;
  box-shadow: @box-shadow;
}
</style>
