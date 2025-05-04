<script setup>
import { ref, onMounted } from 'vue'
import { jump } from '@/router/jump.js'
import {
  HomeOutlined,
  ArrowLeftOutlined,
  BugOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons-vue'

// 错误类型：404, 500, 403
const errorType = ref('404')
// 错误消息和描述
const errorMessages = {
  '404': {
    title: '页面未找到',
    subTitle: '抱歉，您访问的页面不存在',
    icon: 'question-circle-outlined'
  },
  '403': {
    title: '无访问权限',
    subTitle: '抱歉，您没有权限访问此页面',
    icon: 'warning-outlined'
  },
  '500': {
    title: '服务器错误',
    subTitle: '抱歉，服务器出现了问题',
    icon: 'bug-outlined'
  }
}

// 动画计数器
const animationCount = ref(0)

onMounted(() => {
  // 从URL获取错误类型参数
  const urlParams = new URLSearchParams(window.location.search)
  const type = urlParams.get('type')
  if (type && ['404', '403', '500'].includes(type)) {
    errorType.value = type
  }

  // 启动动画计数器
  setInterval(() => {
    animationCount.value = (animationCount.value + 1) % 3
  }, 3000)
})

// 返回上一页
const goBack = () => {
  window.history.back()
}
</script>

<template>
  <div class="error-container">
    <!-- 错误内容 -->
    <div class="error-content">
      <div class="error-animation">
        <div class="error-code">{{ errorType }}</div>
        <div class="animation-elements">
          <div class="element" :class="{ 'element-active': animationCount.value === 0 }">
            <BugOutlined v-if="errorType === '500'" />
            <QuestionCircleOutlined v-else-if="errorType === '404'" />
            <BugOutlined v-else />
          </div>
          <div class="element" :class="{ 'element-active': animationCount.value === 1 }">
            <BugOutlined v-if="errorType === '500'" />
            <QuestionCircleOutlined v-else-if="errorType === '404'" />
            <BugOutlined v-else />
          </div>
          <div class="element" :class="{ 'element-active': animationCount.value === 2 }">
            <BugOutlined v-if="errorType === '500'" />
            <QuestionCircleOutlined v-else-if="errorType === '404'" />
            <BugOutlined v-else />
          </div>
        </div>
      </div>

      <div class="error-message">
        <h1 class="error-title">{{ errorMessages[errorType].title }}</h1>
        <p class="error-subtitle">{{ errorMessages[errorType].subTitle }}</p>
      </div>

      <div class="error-actions">
        <a-button type="primary" size="large" @click="jump('/')" class="action-button home-button">
          <template #icon>
            <HomeOutlined />
          </template>
          返回首页
        </a-button>
        <a-button size="large" @click="goBack" class="action-button back-button">
          <template #icon>
            <ArrowLeftOutlined />
          </template>
          返回上页
        </a-button>
      </div>
    </div>

    <!-- 底部链接区域 -->
    <div class="error-help">
      <p>需要帮助？ <a @click="jump('/about')">联系我们</a> 或查看 <a @click="jump('/about')">常见问题</a></p>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/styles/var';

.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.error-content {
  background-color: white;
  border-radius: 16px;
  box-shadow: @box-shadow;
  padding: 40px;
  max-width: 800px;
  width: 100%;
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

.error-animation {
  position: relative;
  height: 200px;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-code {
  font-size: 150px;
  font-weight: bold;
  color: #f0f0f0;
  position: absolute;
  z-index: 1;
  animation: pulse 5s infinite;
}

.animation-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.element {
  font-size: 40px;
  margin: 0 20px;
  color: #bbb;
  transform: scale(0.8);
  opacity: 0.3;
  transition: all 0.5s;
  animation: float 5s infinite;
  animation-delay: calc(var(--index) * 0.5s);

  &.element-active {
    transform: scale(1.2);
    color: @primary-color;
    opacity: 1;
    filter: drop-shadow(0 0 10px rgba(0, 185, 107, 0.3));
  }

  &:nth-child(1) {
    --index: 0;
    animation-delay: 0s;
  }

  &:nth-child(2) {
    --index: 1;
    animation-delay: 0.5s;
  }

  &:nth-child(3) {
    --index: 2;
    animation-delay: 1s;
  }
}

.error-message {
  margin-bottom: 30px;
}

.error-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.error-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.action-button {
  min-width: 140px;
  height: 45px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
}

.home-button {
  background-color: @primary-color;
  border-color: @primary-color;

  &:hover {
    background-color: darken(@primary-color, 10%);
    border-color: darken(@primary-color, 10%);
  }
}

.error-help {
  margin-top: 20px;
  color: #666;
  font-size: 14px;

  a {
    color: @primary-color;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s;

    &:hover {
      color: darken(@primary-color, 10%);
      text-decoration: underline;
    }
  }
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.2;
  }

  50% {
    opacity: 0.3;
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

/* 响应式适配 */
@media (max-width: 600px) {
  .error-content {
    padding: 30px 20px;
  }

  .error-code {
    font-size: 120px;
  }

  .error-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}
</style>
