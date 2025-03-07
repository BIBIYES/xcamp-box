<script setup>
import { useRouter } from 'vue-router'
import { Logout, Pencil, User } from '@icon-park/vue-next'
import { useUserStore } from '@/stores/user'
import message from '@/plugins/message'
import { getAvatarUrl } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

// 退出登录
const handleLogout = () => {
  userStore.clearUserInfo()
  router.push('/login')
}

// 测试消息
const testMessage = () => {
  console.log('testMessage')
  message.info('欢迎使用xcamp 校园墙')
}

// 发帖按钮点击
const handlePostClick = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  emit('openPostForm')
}

const emit = defineEmits(['openPostForm'])
</script>

<template>
  <div class="navbar bg-base-100 shadow-lg sticky top-0 z-10">
    <div class="navbar-start">
      <a class="btn btn-ghost text-xl font-bold text-neutral-700" @click="testMessage()">
        <span class="text-neutral-900">X</span>CAMP 校园墙
      </a>
    </div>
    <div class="navbar-end">
      <button class="btn btn-ghost btn-circle hover:bg-base-200 mr-4" @click="handlePostClick">
        <Pencil theme="outline" size="18" fill="#555" strokeLinejoin="miter" />
      </button>
      <!-- 头像 -->
      <div class="dropdown dropdown-end">
        <div class="avatar" tabindex="0" role="button">
          <div class="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img :src="getAvatarUrl(userStore.email)" alt="用户头像" />
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
</template>