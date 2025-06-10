<template>
  <div class="amap-wrapper">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-container">
        <!-- 左侧标签页 -->
        <div class="nav-tabs">
          <div class="tab active">污染地图</div>
          <div class="tab" @click="goToPlot">污染统计</div>
          <div class="tab" @click="goToDataAdding">数据添加</div>
          <div class="tab" @click="goToDataMng">数据管理</div>
        </div>
        <!-- 中间标题 -->
        <div class="nav-title">青山沿江化工区重金属污染综合管理网站</div>
        <!-- 右侧用户信息 -->
        <div class="user-info" @click="handleUserClick">
          <span v-if="currentUser">你好，{{ currentUser.username }}</span> <!-- 假设用户信息对象中有 username 属性 -->
          <span v-else>请登录</span>
          <!-- 用户下拉菜单 (如果登录后还需要下拉菜单，可以调整这里的 v-if) -->
          <div class="user-dropdown" v-if="showUserMenu && currentUser">
            <div class="user-dropdown-item">
              <div>用户名：{{ currentUser.username }}</div>
              <div>身份：访客</div> <!-- 这里可以根据实际用户角色显示 -->
              <!-- 可以添加登出按钮 -->
              <button @click.stop="logout">退出登录</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 左侧图层控制 -->
    <div class="layer-control">
      <div class="layer-buttons">
        <button class="layer-btn" @click="filterMarkers('soil')">
          <span>土壤</span>
        </button>
        <button class="layer-btn" @click="filterMarkers('vegetable')">
          <span>蔬菜</span>
        </button>
        <button class="layer-btn" @click="filterMarkers('air')">
          <span>空气</span>
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
import axios from 'axios';
export default {
  name: 'HomeMap',
  data() {
    return {
      showUserMenu: false,
      currentUser: null, // 用于存储当前登录的用户信息
      map: null,
      AMap: null, // 添加 AMap 变量
      pollutionPoints: [
        {
          id: 1,
          name: '测试点位1--土壤',
          longitude: 114.441855,
          latitude: 30.638737,
          pollutionValue: 10.0,
          pollutionType: 'soil',
          // 假设的详细污染物数据 (土壤/蔬菜)
          Pb: 1.23, Cu: 2.34, Zn: 3.45, Cd: 0.12, Cr: 0.56, As: 0.07, AP: 10.8, HN: 5.2, AS: 0.15, K: 150.5, // AS_total 避免与 As 关键字冲突
        },
        {
          id: 2,
          name: '测试点位2 --蔬菜',
          longitude: 114.431855,
          latitude: 30.628737,
          pollutionValue: 20.0,
          pollutionType: 'vegetable',
          Pb: 1.53, Cu: 2.64, Zn: 3.75, Cd: 0.22, Cr: 0.66, As: 0.17, AP: 11.8, HN: 6.2, AS: 0.25, K: 160.5,
        },
        {
          id: 3,
          name: '测试点位3--空气',
          longitude: 114.441855,
          latitude: 30.628737,
          pollutionValue: 20.0,
          pollutionType: 'air',
          // 假设的详细污染物数据 (空气)
          PM2_5: 25.5, PM10: 55.1,
        }
      ],
      markers: [], // 存储所有的标记点实例
      estimationInfoWindow: null, // 添加新的变量存储估算信息窗体
      clickMarker: null, // 用于存储点击时生成的橙色圆点
      currentLayerType: 'soil', // 新增：追踪当前图层类型，默认为 soil
    }
  },

  mounted() {
    // 检查登录状态
    const userData = localStorage.getItem('currentUser'); // 假设用户信息存储在 localStorage
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
      } catch (e) {
        console.error('解析用户信息失败:', e);
        localStorage.removeItem('currentUser'); // 解析失败则清除无效数据
      }
    }

    // 添加全局方法以供信息窗体使用
    window.addNewPollutionInfo = (pointId) => {
      this.addNewPollutionInfo(pointId);
    };

    // 确保DOM完全加载后再初始化地图
    this.$nextTick(() => {
      this.initMap();
    });
  },

  // 将 beforeDestroy 改为 beforeUnmount
  beforeUnmount() {
    // 销毁地图实例
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
    // 清除标记点数组
    this.markers = [];
    // 移除全局方法
    window.addNewPollutionInfo = null;
    // 清除信息窗体
    if (this.estimationInfoWindow) {
      this.estimationInfoWindow.close();
      this.estimationInfoWindow = null;
    }
    // 移除可能存在的点击标记
    if (this.clickMarker) {
      // 确保map实例存在才执行remove
      if (this.map) {
        this.map.remove(this.clickMarker);
      }
      this.clickMarker = null;
    }
  },

  methods: {
    // 重构：按污染类型获取数据
    async fetchPollutionData(pollutionType = 'soil') {
      try {
        const response = await axios.get(`/api/pollution/map/${pollutionType}`);
        // 修改判断条件，检查 response.data.data 是否存在且长度大于 0
        if (response.data && response.data.data && response.data.data.length > 0) {
          console.log(`从后端获取到${pollutionType}类型数据:`, response.data.data);
          return response.data.data; // 返回实际的数据数组
        } else {
          console.log(response.data) // 打印完整的后端响应以便调试
          console.log(`后端${pollutionType}类型数据为空或格式不正确，将使用默认示例数据。`);
          return this.getDefaultDataByType(pollutionType);
        }
      } catch (error) {
        console.error(`获取${pollutionType}类型数据失败，将使用默认示例数据:`, error);
        return this.getDefaultDataByType(pollutionType);
      }
    },

    // 新增：根据污染类型获取默认示例数据
    getDefaultDataByType(pollutionType) {
      const defaultData = {
        soil: [
          {
            pointId: 1,
            stationName: '测试点位1--土壤',
            longitude: 114.441855,
            latitude: 30.638737,
            pollutionValue: 10.0,
            pollutionType: 'soil',
            // Pb: 1.23, Cu: 2.34, Zn: 3.45, Cd: 0.12, Cr: 0.56, As: 0.07, AP: 10.8, HN: 5.2, AS_total: 0.15, K: 150.5
          }
        ],
        vegetable: [
          {
            pointId: 2,
            stationName: '测试点位2--蔬菜',
            longitude: 114.431855,
            latitude: 30.628737,
            pollutionValue: 20.0,
            pollutionType: 'vegetable',
            // Pb: 1.53, Cu: 2.64, Zn: 3.75, Cd: 0.22, Cr: 0.66, As: 0.17, AP: 11.8, HN: 6.2, AS_total: 0.25, K: 160.5
          }
        ],
        air: [
          {
            pointId: 3,
            stationName: '测试点位3--空气',
            longitude: 114.441855,
            latitude: 30.628737,
            pollutionValue: 20.0,
            pollutionType: 'air',
            // PM2_5: 25.5, PM10: 55.1
          }
        ]
      };
      return defaultData[pollutionType] || [];
    },

    async initMap() {
      // 默认加载 soil 类型数据
      const backendData = await this.fetchPollutionData('soil');
      this.pollutionPoints = backendData;

      try {
        // 如果已经存在地图实例，先销毁它
        if (this.map) {
          this.map.destroy();
          this.map = null;
          this.markers = [];
        }
        
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
            plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.ControlBar', 'AMap.DistrictSearch', 'AMap.Event'],
          });

          // 使用组件实例中的 AMap
          this.map = new this.AMap.Map('container', {
            zoom: 13,
            viewMode: '2D',
            lang: 'zh_cn',
          });
          
          this.map.addControl(new this.AMap.Scale());
          this.map.addControl(new this.AMap.ToolBar());
          this.map.addControl(new this.AMap.ControlBar());
          this.addMarkers();
          this.addPoly();

          // 在地图初始化成功后添加点击事件监听
          this.map.on('click', (e) => {
            // 获取点击位置的经纬度
            const position = e.lnglat;
            this.showEstimationInfoWindow(position);
          });
          // 默认显示 soil 类型的采样点
          this.filterMarkers('soil');
          console.log('地图加载成功');
        }
      } catch (error) {
        console.error('地图初始化失败:', error);
      }
    },

    async addPoly() {
      if (!this.AMap || !this.map) {
        console.error('AMap or map not initialized');
        return;
      }
      const AMap = this.AMap; // 使用 this.AMap
      const map = this.map;   // 使用 this.map
      let polygons = [];

      var opts = {
        subdistrict: 0,   // 设置为0，不返回下级行政区
        extensions: 'all',  // 返回行政区边界坐标组等具体信息
        level: 'district'  // 查询行政级别为 区县
      };
      //实例化DistrictSearch
      var district = new AMap.DistrictSearch(opts);

      //行政区查询
      district.search('420107', (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          if (result.districtList && result.districtList.length > 0) {
            const bounds = result.districtList[0].boundaries;
            if (bounds) {
              for (var i = 0, l = bounds.length; i < l; i++) {
                //生成行政区划polygon
                var polygon = new AMap.Polygon({
                  map: map,
                  path: bounds[i],
                  zIndex: 10,
                  fillOpacity: 0.38,
                  fillColor: '#87CEFA', // 淡蓝色填充
                  strokeColor: '#0000FF', // 蓝色边界
                  strokeWeight: 1,    //线宽
                  strokeStyle:'dashed',   // 可以根据需要设置虚线
                  bubble: true,   //允许事件冒泡
                });
                polygons.push(polygon);
              }
              if (polygons.length > 0) {
                map.setFitView(polygons); // 让地图自适应显示绘制的区域
              }
            } else {
              console.error('青山区边界数据为空');
            }
            // 使用 this.AMap.event 来确保作用域正确
            map.on("zoomchange", function () {
              const currentZoom = map.getZoom();
              polygons.forEach(p => {
                if (currentZoom >= 14) {
                  p.hide();
                } else {
                  p.show();
                }
              });
            });

          } else {
            console.error('未找到青山区数据');
          }
        } else {
          console.error('行政区查询失败:', status, result);
        }
      });
    },

    addMarkers() {
      if (!this.map) return;
      this.markers.forEach(marker => marker.setMap(null));
      this.markers = [];

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
          }),
          extData: {
            pollutionType: point.pollutionType,
            id: point.pointId // 确保这里是 pointId，而不是 id
          }
        });

        // 为每个标记点创建一个新的信息窗体实例
        // 注意：infoWindow 现在在 fetchPointDetailsAndShowInfoWindow 中处理或作为组件数据
        // const infoWindow = new this.AMap.InfoWindow({ ... });

        marker.on('click', () => {
          if (this.estimationInfoWindow) {
            this.estimationInfoWindow.close();
          }
          if (this.clickMarker) {
            this.map.remove(this.clickMarker);
            this.clickMarker = null;
          }
          // 调用新方法获取详细数据并显示信息窗体
          this.fetchPointDetailsAndShowInfoWindow(point.pointId, marker.getPosition());
        });

        marker.setMap(this.map);
        this.markers.push(marker);
      });
    },

    async fetchPointDetailsAndShowInfoWindow(pointId, position) {
      if (!this.map || !this.AMap) return;

      try {
        // 显示加载提示 (可选)
        // console.log(`Fetching details for pointId: ${pointId}`);

        const response = await axios.get(`/api/pollution/stations/${pointId}`);
        if (response.data && response.data.code === 200 && response.data.data) {
          const details = response.data.data;

          // 如果之前有全局的信息窗体实例，先关闭它
          if (this.currentInfoWindow) {
            this.currentInfoWindow.close();
          }

          // 创建新的信息窗体实例，或者复用一个全局实例
          this.currentInfoWindow = new this.AMap.InfoWindow({
            isCustom: true,
            offset: new this.AMap.Pixel(0, -10),
            // autoMove: true,
            // closeWhenClickMap: true
          });

          const contentDiv = this.createInfoWindowContent(details, false, position);
          this.currentInfoWindow.setContent(contentDiv);

          // 绑定关闭按钮事件
          const closeBtn = contentDiv.querySelector('.custom-info-close-button');
          if (closeBtn) {
            closeBtn.onclick = () => {
              this.currentInfoWindow.close();
            };
          }

          this.currentInfoWindow.open(this.map, position);
        } else {
          console.error('获取采样点详细数据失败或数据格式不正确:', response.data);
          // 可以显示一个错误提示的信息窗体
        }
      } catch (error) {
        console.error('请求采样点详细数据异常:', error);
        // 可以显示一个错误提示的信息窗体
      }
    },

    // 重构：切换图层时重新获取对应类型数据
    async filterMarkers(type) {
      if (!this.map) return;
      
      this.currentLayerType = type;
      
      try {
        const typeData = await this.fetchPollutionData(type);
        this.pollutionPoints = typeData;
        this.addMarkers();
        
        if (this.estimationInfoWindow) {
          this.estimationInfoWindow.close();
        }
        if (this.clickMarker) {
          this.map.remove(this.clickMarker);
          this.clickMarker = null;
        }
        // 关闭当前打开的详细信息窗体
        if (this.currentInfoWindow) {
            this.currentInfoWindow.close();
        }
        console.log(`已切换到${type}图层并更新数据`);
      } catch (error) {
        console.error(`切换到${type}图层时出错:`, error);
      }
    },

    // 创建信息窗体内容（重构后）
    createInfoWindowContent(details, isEstimation, position) {
      const AMap = this.AMap;
      if (!AMap) return '<div>AMap not loaded</div>';

      const pointInfo = details ? details.pollutionPoint || {} : {}; // 修改点：增加 details 是否为 null 的判断
      const pointName = isEstimation ? '估算点' : (pointInfo.stationName || '未知点位');
      const currentType = isEstimation ? this.currentLayerType : (pointInfo.pollutionType || 'unknown');

      let pollutantsHtml = '';
      // 污染物键名映射 (后端属性名 -> 前端显示名或直接使用)
      const soilVegetablePollutantMap = {
        pb: 'Pb',
        cu: 'Cu',
        zn: 'Zn',
        cd: 'Cd',
        cr: 'Cr',
        ars: 'As',       // 后端是 ars
        ap: 'AP',
        hn: 'HN',
        avs: '总As',    // 后端是 avs, 对应之前的 AS_total
        k: 'K'
      };
      const airPollutantMap = {
        pm2_5: 'PM2.5', // 假设后端是 pm2_5
        pm10: 'PM10'    // 假设后端是 pm10
        // 根据实际空气污染物字段添加更多
      };

      let pollutionData = null;
      let pollutantMap = {};

      // 修改点：增加 details 是否为 null 的判断
      if (details) { 
        if (currentType === 'soil' && details.soilPollution) {
          pollutionData = details.soilPollution;
          pollutantMap = soilVegetablePollutantMap;
        } else if (currentType === 'vegetable' && details.vegetablePollution) {
          pollutionData = details.vegetablePollution;
          pollutantMap = soilVegetablePollutantMap;
        } else if (currentType === 'air' && details.airPollution) {
          pollutionData = details.airPollution;
          pollutantMap = airPollutantMap;
        }
      }

      if (pollutionData) {
        pollutantsHtml = Object.keys(pollutantMap).map(key => {
          const displayName = pollutantMap[key];
          // 修改点：当 isEstimation 为 true 时，污染物值直接显示 '待估算'
          const value = (pollutionData[key] !== undefined && pollutionData[key] !== null ? parseFloat(pollutionData[key]).toFixed(2) : '无数据');
          return `<div>${displayName}：${value}</div>`;
        }).join('');
      } else if (isEstimation) {
        // 修改点：如果是估算点且没有 specific pollutionData (例如 currentType 未匹配或 details 为 null)，显示通用提示
        pollutantsHtml = '<div>待估算详细污染物</div>';
      } else {
        pollutantsHtml = '<div>暂无详细污染物数据</div>';
      }

      const div = document.createElement('div');
      div.className = 'custom-info-window';
      div.style.padding = '0';
      div.style.background = 'white';
      div.style.borderRadius = '8px';
      div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      div.style.minWidth = '280px';
      div.style.fontFamily = '宋体, sans-serif';
      div.style.fontSize = '14px';

      const closeButtonId = `custom-info-close-btn-${Date.now()}-${Math.random().toString(36).substring(2,7)}`;

      // 注意：后端数据中没有直接的 pollutionValue，所以这里移除了相关显示
      div.innerHTML = `
        <div style="position: relative;">
          <div id="${closeButtonId}" class="custom-info-close-button" style="position: absolute; top: 8px; right: 8px; cursor: pointer; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: #666; font-size: 18px; background: rgba(0,0,0,0.05); border-radius: 50%; z-index: 10;">
          ×
        </div>
        <div class="info-window-tabs" style="display: flex; border-bottom: 1px solid #eee;">
          <div class="tab-item active" data-tab="concentration" style="padding: 10px 15px; cursor: pointer; border-bottom: 2px solid #2C7873; color: #2C7873; font-weight: bold;">污染浓度</div>
          <div class="tab-item" data-tab="risk" style="padding: 10px 15px; cursor: pointer; color: #666;">污染风险</div>
        </div>
        <div class="info-window-content" style="padding: 15px;">
          <div class="tab-pane active" data-pane="concentration">
            <div style="font-weight: bold; margin-bottom: 8px;">${pointName} (${currentType})</div>
            <div>经度：${position.lng.toFixed(6)}</div>
            <div>纬度：${position.lat.toFixed(6)}</div>
            ${isEstimation ? '' : ''} <!-- 原污染监测总值已移除 -->
            <div style="margin-top: 8px; font-weight: bold;">详细污染物：</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 5px;">
              ${pollutantsHtml}
            </div>
          </div>
          <div class="tab-pane" data-pane="risk" style="display: none;">
            <!--div style="font-weight: bold; margin-bottom: 12px;">污染风险评估</div-->
            <div class="risk-table" style="border: 1px solid #eee; border-radius: 4px; overflow: hidden;">
              <div style="display: grid; grid-template-columns: 100px 1fr 1fr; background: #f5f5f5; font-weight: bold;">
                <div style="padding: 8px; border-bottom: 1px solid #eee;">污染物</div>
                <div style="padding: 8px; border-bottom: 1px solid #eee; border-left: 1px solid #eee;">致癌风险</div>
                <div style="padding: 8px; border-bottom: 1px solid #eee; border-left: 1px solid #eee;">非致癌风险</div>
              </div>
              ${Object.entries({
                'As': 'ars',
                'Cd': 'cd',
                'Cr': 'cr',
                'Cu': 'cu',
                'Pb': 'pb',
                'Zn': 'zn'
              }).map(([element, code]) => `
                <div style="display: grid; grid-template-columns: 100px 1fr 1fr;">
                  <div style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${element}</div>
                  <div style="padding: 8px; border-bottom: 1px solid #eee; border-left: 1px solid #eee;">
                    <div>最小值：${details.pollutionLevelDTO?.[code + 'minimumCarcinogenicRiskLevel'] || '无数据'}</div>
                    <div style="margin-top: 4px;">最大值：${details.pollutionLevelDTO?.[code + 'maximumCarcinogenicRiskLevel'] || '无数据'}</div>
                  </div>
                  <div style="padding: 8px; border-bottom: 1px solid #eee; border-left: 1px solid #eee;">
                    <div>最小值：${details.pollutionLevelDTO?.[code + 'minimumNonCarcinogenicRiskLevel'] || '无数据'}</div>
                    <div style="margin-top: 4px;">最大值：${details.pollutionLevelDTO?.[code + 'maximumNonCarcinogenicRiskLevel'] || '无数据'}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      // 标签页切换逻辑 (不变)
      const tabs = div.querySelectorAll('.tab-item');
      const panes = div.querySelectorAll('.tab-pane');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => {
            t.classList.remove('active');
            t.style.borderBottom = 'none';
            t.style.color = '#666';
            t.style.fontWeight = 'normal';
          });
          tab.classList.add('active');
          tab.style.borderBottom = '2px solid #2C7873';
          tab.style.color = '#2C7873';
          tab.style.fontWeight = 'bold';

          const targetPane = tab.getAttribute('data-tab');
          panes.forEach(pane => {
            if (pane.getAttribute('data-pane') === targetPane) {
              pane.style.display = 'block';
            } else {
              pane.style.display = 'none';
            }
          });
          if (targetPane === 'risk') {
            console.log('切换到风险标签，准备获取风险数据...');
            // 这里可以添加获取风险数据的逻辑，如果需要的话
          }
        });
      });
      // 关闭按钮的事件绑定移到 fetchPointDetailsAndShowInfoWindow 方法中，因为 infoWindow 实例在那里创建和管理
      return div;
    },

    // 修改：显示估算信息窗体
    async showEstimationInfoWindow(position) { // 添加 async
      if (this.estimationInfoWindow) {
        this.estimationInfoWindow.close();
      }
      if (this.clickMarker) {
        this.map.remove(this.clickMarker);
        this.clickMarker = null;
      }

      // 关闭当前打开的详细信息窗体 (如果是采样点)
      if (this.currentInfoWindow) {
        this.currentInfoWindow.close();
      }

      this.clickMarker = new this.AMap.Marker({
        position: [position.lng, position.lat],
        icon: new this.AMap.Icon({
          size: new this.AMap.Size(10, 10),
          image: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="5" r="5" fill="orange" />
            </svg>
          `),
          imageSize: new this.AMap.Size(10, 10)
        }),
        anchor: 'center',
      });
      this.map.add(this.clickMarker);

      this.estimationInfoWindow = new this.AMap.InfoWindow({
        isCustom: true,
        offset: new this.AMap.Pixel(0, -10)
      });

      try {
        // 调用新的后端接口获取非采样点数据
        const response = await axios.get(`/api/pollution/stations/nearby`, {
          params: {
            longitude: position.lng,
            latitude: position.lat,
            pollutionType: this.currentLayerType // 使用当前图层类型
          }
        });

        let details = null;
        if (response.data && response.data.code === 200 && response.data.data) {
          details = response.data.data;
          // 非采样点数据可能没有 pollutionPoint.stationName, createInfoWindowContent 会处理
          // pollutionPoint 结构可能与采样点不同，确保 createInfoWindowContent 能正确处理
          // 例如，后端返回的数据直接就是 NonPollutionDetailLevelDTO，它可能包含 soilPollution, airPollution 等
          // 以及 pollutionLevelDTO。我们需要确保 createInfoWindowContent 能从这个结构中取值。
          // 假设后端返回的 details 结构与采样点接口的 details.data 结构类似，只是没有 pointId 和 stationName
        } else {
          console.error('获取非采样点详细数据失败或数据格式不正确:', response.data);
          // 即使获取失败，也显示一个基础的信息窗格，或者一个错误提示
        }

        // 使用 createInfoWindowContent 创建内容，isEstimation 仍然为 true，但传入获取到的 details
        const contentDiv = this.createInfoWindowContent(details, true, position);
        this.estimationInfoWindow.setContent(contentDiv);

        const closeBtn = contentDiv.querySelector('.custom-info-close-button');
        if (closeBtn) {
          closeBtn.onclick = () => {
            this.estimationInfoWindow.close();
          };
        }

      } catch (error) {
        console.error('请求非采样点详细数据异常:', error);
        // 发生错误时，也显示一个基础的信息窗格或错误提示
        const errorContentDiv = this.createInfoWindowContent(null, true, position); // 传入 null details
        this.estimationInfoWindow.setContent(errorContentDiv);
        const closeBtn = errorContentDiv.querySelector('.custom-info-close-button');
        if (closeBtn) {
          closeBtn.onclick = () => {
            this.estimationInfoWindow.close();
          };
        }
      }

      this.estimationInfoWindow.on('close', () => {
        if (this.clickMarker) {
          this.map.remove(this.clickMarker);
          this.clickMarker = null;
        }
      });

      this.estimationInfoWindow.open(this.map, [position.lng, position.lat]);
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
    goToDataAdding() {
      this.$router.push('/data-adding');
    },
    // 添加跳转到统计页面的方法
    goToPlot() {
      this.$router.push('/plot');
    },
    goToDataMng() {
      this.$router.push('/DataManage');
    }
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

/* 你可能需要为新的信息窗体标签页添加一些样式 */
.custom-info-window .tab-item.active {
  /* 已在内联样式中处理，这里可以留空或添加其他通用样式 */
}

.custom-info-window .tab-pane {
  /* 已在内联样式中处理 */
}
</style>