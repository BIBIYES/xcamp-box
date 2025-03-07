<script setup>
import { ref } from 'vue'
import { UploadOne, Pencil } from '@icon-park/vue-next'
import message from '@/plugins/message'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import { uploadCoverImage, uploadAlbumImages } from '@/api/upload'
import { releasePost } from '@/api/post'

const emit = defineEmits(['close', 'postSuccess'])

// 表单数据
const postTitle = ref('')
const postContent = ref('')
const albumImages = ref([])
const uploading = ref(false)

// 图片裁剪相关
const cropperRef = ref(null)
const option = ref({
  img: '',
  size: 1,
  outputType: 'jpeg',
  autoCrop: true,
  fixedBox: true,
  centerBox: true,
  infoTrue: true,
  full: false,
})

// 选择封面图片
const selectImage = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (!/\.(jpg|jpeg|png|gif)$/i.test(file.name)) {
    message.warning('请选择图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    option.value.img = e.target.result
  }
  reader.readAsDataURL(file)
}

// 选择相册图片
const selectAlbumImages = (e) => {
  const files = Array.from(e.target.files)
  if (files.length === 0) return

  if (albumImages.value.length + files.length > 9) {
    message.warning('最多只能上传9张图片')
    return
  }

  files.forEach((file) => {
    if (!/\.(jpg|jpeg|png|gif)$/i.test(file.name)) {
      message.warning('请选择图片文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      albumImages.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

// 删除相册图片
const removeAlbumImage = (index) => {
  albumImages.value.splice(index, 1)
}

// 获取裁剪后的图片
const getCropData = () => {
  return new Promise((resolve) => {
    cropperRef.value.getCropData((data) => {
      resolve(data)
    })
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!postTitle.value.trim() || !postContent.value.trim()) {
    message.warning('请填写标题和内容')
    return false
  }

  try {
    uploading.value = true
    let coverImageUrl = null
    let albumImageUrls = []

    // 上传封面图片
    if (option.value.img) {
      const coverImageData = await getCropData()
      const coverRes = await uploadCoverImage(coverImageData)
      if (coverRes.code === 200) {
        coverImageUrl = coverRes.data.imageUrl
      } else {
        throw new Error('封面图片上传失败')
      }
    }

    // 上传相册图片
    if (albumImages.value.length > 0) {
      const albumRes = await uploadAlbumImages(albumImages.value)
      if (albumRes.code === 200) {
        albumImageUrls = albumRes.data.imageUrls
      } else {
        throw new Error('相册图片上传失败')
      }
    }

    // 发布帖子
    const postData = {
      postTitle: postTitle.value.trim(),
      postText: postContent.value.trim(),
      coverImage: coverImageUrl,
      albumImages: albumImageUrls,
    }

    const res = await releasePost(postData)
    if (res.code === 200) {
      message.success('发布成功')
      emit('postSuccess')
      emit('close')
      return true
    } else {
      throw new Error('发布失败')
    }
  } catch (error) {
    console.error(error)
    message.error(error.message || '发布失败，请稍后再试')
    return false
  } finally {
    uploading.value = false
  }
}

// 取消发布
const handleCancel = () => {
  emit('close')
}

// 重置表单
const resetForm = () => {
  postTitle.value = ''
  postContent.value = ''
  option.value.img = ''
  albumImages.value = []
}

// 暴露方法给父组件
defineExpose({
  resetForm,
})
</script>

<template>
  <div class="modal-box bg-base-100 shadow-xl">
    <h3 class="font-bold text-lg text-neutral-700">发布新帖子</h3>
    <div class="divider mt-2 mb-4"></div>
    <div class="flex flex-col gap-4">
      <!-- 图片上传和裁剪区域 -->
      <div class="form-control w-full">
        <div class="flex justify-between items-center mb-2">
          <label class="label-text text-neutral-600">封面图片</label>
          <label class="btn btn-sm btn-outline">
            <UploadOne theme="outline" size="16" fill="currentColor" class="mr-1" />
            选择图片
            <input type="file" class="hidden" accept="image/*" @change="selectImage" />
          </label>
        </div>
        <div v-if="option.img" class="w-full h-64 border rounded-lg overflow-hidden">
          <VueCropper
            ref="cropperRef"
            :img="option.img"
            :outputSize="option.size"
            :outputType="option.outputType"
            :autoCrop="option.autoCrop"
            :fixedBox="option.fixedBox"
            :centerBox="option.centerBox"
            :infoTrue="option.infoTrue"
            :full="option.full"
            :fixedNumber="[16, 9]"
            :canMoveBox="false"
            :canMove="true"
          />
        </div>
        <div
          v-else
          class="w-full h-64 border rounded-lg flex items-center justify-center bg-base-200"
        >
          <div class="text-neutral-500 text- flex justify-center items-center space-x-1">
            <UploadOne theme="outline" size="32" fill="currentColor" class="mb-2" />
            <p class="text-md">点击上方按钮选择封面图片</p>
          </div>
        </div>
      </div>

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
      <div class="form-control w-full">
        <div class="flex justify-between items-center mb-2">
          <label class="label-text text-neutral-600">图集</label>
          <label
            class="btn btn-sm btn-outline"
            :class="{ 'btn-disabled': albumImages.length >= 9 }"
          >
            <UploadOne theme="outline" size="16" fill="currentColor" class="mr-1" />
            选择图片
            <input
              type="file"
              class="hidden"
              accept="image/*"
              multiple
              @change="selectAlbumImages"
              :disabled="albumImages.length >= 9"
            />
          </label>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="(image, index) in albumImages"
            :key="index"
            class="relative aspect-square border rounded-lg overflow-hidden"
          >
            <img :src="image" class="w-full h-full object-cover" />
            <button
              class="btn btn-circle btn-sm btn-error absolute top-0 right-0"
              @click.stop="removeAlbumImage(index)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div
            v-if="albumImages.length < 9"
            class="aspect-square border rounded-lg flex items-center justify-center bg-base-200"
          >
            <div class="text-neutral-500 text-center">
              <p>{{ albumImages.length }}/9</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-action">
      <button class="btn btn-ghost text-neutral-600" @click="handleCancel" :disabled="uploading">
        取消
      </button>
      <button class="btn btn-neutral" @click="handleSubmit" :disabled="uploading">
        <span v-if="uploading" class="loading loading-spinner loading-sm"></span>
        <Pencil
          v-else
          theme="outline"
          size="18"
          fill="currentColor"
          strokeLinejoin="miter"
          class="mr-1"
        />
        {{ uploading ? '发布中...' : '发布' }}
      </button>
    </div>
  </div>
</template>
