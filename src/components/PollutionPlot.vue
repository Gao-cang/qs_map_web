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

    <!-- 统计图展示区域 -->
    <div class="plot-container">
      <div class="plot-grid">
        <!-- 第一行 -->
        <div class="plot-card">
          <div class="chart" ref="barChart1"></div>
          <div class="description">
            <h3>空气污染物浓度分布</h3>
            <p>展示了主要空气污染物（PM2.5、PM10、SO2、NO2）的年度平均浓度分布情况。</p>
          </div>
        </div>
        <div class="plot-card">
          <div class="chart" ref="lineChart1"></div>
          <div class="description">
            <h3>空气质量指数变化趋势</h3>
            <p>展示了近12个月空气质量指数（AQI）的变化趋势，反映区域空气质量整体状况。</p>
          </div>
        </div>
        <!-- 第二行 -->
        <div class="plot-card">
          <div class="chart" ref="pieChart1"></div>
          <div class="description">
            <h3>土壤污染物类型分布</h3>
            <p>展示了不同类型土壤污染物的占比分布，包括重金属、有机物等污染物。</p>
          </div>
        </div>
        <div class="plot-card">
          <div class="chart" ref="barChart2"></div>
          <div class="description">
            <h3>重金属超标情况</h3>
            <p>展示了各类重金属污染物的超标倍数及分布情况。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'PollutionPlot',
  data() {
    return {
      showUserMenu: false,
    }
  },
  mounted() {
    this.initCharts();
  },
  methods: {
    goToMap() {
      this.$router.push('/home');
    },
    goToDataAdding() {
      this.$router.push('/data-adding');
    },
    handleUserClick() {
      this.$router.push('/login');
    },
    initCharts() {
      this.createBarChart1();
      this.createLineChart1();
      this.createPieChart1();
      this.createBarChart2();
    },
    createBarChart1() {
      const data = [
        { name: 'PM2.5', value: 35 },
        { name: 'PM10', value: 70 },
        { name: 'SO2', value: 15 },
        { name: 'NO2', value: 40 }
      ];

      const width = 300;
      const height = 200;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };

      const svg = d3.select(this.$refs.barChart1)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      svg.append('g')
        .attr('fill', '#52958B')
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => y(0) - y(d.value));

      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
    },
    createLineChart1() {
      const data = Array.from({length: 12}, (_, i) => ({
        month: i + 1,
        value: Math.random() * 100 + 50
      }));

      const width = 300;
      const height = 200;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };

      const svg = d3.select(this.$refs.lineChart1)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      const x = d3.scaleLinear()
        .domain([1, 12])
        .range([margin.left, width - margin.right]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const line = d3.line()
        .x(d => x(d.month))
        .y(d => y(d.value));

      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#52958B')
        .attr('stroke-width', 2)
        .attr('d', line);

      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
    },
    createPieChart1() {
      const data = [
        { name: '重金属', value: 45 },
        { name: '有机物', value: 30 },
        { name: '无机物', value: 25 }
      ];

      const width = 300;
      const height = 200;
      const radius = Math.min(width, height) / 2;

      const svg = d3.select(this.$refs.pieChart1)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

      const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(['#52958B', '#2C7873', '#004445']);

      const pie = d3.pie()
        .value(d => d.value);

      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius - 40);

      const arcs = svg.selectAll('arc')
        .data(pie(data))
        .enter()
        .append('g');

      arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.name));
    },
    createBarChart2() {
      const data = [
        { name: '铅', value: 2.5 },
        { name: '镉', value: 1.8 },
        { name: '铬', value: 3.2 },
        { name: '砷', value: 1.5 }
      ];

      const width = 300;
      const height = 200;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };

      const svg = d3.select(this.$refs.barChart2)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      svg.append('g')
        .attr('fill', '#52958B')
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => y(0) - y(d.value));

      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
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

.plot-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.plot-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 1400px;
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
}

.chart {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.description {
  padding: 10px;
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