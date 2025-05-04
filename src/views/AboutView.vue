<script setup>
import { ref, reactive, computed } from 'vue';
import RepoEvents from '@/components/RepoEvents.vue';
import { useAppConfigStore } from '@/stores/appConfig';
import { storeToRefs } from 'pinia';
import { message, Modal } from 'ant-design-vue';
import {
  SettingOutlined,
  DeleteOutlined,
  PlusOutlined,
  GithubFilled
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
  <div class="about-page">
    <a-row class="about-container">
      <a-col :span="20" :offset="2">
        <a-card class="about-card" :bordered="false">
          <!-- 页面标题 -->
          <div class="page-header">
            <div class="page-title">
              <h2>关于</h2>
              <div class="title-divider"></div>
            </div>
          </div>

          <!-- 项目介绍 -->
          <div class="project-intro">
            <div class="intro-content">
              <div class="intro-icon">
                <img src="@/assets/default-avatar.webp" alt="Shop Logo" class="shop-logo">
              </div>
              <div class="intro-text">
                <h3>
                  <a href="https://github.com/caolib/shop-web" target="_blank" rel="noopener noreferrer"
                    class="project-title-link">
                    网上商店用户网页端
                    <github-filled class="github-icon" />
                  </a>
                </h3>
                <p>这是一个基于 Vue3 构建的现代电子商务平台，提供简洁流畅的购物体验。</p>
                <p>使用 Tauri 打包，支持跨平台运行，由
                  <a href="https://github.com/caolib" target="_blank" rel="noopener noreferrer"
                    class="author-link">caolib</a>
                  开发和维护。
                </p>
              </div>
            </div>
          </div>

          <!-- 技术栈展示 -->
          <div class="tech-stack-section">
            <h3 class="section-title">技术栈</h3>
            <div class="tech-icons-container">
              <a-space wrap :size="[16, 16]" class="tech-icons">
                <div v-for="icon in techIcons" :key="icon.i" class="tech-icon-item">
                  <img :src="`https://skillicons.dev/icons?i=${icon.i}&theme=light`" :alt="icon.alt">
                  <span class="icon-name">{{ icon.alt }}</span>
                </div>
                <div class="tech-icon-item">
                  <img src="https://skillicons.dev/icons?i=github&theme=light" alt="GitHub">
                  <span class="icon-name">GitHub</span>
                </div>
              </a-space>
            </div>
          </div>

          <a-divider style="margin: 24px 0;" />

          <!-- API 配置部分 -->
          <div class="api-config-section">
            <h3 class="section-title">API 配置</h3>
            <div class="api-config-content">
              <div class="current-api">
                <span class="api-label">当前 API 源:</span>
                <a-select v-model:value="activeApiUrl" size="middle" class="api-select" :options="apiUrls"
                  @change="handleApiChange" />
                <a-button type="primary" @click="showManageApiModal" class="manage-api-btn">
                  <template #icon>
                    <SettingOutlined />
                  </template>
                  管理 API 源
                </a-button>
              </div>
            </div>
          </div>

          <a-divider style="margin: 24px 0;" />

          <!-- 仓库活动部分 -->
          <div class="repo-activity-section">
            <h3 class="section-title">最近仓库活动</h3>
            <div class="repo-activity-content">
              <repo-events />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- API 管理弹窗 -->
    <a-modal v-model:open="manageApiModalVisible" title="管理 API 源" :footer="null" class="api-modal" width="500px">
      <a-list item-layout="horizontal" :data-source="apiUrls" class="api-list">
        <template #renderItem="{ item }">
          <a-list-item class="api-list-item">
            <a-list-item-meta :title="item.label">
              <template #description>
                <a-tag color="blue">{{ item.value }}</a-tag>
              </template>
            </a-list-item-meta>
            <template #actions>
              <a-button v-if="item.deletable" type="primary" danger size="small" @click="handleRemoveApi(item.value)"
                class="delete-api-btn">
                <template #icon>
                  <DeleteOutlined />
                </template>
                删除
              </a-button>
            </template>
          </a-list-item>
        </template>
      </a-list>

      <a-divider>添加新 API 源</a-divider>

      <a-form :model="newApiForm" layout="vertical" class="add-api-form">
        <a-form-item label="名称" required>
          <a-input v-model:value="newApiForm.label" placeholder="例如：开发环境" />
        </a-form-item>
        <a-form-item label="地址" required>
          <a-input v-model:value="newApiForm.value" placeholder="https://..." />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleAddApi" class="add-api-btn">
            <template #icon>
              <PlusOutlined />
            </template>
            添加 API 源
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
@import '@/styles/var';

.about-page {
  min-height: 95vh;
  padding: 30px 0;
  background-color: #f7f9fc;
}

.about-container {
  margin-top: 10px;
}

.about-card {
  border-radius: 12px;
  box-shadow: @box-shadow;
  padding: 20px;
  background-color: #fff;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  position: relative;
  margin-bottom: 20px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 0;
  }

  .title-divider {
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 4px;
    background-color: @primary-color;
    border-radius: 2px;
  }
}

