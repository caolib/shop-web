<script setup>
import { getUserInfoService, updatePwdService } from '@/api/user';
import { onMounted, reactive, ref } from 'vue';
import { GithubFilled } from '@ant-design/icons-vue';
import avatarImage from "@/assets/default-avatar.webp";
import { message } from 'ant-design-vue';
import { cancelAccountServicce, logout } from '@/api/login';


const user = ref({}); // 用户信息
const avatarUrl = ref(avatarImage);
const userLoading = ref(false); // 用户信息加载状态

const pwdForm = reactive({
  oldPwd: '',
  newPwd: ''
})

onMounted(() => {
  fetchUser()
})

// 获取用户信息
const fetchUser = async () => {
  userLoading.value = true;
  await getUserInfoService().then(res => {
    user.value = res.data;
    if (user.value.avatar_url) {
      avatarUrl.value = user.value.avatar_url;
    }
  }).finally(() => {
    userLoading.value = false;
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
    logout('修改成功,请重新登录');
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
    logout('账号注销成功');
  }).catch((err) => {
    message.error('账号注销失败', err);
  }).finally(() => {
    loading.value = false;
  })
}


</script>

<template>
  <div class="user-page">
    <!-- 用户信息卡片 -->
    <a-row class="user-container">
      <a-col :span="16" :offset="4">
        <a-spin :spinning="userLoading" tip="加载中...">
          <!-- 主卡片 -->
          <a-card hoverable class="user-main-card">
            <a-row>
              <!-- 左侧用户基本信息 -->
              <a-col :span="8" class="user-profile-section">
                <div class="avatar-container">
                  <a-avatar :size="100" :src="avatarUrl" />
                </div>
                <div class="user-name">{{ user.username }}</div>
                <div class="user-tag" v-if="user.provider === 'github'">
                  <a-tag color="black">
                    <GithubFilled /> GitHub
                  </a-tag>
                </div>
              </a-col>

              <!-- 右侧用户详细信息和操作 -->
              <a-col :span="16" class="user-details-section">
                <div class="detail-item">
                  <a-row>
                    <a-col :span="8" class="detail-label">电话号码</a-col>
                    <a-col :span="16" class="detail-value">{{ user.phone || '未设置' }}</a-col>
                  </a-row>
                </div>

                <div class="detail-item">
                  <a-row>
                    <a-col :span="8" class="detail-label">账户余额</a-col>
                    <a-col :span="16" class="detail-value">
                      <span class="balance-amount">￥{{ (user.balance / 100).toFixed(2) }}</span>
                    </a-col>
                  </a-row>
                </div>

                <div class="detail-item" v-if="user.provider === 'github'">
                  <a-row>
                    <a-col :span="8" class="detail-label">绑定账号</a-col>
                    <a-col :span="16" class="detail-value">
                      <GithubFilled style="margin-right: 8px;" />{{ user.oauth_name }}
                    </a-col>
                  </a-row>
                </div>

                <!-- 操作按钮 -->
                <div class="action-buttons">
                  <a-button type="primary" @click="openPwdForm" size="middle">
                    修改密码
                  </a-button>
                  <a-button danger @click="visible2 = true" :loading="loading" size="middle" style="margin-left: 12px;">
                    注销账号
                  </a-button>
                </div>
              </a-col>
            </a-row>
          </a-card>
        </a-spin>
      </a-col>
    </a-row>

    <!-- 修改密码对话框 -->
    <a-modal v-model:open="visible" @ok="updatePwd" title="修改密码" centered>
      <a-form>
        <a-form-item label="原密码" name="oldPwd">
          <a-input v-model:value="pwdForm.oldPwd" type="password" placeholder="请输入原密码" />
        </a-form-item>
        <a-form-item label="新密码" name="newPwd">
          <a-input v-model:value="pwdForm.newPwd" type="password" placeholder="请输入新密码" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 账号注销对话框 -->
    <a-modal v-model:open="visible2" title="确定注销账号？" centered @ok="cancelAccount">
      <div class="warning-message">
        <a-alert type="error" message="注销账号后，您的所有数据将被清空，且无法恢复！" banner />
      </div>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
@import '@/styles/var';

.user-page {
  min-height: 90vh;
  padding: 30px 20px;
  background-color: #f7f9fc;
}

.user-container {
  margin-top: 20px;
}

.user-main-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: @box-shadow;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
}

.user-profile-section {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #f0f0f0;
}

.avatar-container {
  margin-bottom: 16px;
}

.user-name {
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 8px;
}

.user-tag {
  margin-top: 8px;
}

.user-details-section {
  padding: 30px;
}

.detail-item {
  margin-bottom: 20px;
  font-size: 16px;
}

.detail-label {
  color: #8c8c8c;
  text-align: left;
}

.detail-value {
  font-weight: 500;
}

.balance-amount {
  color: @red;
  font-weight: 600;
  font-size: 18px;
}

.action-buttons {
  margin-top: 32px;
  display: flex;
}

.warning-message {
  padding: 10px 0;
}
</style>
