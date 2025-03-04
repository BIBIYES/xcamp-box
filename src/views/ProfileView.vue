<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { getMyPosts, deletePost, updatePost } from '@/api/profile'
import { getUserLikedPosts } from '@/api/post'
import { formatDateTime } from '@/utils/date'
import { PreviewOpen, Like, Edit, Delete, Left } from '@icon-park/vue-next'
import message from '@/plugins/message'
import { useRouter } from 'vue-router'
import { updateUsername } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

// 返回上一页
const goBack = () => {
  router.back()
}

// 用户发布的帖子列表
const posts = ref([])
const loading = ref(true)

// 获取用户发布的帖子
const fetchMyPosts = async () => {
  loading.value = true
  try {
    const res = await getMyPosts()
    posts.value = res.data
    // 更新统计数据
    userStats.value.totalPosts = posts.value.length
    userStats.value.totalLikes = posts.value.reduce((sum, post) => sum + post.likeCount, 0)
  } catch (error) {
    console.error('获取帖子失败：', error)
  } finally {
    loading.value = false
  }
}

// 用户统计数据（模拟数据）
const userStats = ref({
  totalPosts: 0,
  totalLikes: 0,
  joinDate: '2024-01-01',
  lastActive: new Date().toISOString(),
})

// 删除确认对话框
const deleteDialog = ref(false)
const currentPostId = ref(null)

// 打开删除确认对话框
const openDeleteDialog = (postId) => {
  currentPostId.value = postId
  deleteDialog.value = true
}

// 确认删除帖子
const confirmDelete = async () => {
  try {
    await deletePost(currentPostId.value)
    message.success('删除成功')
    await fetchMyPosts()
  } catch (error) {
    console.error('删除失败：', error)
    message.error('删除失败')
  } finally {
    deleteDialog.value = false
    currentPostId.value = null
  }
}

// 编辑表单相关
const editDialog = ref(false)
const editForm = ref({
  postId: '',
  postTitle: '',
  postText: '',
})

// 打开编辑表单
const openEditDialog = (post) => {
  editForm.value = {
    postId: post.postId,
    postTitle: post.postTitle,
    postText: post.postText,
  }
  editDialog.value = true
}

// 提交编辑表单
const submitEdit = async () => {
  if (!editForm.value.postTitle.trim() || !editForm.value.postText.trim()) {
    message.warning('标题和内容不能为空')
    return
  }
  try {
    await updatePost(editForm.value)
    message.success('保存成功')
    await fetchMyPosts()
    editDialog.value = false
  } catch (error) {
    console.error('更新失败：', error)
    message.error('保存失败')
  }
}

// 新增状态管理
const activeTab = ref('all')

// 获取用户点赞的帖子
const likedPosts = ref([])
const likedLoading = ref(false)

const fetchLikedPosts = async () => {
  likedLoading.value = true
  try {
    const res = await getUserLikedPosts(userStore.userId)
    likedPosts.value = res.data
  } catch (error) {
    console.error('获取点赞帖子失败：', error)
  } finally {
    likedLoading.value = false
  }
}

// 检查帖子是否被点赞
const isPostLiked = (postId) => {
  return likedPosts.value.some((post) => post.postId === postId)
}

// 页面加载时获取数据
onMounted(() => {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    router.push('/login')
    return
  }
  fetchMyPosts()
  fetchLikedPosts()
})

// 修改用户名相关
const usernameDialog = ref(false)
const newUsername = ref('')

// 打开修改用户名对话框
const openUsernameDialog = () => {
  newUsername.value = userStore.username
  usernameDialog.value = true
}

