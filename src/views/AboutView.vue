<script setup>
import { ref, reactive, computed } from 'vue';
import RepoEvents from '@/components/RepoEvents.vue';
import { useAppConfigStore } from '@/stores/appConfig';
import { storeToRefs } from 'pinia';
import { message, Modal } from 'ant-design-vue';
import {
  SettingOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';

const techIcons = [
  { i: 'vue', alt: 'Vue.js' },
  { i: 'vite', alt: 'Vite' },
  { i: 'pinia', alt: 'Pinia' },
  { i: 'js', alt: 'JavaScript' },
  { i: 'html', alt: 'HTML' },
  { i: 'css', alt: 'CSS' },
  { i: 'git', alt: 'Git' },
  { i: 'pnpm', alt: 'pnpm' },
];

// App Config Store
const appConfigStore = useAppConfigStore();
const { apiUrls, activeApiUrl } = storeToRefs(appConfigStore);

const handleApiChange = (value) => {
  appConfigStore.setActiveApiUrl(value);
};

// API 管理模态框状态和逻辑
const manageApiModalVisible = ref(false);
const newApiForm = reactive({
  label: '',
  value: ''
});

const showManageApiModal = () => {
  manageApiModalVisible.value = true;
};

const handleAddApi = () => {
  if (!newApiForm.label || !newApiForm.value) {
    message.error('名称和地址不能为空！');
    return;
  }
  if (!/^https?:\/\/.+/.test(newApiForm.value)) {
    message.error('请输入有效的 URL 地址 (以 http:// 或 https:// 开头)');
    return;
  }
  const success = appConfigStore.addApiUrl({
    label: newApiForm.label,
    value: newApiForm.value
  });
  if (success) {
    message.success('添加成功！');
    newApiForm.label = '';
    newApiForm.value = '';
  } else {
    message.error('添加失败，请检查名称或地址是否重复！');
  }
};

const handleRemoveApi = (apiUrlValue) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除 API 源 ${apiUrls.value.find(item => item.value === apiUrlValue)?.label || apiUrlValue} 吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      const success = appConfigStore.removeApiUrl(apiUrlValue);
      if (success) {
        message.success('删除成功！');
      } else {
        message.error('删除失败！该项可能不可删除或已被移除。');
      }
    }
  });
};

</script>

<template>
  <div class="about-container">
    <a-card>
      <div class="centered-content">
        <a-typography-paragraph>
          这是一个基于Vue的网上商店用户网页端
        </a-typography-paragraph>
        <a-typography-paragraph>
          <a-space wrap justify="center">
            <img v-for="icon in techIcons" :key="icon.i" :src="`https://skillicons.dev/icons?i=${icon.i}&theme=light`"
              :alt="icon.alt">
            <a href="https://github.com/caolib/shop-web" target="_blank" rel="noopener noreferrer">
              <img src="https://skillicons.dev/icons?i=github&theme=light" alt="GitHub Repository">
            </a>
          </a-space>
        </a-typography-paragraph>
      </div>

      <a-divider />

      <div class="api-config-section">
        <span style="margin-right: 8px;">当前 API 源:</span>
        <a-select v-model:value="activeApiUrl" size="small" style="width: 200px; margin-right: 8px;" :options="apiUrls"
          @change="handleApiChange" />
        <a-button size="small" @click="showManageApiModal">
          <SettingOutlined /> 管理 API 源
        </a-button>
      </div>

      <a-divider />

      <a-typography-title :level="4">最近仓库活动</a-typography-title>
      <repo-events />
    </a-card>

    <a-modal v-model:open="manageApiModalVisible" title="管理 API 源" :footer="null">
      <a-list item-layout="horizontal" :data-source="apiUrls">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="item.label" :description="item.value">
            </a-list-item-meta>
            <template #actions>
              <a-button v-if="item.deletable" type="text" danger size="small" @click="handleRemoveApi(item.value)">
                <DeleteOutlined />
              </a-button>
            </template>
          </a-list-item>
        </template>
      </a-list>

      <a-divider>添加新 API 源</a-divider>

      <a-form :model="newApiForm" layout="vertical">
        <a-form-item label="名称" required>
          <a-input v-model:value="newApiForm.label" placeholder="例如：开发环境" />
        </a-form-item>
        <a-form-item label="地址" required>
          <a-input v-model:value="newApiForm.value" placeholder="https://..." />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleAddApi" block>
            <PlusOutlined /> 添加
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<style scoped>
.about-container {
  padding: 20px;
}

.centered-content {
  text-align: center;
}

.centered-content .ant-space {
  display: inline-flex;
  justify-content: center;
}

img[alt] {
  margin-right: 5px;
  margin-bottom: 5px;
}

.api-config-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}
</style>