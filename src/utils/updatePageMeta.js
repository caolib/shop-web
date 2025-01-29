/**
 * 修改页面的标题和图标
 * @param title 标题
 * @param icon 图标
 */
const updatePageMeta = (icon, title) => {
    const pageIcon = document.getElementById('page-icon');
    const pageTitle = document.getElementById('page-title');

    if (pageIcon) pageIcon.href = icon;
    if (pageTitle) pageTitle.textContent = title;
}

export { updatePageMeta }