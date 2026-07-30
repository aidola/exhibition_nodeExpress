<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="报名活动">
          <el-select v-model="searchForm.event_id" placeholder="全部活动" clearable style="width: 200px" @change="handleSearch">
            <el-option v-for="e in eventOptions" :key="e.id" :label="e.title" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 120px" @change="handleSearch">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="160" show-overflow-tooltip />
        <el-table-column prop="company" label="公司" min-width="160" show-overflow-tooltip />
        <el-table-column prop="position" label="职位" width="100" />
        <el-table-column label="报名活动" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ row.event?.title || '-' }}</template>
        </el-table-column>
        <el-table-column label="报名时间" width="160">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button link type="success" size="small" @click="handleConfirm(row)">确认</el-button>
              <el-button link type="danger" size="small" @click="handleCancel(row)">取消</el-button>
            </template>
            <el-button link type="primary" size="small" @click="handleView(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-box">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="报名详情" width="600px">
      <template v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detailData.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ detailData.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="公司">{{ detailData.company || '-' }}</el-descriptions-item>
          <el-descriptions-item label="职位">{{ detailData.position || '-' }}</el-descriptions-item>
          <el-descriptions-item label="报名活动">{{ detailData.event?.title || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(detailData.status)">{{ getStatusText(detailData.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="报名时间">{{ formatTime(detailData.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailData.notes || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRegistrations, updateRegistration, getEvents } from '@/api'

const route = useRoute()
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({ page: 1, page_size: 10, total: 0 })
const searchForm = reactive({ event_id: '', status: '' })
const eventOptions = ref([])

const detailVisible = ref(false)
const detailData = ref(null)

onMounted(async () => {
  // 从URL参数获取默认筛选
  if (route.query.event_id) {
    searchForm.event_id = route.query.event_id
  }

  fetchData()

  // 获取活动列表用于筛选下拉
  try {
    const res = await getEvents({ page_size: 1000 })
    eventOptions.value = res.data.data.list
  } catch {}
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRegistrations({
      page: pagination.page,
      page_size: pagination.page_size,
      event_id: searchForm.event_id,
      status: searchForm.status,
    })
    tableData.value = res.data.data.list
    pagination.total = res.data.data.total
  } catch {} finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.page = 1; fetchData() }

const resetSearch = () => {
  searchForm.event_id = ''
  searchForm.status = ''
  handleSearch()
}

const handleView = (row) => {
  detailData.value = row
  detailVisible.value = true
}

const handleConfirm = async (row) => {
  ElMessageBox.confirm('确认该报名信息？', '提示', { type: 'info' }).then(async () => {
    try {
      await updateRegistration(row.id, { status: 'confirmed' })
      ElMessage.success('已确认报名')
      fetchData()
    } catch {}
  }).catch(() => {})
}

const handleCancel = async (row) => {
  ElMessageBox.confirm('确定要取消该报名吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      await updateRegistration(row.id, { status: 'cancelled' })
      ElMessage.success('已取消报名')
      fetchData()
    } catch {}
  }).catch(() => {})
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const getStatusType = (status) => {
  const map = { pending: 'warning', confirmed: 'success', cancelled: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { pending: '待确认', confirmed: '已确认', cancelled: '已取消' }
  return map[status] || status
}
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.pagination-box { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
