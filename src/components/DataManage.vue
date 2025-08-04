<template>
  <div class="data-manage-wrapper">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <!-- 第一行：网站标题 -->
      <div class="title-row">
        <div class="main-title">青山沿江化工区域重金属健康风险数智管理网站</div>
      </div>
      <!-- 第二行：导航按钮和用户信息 -->
      <div class="nav-row">
        <div class="nav-container">
          <!-- 左侧标签页 -->
          <div class="nav-tabs">
            <div
              v-for="(tab, index) in navTabs"
              :key="index"
              class="tab"
              :class="{ active: tab.active }"
              @click="handleTabClick(tab.action)"
            >
              {{ tab.text }}
            </div>
          </div>
          <!-- 右侧用户信息 -->
          <div class="user-info" @click="handleUserClick">
            <span v-if="currentUser">你好，{{ currentUser.username }}</span>
            <span v-else>请登录</span>
            <!-- 用户下拉菜单 -->
            <div class="user-dropdown" v-if="showUserMenu && currentUser">
              <div class="user-dropdown-item">
                <div>用户名：{{ currentUser.username }}</div>
                <div>身份：访客</div>
                <!-- 可以添加登出按钮 -->
                <button @click.stop="logout">退出登录</button>
              </div>
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
              </div>
              <!-- 修改污染物展示结构 -->
              <div class="pollutants-details">
                <div v-if="item.pollutants.soil && Object.keys(item.pollutants.soil).length > 0" class="pollution-category">
                  <strong>土壤:</strong>
                  <div class="pollutant-item" v-for="(value, key) in item.pollutants.soil" :key="key">
                    {{ key.toUpperCase() }}: {{ value === null || value === undefined ? '-' : value }}
                  </div>
                </div>
                <div v-if="item.pollutants.air && Object.keys(item.pollutants.air).length > 0" class="pollution-category">
                  <strong>空气:</strong>
                  <div class="pollutant-item" v-for="(value, key) in item.pollutants.air" :key="key">
                    {{ key.toUpperCase() }}: {{ value === null || value === undefined ? '-' : value }}
                  </div>
                </div>
                <div v-if="item.pollutants.vegetable && Object.keys(item.pollutants.vegetable).length > 0" class="pollution-category">
                  <strong>蔬菜:</strong>
                  <div class="pollutant-item" v-for="(value, key) in item.pollutants.vegetable" :key="key">
                    {{ key.toUpperCase() }}: {{ value === null || value === undefined ? '-' : value }}
                  </div>
                </div>
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
              </div>
              <!-- 修改污染物展示结构 -->
              <div class="pollutants-details">
                <div v-if="item.pollutants.soil && Object.keys(item.pollutants.soil).length > 0" class="pollution-category">
                  <strong>土壤:</strong>
                  <span>
                    {{ Object.entries(item.pollutants.soil).map(([key, value]) => `${key.toUpperCase()}: ${value === null || value === undefined ? '-' : value}`).join(', ') }}
                  </span>
                </div>
                <div v-if="item.pollutants.air && Object.keys(item.pollutants.air).length > 0" class="pollution-category">
                  <strong>空气:</strong>
                  <span>
                    {{ Object.entries(item.pollutants.air).map(([key, value]) => `${key.toUpperCase()}: ${value === null || value === undefined ? '-' : value}`).join(', ') }}
                  </span>
                </div>
                <div v-if="item.pollutants.vegetable && Object.keys(item.pollutants.vegetable).length > 0" class="pollution-category">
                  <strong>蔬菜:</strong>
                  <span>
                    {{ Object.entries(item.pollutants.vegetable).map(([key, value]) => `${key.toUpperCase()}: ${value === null || value === undefined ? '-' : value}`).join(', ') }}
                  </span>
                </div>
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
import axios from 'axios'; // 导入 axios

