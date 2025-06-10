<template>
  <div class="login-container">
    <!-- 左侧登录表单 -->
    <div class="login-form-section">
      <div class="login-box">
        <!-- 登录类型切换 -->
        <div class="login-tabs">
          <div 
            :class="['tab', { active: loginType === 'visitor' }]"
            @click="loginType = 'visitor'"
          >
            访客登录
          </div>
          <div 
            :class="['tab', { active: loginType === 'admin' }]"
            @click="loginType = 'admin'"
          >
            管理员登录
          </div>
        </div>

        <!-- 登录表单 -->
        <form class="login-form" @submit.prevent="handleLogin">
          <!-- 手机号输入 -->
          <div class="form-item">
            <input 
              v-model="formData.phone" 
              type="text" 
              placeholder="请输入手机号"
              :class="{ 'error': errors.phone }"
            >
            <span class="error-message" v-if="errors.phone">{{ errors.phone }}</span>
          </div>

          <!-- 管理员口令（仅管理员登录时显示） -->
          <div class="form-item" v-if="loginType === 'admin'">
            <input 
              v-model="formData.adminToken" 
              type="password" 
              placeholder="请输入管理员口令"
              :class="{ 'error': errors.adminToken }"
            >
            <span class="error-message" v-if="errors.adminToken">{{ errors.adminToken }}</span>
          </div>

          <!-- 密码输入 -->
          <div class="form-item">
            <div class="password-input">
              <input 
                v-model="formData.password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="请输入密码"
                :class="{ 'error': errors.password }"
              >
              <i 
                :class="['password-toggle', showPassword ? 'visible' : '']"
                @click="showPassword = !showPassword"
              ></i>
            </div>
            <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
          </div>

          <!-- 记住密码和忘记密码 -->
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="formData.rememberMe">
              <span>记住密码</span>
            </label>
            <a href="#" class="forget-password">忘记密码？</a>
          </div>

          <!-- 登录按钮 -->
          <button type="submit" class="login-button" :disabled="isLoading">
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
          
          <!-- 添加注册入口 -->
          <div class="register-tip">
            没有账号？<span class="register-link" @click="goToRegister">点此注册新账号</span>
          </div>
        </form>
      </div>
    </div>

    <!-- 右侧展示区域 -->
    <div class="login-display-section">
      <div class="display-content">
        <h1>青山工业区多介质污染综合管理系统</h1>
        <p>实时监测 · 数据分析 · 智能预警</p>
        <!-- 移除图片标签 -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserLogin',
  data() {
    return {
      loginType: 'visitor', // visitor 或 admin
      showPassword: false,
      isLoading: false,
      formData: {
        phone: '',
        password: '',
        adminToken: '',
        rememberMe: false
      },
      errors: {
        phone: '',
        password: '',
        adminToken: ''
      }
    }
  },
  methods: {
    validateForm() {
      let isValid = true
      this.errors = {
        phone: '',
        password: '',
        adminToken: ''
      }

      // 手机号验证
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!this.formData.phone) {
        this.errors.phone = '请输入手机号'
        isValid = false
      } else if (!phoneRegex.test(this.formData.phone)) {
        this.errors.phone = '请输入有效的手机号'
        isValid = false
      }

      // 密码验证
      if (!this.formData.password) {
        this.errors.password = '请输入密码'
        isValid = false
      } else if (this.formData.password.length < 6) {
        this.errors.password = '密码长度不能少于6位'
        isValid = false
      }

      // 管理员口令验证
      if (this.loginType === 'admin' && !this.formData.adminToken) {
        this.errors.adminToken = '请输入管理员口令'
        isValid = false
      }

      return isValid
    },
    async handleLogin() {
      if (!this.validateForm()) return

      this.isLoading = true
      try {
        // 构造请求参数
        const payload = {
          phone: this.formData.phone,
          password: this.formData.password
          
        };
        if (this.loginType === 'admin') {
          payload.adminToken = this.formData.adminToken;
        }

        // TODO: 替换为实际的后端API调用
        // 假设您使用axios库进行API请求
        // import axios from 'axios'; // 需要在script顶部导入
        // const response = await axios.post('/api/login', payload);

        // 模拟后端响应 - 请替换为实际的API调用和响应处理
        await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
        const response = { data: { success: true, message: '登录成功' } }; // 模拟成功响应
        // const response = { data: { success: false, message: '手机号或密码错误' } }; // 模拟失败响应

        if (response.data.success) {
          console.log('登录成功：', response.data.message);
          // 登录成功后的处理，例如保存token，然后跳转
          // localStorage.setItem('userToken', response.data.token); // 假设后端返回token
          this.$router.push('/home');
        } else {
          // 登录失败，显示错误信息
          console.error('登录失败：', response.data.message);
          // 可以在界面上显示错误提示，例如:
          // this.loginError = response.data.message;
          alert(response.data.message); // 简单起见，使用alert
        }

      } catch (error) {
        console.error('登录请求失败：', error);
        // 处理网络错误或其他请求错误
        // this.loginError = '登录请求失败，请稍后再试';
        alert('登录请求失败，请稍后再试'); // 简单起见，使用alert
      } finally {
        this.isLoading = false
      }
    },
    goToRegister() {
      this.$router.push('/register')
    }
  }
}
</script>

<style scoped>
/* 添加返回按钮样式 */
.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 8px 16px;
  color: #2C7873;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
}

.back-button:hover {
  color: #52958B;
}
.login-container {
  display: flex;
  width: 80%;  /* 修改为80%宽度 */
  height: 80vh;  /* 修改为80%高度 */
  background-color: #f5f5f5;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.login-form-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5%;
  background-color: white;
}

/* 修改右侧展示区域样式 */
.login-display-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2C7873;
  padding: 5%;
}
.display-content {
  text-align: center;
  color: white;
  width: 90%;
}
.display-content h1 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  line-height: 1.4;
  font-weight: 500;
}
.display-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
}
.login-box {
  width: 90%;
  max-width: 380px;
  background: white;
  padding: 5% 8%;
  border-radius: 1rem;
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.05);
}
.login-tabs {
  display: flex;
  margin-bottom: 8%;
  border-bottom: 2px solid #eee;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 3% 0;
  cursor: pointer;
  color: #666;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
}
.tab.active {
  color: #2C7873;
  font-weight: 500;
}
.tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #2C7873;
}
.login-form {
  width: 100%;
}
.form-item {
  margin-bottom: 6%;
  width: 100%;
}
.form-item input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1.5px solid #e8e8e8;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background-color: #f8f8f8;
}
.form-item input:focus {
  border-color: #2C7873;
  background-color: white;
  outline: none;
  box-shadow: 0 0 0 3px rgba(44, 120, 115, 0.1);
}
.login-button {
  width: 100%;
  padding: 0.8rem;
  background-color: #2C7873;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 3%;
}
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5% 0;
  width: 100%;
}
.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}
.register-tip {
  text-align: center;
  margin-top: 8%;
  font-size: 0.9rem;
  color: #666;
}
.error-message {
  color: #ff4d4f;
  font-size: 0.8rem;
  margin-top: 2%;
  display: block;
}
</style>