import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const token = ref('')
  const userId = ref(null)
  const username = ref(null)
  const email = ref('')
  const isLoggedIn = ref(false)

  // 设置用户信息
  const setUserInfo = (data) => {
    token.value = data.message
    userId.value = data.data.userId
    username.value = data.data.username
    email.value = data.data.email
    isLoggedIn.value = true
  }

  // 更新用户名
  const setUsername = (newUsername) => {
    username.value = newUsername
  }

  // 清除用户信息
  const clearUserInfo = () => {
    token.value = ''
    userId.value = null
    username.value = null
    email.value = ''
    isLoggedIn.value = false
  }

  return {
    token,
    userId,
    username,
    email,
    isLoggedIn,
    setUserInfo,
    clearUserInfo,
    setUsername
  }
}, {
  persist: true
})