<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="客户名称/联系人/公司/电话" clearable style="width: 260px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="等级">
          <el-select v-model="searchForm.level" placeholder="全部等级" clearable style="width: 120px" @change="handleSearch">
            <el-option label="VIP" value="VIP" />
            <el-option label="重要" value="important" />
            <el-option label="普通" value="normal" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 120px" @change="handleSearch">
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
            <el-option label="已流失" value="lost" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源">
          <el-input v-model="searchForm.source" placeholder="客户来源" clearable style="width: 140px" @keyup.enter="handleSearch" />
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
        <el-icon><Plus /></el-icon> 新增客户
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="客户名称/公司" min-width="180" show-overflow-tooltip />
        <el-table-column prop="contact_person" label="联系人" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="industry" label="行业" width="100" />
        <el-table-column label="等级" width="80">
          <template #default="{ row }">
            <el-tag :type="row.level === 'VIP' ? 'danger' : row.level === 'important' ? 'warning' : 'info'" size="small">
              {{ row.level === 'VIP' ? 'VIP' : row.level === 'important' ? '重要' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : row.status === 'lost' ? 'danger' : 'warning'" size="small">
              {{ row.status === 'active' ? '活跃' : row.status === 'lost' ? '已流失' : '非活跃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="120" show-overflow-tooltip />
        <el-table-column label="所属展会" min-width="140">
          <template #default="{ row }">{{ row.exhibition?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定要删除该客户吗？" @confirm="handleDelete(row)">
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
            <el-form-item label="客户名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入客户名称或公司名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="form.contact_person" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司">
              <el-input v-model="form.company" placeholder="请输入公司名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位">
              <el-input v-model="form.position" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="行业">
              <el-input v-model="form.industry" placeholder="请输入所属行业" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="等级">
              <el-select v-model="form.level" style="width: 100%">
                <el-option label="VIP" value="VIP" />
                <el-option label="重要" value="important" />
                <el-option label="普通" value="normal" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="活跃" value="active" />
                <el-option label="非活跃" value="inactive" />
                <el-option label="已流失" value="lost" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源">
              <el-input v-model="form.source" placeholder="请输入客户来源" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联展会">
              <el-select v-model="form.exhibition_id" placeholder="请选择展会" clearable style="width: 100%">
                <el-option v-for="ex in exhibitionOptions" :key="ex.id" :label="ex.name" :value="ex.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="地址">
              <el-input v-model="form.address" placeholder="请输入地址" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注" />
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
    <el-dialog v-model="detailVisible" title="客户详情" width="700px">
      <template v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户名称" :span="2">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ detailData.contact_person || '-' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detailData.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ detailData.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="公司">{{ detailData.company || '-' }}</el-descriptions-item>
          <el-descriptions-item label="职位">{{ detailData.position || '-' }}</el-descriptions-item>
          <el-descriptions-item label="行业">{{ detailData.industry || '-' }}</el-descriptions-item>
          <el-descriptions-item label="等级">
            <el-tag :type="detailData.level === 'VIP' ? 'danger' : detailData.level === 'important' ? 'warning' : 'info'">
              {{ detailData.level }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detailData.status === 'active' ? 'success' : detailData.status === 'lost' ? 'danger' : 'warning'">
              {{ detailData.status === 'active' ? '活跃' : detailData.status === 'lost' ? '已流失' : '非活跃' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="来源">{{ detailData.source || '-' }}</el-descriptions-item>
          <el-descriptions-item label="所属展会">{{ detailData.exhibition?.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{ detailData.address || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailData.notes || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCustomers, getCustomerDetail, createCustomer, updateCustomer, deleteCustomer } from '@/api'
import { getAllExhibitions } from '@/api'

const loading = ref(false)
const tableData = ref([])
const pagination = reactive({ page: 1, page_size: 10, total: 0 })
const searchForm = reactive({ keyword: '', level: '', status: '', source: '' })

const dialogVisible = ref(false)
const dialogTitle = ref('新增客户')
const submitting = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const editId = ref(null)
const exhibitionOptions = ref([])

const form = reactive({
  name: '', contact_person: '', phone: '', email: '', company: '',
  position: '', industry: '', address: '', notes: '', source: '',
  level: 'normal', status: 'active', exhibition_id: null,
})

const formRules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
}

const detailVisible = ref(false)
const detailData = ref(null)

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
    const res = await getCustomers({
      page: pagination.page,
      page_size: pagination.page_size,
      keyword: searchForm.keyword,
      level: searchForm.level,
      status: searchForm.status,
      source: searchForm.source,
    })
    tableData.value = res.data.data.list
    pagination.total = res.data.data.total
  } catch {} finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.page = 1; fetchData() }

const resetSearch = () => {
  Object.assign(searchForm, { keyword: '', level: '', status: '', source: '' })
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  dialogTitle.value = '新增客户'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑客户'
  Object.keys(form).forEach(key => {
    form[key] = row[key] !== undefined ? row[key] : form[key]
  })
  dialogVisible.value = true
}

const handleView = async (row) => {
  try {
    const res = await getCustomerDetail(row.id)
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
      await updateCustomer(editId.value, form)
      ElMessage.success('客户更新成功')
    } else {
      await createCustomer(form)
      ElMessage.success('客户创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {} finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await deleteCustomer(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

const resetForm = () => {
  Object.assign(form, {
    name: '', contact_person: '', phone: '', email: '', company: '',
    position: '', industry: '', address: '', notes: '', source: '',
    level: 'normal', status: 'active', exhibition_id: null,
  })
  if (formRef.value) formRef.value.resetFields()
}
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.toolbar-card :deep(.el-card__body) { padding: 10px 20px; }
.pagination-box { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
