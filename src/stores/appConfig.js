import { defineStore } from 'pinia'
import { ref } from 'vue'

// 默认的 API 地址 (从环境变量读取)
const defaultApiUrl = import.meta.env.VITE_APP_BASE_API

// 初始 API 列表，至少包含默认环境
const initialApiUrls = [
  { label: '默认环境', value: defaultApiUrl, deletable: false }, // 默认环境不可删除
  // 可以添加一些预设环境，并标记为可删除
  // { label: '预设测试', value: 'http://preset-test.api', deletable: true },
]

export const useAppConfigStore = defineStore(
  'appConfig',
  () => {
    // 可选的 API 地址列表
    const apiUrls = ref(initialApiUrls)

    // 当前激活的 API 地址
    const activeApiUrl = ref(defaultApiUrl)

    // 设置激活的 API 地址
    function setActiveApiUrl(url) {
      if (url && apiUrls.value.some((item) => item.value === url)) {
        activeApiUrl.value = url
        // 切换后刷新页面以应用更改
        window.location.reload()
      } else {
        console.warn(`Attempted to set invalid API URL: ${url}`)
      }
    }

    // 添加新的 API 地址
    function addApiUrl(newApi) {
      if (
        newApi &&
        newApi.label &&
        newApi.value &&
        !apiUrls.value.some((item) => item.value === newApi.value || item.label === newApi.label)
      ) {
        apiUrls.value.push({ ...newApi, deletable: true }) // 新添加的默认可删除
      } else {
        console.warn('Attempted to add invalid or duplicate API URL:', newApi)
        // 可以加入用户提示，例如使用 message 组件
        // message.error('无效或重复的 API 地址！');
        return false // 返回 false 表示添加失败
      }
      return true // 返回 true 表示添加成功
    }

    // 删除 API 地址
    function removeApiUrl(apiUrlValue) {
      const index = apiUrls.value.findIndex((item) => item.value === apiUrlValue)
      // 确保找到、可删除，并且不是当前激活的 URL (或者允许删除当前激活但需要后续处理)
      if (index > -1 && apiUrls.value[index].deletable) {
        // 如果删除的是当前激活的 URL，切换回默认值
        if (activeApiUrl.value === apiUrlValue) {
          setActiveApiUrl(defaultApiUrl) // 切换回默认，会触发刷新
        }
        apiUrls.value.splice(index, 1)
      } else {
        console.warn(
          'Attempted to remove non-existent, non-deletable, or active API URL:',
          apiUrlValue,
        )
        return false // 删除失败
      }
      return true // 删除成功
    }

    return {
      apiUrls,
      activeApiUrl,
      setActiveApiUrl,
      addApiUrl,
      removeApiUrl,
      defaultApiUrl, // 暴露默认 URL 可能有用
    }
  },
  {
    // 持久化整个 store 或特定字段
    persist: {
      paths: ['apiUrls', 'activeApiUrl'], // 持久化列表和当前选中的 URL
    },
  },
)
