<template>
  <div class="document-wrapper">
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
              v-for="(tab, index) in tabs"
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
      <div class="document-panel">
        <h1>风险计算算法文档</h1>
        <div class="iframe-container">
          <iframe 
            src="/risk_calculation.html" 
            class="document-iframe"
            frameborder="0"
            scrolling="auto"
            title="风险计算算法文档">
          </iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RiskDocument',
  data() {
    return {
      tabs: [
        { text: '污染地图', active: false, action: 'goToMap' },
        { text: '污染统计', active: false, action: 'goToPlot' },
        { text: '数据添加', active: false, action: 'goToDataAdding' },
        { text: '数据管理', active: false, action: 'goToDataMng' },
        { text: '算法文档', active: true, action: 'goToDocument' }
      ],
      showUserMenu: false,
      currentUser: null, // 用于存储当前登录的用户信息
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
      // 查找 tabs 数组中对应的项并更新 active 状态
      this.tabs.forEach(tab => {
        tab.active = tab.action === action;
      });

      // 执行对应的跳转方法
      if (typeof this[action] === 'function') {
        this[action]();
      } else {
        console.warn(`Action "${action}" is not a defined method.`);
      }
    }
  }
}
</script>

<style scoped>
.document-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

.content-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.document-panel {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  margin: 0 auto;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.document-panel h1 {
  color: #2C7873;
  margin-bottom: 20px;
  text-align: center;
  flex-shrink: 0;
}

.iframe-container {
  flex: 1;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
}

.document-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: white;
  transform: scale(1.2);
  transform-origin: center top;
  overflow: hidden;
}
</style>