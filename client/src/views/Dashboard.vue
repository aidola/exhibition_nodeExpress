<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6f7ff">
              <el-icon :size="28" color="#1890ff"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.counts?.totalExhibitions || 0 }}</div>
              <div class="stat-label">展会总数</div>
            </div>
          </div>
          <div class="stat-extra">进行中: {{ stats.counts?.ongoingExhibitions || 0 }}</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f6ffed">
              <el-icon :size="28" color="#52c41a"><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.counts?.totalCustomers || 0 }}</div>
              <div class="stat-label">客户总数</div>
            </div>
          </div>
          <div class="stat-extra">VIP: {{ stats.counts?.vipCustomers || 0 }}</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fff7e6">
              <el-icon :size="28" color="#faad14"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.counts?.totalEvents || 0 }}</div>
              <div class="stat-label">活动总数</div>
            </div>
          </div>
          <div class="stat-extra">今日: {{ stats.counts?.todayEvents || 0 }}</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f0f5ff">
              <el-icon :size="28" color="#722ed1"><List /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.counts?.totalRegistrations || 0 }}</div>
              <div class="stat-label">报名总数</div>
            </div>
          </div>
          <div class="stat-extra">今日: {{ stats.counts?.todayRegistrations || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 内容区域 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 近期展会 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>近期展会</span>
              <el-button text type="primary" @click="$router.push('/exhibitions')">查看更多</el-button>
            </div>
          </template>
          <el-table :data="stats.recentExhibitions || []" size="small">
            <el-table-column prop="name" label="展会名称" show-overflow-tooltip />
            <el-table-column prop="start_date" label="开始日期" width="110" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getExhibitionStatusType(row.status)" size="small">
                  {{ getExhibitionStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!stats.recentExhibitions?.length" description="暂无数据" :image-size="60" />
        </el-card>
      </el-col>

      <!-- 近期活动 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>近期活动</span>
              <el-button text type="primary" @click="$router.push('/events')">查看更多</el-button>
            </div>
          </template>
          <el-table :data="stats.recentEvents || []" size="small">
            <el-table-column prop="title" label="活动名称" show-overflow-tooltip />
            <el-table-column label="所属展会" width="140">
              <template #default="{ row }">
                {{ row.exhibition?.name || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="开始时间" width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.start_time) }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!stats.recentEvents?.length" description="暂无数据" :image-size="60" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近报名 -->
    <el-card shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>最近报名</span>
          <el-button text type="primary" @click="$router.push('/registrations')">查看更多</el-button>
        </div>
      </template>
      <el-table :data="stats.recentRegistrations || []" size="small">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="company" label="公司" show-overflow-tooltip />
        <el-table-column label="报名活动" show-overflow-tooltip>
          <template #default="{ row }">{{ row.event?.title || '-' }}</template>
        </el-table-column>
        <el-table-column label="报名时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'confirmed' ? 'success' : 'warning'" size="small">
              {{ row.status === 'confirmed' ? '已确认' : row.status === 'cancelled' ? '已取消' : '待确认' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!stats.recentRegistrations?.length" description="暂无数据" :image-size="60" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboardStats } from '@/api'

const stats = ref({
  counts: {},
  recentExhibitions: [],
  recentEvents: [],
  recentRegistrations: [],
})

onMounted(async () => {
  try {
    const res = await getDashboardStats()
    stats.value = res.data.data
  } catch {}
})

const getExhibitionStatusType = (status) => {
  const map = { planning: 'info', ongoing: 'success', completed: '', cancelled: 'danger' }
  return map[status] || 'info'
}

const getExhibitionStatusText = (status) => {
  const map = { planning: '筹备中', ongoing: '进行中', completed: '已结束', cancelled: '已取消' }
  return map[status] || status
}

const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.stats-row {
  margin-bottom: 0;
}

.stat-card {
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}

.stat-extra {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #999;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
