<template>
  <div class="login-container">
    <!-- 添加返回按钮 -->
    <div class="back-button" @click="goBack">
      <span>&larr; 返回主页</span>
    </div>
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
        // 模拟登录请求
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // TODO: 实现实际的登录逻辑
        console.log('登录信息：', {
          type: this.loginType,
          ...this.formData
        })

        // 登录成功后的处理
        this.$router.push('/home')
      } catch (error) {
        console.error('登录失败：', error)
      } finally {
        this.isLoading = false
      }
    },
    // 添加返回方法
    goBack() {
      this.$router.push('/home')
    },
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
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-form-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.login-box {
  width: 400px;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.login-tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
}

.tab.active {
  color: #2C7873;
  border-bottom: 2px solid #2C7873;
}

.form-item {
  margin-bottom: 20px;
}

.form-item input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.form-item input:focus {
  border-color: #2C7873;
  outline: none;
}

.form-item input.error {
  border-color: #ff4d4f;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  width: 20px;
  height: 20px;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>') center/contain no-repeat;
}

.password-toggle.visible {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>');
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.forget-password {
  color: #2C7873;
  text-decoration: none;
}

.forget-password:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #2C7873;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover {
  background-color: #52958B;
}

.login-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-display-section {
  flex: 1;
  background: linear-gradient(135deg, #2C7873, #52958B); /* 添加渐变背景替代图片 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.display-content {
  text-align: center;
  color: white;
}

.display-content h1 {
  font-size: 28px;
  margin-bottom: 16px;
}

.display-content p {
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 40px;
}

.display-image {
  max-width: 80%;
  height: auto;
}

@media (max-width: 1024px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-display-section {
    display: none;
  }
}
</style>