export default {
  name: 'DataManage',
  data() {
    return {
      navTabs: [
        { text: '污染地图', active: false, action: 'goToMap' },
        { text: '污染统计', active: false, action: 'goToPlot' },
        { text: '数据添加', active: false, action: 'goToDataAdding' },
        { text: '数据管理', active: true, action: 'goToDataMng' },
        { text: '算法文档', active: false, action: 'goToDocument' }
      ],
      showUserMenu: false,
      currentUser: null, // 用于存储当前登录的用户信息,
      currentTab: 'pending',
      tabs: [
        { key: 'pending', label: '待审核数据' },
        { key: 'approved', label: '已有数据' }
      ],
      pendingData: [], // 初始化为空数组，将从 API 获取数据
      approvedData: [] // 初始化为空数组，将从 API 获取数据
    };
  },
  watch: {
    currentTab(newTab) {
      if (newTab === 'approved') {
        this.fetchApprovedData();
      } else if (newTab === 'pending') {
        this.fetchPendingData();
      }
    }
  },
  mounted() {
    // 检查用户登录状态
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
      } catch (error) {
        console.error('解析用户数据失败:', error);
        localStorage.removeItem('currentUser');
      }
    }
    
    this.fetchPendingData(); // 组件挂载后调用方法获取数据
    this.fetchApprovedData(); // 组件挂载后调用方法获取数据
  },
  methods: {
    // 添加处理用户点击的方法
    handleUserClick() {
      if (this.currentUser) {
        // 如果已登录，可以切换用户菜单的显示，或者不执行任何操作
        this.showUserMenu = !this.showUserMenu;
        console.log('用户已登录:', this.currentUser.username);
      } else {
        // 如果未登录，则跳转到登录页
        this.$router.push('/login');
      }
    },

    // 添加登出方法 (如果需要)
    logout() {
      localStorage.removeItem('currentUser');
      this.currentUser = null;
      this.showUserMenu = false; // 关闭下拉菜单
      // 可以选择跳转到登录页或首页
      this.$router.push('/login'); 
      // 或者刷新页面以确保状态完全重置
      // window.location.reload(); 
    },
    goToMap() {
      this.$router.push('/');
    },
    goToDataAdding() {
      this.$router.push('/data-adding');
    },
    // 添加跳转到统计页面的方法
    goToPlot() {
      this.$router.push('/plot');
    },
    goToDataMng() {
      this.$router.push('/DataManage');
    },
    goToDocument() {
      window.open('/riskDocument');
    },
    handleTabClick(action) {
      // 查找 navTabs 数组中对应的项并更新 active 状态
      this.navTabs.forEach(tab => {
        tab.active = tab.action === action;
      });

      // 执行对应的跳转方法
      if (typeof this[action] === 'function') {
        this[action]();
      } else {
        console.warn(`Action "${action}" is not a defined method.`);
      }
    },
    async fetchPendingData() { // 新增异步方法获取待审核数据
      try {
        const response = await axios.get('/api/pollution/awaiting1');
        if (response.data && response.data.code === 200) {
          this.pendingData = response.data.data.map(item => {
            const pollutants = {
              soil: { pb: null, cu: null, zn: null, cd: null, cr: null, ars: null, ap: null, hn: null, avs: null, k: null },
              air: { pm10: null, pm2_5: null},
              vegetable: {pb: null, cu: null, zn: null, cd: null, cr: null, ars: null, ap: null, hn: null, avs: null, k: null}
            };

            if (item.soilPollution) {
              for (const key in pollutants.soil) {
                if (Object.prototype.hasOwnProperty.call(item.soilPollution, key)) {
                  pollutants.soil[key] = item.soilPollution[key];
                }
              }
            }
            if (item.airPollution) {
              for (const key in pollutants.air) {
                if (Object.prototype.hasOwnProperty.call(item.airPollution, key)) {
                  pollutants.air[key] = item.airPollution[key];
                }
              }
            }
            if (item.vegetablePollution) {
              for (const key in pollutants.vegetable) {
                if (Object.prototype.hasOwnProperty.call(item.vegetablePollution, key)) {
                  pollutants.vegetable[key] = item.vegetablePollution[key];
                }
              }
            }

            return {
              id: item.pollutionPoint.pointId, // 使用 pointId 作为唯一标识
              name: item.pollutionPoint.stationName,
              time: new Date(item.pollutionPoint.createTime).toLocaleString(), // 格式化时间
              longitude: item.pollutionPoint.longitude,
              latitude: item.pollutionPoint.latitude,
              pollutionTypeOriginal: this.translatePollutionType(item.pollutionPoint.pollutionType), // 保存转换后的污染类型文本
              pollutants: pollutants, // 使用处理后的污染物对象
              originalData: item 
            };
          });
        } else {
          console.error('获取待审核数据失败:', response.data.message);
          alert('获取待审核数据失败: ' + response.data.message);
        }
      } catch (error) {
        console.error('请求待审核数据接口时发生错误:', error);
        alert('请求待审核数据接口时发生错误，请检查网络或联系管理员。');
      }
    },
    async fetchApprovedData() { // 新增异步方法获取已审核数据
      try {
        const response = await axios.get('/api/pollution/awaiting2');
        if (response.data && response.data.code === 200) {
          this.approvedData = response.data.data.map(item => {
            const pollutants = {
              soil: { pb: null, cu: null, zn: null, cd: null, cr: null, ars: null, ap: null, hn: null, avs: null, k: null },
              air: { pm10: null, pm2_5: null},
              vegetable: {pb: null, cu: null, zn: null, cd: null, cr: null, ars: null, ap: null, hn: null, avs: null, k: null}
            };

            if (item.soilPollution) {
              for (const key in pollutants.soil) {
                if (Object.prototype.hasOwnProperty.call(item.soilPollution, key)) {
                  pollutants.soil[key] = item.soilPollution[key];
                }
              }
            }
            if (item.airPollution) {
              for (const key in pollutants.air) {
                if (Object.prototype.hasOwnProperty.call(item.airPollution, key)) {
                  pollutants.air[key] = item.airPollution[key];
                }
              }
            }
            if (item.vegetablePollution) {
              for (const key in pollutants.vegetable) {
                if (Object.prototype.hasOwnProperty.call(item.vegetablePollution, key)) {
                  pollutants.vegetable[key] = item.vegetablePollution[key];
                }
              }
            }

            return {
              id: item.pollutionPoint.pointId,
              name: item.pollutionPoint.stationName,
              time: new Date(item.pollutionPoint.createTime).toLocaleString(),
              longitude: item.pollutionPoint.longitude,
              latitude: item.pollutionPoint.latitude,
              pollutionTypeOriginal: this.translatePollutionType(item.pollutionPoint.pollutionType),
              pollutants: pollutants,
              originalData: item
            };
          });
        } else {
          console.error('获取已审核数据失败:', response.data.message);
          alert('获取已审核数据失败: ' + (response.data.message || '未知错误'));
        }
      } catch (error) {
        console.error('请求已审核数据接口时发生错误:', error);
        alert('请求已审核数据接口时发生错误，请检查网络或联系管理员。');
      }
    },
    translatePollutionType(type) { // 辅助方法转换污染类型显示
      switch (type) {
        case 'soil':
          return '土壤';
        case 'air':
          return '空气';
        case 'vegetable':
          return '蔬菜';
      }
    },
    async approveData(id) {
      const itemToApprove = this.pendingData.find(item => item.id === id);
      if (!itemToApprove) {
        alert('未找到要审核的数据项');
        return;
      }
      try {
        const response = await axios.post(`/api/pollution/${id}/approve`);
        if (response.data && response.data.code === 200) {
          alert(`数据点 "${itemToApprove.name}" 审核通过成功！`);
          this.fetchPendingData(); // 刷新待审核列表
        } else {
          console.error('审核通过失败:', response.data.message);
          alert('审核通过失败: ' + (response.data.message || '未知错误'));
        }
      } catch (error) {
        console.error('请求审核通过接口时发生错误:', error);
        alert('请求审核通过接口时发生错误，请检查网络或联系管理员。');
      }
    },
    async rejectData(id) {
      const itemToReject = this.pendingData.find(item => item.id === id);
      if (!itemToReject) {
        alert('未找到要拒绝的数据项');
        return;
      }
      try {
        const response = await axios.post(`/api/pollution/${id}/reject`);
        if (response.data && response.data.code === 200) {
          alert(`数据点 "${itemToReject.name}" 已成功拒绝！`);
          this.fetchPendingData(); // 刷新待审核列表
        } else {
          console.error('拒绝数据失败:', response.data.message);
          alert('拒绝数据失败: ' + (response.data.message || '未知错误'));
        }
      } catch (error) {
        console.error('请求拒绝数据接口时发生错误:', error);
        alert('请求拒绝数据接口时发生错误，请检查网络或联系管理员。');
      }
    },
    async deleteData(id) {
      const itemToDelete = this.approvedData.find(item => item.id === id);
      if (!itemToDelete) {
        alert('未找到要删除的数据项');
        return;
      }
      try {
        // 调用删除接口
        const response = await axios.delete(`/api/pollution/delete/${id}`); 
        if (response.data && response.data.code === 200) {
          alert(`数据点 "${itemToDelete.name}" 删除成功！`);
          this.fetchApprovedData(); // 刷新已有数据列表
        } else {
          console.error('删除数据失败:', response.data.message);
          alert('删除数据失败: ' + (response.data.message || '未知错误'));
        }
      } catch (error) {
        console.error('请求删除数据接口时发生错误:', error);
        alert('请求删除数据接口时发生错误，请检查网络或联系管理员。');
      }
    }
  },

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

.nav-bar {
  width: 100%;
  height: 100px; /* 增加高度以容纳两行 */
  position: relative;
  background-color: #2C7873;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

/* 第一行：标题行 */
.title-row {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 20px;
}

.main-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-align: center;
}

/* 第二行：导航行 */
.nav-row {
  flex: 1;
  display: flex;
  align-items: center;
  margin-top: 5px; /* 增加顶部间隙 */
}

.nav-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.nav-tabs {
  display: flex;
  gap: 12px;
  flex: 0 0 auto;
  min-width: 0;
}

.tab {
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tab:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab.active {
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: bold;
  border-color: rgba(255, 255, 255, 0.4);
}

.user-info {
  cursor: pointer;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex: 0 0 auto;
  white-space: nowrap;
  position: relative;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 12px;
  min-width: 200px;
  z-index: 1000;
  color: #333;
}

.user-dropdown-item {
  padding: 8px 0;
}

.user-dropdown-item div {
  margin-bottom: 4px;
  font-size: 14px;
}

.user-dropdown-item button {
  background: #2C7873;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 8px;
}

.user-dropdown-item button:hover {
  background: #1f5a56;
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