<template>
  <div class="data-adding-wrapper">
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
      <!-- 左侧表单区域 -->
      <div class="form-panel">
        <h2>添加新的污染信息</h2>
        
        <div class="form-group">
          <label>点位名称</label>
          <input type="text" v-model="formData.name" placeholder="请输入点位名称">
        </div> <!--点位名称-->
        
        <div class="form-group">
          <label>经度</label>
          <input type="number" v-model="formData.longitude" placeholder="请输入经度" @input="updateMapPosition">
        </div> <!--经度-->
        
        <div class="form-group">
          <label>纬度</label>
          <input type="number" v-model="formData.latitude" placeholder="请输入纬度" @input="updateMapPosition">
        </div> <!--纬度-->

        <!-- <div class="form-group">
          <label>采样日期</label>
          <input type="date" v-model="formData.samplingDate">
        </div> 采样日期 -->

        <!-- 替换原有的污染类型和污染值输入部分 -->
        <div class="form-group">
          <label>污染类型</label>
          <select v-model="selectedPollutantType">
            <option value="soil">土壤采样</option>
            <option value="vegetable">蔬菜采样</option>
            <option value="air">空气采样</option>
          </select>
        </div>
        
        <div class="pollutant-container">
          <template v-if="selectedPollutantType === 'soil'">
            <div class="pollutant-grid">
              <div class="pollutant-item" v-for="item in soilPollutants" :key="item.key">
                <label>{{ item.label }}</label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    v-model="formData.pollutants[item.key]" 
                    :placeholder="item.label"
                    min="0"
                    step="0.01"
                  >
                  <span class="unit">{{ item.unit }}</span>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="selectedPollutantType === 'vegetable'">
            <div class="pollutant-grid">
              <div class="pollutant-item" v-for="item in vegetablePollutants" :key="item.key">
                <label>{{ item.label }}</label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    v-model="formData.pollutants[item.key]" 
                    :placeholder="item.label"
                    min="0"
                    step="0.01"
                  >
                  <span class="unit">{{ item.unit }}</span>
                </div>
              </div>
            </div>
          </template>
          
          <template v-else>
            <div class="pollutant-grid">
              <div class="pollutant-item" v-for="item in airPollutants" :key="item.key">
                <label>{{ item.label }}</label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    v-model="formData.pollutants[item.key]" 
                    :placeholder="item.label"
                    min="0"
                    step="0.01"
                  >
                  <span class="unit">{{ item.unit }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="form-group">
          <label>备注信息</label>
          <textarea v-model="formData.remarks" placeholder="请输入备注信息"></textarea>
        </div>
        
        <div class="form-actions">
          <button class="submit-btn" @click="submitData">提交新的污染信息</button>
          <button class="cancel-btn" @click="goToHome">取消</button>
        </div>
      </div>

      <!-- 右侧地图区域 -->
      <div class="map-panel">
        <div id="data-map" class="data-map"></div>
        <div class="map-tip">提示：点击地图可自动填充经纬度信息</div>
      </div>
    </div>
  
  </div>
</template>

<script>
import axios from 'axios'; // 导入 axios

export default {
  name: 'DataAdding',
  data() {
    return {
      tabs: [
        { text: '污染地图', active: false, action: 'goToMap' },
        { text: '污染统计', active: false, action: 'goToPlot' },
        { text: '数据添加', active: true, action: 'goToDataAdding' },
        { text: '数据管理', active: false, action: 'goToDataMng' },
        { text: '算法文档', active: false, action: 'goToDocument' }
      ],
      showUserMenu: false,
      currentUser: null, // 用于存储当前登录的用户信息,
      map: null,
      AMap: null,
      marker: null,
      selectedPollutantType: 'soil',
      // Pb、Cu、Zn、Cd、Cr、As、AP、HN、AS、K
      soilPollutants:  [
        { key: 'pb', label: '铅(Pb)', unit: 'mg/kg' },
        { key: 'cu', label: '铜(Cu)', unit: 'mg/kg' },
        { key: 'zn', label: '锌(Zn)', unit:'mg/kg' },
        { key: 'cd', label: '镉(Cd)', unit:'mg/kg' },
        { key: 'cr', label: '铬(Cr)', unit:'mg/kg' },
        { key: 'ars', label: '砷(As)', unit:'mg/kg' },
        { key: 'ap', label: '有效磷(P)', unit: 'mg/kg' },
        { key: 'hn', label: '碱化氮(N)', unit: 'mg/kg' },
        { key: 'avs', label: '有效硫(S)', unit: 'mg/kg' },
        { key: 'k', label: '钾(K)', unit: 'mg/kg' }
      ],
      vegetablePollutants:  [
      { key: 'pb', label: '铅(Pb)', unit: 'mg/kg' },
        { key: 'cu', label: '铜(Cu)', unit: 'mg/kg' },
        { key: 'zn', label: '锌(Zn)', unit:'mg/kg' },
        { key: 'cd', label: '镉(Cd)', unit:'mg/kg' },
        { key: 'cr', label: '铬(Cr)', unit:'mg/kg' },
        { key: 'ars', label: '砷(As)', unit:'mg/kg' },
        { key: 'ap', label: '有效磷(P)', unit: 'mg/kg' },
        { key: 'hn', label: '碱化氮(N)', unit: 'mg/kg' },
        { key: 'avs', label: '有效硫(S)', unit: 'mg/kg' },
        { key: 'k', label: '钾(K)', unit: 'mg/kg' }
      ],
      airPollutants: [
        { key: 'pm25', label: 'PM2.5', unit: 'μg/m³' },
        { key: 'pm10', label: 'PM10', unit: 'μg/m³' },
      ],
      formData: {
        name: '',
        longitude: this.$route.query.lng || '',
        latitude: this.$route.query.lat || '',
        // samplingDate: '', // 添加采样日期字段
        pollutionType: 'soil',
        pollutants: {},
        remarks: ''
      }
    }
  },
  watch: {
    selectedPollutantType(newType) {
      this.formData.pollutionType = newType; // 同步 pollutionType
      this.formData.pollutants = {}; //切换类型时清空污染物数据
    }
  },
  computed: {
    hasValidPollutantInput() {
      // 检查 pollutants 对象中是否有任何一个值大于0
      return Object.values(this.formData.pollutants).some(value => value && parseFloat(value) > 0);
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
    
    // 添加生命周期钩子，在组件挂载后初始化地图
    this.$nextTick(() => {
      this.initMap();
    });
  },

  beforeUnmount() {
    // 组件销毁前清理地图实例
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
  },
  methods: {
    async initMap() {
      try {
        // 配置安全密钥
        window._AMapSecurityConfig = {
          securityJsCode: 'baad3e3aad81d6d40a5ce47752a842fb',
        };

        // 检查是否已经加载了AMap脚本
        if (!window.AMapLoader) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://webapi.amap.com/loader.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (window.AMapLoader) {
          // 将 AMap 保存到组件实例中
          this.AMap = await window.AMapLoader.load({
            key: 'c909057b33762148f3f108186dd9c643',
            version: '2.0',
            plugins: ['AMap.Scale', 'AMap.ToolBar'],
          });

          // 使用组件实例中的 AMap
          this.map = new this.AMap.Map('data-map', {
            zoom: 13,
            center: [this.formData.longitude || 114.4240, this.formData.latitude || 30.6090],
            viewMode: '2D',
            lang: 'zh_cn',
          });
          
          this.map.addControl(new this.AMap.Scale());
          this.map.addControl(new this.AMap.ToolBar());
          
          // 如果有初始经纬度，添加标记
          if (this.formData.longitude && this.formData.latitude) {
            this.addMarker([this.formData.longitude, this.formData.latitude]);
          }

          // 添加地图点击事件
          this.map.on('click', (e) => {
            const position = e.lnglat;
            this.formData.longitude = position.lng;
            this.formData.latitude = position.lat;
            this.addMarker([position.lng, position.lat]);
          });

          console.log('地图加载成功');
        }
      } catch (error) {
        console.error('地图初始化失败:', error);
      }
    },

    addMarker(position) {
      // 如果已有标记，先移除
      if (this.marker) {
        this.marker.setMap(null);
      }
      
      // 创建新标记
      this.marker = new this.AMap.Marker({
        position: position,
        icon: new this.AMap.Icon({
          size: new this.AMap.Size(20, 20),
          image: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="10" fill="#2C7873" opacity="0.8"/>
            </svg>
          `),
          imageSize: new this.AMap.Size(20, 20)
        })
      });
      
      this.marker.setMap(this.map);
      
      // 将地图中心移动到标记位置
      this.map.setCenter(position);
    },

    updateMapPosition() {
      if (this.formData.longitude && this.formData.latitude && this.map) {
        const position = [this.formData.longitude, this.formData.latitude];
        this.addMarker(position);
      }
    },

    async submitData() {
      if (!this.formData.name) {
        alert('请输入点位名称');
        return;
      }
      if (!this.formData.longitude || !this.formData.latitude) {
        alert('请输入经纬度信息');
        return;
      }
      // if (!this.formData.samplingDate) {
      //   alert('请选择采样日期');
      //   return;
      // }
      if (!this.hasValidPollutantInput) {
        alert('请至少输入一个有效的污染物值（大于0）');
        return;
      }

      // 构建提交到后端的数据 payload
      const payload = {
        stationName: this.formData.name,
        longitude: parseFloat(this.formData.longitude),
        latitude: parseFloat(this.formData.latitude),
        // time: this.formData.samplingDate, // API 要求 YYYY-MM-DD HH:mm:ss，但input[type=date]只提供 YYYY-MM-DD
                                        // 后端可能需要调整或前端补充时间部分，此处按api.md中示例格式提交
        pollutionType: this.selectedPollutantType, // 使用 selectedPollutantType 作为污染类型
        remarks: this.formData.remarks, // 添加备注信息
        pollutants: {} // 初始化为空对象
      };

      // 根据污染类型动态添加污染物数据
      // 直接遍历 formData.pollutants 对象
      for (const key in this.formData.pollutants) {
        if (Object.hasOwnProperty.call(this.formData.pollutants, key)) {
          const valueString = this.formData.pollutants[key];
          // 确保值存在且不为空字符串再进行转换
          if (valueString !== null && valueString !== undefined && valueString !== '') {
            const value = parseFloat(valueString);
            // 后端可能期望即使是0也传递，或者只传递大于0的值，根据API调整
            // 此处我们传递所有输入的值，如果值为NaN（无法转换的字符串），则设为0或null，根据后端要求
            payload.pollutants[key] = isNaN(value) ? 0 : value; 
          } else {
            // 如果输入为空或不存在，可以根据后端要求设置为0或忽略该字段
            payload.pollutants[key] = 0; // 或者 delete payload.pollutants[key];
          }
        }
      }
      
      console.log('提交的数据:', payload); 

      try {

        const response = await axios.post('/api/pollution/DataAdd', payload);
        if (response.data && response.data.code === 200) {
          alert('数据提交成功！' + (response.data.msg || ''));
          // this.goToHome(); // 提交成功后跳转到首页
        } else {
          alert('数据提交失败：' + (response.data.msg || '未知错误'));
        }
      } catch (error) {
        console.error('提交数据时发生错误:', error);
        let errorMessage = '提交数据时发生网络错误或服务器无响应';
        if (error.response && error.response.data && error.response.data.msg) {
          errorMessage = `数据提交失败：${error.response.data.msg}`;
        }
        alert(errorMessage);
      }
    },
    
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
.data-adding-wrapper {
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
  display: flex;
  padding: 20px;
  height: calc(100% - 100px);
  box-sizing: border-box;
  gap: 20px;
}

.form-panel {
  flex: 1;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  overflow-y: auto;
}

.map-panel {
  flex: 1;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.data-map {
  flex: 1;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.map-tip {
  margin-top: 10px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

h2 {
  color: #2C7873;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

textarea {
  height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  padding: 10px 20px;
  background-color: #2C7873;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background-color: #1a5a56;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background-color: #e5e5e5;
}
.pollutant-container {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.pollutant-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.pollutant-item {
  background-color: white;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-with-unit input {
  flex: 1;
}

.unit {
  color: #666;
  font-size: 12px;
  white-space: nowrap;
}

.submit-btn {
  padding: 10px 20px;
  background-color: #2C7873;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer; /* 确保光标是可点击状态 */
  font-size: 14px;
  transition: all 0.3s ease;
  opacity: 1; /* 确保按钮完全可见 */
}
.submit-btn:hover {
  background-color: #1a5a56;
}
</style>