// 提交修改用户名
const submitUsername = async () => {
  if (!newUsername.value.trim()) {
    message.warning('用户名不能为空')
    return
  }
  try {
    const res = await updateUsername({ username: newUsername.value.trim() })
    if (res.code != 200) {
      message.warning(res.message)
      return
    }
    message.success('修改成功')
    userStore.setUsername(newUsername.value.trim())
    usernameDialog.value = false
  } catch (error) {
    console.error('修改失败：', error)
    message.error('修改失败')
  }
}
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

    <!-- 个人信息卡片 -->
    <div class="max-w-4xl mx-auto pt-2 px-4">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex flex-col md:flex-row items-center gap-6">
            <!-- 头像区域 -->
            <div class="avatar">
              <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  alt="用户头像"
                />
              </div>
            </div>

            <!-- 用户信息区域 -->
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h2 class="text-2xl font-bold text-neutral-800">{{ userStore.username }}</h2>
                <button class="btn btn-ghost btn-sm" @click="openUsernameDialog">
                  <Edit theme="outline" size="18" class="text-neutral-500" />
                </button>
              </div>
              <p class="text-neutral-500 mt-1">{{ userStore.email }}</p>
              <div class="stats stats-horizontal shadow mt-4">
                <div class="stat place-items-center">
                  <div class="stat-title">发帖</div>
                  <div class="stat-value text-primary">{{ userStats.totalPosts }}</div>
                </div>
                <div class="stat place-items-center">
                  <div class="stat-title">获赞</div>
                  <div class="stat-value text-secondary">{{ userStats.totalLikes }}</div>
                </div>
              </div>
            </div>

            <!-- 其他信息 -->
            <div class="text-sm text-neutral-500">
              <p>加入时间：{{ formatDateTime(userStats.joinDate) }}</p>
              <p class="mt-1">最后活跃：{{ formatDateTime(userStats.lastActive) }}</p>
            </div>
          </div>
        </div>

        <!-- 喜欢的帖子列表 -->
        <div v-if="activeTab === 'liked' && !likedLoading">
          <div v-if="likedPosts.length === 0" class="card bg-base-100 shadow-md p-8 text-center">
            <div class="text-lg text-neutral-700">暂未点赞任何帖子</div>
          </div>

          <div
            v-for="post in likedPosts"
            :key="post.postId"
            class="card bg-base-100 hover:shadow-xl transition-shadow duration-300 mb-6 cursor-pointer"
            @click="router.push(`/post/${post.postId}`)"
          ></div>
        </div>
      </div>

      <!-- 我的帖子列表 -->
      <div class="mt-8">
        <h3 class="text-xl font-bold text-neutral-700 mb-4">
          {{ activeTab === 'all' ? '我的帖子' : '我喜欢的帖子' }}
        </h3>

        <!-- Tab切换 -->
        <div class="tabs tabs-boxed bg-base-100 mb-4">
          <button
            class="tab"
            :class="{ 'tab-active': activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            全部帖子
          </button>
          <button
            class="tab"
            :class="{ 'tab-active': activeTab === 'liked' }"
            @click="activeTab = 'liked'"
          >
            我喜欢的
          </button>
        </div>

        <!-- 全部帖子加载状态 -->
        <div v-if="activeTab === 'all' && loading" class="flex justify-center items-center h-48">
          <span class="loading loading-spinner loading-lg text-neutral-500"></span>
        </div>

        <!-- 喜欢的帖子加载状态 -->
        <div
          v-if="activeTab === 'liked' && likedLoading"
          class="flex justify-center items-center h-48"
        >
          <span class="loading loading-spinner loading-lg text-neutral-500"></span>
        </div>

        <!-- 全部帖子列表 -->
        <div v-if="activeTab === 'all' && !loading">
          <div v-if="posts.length === 0" class="card bg-base-100 shadow-md p-8 text-center">
            <div class="text-lg text-neutral-700">暂未发布任何帖子</div>
          </div>

          <div
            v-for="post in posts"
            :key="post.postId"
            class="card bg-base-100 hover:shadow-xl transition-shadow duration-300 mb-6"
          >
            <div class="card-body">
              <div class="flex justify-between items-start">
                <h2 class="card-title text-neutral-800">{{ post.postTitle }}</h2>
                <div class="flex gap-2">
                  <button class="btn btn-ghost btn-sm" @click="openEditDialog(post)">
                    <Edit theme="outline" size="18" class="text-neutral-500" />
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="openDeleteDialog(post.postId)">
                    <Delete theme="outline" size="18" class="text-error" />
                  </button>
                </div>
              </div>
              <p class="my-4 text-neutral-700">{{ post.postText }}</p>
              <div class="divider my-2"></div>
              <div class="flex justify-between items-center">
                <div class="text-xs text-neutral-500">{{ formatDateTime(post.createTime) }}</div>
                <div class="flex gap-6">
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
                      fill="currentColor"
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

        <!-- 喜欢的帖子列表 -->
        <div v-if="activeTab === 'liked' && !likedLoading">
          <div v-if="likedPosts.length === 0" class="card bg-base-100 shadow-md p-8 text-center">
            <div class="text-lg text-neutral-700">暂未点赞任何帖子</div>
          </div>

          <div
            v-for="post in likedPosts"
            :key="post.postId"
            class="card bg-base-100 hover:shadow-xl transition-shadow duration-300 mb-6 cursor-pointer"
            @click="router.push(`/post/${post.postId}`)"
          >
            <div class="card-body">
              <div class="flex justify-between items-start">
                <h2 class="card-title text-neutral-800">{{ post.postTitle }}</h2>
              </div>
              <p class="my-4 text-neutral-700">{{ post.postText }}</p>
              <div class="divider my-2"></div>
              <div class="flex justify-between items-center">
                <div class="text-xs text-neutral-500">{{ formatDateTime(post.createTime) }}</div>
                <div class="flex gap-6">
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
                      fill="currentColor"
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

    <!-- 删除确认对话框 -->
    <dialog :open="deleteDialog" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <h3 class="font-bold text-lg">确认删除</h3>
        <p class="py-4">确定要删除这篇文章吗？此操作无法撤销。</p>
        <div class="modal-action">
          <button class="btn" @click="deleteDialog = false">取消</button>
          <button class="btn btn-error" @click="confirmDelete">删除</button>
        </div>
      </div>
    </dialog>

    <!-- 编辑表单对话框 -->
    <dialog :open="editDialog" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">编辑帖子</h3>
        <div class="form-control w-full">
          <input
            type="text"
            v-model="editForm.postTitle"
            class="input input-bordered w-full text-base"
            placeholder="请输入标题"
            maxlength="50"
          />
          <div class="text-right text-xs text-neutral-500 mt-1">
            {{ editForm.postTitle.length }}/50
          </div>
        </div>
        <div class="form-control w-full mt-4">
          <textarea
            v-model="editForm.postText"
            class="textarea textarea-bordered h-32 text-base"
            placeholder="请输入内容"
            maxlength="500"
          ></textarea>
          <div class="text-right text-xs text-neutral-500 mt-1">
            {{ editForm.postText.length }}/500
          </div>
        </div>
        <div class="modal-action">
          <button class="btn" @click="editDialog = false">取消</button>
          <button class="btn btn-primary" @click="submitEdit">保存</button>
        </div>

        <!-- 喜欢的帖子列表 -->
        <div v-if="activeTab === 'liked' && !likedLoading">
          <div v-if="likedPosts.length === 0" class="card bg-base-100 shadow-md p-8 text-center">
            <div class="text-lg text-neutral-700">暂未点赞任何帖子</div>
          </div>

          <div
            v-for="post in likedPosts"
            :key="post.postId"
            class="card bg-base-100 hover:shadow-xl transition-shadow duration-300 mb-6 cursor-pointer"
            @click="router.push(`/post/${post.postId}`)"
          >
            <div class="card-body">
              <div class="flex justify-between items-start">
                <h2 class="card-title text-neutral-800">{{ post.postTitle }}</h2>
              </div>
              <p class="my-4 text-neutral-700">{{ post.postText }}</p>
              <div class="divider my-2"></div>
              <div class="flex justify-between items-center">
                <div class="text-xs text-neutral-500">{{ formatDateTime(post.createTime) }}</div>
                <div class="flex gap-6">
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
                      theme="outline"
                      size="16"
                      class="text-red-500"
                      strokeLinejoin="miter"
                      fill="currentColor"
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
      <form method="dialog" class="modal-backdrop">
        <button @click="editDialog = false">关闭</button>
      </form>
    </dialog>

    <!-- 修改用户名对话框 -->
    <dialog :open="usernameDialog" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">修改用户名</h3>
        <div class="form-control w-full">
          <input
            type="text"
            v-model="newUsername"
            class="input input-bordered w-full text-base"
            placeholder="请输入新用户名"
            maxlength="20"
          />
          <div class="text-right text-xs text-neutral-500 mt-1">{{ newUsername.length }}/20</div>
        </div>
        <div class="modal-action">
          <button class="btn" @click="usernameDialog = false">取消</button>
          <button class="btn btn-primary" @click="submitUsername">保存</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="usernameDialog = false">关闭</button>
      </form>
    </dialog>
  </div>
</template>
