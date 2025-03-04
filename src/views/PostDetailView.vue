<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPostDetail, likePost } from '@/api/post'
import { getCommentList, addComment } from '@/api/comment'
import { formatDateTime } from '@/utils/date'
import { Like, PreviewOpen, Left } from '@icon-park/vue-next'
import message from '@/plugins/message'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 返回上一页
const goBack = () => {
  router.back()
}

// 帖子详情数据
const post = ref(null)
const loading = ref(true)

// 获取帖子详情
const fetchPostDetail = async () => {
  loading.value = true
  try {
    const res = await getPostDetail(route.params.id)
    post.value = res.data
  } catch (error) {
    console.error('获取帖子详情失败：', error)
  } finally {
    loading.value = false
  }
}

// 点赞帖子
const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    const res = await likePost(route.params.id)
    if (res.code !== 200) {
      message.error(res.message)
      return
    }
    message.success(res.message)
    // 根据返回消息判断是点赞还是取消点赞
    if (res.message == '点赞成功') {
      post.value.likeCount++
    } else {
      post.value.likeCount--
    }
  } catch (error) {
    console.error('点赞失败：', error)
    message.error('点赞失败，请稍后再试')
  }
}

// 评论相关
const comments = ref([])
const commentLoading = ref(false)
const commentText = ref('')
const commentSubmitting = ref(false)

// 获取评论列表
const fetchComments = async () => {
  commentLoading.value = true
  try {
    const res = await getCommentList(route.params.id)
    comments.value = res.data || []
  } catch (error) {
    console.error('获取评论失败：', error)
    message.error('获取评论失败，请稍后再试')
  } finally {
    commentLoading.value = false
  }
}

// 发布评论
const submitComment = async () => {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    router.push('/login')
    return
  }

  if (!commentText.value.trim()) {
    message.warning('评论内容不能为空')
    return
  }

  commentSubmitting.value = true
  try {
    await addComment({
      commentText: commentText.value.trim(),
      postId: Number(route.params.id),
    })
    message.success('评论发布成功')
    commentText.value = ''
    // 刷新评论列表
    fetchComments()
    // 更新帖子评论数
    post.value.commentCount++
  } catch (error) {
    console.error('评论发布失败：', error)
    message.error('评论发布失败，请稍后再试')
  } finally {
    commentSubmitting.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchPostDetail()
  fetchComments()
})
</script>

<template>
  <div class="app w-full min-h-screen bg-base-200 pb-8">
    <!-- 返回按钮 -->
    <div class="max-w-4xl mx-auto pt-4 px-4">
      <button class="btn btn-ghost btn-sm flex items-center gap-1" @click="goBack">
        <Left theme="outline" size="18" class="text-neutral-500" />
        <span>返回</span>
      </button>
    </div>

    <!-- 帖子详情 -->
    <div class="max-w-4xl mx-auto pt-2 px-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center h-48">
        <span class="loading loading-spinner loading-lg text-neutral-500"></span>
      </div>

      <!-- 帖子内容 -->
      <div v-else-if="post" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex justify-between items-start">
            <h1 class="text-2xl font-bold text-neutral-800">{{ post.postTitle }}</h1>
            <div class="badge badge-ghost text-neutral-600">{{ post.authorName }}</div>
          </div>

          <div class="divider my-2"></div>

          <p class="text-lg text-neutral-700 whitespace-pre-wrap">{{ post.postText }}</p>

          <div class="divider my-4"></div>

          <!-- 帖子信息 -->
          <div class="flex flex-col gap-2 text-sm text-neutral-500">
            <div class="flex justify-between items-center">
              <span>创建时间：{{ formatDateTime(post.createTime) }}</span>
              <span>最后更新：{{ formatDateTime(post.updateTime) }}</span>
            </div>

            <div class="flex justify-end gap-6">
              <div class="flex items-center gap-1 tooltip" data-tip="浏览量">
                <PreviewOpen
                  theme="outline"
                  size="16"
                  class="text-neutral-500"
                  strokeLinejoin="miter"
                />
                <span class="text-neutral-600">{{ post.viewCount }}</span>
              </div>
              <div
                class="flex items-center gap-1 tooltip cursor-pointer"
                data-tip="点赞"
                @click="handleLike"
              >
                <Like theme="outline" size="16" class="text-neutral-500" strokeLinejoin="miter" />
                <span class="text-neutral-600">{{ post.likeCount }}</span>
              </div>
              <div class="flex items-center gap-1 tooltip" data-tip="评论">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span class="text-neutral-600">{{ post.commentCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else class="card bg-base-100 shadow-xl p-8 text-center">
        <div class="text-lg text-error">加载帖子详情失败</div>
        <button class="btn btn-ghost mt-4" @click="goBack">返回上一页</button>
      </div>

      <!-- 评论区域 -->
      <div v-if="post" class="mt-6">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="text-xl font-bold text-neutral-800">评论区</h2>

            <!-- 评论表单 -->
            <div class="mt-4">
              <div class="form-control">
                <textarea
                  v-model="commentText"
                  class="textarea textarea-bordered focus:outline-neutral-400"
                  placeholder="写下你的评论..."
                  rows="3"
                ></textarea>
              </div>
              <div class="flex justify-end mt-2">
                <button
                  class="btn btn-neutral"
                  @click="submitComment"
                  :disabled="commentSubmitting"
                >
                  <span v-if="commentSubmitting" class="loading loading-spinner loading-xs"></span>
                  发布评论
                </button>
              </div>
            </div>

            <div class="divider"></div>

            <!-- 评论列表 -->
            <div>
              <!-- 评论加载中 -->
              <div v-if="commentLoading" class="flex justify-center py-8">
                <span class="loading loading-spinner loading-md text-neutral-500"></span>
              </div>

              <!-- 无评论 -->
              <div v-else-if="comments.length === 0" class="py-8 text-center text-neutral-500">
                暂无评论，快来发表第一条评论吧！
              </div>

              <!-- 评论列表 -->
              <div v-else class="space-y-4">
                <div
                  v-for="comment in comments"
                  :key="comment.commentId"
                  class="border-b border-base-200 pb-4 last:border-0"
                >
                  <div class="flex justify-between items-start">
                    <div class="font-medium text-neutral-700">{{ comment.username }}</div>
                    <div class="text-xs text-neutral-500">
                      {{ formatDateTime(comment.commentDate) }}
                    </div>
                  </div>
                  <div class="mt-2 text-neutral-700">{{ comment.commentText }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
