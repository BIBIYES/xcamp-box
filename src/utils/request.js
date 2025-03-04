import axios from 'axios'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: '/api',
  timeout: 100000,
  headers: { 'X-Custom-Header': 'foobar' },
})

// 添加请求拦截器
request.interceptors.request.use(
  function (config) {
    // 从store中获取token
    const userStore = useUserStore()
    const token = userStore.token

    // 如果有token则添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

// 添加响应拦截器
request.interceptors.response.use(
  function (response) {
    console.log(response.data)

    return response.data
  },
  function (error) {
    return Promise.reject(error)
  },
)

export default request
