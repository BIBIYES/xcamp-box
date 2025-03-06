import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @param {string} data.email - 用户邮箱
 * @param {string} data.password - 用户密码
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data,
  })
}

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @param {string} data.email - 用户邮箱
 * @param {string} data.password - 用户密码
 * @param {string} data.verificationCode - 验证码
 * @returns {Promise}
 */
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data,
  })
}

/**
 * 获取邮箱验证码
 * @param {Object} data - 请求数据
 * @param {string} data.email - 用户邮箱
 * @returns {Promise}
 */
export function sendVerificationCode(data) {
  return request({
    url: '/user/sendVerificationCode',
    method: 'post',
    data,
  })
}

/**
 * 修改用户名
 * @param {Object} data - 请求数据
 * @param {string} data.username - 新用户名
 * @returns {Promise}
 */
export function updateUsername(data) {
  console.log(data)

  return request({
    url: '/user/updateUser',
    method: 'post',
    data,
  })
}

/**
 * 获取用户头像URL
 * @param {string} email - 用户邮箱
 * @returns {string} 头像URL
 */
export function getAvatarUrl(email) {
  if (!email) return ''
  const qqEmail = email.toLowerCase()
  return `https://q2.qlogo.cn/headimg_dl?dst_uin=${qqEmail.split('@')[0]}&spec=640`
}
