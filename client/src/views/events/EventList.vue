<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="活动标题/主讲人" clearable style="width: 220px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="全部类型" clearable style="width: 120px" @change="handleSearch">
            <el-option label="论坛" value="forum" />
            <el-option label="工作坊" value="workshop" />
            <el-option label="演讲" value="speech" />
            <el-option label="对接会" value="matchmaking" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 120px" @change="handleSearch">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已结束" value="ended" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属展会">
          <el-select v-model="searchForm.exhibition_id" placeholder="全部展会" clearable style="width: 200px" @change="handleSearch">
            <el-option v-for="ex in exhibitionOptions" :key="ex.id" :label="ex.name" :value="ex.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card shadow="never" class="toolbar-card">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 新增活动
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="活动标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag size="small">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属展会" min-width="150">
          <template #default="{ row }">{{ row.exhibition?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="时间" width="200">
          <template #default="{ row }">
            <div style="font-size: 12px">{{ formatTime(row.start_time) }}</div>
            <div style="font-size: 12px; color: #999">至 {{ formatTime(row.end_time) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="地点" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.location || '-' }}</template>
        </el-table-column>
        <el-table-column label="报名" width="100" align="center">
          <template #default="{ row }">
            {{ row.current_participants }}/{{ row.max_participants || '不限' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" size="small" @click="$router.push(`/registrations?event_id=${row.id}`)">报名</el-button>
            <el-popconfirm title="确定要删除该活动吗？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="650px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="活动标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入活动标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动类型">
              <el-select v-model="form.type" style="width: 100%">
                <el-option label="论坛" value="forum" />
                <el-option label="工作坊" value="workshop" />
                <el-option label="演讲" value="speech" />
                <el-option label="对接会" value="matchmaking" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="草稿" value="draft" />
                <el-option label="已发布" value="published" />
                <el-option label="已结束" value="ended" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="所属展会" prop="exhibition_id">
              <el-select v-model="form.exhibition_id" placeholder="请选择所属展会" style="width: 100%">
                <el-option v-for="ex in exhibitionOptions" :key="ex.id" :label="ex.name" :value="ex.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="start_time">
              <el-date-picker v-model="form.start_time" type="datetime" placeholder="选择开始时间" style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="end_time">
              <el-date-picker v-model="form.end_time" type="datetime" placeholder="选择结束时间" style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动地点">
              <el-input v-model="form.location" placeholder="请输入活动地点" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主讲人/嘉宾">
              <el-input v-model="form.speaker" placeholder="请输入主讲人或嘉宾" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大报名人数">
              <el-input-number v-model="form.max_participants" :min="0" placeholder="0表示不限" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="封面图URL">
              <el-input v-model="form.cover_image" placeholder="请输入封面图链接" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="活动描述">
              <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入活动描述" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getEvents, createEvent, updateEvent, deleteEvent, getAllExhibitions } from '@/api'

const loading = ref(false)
const tableData = ref([])
const pagination = reactive({ page: 1, page_size: 10, total: 0 })
const searchForm = reactive({ keyword: '', type: '', status: '', exhibition_id: '' })
const exhibitionOptions = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增活动')
const submitting = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const editId = ref(null)

const form = reactive({
  title: '', type: 'other', description: '', location: '',
  start_time: '', end_time: '', max_participants: 0, speaker: '',
  cover_image: '', status: 'draft', exhibition_id: null,
})

const formRules = {
  title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
  exhibition_id: [{ required: true, message: '请选择所属展会', trigger: 'change' }],
  start_time: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  end_time: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
}

onMounted(async () => {
  fetchData()
  try {
    const res = await getAllExhibitions()
    exhibitionOptions.value = res.data.data
  } catch {}
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getEvents({
      page: pagination.page,
      page_size: pagination.page_size,
      keyword: searchForm.keyword,
      type: searchForm.type,
      status: searchForm.status,
      exhibition_id: searchForm.exhibition_id,
    })
    tableData.value = res.data.data.list
    pagination.total = res.data.data.total
  } catch {} finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.page = 1; fetchData() }

const resetSearch = () => {
  Object.assign(searchForm, { keyword: '', type: '', status: '', exhibition_id: '' })
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false; editId.value = null
  dialogTitle.value = '新增活动'; resetForm(); dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true; editId.value = row.id
  dialogTitle.value = '编辑活动'
  Object.keys(form).forEach(key => {
    form[key] = row[key] !== undefined ? row[key] : form[key]
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateEvent(editId.value, form)
      ElMessage.success('活动更新成功')
    } else {
      await createEvent(form)
      ElMessage.success('活动创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {} finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await deleteEvent(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

const resetForm = () => {
  Object.assign(form, {
    title: '', type: 'other', description: '', location: '',
    start_time: '', end_time: '', max_participants: 0, speaker: '',
    cover_image: '', status: 'draft', exhibition_id: null,
  })
  if (formRef.value) formRef.value.resetFields()
}

const formatTime = (time) => {
  if (!time) return '-'
  const d = new Date(time)
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const getTypeText = (type) => {
  const map = { forum: '论坛', workshop: '工作坊', speech: '演讲', matchmaking: '对接会', other: '其他' }
  return map[type] || type
}
const getStatusType = (s) => {
  const map = { draft: 'info', published: 'success', ended: '', cancelled: 'danger' }
  return map[s] || 'info'
}
const getStatusText = (s) => {
  const map = { draft: '草稿', published: '已发布', ended: '已结束', cancelled: '已取消' }
  return map[s] || s
}
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.toolbar-card :deep(.el-card__body) { padding: 10px 20px; }
.pagination-box { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
