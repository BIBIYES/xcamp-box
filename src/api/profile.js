import request from '@/utils/request'

// 获取个人发布的帖子
export const getMyPosts = () => {
  return request({
    url: '/post/getPostMind',
    method: 'get'
  })
}

// 删除帖子
export const deletePost = (postId) => {
  return request({
    url: '/post/delete',
    method: 'delete',
    data: { postId }
  })
}

// 编辑帖子
export const updatePost = (data) => {
  return request({
    url: '/post/revise',
    method: 'post',
    data
  })
}