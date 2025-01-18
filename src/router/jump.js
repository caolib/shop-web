import router from "."


// 跳转到指定商品页面
const jumpToItem = (id) => {
    router.push({ path: '/commodity', query: { id } })
}

export { jumpToItem }