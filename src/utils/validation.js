const validateUsername = (_, value) => {
  if (value.length < 6) {
    return Promise.reject('用户名至少为6位');
  }
  return Promise.resolve();
};

const validatePassword = (_, value) => {
  if (value.length < 6) {
    return Promise.reject('密码至少为6位');
  }
  return Promise.resolve();
};

const validatePhone = (_, value) => {
  if (value.length !== 11) {
    return Promise.reject('电话必须为11位');
  }
  return Promise.resolve();
};

export { validateUsername, validatePassword, validatePhone };
