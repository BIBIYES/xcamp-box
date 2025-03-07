<script setup>
import { ref } from 'vue'

import NavBar from '@/components/NavBar.vue'
import PostForm from '@/components/PostForm.vue'
import PostList from '@/components/PostList.vue'
import Footer from '@/components/FooterBar.vue'

// 发送帖子模态框
const visible = ref(false)
const postListRef = ref(null)

// 打开发帖模态框
const handleOpenPostForm = () => {
  visible.value = true
}

// 关闭模态框
const handleClosePostForm = () => {
  visible.value = false
}

// 发帖成功后刷新列表
const handlePostSuccess = () => {
  if (postListRef.value) {
    postListRef.value.fetchPosts()
  }
}
</script>

<template>
  <div class="app w-full h-screen bg-base-200">
    <!-- 发帖表单模态框 -->
    <dialog :open="visible" class="modal modal-bottom sm:modal-middle">
      <PostForm @close="handleClosePostForm" @postSuccess="handlePostSuccess" />
      <form method="dialog" class="modal-backdrop">
        <button @click="handleClosePostForm">关闭</button>
      </form>
    </dialog>

    <div class="flex flex-col h-screen">
      <!-- 导航栏 -->
      <NavBar @openPostForm="handleOpenPostForm" />

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8">
        <PostList ref="postListRef" @newPost="handleOpenPostForm" />
      </div>

      <!-- 页脚 -->
      <Footer />
    </div>
  </div>
</template>

<style scoped></style>
