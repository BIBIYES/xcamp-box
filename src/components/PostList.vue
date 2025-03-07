<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllPost, getUserLikedPosts } from '@/api/post'
import { useUserStore } from '@/stores/user'
import PostCard from '@/components/PostCard.vue'

const router = useRouter()
const userStore = useUserStore()

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
      likedPostIds.value = res.data.map((post) => post.postId)
    }
  } catch (error) {
    console.error('获取点赞帖子失败：', error)
  }
}

// 获取帖子列表
const fetchPosts = () => {
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

// 处理帖子点击
const handlePostClick = (postId) => {
  router.push(`/post/${postId}`)
}

// 处理发布新帖子按钮点击
const handleNewPost = () => {
  emit('newPost')
}

const emit = defineEmits(['newPost'])

// 暴露方法给父组件
defineExpose({
  fetchPosts
})

// 页面加载时获取数据
onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center h-48">
      <span class="loading loading-spinner loading-lg text-neutral-500"></span>
    </div>

    <!-- 帖子列表 -->
    <div v-else>
      <div v-if="posts.length === 0" class="card bg-base-100 shadow-md p-8 text-center">
        <div class="text-lg text-neutral-700">暂无帖子</div>
        <button class="btn btn-neutral mt-4" @click="handleNewPost">发布第一条帖子</button>
      </div>

      <PostCard 
        v-for="post in posts" 
        :key="post.postId" 
        :post="post" 
        :is-liked="isPostLiked(post.postId)" 
        @click="handlePostClick"
      />
    </div>
  </div>
</template>