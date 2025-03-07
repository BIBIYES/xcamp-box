<script setup>
import { Like, PreviewOpen } from '@icon-park/vue-next'
import { formatDateTime } from '@/utils/date'
import MarkdownView from '@/components/MarkdownView.vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  isLiked: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', props.post.postId)
}
</script>

<template>
  <div
    class="card bg-base-100 hover:shadow-xl transition-shadow duration-300 mb-6 overflow-hidden cursor-pointer h-40"
    @click="handleClick"
  >
    <div class="card-body">
      <div class="flex justify-between items-start">
        <h2 class="card-title text-neutral-800">{{ post.postTitle }}</h2>
        <div class="badge badge-ghost text-neutral-600">{{ post.authorName }}</div>
      </div>
      <MarkdownView :content="post.postText" />
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
              v-if="isLiked"
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
</template>