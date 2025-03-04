<template>
  <div class="amap-wrapper">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-container">
        <!-- 左侧标签页 -->
        <div class="nav-tabs">
          <div class="tab active">污染地图</div>
          <div class="tab">污染统计</div>
        </div>
        <!-- 中间标题 -->
        <div class="nav-title">青山工业区多介质污染综合管理网站</div>
        <!-- 右侧用户信息 -->
        <div class="user-info" @click="toggleUserMenu">
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

    <!-- 左侧图层控制 -->
    <div class="layer-control">
      <div class="layer-buttons">
        <button class="layer-btn">
          <span>空气</span>
        </button>
        <button class="layer-btn">
          <span>土壤</span>
        </button>
        <button class="layer-btn">
          <span>蔬菜</span>
        </button>
        <button class="layer-btn">
          <span>扬尘</span>
        </button>
      </div>
    </div>

    <!-- 中间地图 -->
    <div id="container" class="amap-container" style="width: 100%; height: 100%; position: relative;">
      <!-- 地图内容 -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeMap',
  data() {
    return {
      showUserMenu: false,
      map: null,
      AMap: null, // 添加 AMap 变量
      pollutionPoints: [
        {
          id: 1,
          name: '测试点位1',
          longitude: 114.311855,
          latitude: 30.608737,
          pollutionValue: 75.5
        },
        {
          id: 2,
          name: '测试点位2',
          longitude: 114.321855,
          latitude: 30.618737,
          pollutionValue: 85.2
        }
      ],
      markers: [], // 存储所有的标记点实例
      estimationInfoWindow: null, // 添加新的变量存储估算信息窗体
    }
  },
  mounted() {
    // 添加全局方法以供信息窗体使用
    window.addNewPollutionInfo = (pointId) => {
      this.addNewPollutionInfo(pointId);
    };

    // 确保DOM完全加载后再初始化地图
    this.$nextTick(() => {
      this.initMap();
    });
  },
  methods: {
    async initMap() {
      try {
        // 配置安全密钥
        window._AMapSecurityConfig = {
          securityJsCode: 'baad3e3aad81d6d40a5ce47752a842fb',
        };

        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://webapi.amap.com/loader.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        if (window.AMapLoader) {
          // 将 AMap 保存到组件实例中
          this.AMap = await window.AMapLoader.load({
            key: 'c909057b33762148f3f108186dd9c643',
            version: '2.0',
            plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.ControlBar'],
          });

          // 使用组件实例中的 AMap
          this.map = new this.AMap.Map('container', {
            zoom: 13,
            center: [114.311855, 30.608737],
            viewMode: '2D',
            lang: 'zh_cn',
          });
          
          this.map.addControl(new this.AMap.Scale());
          this.map.addControl(new this.AMap.ToolBar());
          this.map.addControl(new this.AMap.ControlBar());
          this.addMarkers();

          // 在地图初始化成功后添加点击事件监听
          this.map.on('click', (e) => {
            // 获取点击位置的经纬度
            const position = e.lnglat;
            this.showEstimationInfoWindow(position);
          });

          console.log('地图加载成功');
        }
      } catch (error) {
        console.error('地图初始化失败:', error);
      }
    },
    addMarkers() {
      if (!this.map) return;
      
      this.pollutionPoints.forEach(point => {
        const marker = new this.AMap.Marker({
          position: [point.longitude, point.latitude],
          icon: new this.AMap.Icon({
            size: new this.AMap.Size(12, 12),
            image: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="6" r="6" fill="red" opacity="0.8"/>
              </svg>
            `),
            imageSize: new this.AMap.Size(12, 12)
          })
        });
    
        const infoWindow = new this.AMap.InfoWindow({
          isCustom: true,
          content: this.createInfoWindowContent(point, () => infoWindow.close()),  // 传入关闭函数
          offset: new this.AMap.Pixel(0, -10)
        });
    
        marker.on('click', () => {
          infoWindow.open(this.map, marker.getPosition());
        });
    
        marker.setMap(this.map);
        this.markers.push(marker);
      });
    },
    // 创建信息窗体内容
    createInfoWindowContent(point, closeWindow) {  // 修改参数为关闭函数
      const div = document.createElement('div');
      div.className = 'info-window';
      div.innerHTML = `
        <div style="padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); min-width: 200px; position: relative;">
          <div style="position: absolute; top: 8px; right: 8px; cursor: pointer; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: #666; font-size: 18px; background: rgba(0,0,0,0.05); border-radius: 50%;"
               onclick="this.dispatchEvent(new CustomEvent('close-window'))">
            ×
          </div>
          <div style="font-family: 宋体; font-size: 14px; margin-bottom: 8px; padding-right: 20px;">
            <div>点位名称：${point.name}</div>
            <div>经度：${point.longitude}</div>
            <div>纬度：${point.latitude}</div>
            <div>污染监测值：${point.pollutionValue}</div>
          </div>
          <button onclick="window.addNewPollutionInfo(${point.id})" 
                  style="width: 100%; padding: 8px; background: #2C7873; color: white; border: none; border-radius: 4px; cursor: pointer;">
            添加新的污染信息
          </button>
        </div>
      `;
      // 添加关闭事件监听器
      const closeButton = div.querySelector('div[onclick]');
      closeButton.addEventListener('close-window', closeWindow);
    
      return div;
    },
    // 添加新的污染信息
    addNewPollutionInfo(pointId) {
      console.log('添加新的污染信息', pointId);
      // TODO: 实现添加新污染信息的逻辑
    },
    // 添加新方法：显示估算信息窗体
    showEstimationInfoWindow(position) {
      // 如果已经有估算信息窗体打开，先关闭它
      if (this.estimationInfoWindow) {
        this.estimationInfoWindow.close();
      }
    
      // 创建新的信息窗体
      this.estimationInfoWindow = new this.AMap.InfoWindow({
        isCustom: true,
        content: this.createEstimationInfoWindowContent(position),
        offset: new this.AMap.Pixel(0, -10)
      });
    
      // 打开信息窗体
      this.estimationInfoWindow.open(this.map, [position.lng, position.lat]);
    },
    // 添加新方法：创建估算信息窗体内容
    createEstimationInfoWindowContent(position) {
      const div = document.createElement('div');
      div.className = 'estimation-info-window';
      div.innerHTML = `
        <div style="padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); min-width: 200px; position: relative;">
          <div style="position: absolute; top: 8px; right: 8px; cursor: pointer; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: #666; font-size: 18px; background: rgba(0,0,0,0.05); border-radius: 50%;"
               onclick="this.closest('.estimation-info-window').dispatchEvent(new CustomEvent('close-window'))">
            ×
          </div>
          <div style="font-family: 宋体; font-size: 14px; margin-bottom: 8px; padding-right: 20px;">
            <div style="font-weight: bold; margin-bottom: 8px;">估算结果</div>
            <div>经度：${position.lng.toFixed(6)}</div>
            <div>纬度：${position.lat.toFixed(6)}</div>
            <div>污染估算值：待计算</div>
          </div>
          <button onclick="this.closest('.estimation-info-window').dispatchEvent(new CustomEvent('add-estimation'))" 
                  style="width: 100%; padding: 8px; background: #2C7873; color: white; border: none; border-radius: 4px; cursor: pointer;">
            添加新的污染信息
          </button>
        </div>
      `;
    
      // 添加关闭事件监听器
      div.addEventListener('close-window', () => {
        this.estimationInfoWindow.close();
      });
    
      // 添加新增估算信息事件监听器
      div.addEventListener('add-estimation', () => {
        console.log('添加新的估算信息', position);
        // TODO: 实现添加新估算信息的逻辑
      });
    
      return div;
    },
  }
}
</script>

<style scoped>
.amap-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-bar {
  width: 100%;
  height: 60px; /* 改为固定高度 */
  position: relative;
  background-color: #2C7873;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 100;
}

.amap-container {
  position: absolute;
  top: 0px; /* 对应导航栏固定高度 */
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100% ; /* 使用计算值 */
}

.layer-control {
  position: absolute;
  left: 20px;
  top: 80px; /* 导航栏高度 + 间距 */
  z-index: 100;
  background-color: #2C7873;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  padding: 15px;
  transition: all 0.3s ease;
}

/* 简化根元素样式 */
:root, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.nav-container {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
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
.layer-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;  /* 增加间距，原来是12px */
}

.layer-btn {
  width: 80px;
  height: 80px;
  border: none;
  background-color: #52958B;
  color: white;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px 0;  /* 添加上下外边距 */
}

.layer-btn:hover {
  background-color: #3A6B66;
  transform: scale(1.05);
}

/* 移除多余的样式 */
#container {
  height: 100%;
  min-height: unset;
}

/* 确保整个页面不会出现滚动条 */
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
}
</style>