<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAllPost, releasePost, getUserLikedPosts } from '@/api/post'
import { formatDateTime } from '@/utils/date'
import { Like, Logout, Pencil, PreviewOpen, User } from '@icon-park/vue-next'
import { useUserStore } from '@/stores/user'
import message from '@/plugins/message'
const router = useRouter()
const userStore = useUserStore()

// 退出登录
const handleLogout = () => {
  userStore.clearUserInfo()
  router.push('/login')
}

const testMessage = () => {
  console.log('testMessage')
  message.info('欢迎使用xcamp 校园墙')
}

// 发送帖子模态框
const visible = ref(false)
const postTitle = ref('')
const postContent = ref('')

// 打开发帖模态框
const handleClick = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  postTitle.value = ''
  postContent.value = ''
  visible.value = true
}

// 异步发送模态框
const handleBeforeOk = async () => {
  if (!postTitle.value.trim() || !postContent.value.trim()) {
    return false
  }

  try {
    const res = await releasePost({
      postTitle: postTitle.value.trim(),
      postText: postContent.value.trim(),
    })
    console.log(res)
    visible.value = false
    // 刷新帖子列表
    handelGetPost()
    return true
  } catch (error) {
    console.log(error)

    return false
  }
}

// 关闭模态框
const handleCancel = () => {
  visible.value = false
}

/**
 * 获取帖子列表
 */
const posts = ref([])
const loading = ref(true)
const likedPostIds = ref([]) // 存储用户已点赞的帖子ID

// 检查帖子是否已被点赞
const isPostLiked = (postId) => {
  return likedPostIds.value.includes(postId)
}

// 获取用户已点赞的帖子
const fetchLikedPosts = async () => {
  if (!userStore.isLoggedIn || !userStore.userId) return
  
  try {
    const res = await getUserLikedPosts(userStore.userId)
    if (res.data && Array.isArray(res.data)) {
      // 提取已点赞帖子的ID
      likedPostIds.value = res.data.map(post => post.postId)
    }
  } catch (error) {
    console.error('获取点赞帖子失败：', error)
  }
}

const handelGetPost = () => {
  loading.value = true
  getAllPost()
    .then((res) => {
      posts.value = res.data
      loading.value = false
      // 获取已点赞帖子
      fetchLikedPosts()
    })
    .catch(() => {
      loading.value = false
    })
}

/**
 * 页面加载时
 */
onMounted(() => {
  handelGetPost()
})
</script>

