<template>
  <div class="plot-wrapper">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-container">
        <!-- 左侧标签页 -->
        <div class="nav-tabs">
          <div class="tab" @click="goToMap">污染地图</div>
          <div class="tab active">污染统计</div>
          <div class="tab" @click="goToDataAdding">数据添加</div>
          <div class="tab" @click="goToDataMng">数据管理</div>
        </div>
        <!-- 中间标题 -->
        <div class="nav-title">青山工业区多介质污染综合管理网站</div>
        <!-- 右侧用户信息 -->
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

    <!-- 子页面切换栏 -->
    <div class="sub-nav-bar">
      <div
        class="sub-tab"
        :class="{ active: activeTab === 'statistics' }"
        @click="activeTab = 'statistics'"
      >
        统计数据
      </div>
      <div
        class="sub-tab"
        :class="{ active: activeTab === 'calculation' }"
        @click="activeTab = 'calculation'"
      >
        计算方法
      </div>
    </div>

    <!-- 统计数据展示区域 -->
    <div class="plot-container" v-if="activeTab === 'statistics'">
      <div class="plot-grid"> <!-- Removed single-card, will use grid-template-columns for two cards -->
        <!-- 第一个卡片：蔬菜重金属含量 -->
        <div class="plot-card"> <!-- Removed full-width-card -->
          <div class="description">
            <h3>蔬菜重金属含量平均值 (mg/kg)</h3>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>蔬菜</th>
                  <th v-for="metal in metals" :key="metal.key">{{ metal.name }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="veg in vegetableData" :key="veg.name">
                  <td>{{ veg.name }}</td>
                  <td v-for="metal in metals" :key="metal.key" :style="getCellStyle(veg[metal.key], metal.key)">
                    {{ veg[metal.key] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 第二个卡片：土壤重金属污染物描述性统计 -->
        <div class="plot-card">
          <div class="description">
            <h3>土壤重金属污染物描述性统计</h3>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>统计指标</th>
                  <th v-for="metalKey in soilMetals" :key="metalKey">{{ metalKey }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stat in soilStatsData" :key="stat.label">
                  <td>{{ stat.label }}</td>
                  <td v-for="metalKey in soilMetals" :key="metalKey">
                    {{ stat[metalKey] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- 计算方法展示区域 -->
    <div class="calculation-container" v-if="activeTab === 'calculation'">
      <iframe src="/risk_calculation.html" frameborder="0" class="calculation-iframe"></iframe>
    </div>

  </div>
</template>

<script>
// import * as d3 from 'd3'; // D3.js不再需要，可以移除

export default {
  name: 'PollutionPlot',
  data() {
    return {
      showUserMenu: false,
      activeTab: 'statistics', // 默认显示统计数据
      metals: [
        { key: 'Zn', name: 'Zn', min: 0, max: 10 },
        { key: 'Cu', name: 'Cu', min: 0, max: 1.2 },
        { key: 'Cr', name: 'Cr', min: 0, max: 0.8 },
        { key: 'Cd', name: 'Cd', min: 0, max: 0.12 },
        { key: 'Pb', name: 'Pb', min: 0, max: 3 },
        { key: 'As', name: 'As', min: 0, max: 0.3 },
      ],
      vegetableData: [
        { name: '白菜', Zn: 3.7626, Cu: 0.4289, Cr: 0.0659, Cd: 0.0326, Pb: 1.0196, As: 0.0237 },
        { name: '地菜', Zn: 8.9909, Cu: 1.0396, Cr: 0.7080, Cd: 0.1078, Pb: 2.9065, As: 0.2514 },
        { name: '甘蓝', Zn: 3.5606, Cu: 0.3768, Cr: 0.1365, Cd: 0.0311, Pb: 1.1682, As: 0.0099 },
        { name: '萝卜', Zn: 2.1419, Cu: 0.1323, Cr: 0.0393, Cd: 0.0231, Pb: 0.3916, As: 0.0115 },
        { name: '萝卜菜', Zn: 4.1148, Cu: 0.6691, Cr: 0.0873, Cd: 0.0416, Pb: 1.6648, As: 0.0251 },
        { name: '蒜苗', Zn: 3.8694, Cu: 0.4008, Cr: 0.4328, Cd: 0.0382, Pb: 1.4828, As: 0.0711 },
        { name: '莴苣', Zn: 2.6039, Cu: 0.3335, Cr: 0.0463, Cd: 0.0659, Pb: 2.0205, As: 0.0427 },
      ],
      soilMetals: ['Pb', 'Cu', 'Zn', 'Cd', 'Cr', 'As'], // 土壤重金属列
      soilStatsData: [
        { label: '均值', Pb: 27.16, Cu: 41.32, Zn: 103.35, Cd: 0.28, Cr: 64.52, As: 5.29 },
        { label: '标准差', Pb: 12.34, Cu: 8.53, Zn: 19.09, Cd: 0.04, Cr: 33.51, As: 1.95 },
        { label: '变异系数%', Pb: 44.7, Cu: 20.6, Zn: 18.5, Cd: 14.3, Cr: 51.9, As: 36.9 },
        { label: '最小值', Pb: 5.21, Cu: 27.57, Zn: 74.68, Cd: 0.24, Cr: 21.42, As: 1.65 },
        { label: '最大值', Pb: 45.28, Cu: 62.24, Zn: 147.85, Cd: 0.45, Cr: 137.1, As: 10.26 },
        { label: '显著性', Pb: 0.059, Cu: 0.2, Zn: 0.2, Cd: 0.2, Cr: 0.2, As: 0.183 },
        { label: '湖北省平均背景', Pb: 26.7, Cu: 30.7, Zn: 83.6, Cd: 0.17, Cr: 86, As: 12.3 },
        { label: '风险筛选值', Pb: '120/170', Cu: '100/100', Zn: '250/300', Cd: '0.3/0.6', Cr: '200/250', As: '30/25' },
      ]
    }
  },
  // mounted 和 watch 中关于 initChartsOnce 的部分可以移除
  // mounted() {
  //   if (this.activeTab === 'statistics') {
  //     // this.initChartsOnce(); // 不再需要
  //   }
  // },
  // watch: {
  //   activeTab(newTab) {
  //     if (newTab === 'statistics') {
  //       // this.initChartsOnce(); // 不再需要
  //     }
  //   }
  // },
  methods: {
    goToMap() {
      this.$router.push('/home');
    },
    goToDataAdding() {
      this.$router.push('/data-adding');
    },
    goToDataMng() {
      this.$router.push('/DataManage');
    },
    handleUserClick() {
      this.$router.push('/login');
    },
    // initChartsOnce 和其他 createChart 方法已移除
    getCellStyle(value, metalKey) {
      const metalConfig = this.metals.find(m => m.key === metalKey);
      if (!metalConfig) return {};

      const { min, max } = metalConfig;
      // 归一化值到 0-1 之间
      const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));

      // 定义渐变色的起始和结束 (例如：从绿色到红色)
      // 您可以调整这些颜色
      const startColor = { r: 144, g: 238, b: 144 }; // LightGreen
      const endColor = { r: 255, g: 99, b: 71 };   // Tomato

      // 计算中间色
      const r = Math.round(startColor.r + (endColor.r - startColor.r) * normalizedValue);
      const g = Math.round(startColor.g + (endColor.g - startColor.g) * normalizedValue);
      const b = Math.round(startColor.b + (endColor.b - startColor.b) * normalizedValue);

      return {
        backgroundColor: `rgb(${r}, ${g}, ${b})`,
        color: normalizedValue > 0.6 ? 'white' : 'black', // 根据背景色深浅调整文字颜色
      };
    }
  }
}
</script>

<style scoped>
.plot-wrapper {
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
  height: 60px;
  position: relative;
  background-color: #2C7873;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 100;
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
  transition: all 0.3s ease;
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
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sub-nav-bar {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  background-color: #e0e0e0; /* Or any color that fits your design */
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.sub-tab {
  padding: 8px 20px;
  cursor: pointer;
  border-radius: 4px;
  margin: 0 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
  color: #333;
  font-weight: 500;
}

.sub-tab:hover {
  background-color: #d0d0d0;
}

.sub-tab.active {
  background-color: #52958B;
  color: white;
}

.plot-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.calculation-container {
  flex: 1;
  padding: 0 20px 20px 20px; /* Removed top padding, will control with iframe margin */
  overflow: auto;
  display: flex;
  align-items: flex-start; /* Align items to the start (top) of the container */
  justify-content: center; /* Horizontally center */
  background-color: #f0f0f0;
}

.calculation-iframe {
  width: calc(100%* 1.5); /* Adjust width to account for scaling */
  height: calc(100% *1.5); /* Adjust height to account for scaling */
  border: 1px solid #ccc;
  transform: scale(1.5);
  transform-origin: top center;
  margin-top: 10px;
}

.plot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); /* 修改为自适应列布局 */
  gap: 20px;
  max-width: 1400px; /* 保持最大宽度 */
  margin: 0 auto;
}

.plot-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-x: auto; /* 允许表格水平滚动，如果内容过宽 */
}

.table-container {
  width: 100%;
  overflow-x: auto; /* 确保表格本身可以滚动 */
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px 10px; /* 调整内边距 */
  text-align: center; /* 文本居中 */
  min-width: 60px; /* 给单元格一个最小宽度 */
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
  color: #333;
}

/* tbody tr:nth-child(even) {
  background-color: #f9f9f9;
} */ /* 移除了斑马条纹，如果需要可以取消注释 */

tbody tr:hover {
  background-color: #f1f1f1;
}

.description {
  padding: 10px;
  text-align: center; /* 标题居中 */
}

.description h3 {
  color: #2C7873;
  margin-bottom: 8px;
}

.description p {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}
</style>