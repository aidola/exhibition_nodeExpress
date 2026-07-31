<template>
  <div class="cleanup-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>清理未使用图片</span>
        </div>
      </template>

      <div class="cleanup-content">
        <el-alert
          title="说明"
          type="info"
          :closable="false"
          show-icon
        >
          <p>此功能将扫描 <code>server/uploads/</code> 目录，找出所有未被数据库（头像、展会封面、活动封面）引用的图片文件并删除，释放磁盘空间。</p>
        </el-alert>

        <div class="action-area">
          <el-button type="danger" :loading="loading" @click="handleCleanup">
            <el-icon><Delete /></el-icon> 一键清理未使用图片
          </el-button>
          <span class="tip">建议定期执行，避免无用图片积累</span>
        </div>

        <el-divider v-if="result" />

        <el-descriptions v-if="result" title="清理结果" :column="3" border>
          <el-descriptions-item label="扫描文件总数">{{ result.total }}</el-descriptions-item>
          <el-descriptions-item label="已删除">{{ result.deleted }}</el-descriptions-item>
          <el-descriptions-item label="已保留">{{ result.kept }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="result && result.deletedFiles.length > 0" style="margin-top: 16px">
          <el-collapse>
            <el-collapse-item :title="`已删除文件列表 (${result.deletedFiles.length})`">
              <el-table :data="result.deletedFiles.map((f, i) => ({ index: i + 1, name: f }))" size="small" max-height="300">
                <el-table-column prop="index" label="#" width="60" />
                <el-table-column prop="name" label="文件名" />
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cleanupUnusedImages } from '@/api'

const loading = ref(false)
const result = ref(null)

const handleCleanup = () => {
  ElMessageBox.confirm(
    '此操作将扫描 uploads 目录，删除所有未被数据库引用的图片文件，释放磁盘空间。确定继续？',
    '清理未使用图片',
    { type: 'warning', confirmButtonText: '确定清理', cancelButtonText: '取消' }
  ).then(async () => {
    loading.value = true
    try {
      const res = await cleanupUnusedImages()
      const data = res.data.data
      result.value = data
      if (data.deleted === 0) {
        ElMessage.success('没有发现未使用的图片，无需清理')
      } else {
        ElMessage.success(`清理完成！共删除 ${data.deleted} 个未使用的文件，保留 ${data.kept} 个文件`)
      }
    } catch {}
    loading.value = false
  }).catch(() => {})
}
</script>

<style scoped>
.cleanup-page {
  max-width: 800px;
}

.cleanup-content p {
  margin: 0;
  line-height: 1.8;
}

.action-area {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.tip {
  color: #999;
  font-size: 13px;
}
</style>
