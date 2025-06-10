import { createRouter, createWebHistory } from 'vue-router'
import HomeMap from '../components/HomeMap.vue'
import UserLogin from '../components/UserLogin.vue'
import PollutionPlot from '../components/PollutionPlot.vue'  // 添加导入
import DataAdding from '@/components/DataAdding.vue'
import UserRegister from '../components/UserRegister.vue'
import DataManage from '../components/DataManage.vue'


const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: UserLogin
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeMap,
    meta: { 
      keepAlive: true  // 启用组件缓存
    }
  },
  {
    path: '/plot',  // 添加新路由
    name: 'Plot',
    component: PollutionPlot
  },
  {
    path: '/data-adding',
    name: 'DataAdding',
    component: DataAdding
  },
  {
    path: '/DataManage',
    name: 'DataManage',
    component: DataManage
  },
  {
    path: '/register',
    name: 'Register',
    component: UserRegister
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router