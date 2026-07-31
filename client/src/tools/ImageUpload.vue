<template>
  <div class="image-upload-wrapper" :class="{ 'is-full': !showUploadBtn }">
    <el-upload
      v-model:file-list="innerFileList"
      :before-upload="beforeUpload"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      :on-change="handleChange"
      :auto-upload="false"
      list-type="picture-card"
      :limit="limit"
      :accept="accept"
      :multiple="limit > 1"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>
    <p v-if="tip" class="upload-tip">{{ tip }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadImage } from '@/api'

let uidCounter = 0
const genUid = () => `up-${Date.now()}-${++uidCounter}`

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: '',
  },
  limit: {
    type: Number,
    default: 1,
  },
  accept: {
    type: String,
    default: 'image/*',
  },
  tip: {
    type: String,
    default: '',
  },
  maxSize: {
    type: Number,
    default: 10,
  },
})

const emit = defineEmits(['update:modelValue'])

const innerFileList = ref([])
const isInternal = ref(false)
// 等待上传的原始 File 对象（选择文件后暂存，确认时才上传）
const pendingFiles = ref([])

// 是否单图模式
const isSingle = () => props.limit === 1

// 是否显示上传按钮（文件数未达到上限）
const showUploadBtn = computed(() => innerFileList.value.length < props.limit)

// 从 modelValue 构建 fileList（已有图片，status 为 success）
const buildFileList = (val) => {
  if (isSingle()) {
    return val && typeof val === 'string' && val.length > 0
      ? [{ name: 'image', url: val, uid: genUid(), status: 'success' }]
      : []
  }
  const urls = Array.isArray(val) ? val.filter(Boolean) : (val ? [val] : [])
  return urls.map((url, i) => ({ name: `image-${i}`, url, uid: genUid(), status: 'success' }))
}

// 外部 modelValue 变化 → 同步 fileList（跳过内部触发）
watch(() => props.modelValue, (val) => {
  if (isInternal.value) {
    isInternal.value = false
    return
  }
  innerFileList.value = buildFileList(val)
  pendingFiles.value = []
}, { immediate: true })

// 收集当前服务端 URL 并 emit
const emitChange = () => {
  const urls = innerFileList.value
    .map(f => f.url)
    .filter(url => url && typeof url === 'string' && !url.startsWith('blob:'))
  isInternal.value = true
  if (isSingle()) {
    emit('update:modelValue', urls[0] || '')
  } else {
    emit('update:modelValue', urls)
  }
}

// 用户选择文件：只展示本地预览，暂存原始 File 对象，不调用上传接口
const handleChange = (uploadFile) => {
  if (uploadFile.raw) {
    pendingFiles.value.push({ uid: uploadFile.uid, file: uploadFile.raw })
  }
}

// 前端校验
const beforeUpload = (file) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (file.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB！`)
    return false
  }
  return true
}

// 超出数量限制
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${props.limit} 张图片`)
}

// 移除文件时同步清理 pendingFiles
const handleRemove = (uploadFile) => {
  pendingFiles.value = pendingFiles.value.filter(f => f.uid !== uploadFile.uid)
}

// 对外暴露：父组件在确认时调用，执行真正的上传
const upload = async () => {
  if (pendingFiles.value.length === 0) {
    return
  }

  for (const { uid, file } of pendingFiles.value) {
    try {
      const res = await uploadImage(file)
      if (res.data.code === 200) {
        const serverUrl = res.data.data.url
        const item = innerFileList.value.find(f => f.uid === uid)
        if (item) {
          item.url = serverUrl
          item.status = 'success'
        }
      } else {
        const item = innerFileList.value.find(f => f.uid === uid)
        if (item) item.status = 'fail'
        ElMessage.error(res.data.message || '上传失败')
      }
    } catch {
      const item = innerFileList.value.find(f => f.uid === uid)
      if (item) item.status = 'fail'
    }
  }

  pendingFiles.value = []
  emitChange()
}

defineExpose({ upload })
</script>

<style scoped>
.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 文件数达到上限时，隐藏 el-upload 的上传触发按钮 */
.image-upload-wrapper.is-full :deep(.el-upload--picture-card) {
  display: none;
}

.upload-tip {
  margin-top: 12px;
  font-size: 12px;
  color: #999;
  text-align: center;
}
</style>