<template>
  <div class="app w-full h-screen bg-base-200">
    <!-- 模态框 -->
    <dialog :open="visible" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box bg-base-100 shadow-xl">
        <h3 class="font-bold text-lg text-neutral-700">发布新帖子</h3>
        <div class="divider mt-2 mb-4"></div>
        <div class="flex flex-col gap-4">
          <div class="form-control w-full">
            <div class="flex justify-between items-center">
              <label class="label-text text-neutral-600">标题</label>
              <span class="label-text-alt text-neutral-500">{{ postTitle.length }}/50</span>
            </div>
            <input
              v-model="postTitle"
              type="text"
              placeholder="请输入标题"
              class="input input-bordered w-full focus:outline-neutral-400 mt-1"
              maxlength="50"
            />
          </div>
          <div class="form-control w-full">
            <div class="flex justify-between items-center">
              <label class="label-text text-neutral-600">内容</label>
              <span class="label-text-alt text-neutral-500">{{ postContent.length }}/500</span>
            </div>
            <textarea
              v-model="postContent"
              class="textarea textarea-bordered focus:outline-neutral-400 h-36 mt-1"
              placeholder="请输入内容"
              maxlength="500"
            ></textarea>
          </div>
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost text-neutral-600" @click="handleCancel">取消</button>
          <button class="btn btn-neutral" @click="handleBeforeOk">
            <Pencil
              theme="outline"
              size="18"
              fill="currentColor"
              strokeLinejoin="miter"
              class="mr-1"
            />
            发布
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="handleCancel">关闭</button>
      </form>
    </dialog>

    <div class="flex flex-col h-screen">
      <!-- 导航栏 -->
      <div class="navbar bg-base-100 shadow-lg sticky top-0 z-10">
        <div class="navbar-start">
          <a class="btn btn-ghost text-xl font-bold text-neutral-700" @click="testMessage()">
            <span class="text-neutral-900">X</span>CAMP 校园墙
          </a>
        </div>
        <div class="navbar-end">
          <button class="btn btn-ghost btn-circle hover:bg-base-200 mr-4" @click="handleClick">
            <Pencil theme="outline" size="18" fill="#555" strokeLinejoin="miter" />
          </button>
          <!-- 头像 -->
          <div class="dropdown dropdown-end">
            <div class="avatar" tabindex="0" role="button">
              <div class="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  alt="用户头像"
                />
              </div>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content menu menu-sm bg-base-100 rounded-box z-50 w-48 p-2 shadow-xl mt-2"
            >
              <li>
                <a class="text-base-content hover:bg-base-200" @click="router.push('/profile')">
                  <User theme="outline" size="18" fill="currentColor" strokeLinejoin="miter" />
                  个人资料
                </a>
              </li>
              <li>
                <a class="text-base-content hover:bg-base-200" @click="handleLogout">
                  <Logout theme="outline" size="18" fill="currentColor" strokeLinejoin="miter" />
                  退出登录
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-3xl mx-auto">
          <!-- 加载状态 -->
          <div v-if="loading" class="flex justify-center items-center h-48">
            <span class="loading loading-spinner loading-lg text-neutral-500"></span>
          </div>

          <!-- 帖子列表 -->
          <div v-else>
            <div v-if="posts.length === 0" class="card bg-base-100 shadow-md p-8 text-center">
              <div class="text-lg text-neutral-700">暂无帖子</div>
              <button class="btn btn-neutral mt-4" @click="handleClick">发布第一条帖子</button>
            </div>

            <div
              v-for="post in posts"
              :key="post.postId"
              class="card bg-base-100 hover:shadow-xl transition-shadow duration-300 mb-6 overflow-hidden cursor-pointer"
              @click="router.push(`/post/${post.postId}`)"
            >
              <div class="card-body">
                <div class="flex justify-between items-start">
                  <h2 class="card-title text-neutral-800">{{ post.postTitle }}</h2>
                  <div class="badge badge-ghost text-neutral-600">{{ post.authorName }}</div>
                </div>
                <p class="my-4 text-neutral-700">{{ post.postText }}</p>
                <div class="divider my-2"></div>
                <div class="flex justify-between items-center">
                  <div class="text-xs text-neutral-500">{{ formatDateTime(post.createTime) }}</div>
                  <div class="flex gap-6 pointer-events-none">
                    <div class="flex items-center gap-1 tooltip" data-tip="浏览量">
                      <PreviewOpen
                        theme="outline"
                        size="16"
                        class="text-neutral-500"
                        strokeLinejoin="miter"
                      />
                      <span class="text-neutral-600">{{ post.viewCount }}</span>
                    </div>
                    <div class="flex items-center gap-1 tooltip" data-tip="点赞">
                      <Like
                        v-if="isPostLiked(post.postId)"
                        theme="filled"
                        size="16"
                        class="text-red-500"
                        strokeLinejoin="miter"
                      />
                      <Like
                        v-else
                        theme="outline"
                        size="16"
                        class="text-neutral-500"
                        strokeLinejoin="miter"
                      />
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
          </div>
        </div>
      </div>

      <!-- 页脚 -->
      <footer
        class="footer footer-center p-4 bg-base-100 text-base-content/60 border-t border-base-200"
      >
        <div>
          <p>Copyright © 2024 - XCAMP 校园墙</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped></style>
