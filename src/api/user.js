import request from '@/utils/request'

/**
 * 获取用户信息
 */
const getUserInfoService = () => {
  return request.get('/users')
}


/**
 * 更新用户密码
 * @param {string} oldPwd 原密码
 * @param {string} newPwd 新密码
 */
const updatePwdService = (pwdForm) => {
  console.log(pwdForm)
  return request.put('/users/pwd', pwdForm)
}

export {
  getUserInfoService,
  updatePwdService
}