.project-intro {
  margin-bottom: 40px;

  .intro-content {
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }

  .intro-icon {
    margin-right: 30px;

    @media (max-width: 768px) {
      margin-right: 0;
      margin-bottom: 20px;
    }
  }

  .shop-logo {
    width: 120px;
    height: 120px;
    border-radius: 60px;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 4px solid white;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
  }

  .intro-text {
    flex: 1;

    h3 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
      color: #333;
    }

    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 8px;
    }

    .project-title-link {
      color: inherit;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      transition: all 0.3s;

      &:hover {
        color: @primary-color;
      }

      .github-icon {
        margin-left: 8px;
        font-size: 18px;
        opacity: 0.7;
      }
    }

    .author-link {
      color: @primary-color;
      text-decoration: none;
      font-weight: 500;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: @primary-color;
        transform: scaleX(0);
        transition: transform 0.3s ease;
        transform-origin: right;
      }

      &:hover::after {
        transform: scaleX(1);
        transform-origin: left;
      }
    }
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
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

.tech-stack-section {
  margin-bottom: 30px;
}

.tech-icons-container {
  background-color: #fafafa;
  border-radius: 12px;
  padding: 20px;
  box-shadow: inset 0 1px 8px rgba(0, 0, 0, 0.03);
}

.tech-icons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.tech-icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  transition: all 0.3s;

  img {
    width: 50px;
    height: 50px;
    margin-bottom: 8px;
    transition: all 0.3s;
  }

  .icon-name {
    font-size: 12px;
    color: #666;
  }

  &:hover {
    transform: translateY(-5px);

    img {
      transform: scale(1.1);
    }

    .icon-name {
      color: @primary-color;
    }
  }

  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: inherit;
    text-decoration: none;
  }
}

.api-config-section {
  margin-bottom: 30px;
}

.api-config-content {
  background-color: #fafafa;
  border-radius: 12px;
  padding: 20px;
  box-shadow: inset 0 1px 8px rgba(0, 0, 0, 0.03);
}

.current-api {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.api-label {
  font-weight: 500;
  color: #555;
}

.api-select {
  width: 220px;
  margin-right: 10px;
}

.manage-api-btn {
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
  }
}

.repo-activity-section {
  margin-bottom: 20px;
}

.repo-activity-content {
  background-color: #fafafa;
  border-radius: 12px;
  padding: 20px;
  box-shadow: inset 0 1px 8px rgba(0, 0, 0, 0.03);
  max-height: 400px;
  overflow-y: auto;
}

// 弹窗样式
.api-modal {
  .api-list {
    margin-bottom: 20px;

    .api-list-item {
      transition: all 0.3s;
      border-radius: 8px;
      padding: 8px;

      &:hover {
        background-color: #f7f7f7;
      }
    }
  }

  .add-api-form {
    .add-api-btn {
      display: block;
      width: 100%;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
      }
    }
  }

  .delete-api-btn {
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>