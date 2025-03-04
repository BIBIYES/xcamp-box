import request from '@/utils/request'

/**
 * 获取所有帖子列表
 * @returns {Promise}
 */
export const getAllPost = () => {
  return request.get('/post/list')
}

/**
 * 发布新帖子
 * @param {Object} data - 帖子信息
 * @param {string} data.postTitle - 帖子标题
 * @param {string} data.postText - 帖子内容
 * @returns {Promise}
 */
export const releasePost = (data) => {
  return request({
    url: '/post/release',
    method: 'post',
    data
  })
}

/**
 * 获取帖子详情
 * @param {number} postId - 帖子ID
 * @returns {Promise}
 */
export const getPostDetail = (postId) => {
  return request.get(`/post/detail/${postId}`)
}

/**
 * 点赞/取消点赞帖子
 * @param {number} postId - 帖子ID
 * @returns {Promise}
 */
export const likePost = (postId) => {
  return request({
    url: '/like-record/toggle',
    method: 'post',
    data: { postId: String(postId) }
  })
}

/**
 * 获取用户点赞的帖子列表
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export const getUserLikedPosts = (userId) => {
  return request.get(`/like-record/user/${userId}`)
}
