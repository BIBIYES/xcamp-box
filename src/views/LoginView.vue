<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, register, sendVerificationCode } from '@/api/user'
import { User, Lock, Mail } from '@icon-park/vue-next'
import { useUserStore } from '@/stores/user'
import message from '@/plugins/message'
const router = useRouter()
const userStore = useUserStore()

// 表单数据
const activeTab = ref('login')
const email = ref('')
const password = ref('')
const verifyPassword = ref('')
const verificationCode = ref('')
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

// 切换标签页时重置表单
const handleTabChange = (tab) => {
  activeTab.value = tab
  email.value = ''
  password.value = ''
  verificationCode.value = ''
}

// 发送验证码
const handleSendCode = async () => {
  if (!email.value || !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(email.value)) {
    message.warning('请输入正确的邮箱地址')
    return
  }

  try {
    sendingCode.value = true
    const res = await sendVerificationCode({ email: email.value })
    if (res.code !== 200) {
      message.error(res.message)
      return
    }
    message.success(res.message)
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.log(error)
    message.error('验证码发送失败')
  } finally {
    sendingCode.value = false
  }
}

// 登录
const handleLogin = async () => {
  if (!email.value || !password.value) {
    message.warning('请填写完整信息', { position: 'top-center' })
    return
  }

  try {
    loading.value = true
    const res = await login({ email: email.value, password: password.value })
    if (res.code === 200) {
      userStore.setUserInfo(res)
      message.success('登录成功')
      router.push('/')
    } else {
      message.error(res.message || '登录失败')
    }
  } catch (error) {
    message.error('登录失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 注册
const handleRegister = async () => {
  if (!email.value || !password.value || !verificationCode.value || !verifyPassword.value) {
    message.warning('请填写完整信息')
    return
  }
  if (password.value !== verifyPassword.value) {
    message.warning('两次密码不一致')
    return
  }

  try {
    loading.value = true
    await register({
      email: email.value,
      password: password.value,
      verificationCode: verificationCode.value,
    })
    message.success('注册成功，请登录')
    handleTabChange('login')
  } catch (error) {
    message.error('注册失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="app w-full h-screen bg-base-200 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <!-- 标题 -->
          <h2 class="text-center text-2xl font-bold mb-2">
            <span class="text-primary">X</span>CAMP 校园墙
          </h2>
          <p class="text-center text-base-content/60 mb-6">欢迎来到XCAMP校园社区</p>

          <!-- 标签页 -->
          <div class="tabs tabs-boxed bg-base-200 p-1 mb-6">
            <a
              class="tab flex-1 transition-colors duration-200"
              :class="{ 'tab-active bg-base-100 shadow-sm': activeTab === 'login' }"
              @click="handleTabChange('login')"
            >
              登录
            </a>
            <a
              class="tab flex-1 transition-colors duration-200"
              :class="{ 'tab-active bg-base-100 shadow-sm': activeTab === 'register' }"
              @click="handleTabChange('register')"
            >
              注册
            </a>
          </div>

          <!-- 登录表单 -->
          <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">邮箱</span>
              </label>
              <div class="relative">
                <Mail
                  theme="outline"
                  size="18"
                  fill="#999"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <input
                  v-model="email"
                  type="email"
                  placeholder="请输入邮箱"
                  class="input input-bordered w-full pl-10 focus:outline-neutral-400"
                  required
                />
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">密码</span>
              </label>
              <div class="relative">
                <Lock
                  theme="outline"
                  size="18"
                  fill="#999"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <input
                  v-model="password"
                  type="password"
                  placeholder="请输入密码"
                  class="input input-bordered w-full pl-10 focus:outline-neutral-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-neutral w-full"
              :class="{ loading: loading }"
              :disabled="loading"
            >
              <User v-if="!loading" theme="outline" size="18" fill="currentColor" class="mr-1" />
              登录
            </button>
          </form>

          <!-- 注册表单 -->
          <form v-else @submit.prevent="handleRegister" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">邮箱</span>
              </label>
              <div class="relative">
                <Mail
                  theme="outline"
                  size="18"
                  fill="#999"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <input
                  v-model="email"
                  type="email"
                  placeholder="请输入邮箱"
                  class="input input-bordered w-full pl-10 focus:outline-neutral-400"
                  required
                />
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">验证码</span>
              </label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <Lock
                    theme="outline"
                    size="18"
                    fill="#999"
                    class="absolute left-3 top-1/2 transform -translate-y-1/2"
                  />
                  <input
                    v-model="verificationCode"
                    type="text"
                    placeholder="请输入验证码"
                    class="input input-bordered w-full pl-10 focus:outline-neutral-400"
                    required
                  />
                </div>
                <button
                  type="button"
                  class="btn btn-neutral btn-outline"
                  :class="{ loading: sendingCode }"
                  :disabled="sendingCode || countdown > 0"
                  @click="handleSendCode"
                >
                  {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </button>
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">密码</span>
              </label>
              <div class="relative">
                <Lock
                  theme="outline"
                  size="18"
                  fill="#999"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <input
                  v-model="password"
                  type="password"
                  placeholder="请输入密码"
                  class="input input-bordered w-full pl-10 focus:outline-neutral-400"
                  required
                />
              </div>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">确认密码</span>
              </label>
              <div class="relative">
                <Lock
                  theme="outline"
                  size="18"
                  fill="#999"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <input
                  v-model="verifyPassword"
                  type="password"
                  placeholder="请输入密码"
                  class="input input-bordered w-full pl-10 focus:outline-neutral-400"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              class="btn btn-neutral w-full"
              :class="{ loading: loading }"
              :disabled="loading"
            >
              <User v-if="!loading" theme="outline" size="18" fill="currentColor" class="mr-1" />
              注册
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  transition: all 0.3s ease;
}
</style>
