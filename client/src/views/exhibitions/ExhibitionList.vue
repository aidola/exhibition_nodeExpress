<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="展会名称/主办方/地点" clearable style="width: 240px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 140px" @change="handleSearch">
            <el-option label="筹备中" value="planning" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="completed" />
            <el-option label="已取消" value="cancelled" />
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
        <el-icon><Plus /></el-icon> 新增展会
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="展会名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="organizer" label="主办方" min-width="150" show-overflow-tooltip />
        <el-table-column prop="location" label="地点" min-width="150" show-overflow-tooltip />
        <el-table-column label="日期" width="200">
          <template #default="{ row }">
            {{ row.start_date }} ~ {{ row.end_date }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="推荐" width="70" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.is_featured" color="#f59e0b"><StarFilled /></el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定要删除该展会吗？" @confirm="handleDelete(row)">
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
            <el-form-item label="展会名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入展会名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始日期" prop="start_date">
              <el-date-picker v-model="form.start_date" type="date" placeholder="选择开始日期" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="end_date">
              <el-date-picker v-model="form.end_date" type="date" placeholder="选择结束日期" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主办方">
              <el-input v-model="form.organizer" placeholder="请输入主办方" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="举办地点">
              <el-input v-model="form.location" placeholder="请输入地点" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="form.contact_person" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="form.contact_phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="筹备中" value="planning" />
                <el-option label="进行中" value="ongoing" />
                <el-option label="已结束" value="completed" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否推荐">
              <el-switch v-model="form.is_featured" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="展会简介">
              <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入展会简介" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="封面图URL">
              <el-input v-model="form.cover_image" placeholder="请输入封面图链接" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="展会详情" width="700px">
      <template v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="展会名称" :span="2">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item label="主办方">{{ detailData.organizer || '-' }}</el-descriptions-item>
          <el-descriptions-item label="地点">{{ detailData.location || '-' }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ detailData.start_date }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ detailData.end_date }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ detailData.contact_person || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detailData.contact_phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(detailData.status)">{{ getStatusText(detailData.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="推荐">{{ detailData.is_featured ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="简介" :span="2">{{ detailData.description || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-tabs>
          <el-tab-pane :label="`关联活动 (${(detailData.events || []).length})`">
            <el-table :data="detailData.events || []" size="small">
              <el-table-column prop="title" label="活动名称" show-overflow-tooltip />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="{ row }">{{ getEventTypeText(row.type) }}</template>
              </el-table-column>
              <el-table-column label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
                    {{ row.status === 'published' ? '已发布' : row.status === 'draft' ? '草稿' : row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!detailData.events?.length" description="暂无关联活动" :image-size="60" />
          </el-tab-pane>
          <el-tab-pane :label="`关联客户 (${(detailData.customers || []).length})`">
            <el-table :data="detailData.customers || []" size="small">
              <el-table-column prop="name" label="客户名称" show-overflow-tooltip />
              <el-table-column prop="contact_person" label="联系人" width="100" />
              <el-table-column label="等级" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.level === 'VIP' ? 'danger' : row.level === 'important' ? 'warning' : 'info'" size="small">
                    {{ row.level }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!detailData.customers?.length" description="暂无关联客户" :image-size="60" />
          </el-tab-pane>
        </el-tabs>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getExhibitions, getExhibitionDetail, createExhibition, updateExhibition, deleteExhibition } from '@/api'

// 列表数据
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({ page: 1, page_size: 10, total: 0 })
const searchForm = reactive({ keyword: '', status: '' })

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增展会')
const submitting = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const editId = ref(null)

const form = reactive({
  name: '', start_date: '', end_date: '', organizer: '', location: '',
  contact_person: '', contact_phone: '', description: '', cover_image: '',
  status: 'planning', is_featured: false,
})

const formRules = {
  name: [{ required: true, message: '请输入展会名称', trigger: 'blur' }],
  start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  end_date: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 详情
const detailVisible = ref(false)
const detailData = ref(null)

onMounted(() => fetchData())

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getExhibitions({
      page: pagination.page,
      page_size: pagination.page_size,
      keyword: searchForm.keyword,
      status: searchForm.status,
    })
    tableData.value = res.data.data.list
    pagination.total = res.data.data.total
  } catch {} finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  dialogTitle.value = '新增展会'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑展会'
  Object.assign(form, {
    name: row.name,
    start_date: row.start_date,
    end_date: row.end_date,
    organizer: row.organizer || '',
    location: row.location || '',
    contact_person: row.contact_person || '',
    contact_phone: row.contact_phone || '',
    description: row.description || '',
    cover_image: row.cover_image || '',
    status: row.status,
    is_featured: row.is_featured,
  })
  dialogVisible.value = true
}

const handleView = async (row) => {
  try {
    const res = await getExhibitionDetail(row.id)
    detailData.value = res.data.data
    detailVisible.value = true
  } catch {}
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateExhibition(editId.value, form)
      ElMessage.success('展会更新成功')
    } else {
      await createExhibition(form)
      ElMessage.success('展会创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {} finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await deleteExhibition(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

const resetForm = () => {
  Object.assign(form, {
    name: '', start_date: '', end_date: '', organizer: '', location: '',
    contact_person: '', contact_phone: '', description: '', cover_image: '',
    status: 'planning', is_featured: false,
  })
  if (formRef.value) formRef.value.resetFields()
}

const getStatusType = (status) => {
  const map = { planning: 'info', ongoing: 'success', completed: '', cancelled: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { planning: '筹备中', ongoing: '进行中', completed: '已结束', cancelled: '已取消' }
  return map[status] || status
}

const getEventTypeText = (type) => {
  const map = { forum: '论坛', workshop: '工作坊', speech: '演讲', matchmaking: '对接会', other: '其他' }
  return map[type] || type
}
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.toolbar-card :deep(.el-card__body) { padding: 10px 20px; }
.pagination-box { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
