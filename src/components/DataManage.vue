<template>
  <div class="data-manage-wrapper">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-container">
        <div class="nav-tabs">
          <div class="tab" @click="goToHome">污染地图</div>
          <div class="tab" @click="goToPlot">污染统计</div>
          <div class="tab" @click="goToDataAdding">数据添加</div>
          <div class="tab active">数据管理</div>
        </div>
        <div class="nav-title">青山工业区多介质污染综合管理网站</div>
        <div class="user-info" @click="handleUserClick">
          <span>请登录</span>
          <div class="user-dropdown" v-if="showUserMenu">
            <div class="user-dropdown-item">
              <div>用户名：张三</div>
              <div>身份：访客</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="content-container">
      <!-- 数据管理面板 -->
      <div class="manage-panel">
        <div class="tabs">
          <div 
            v-for="tab in tabs" 
            :key="tab.key"
            :class="['tab-item', { active: currentTab === tab.key }]"
            @click="currentTab = tab.key"
          >
            {{ tab.label }}
          </div>
        </div>

        <!-- 待审核数据列表 -->
        <div v-if="currentTab === 'pending'" class="data-list">
          <div class="data-item" v-for="item in pendingData" :key="item.id">
            <div class="data-header">
              <span class="location">{{ item.name }}</span>
              <span class="time">{{ item.time }}</span>
            </div>
            <div class="data-content">
              <div class="data-row">
                <span>位置：{{ item.longitude }}, {{ item.latitude }}</span>
                <span>类型：{{ item.pollutionType }}</span>
              </div>
              <div class="data-row">
                <span>污染物：{{ item.pollutants }}</span>
              </div>
            </div>
            <div class="data-actions">
              <button class="btn approve" @click="approveData(item.id)">通过</button>
              <button class="btn reject" @click="rejectData(item.id)">拒绝</button>
            </div>
          </div>
        </div>

        <!-- 已有数据列表 -->
        <div v-if="currentTab === 'approved'" class="data-list">
          <div class="data-item" v-for="item in approvedData" :key="item.id">
            <div class="data-header">
              <span class="location">{{ item.name }}</span>
              <span class="time">{{ item.time }}</span>
            </div>
            <div class="data-content">
              <div class="data-row">
                <span>位置：{{ item.longitude }}, {{ item.latitude }}</span>
                <span>类型：{{ item.pollutionType }}</span>
              </div>
              <div class="data-row">
                <span>污染物：{{ item.pollutants }}</span>
              </div>
            </div>
            <div class="data-actions">
              <button class="btn delete" @click="deleteData(item.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataManage',
  data() {
    return {
      showUserMenu: false,
      currentTab: 'pending',
      tabs: [
        { key: 'pending', label: '待审核数据' },
        { key: 'approved', label: '已有数据' }
      ],
      pendingData: [
        {
          id: 1,
          name: '测试点位1',
          time: '2024-01-20 10:30',
          longitude: 114.311855,
          latitude: 30.608737,
          pollutionType: '空气',
          pollutants: 'PM2.5: 75μg/m³, SO₂: 35μg/m³'
        }
      ],
      approvedData: [
        {
          id: 2,
          name: '测试点位2',
          time: '2024-01-19 15:45',
          longitude: 114.312855,
          latitude: 30.609737,
          pollutionType: '土壤重金属',
          pollutants: 'Pb: 50mg/kg, Cd: 0.3mg/kg'
        }
      ]
    }
  },
  methods: {
    goToHome() {
      this.$router.push('/')
    },
    goToPlot() {
      this.$router.push('/plot')
    },
    goToDataAdding() {
      this.$router.push('/data-adding')
    },
    handleUserClick() {
      this.$router.push('/login')
    },
    approveData() {
      // 实现审核通过逻辑
      alert('审核通过')
    },
    rejectData() {
      // 实现拒绝逻辑
      alert('已拒绝')
    },
    deleteData() {
      // 实现删除逻辑
      alert('删除成功')
    }
  }
}
</script>

<style scoped>
.data-manage-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* 保持原有的导航栏样式 */
.nav-bar {
  width: 100%;
  height: 60px;
  background-color: #2C7873;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.nav-container {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.nav-tabs {
  display: flex;
  gap: 10px;
}

.tab {
  padding: 6px 16px;
  cursor: pointer;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
}

.tab:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.tab.active {
  background-color: #52958B;
  color: white;
}

.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.user-info {
  cursor: pointer;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}

/* 主体内容样式 */
.content-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.manage-panel {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
}

.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.tab-item {
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
  color: #666;
}

.tab-item.active {
  background-color: #2C7873;
  color: white;
}

.data-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.data-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
}

.data-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.location {
  font-weight: bold;
  color: #2C7873;
}

.time {
  color: #666;
}

.data-content {
  margin-bottom: 15px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  color: #333;
}

.data-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.approve {
  background-color: #2C7873;
  color: white;
}

.reject, .delete {
  background-color: #dc3545;
  color: white;
}

.edit {
  background-color: #52958B;
  color: white;
}
</style>