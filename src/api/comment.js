import request from '@/utils/request'

/**
 * 获取评论列表
 * @param {number} postId - 帖子ID
 * @param {number} pageNum - 页码
 * @param {number} pageSize - 每页条数
 * @returns {Promise}
 */
export const getCommentList = (postId, pageNum = 1, pageSize = 10) => {
  return request.get(`/comment/list/${postId}`, {
    params: {
      pageNum,
      pageSize
    }
  })
}

/**
 * 发布评论
 * @param {Object} data - 评论信息
 * @param {string} data.commentText - 评论内容
 * @param {number} data.postId - 帖子ID
 * @returns {Promise}
 */
export const addComment = (data) => {
  return request({
    url: '/comment/add',
    method: 'post',
    data
  })
}