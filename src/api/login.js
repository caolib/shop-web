import request from '@/utils/request'

/**
 * 用户登录
 * @param user 用户信息 {username, password}
 */
// const loginService = (user) => {
//   return request.post('/users/login', user)
// }
const loginService = (user) => {
  console.log('Login request:', user);
  return request.post('/users/login', user)
    .then(response => {
      console.log('Login response:', response);
      return response;
    })
    .catch(error => {
      console.error('Login error:', error);
      throw error;
    });
}
/**
 * github登录
 */
const githubLoginService = (code) => {
  // 获取 URL 中的授权码 code
  return request.get(`/oauth/github?code=${code}`)
}

export { loginService, githubLoginService }
