<template>
    <div class="data-adding-wrapper">
      <!-- 顶部导航栏 -->
      <div class="nav-bar">
        <div class="nav-container">
          <!-- 左侧标签页 -->
          <div class="nav-tabs">
            <div class="tab" @click="goToHome">污染地图</div>
            <div class="tab" @click="goToPlot">污染统计</div>
            <div class="tab" @click="goToDataAdding">数据添加</div>
            <div class="tab active">数据管理</div>
          </div>
          <!-- 中间标题 -->
          <div class="nav-title">青山工业区多介质污染综合管理网站</div>
          <!-- 右侧用户信息 -->
          <div class="user-info" @click="handleUserClick">
            <span>请登录</span>
            <!-- 用户下拉菜单 -->
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
        <!-- 左侧表单区域 -->
        <div class="form-panel">
          <h2>添加新的污染信息</h2>
          
          <div class="form-group">
            <label>点位名称</label>
            <input type="text" v-model="formData.name" placeholder="请输入点位名称">
          </div>
          
          <div class="form-group">
            <label>经度</label>
            <input type="number" v-model="formData.longitude" placeholder="请输入经度" @input="updateMapPosition">
          </div>
          
          <div class="form-group">
            <label>纬度</label>
            <input type="number" v-model="formData.latitude" placeholder="请输入纬度" @input="updateMapPosition">
          </div>
          <!-- 替换原有的污染类型和污染值输入部分 -->
          <div class="form-group">
            <label>污染类型</label>
            <select v-model="selectedPollutantType">
              <option value="air">空气污染物</option>
              <option value="heavyMetal">重金属污染物</option>
            </select>
          </div>
          
          <div class="pollutant-container">
            <template v-if="selectedPollutantType === 'air'">
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
            
            <template v-else>
              <div class="pollutant-grid">
                <div class="pollutant-item" v-for="item in heavyMetalPollutants" :key="item.key">
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
  export default {
    name: 'DataAdding',
    data() {
      return {
        showUserMenu: false,
        map: null,
        AMap: null,
        marker: null,
        selectedPollutantType: 'air',
        airPollutants: [
          { key: 'pm25', label: 'PM2.5', unit: 'μg/m³' },
          { key: 'pm10', label: 'PM10', unit: 'μg/m³' },
          { key: 'so2', label: 'SO₂', unit: 'μg/m³' },
          { key: 'nox', label: 'NOx', unit: 'ppb' },
          { key: 'co', label: 'CO', unit: 'ppm' },
          { key: 'o3', label: 'O₃', unit: 'ppb' }
        ],
        heavyMetalPollutants: [
          { key: 'cr', label: '铬(Cr)', unit: 'mg/kg' },
          { key: 'ni', label: '镍(Ni)', unit: 'mg/kg' },
          { key: 'as', label: '砷(As)', unit: 'mg/kg' },
          { key: 'pb', label: '铅(Pb)', unit: 'mg/kg' },
          { key: 'zn', label: '锌(Zn)', unit: 'mg/kg' },
          { key: 'cu', label: '铜(Cu)', unit: 'mg/kg' },
          { key: 'cd', label: '镉(Cd)', unit: 'mg/kg' }
        ],
        formData: {
          name: '',
          longitude: this.$route.query.lng || '',
          latitude: this.$route.query.lat || '',
          pollutionType: 'air',
          pollutants: {},
          remarks: ''
        }
      }
    },
    computed: {
      hasValidPollutantInput() {
        return Object.values(this.formData.pollutants).some(value => value > 0);
      }
    },
    mounted() {
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
              center: [this.formData.longitude || 114.311855, this.formData.latitude || 30.608737],
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
  
      submitData() {
        if (!this.formData.name) {
          alert('请输入点位名称');
          return;
        }
        if (!this.formData.longitude || !this.formData.latitude) {
          alert('请输入经纬度信息');
          return;
        }
        if (!this.hasValidPollutantInput) {
          alert('请至少输入一个污染物的值');
          return;
        }
        
        // TODO: 实现数据提交逻辑
        console.log('提交的数据:', this.formData);
        
        alert('数据提交成功！');
        this.goToHome();
      },
      goToHome() {
        this.$router.push('/');
      },
      goToPlot() {
        this.$router.push('/plot');
      },
      handleUserClick() {
        this.$router.push('/login');
      },
      goToDataAdding() {
        this.$router.push('/data-adding');
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
    margin-left: 0;
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
  
  .content-container {
    display: flex;
    padding: 20px;
    height: calc(100% - 60px);
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
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .submit-btn.active {
    opacity: 1;
    cursor: pointer;
  }
  </style>
