<script setup>
import { marked } from 'marked'
import '@/assets/github-markdown.css'
const renderMarkdown = (content) => {
  return marked(content)
}

const { content } = defineProps({
  content: String,
})
</script>
<template>
  <div class="article-content markdown-body" v-html="renderMarkdown(content)"></div>
</template>
<style scoped>
@import 'github-markdown-css/github-markdown.css';
div {
  width: 100%;
  border-radius: 10px;
}
.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 15px;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
</style>
