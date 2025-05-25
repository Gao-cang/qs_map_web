<template>
  <div class="register-container">
    <!-- 返回按钮 -->
    <div class="back-button" @click="goBack">
      <span>&larr; 返回登录</span>
    </div>

    <!-- 注册框 -->
    <div class="register-box">
      <h2>用户注册</h2>
      
      <!-- 注册类型切换 -->
      <div class="register-tabs">
        <div 
          :class="['tab', { active: registerType === 'visitor' }]"
          @click="registerType = 'visitor'"
        >
          访客注册
        </div>
        <div 
          :class="['tab', { active: registerType === 'admin' }]"
          @click="registerType = 'admin'"
        >
          管理员注册
        </div>
      </div>

      <!-- 注册表单 -->
      <form class="register-form" @submit.prevent="handleRegister">
        <!-- 手机号 -->
        <div class="form-item">
          <input 
            v-model="formData.phone"
            type="text"
            placeholder="请输入手机号"
            :class="{ 'error': errors.phone }"
          >
          <span class="error-message" v-if="errors.phone">{{ errors.phone }}</span>
        </div>

        <!-- 昵称 -->
        <div class="form-item">
          <input 
            v-model="formData.nickname"
            type="text"
            placeholder="请输入昵称"
            :class="{ 'error': errors.nickname }"
          >
          <span class="error-message" v-if="errors.nickname">{{ errors.nickname }}</span>
        </div>

        <!-- 密码 -->
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

        <!-- 确认密码 -->
        <div class="form-item">
          <div class="password-input">
            <input 
              v-model="formData.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请确认密码"
              :class="{ 'error': errors.confirmPassword }"
            >
          </div>
          <span class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
        </div>

        <!-- 管理员口令 -->
        <div class="form-item" v-if="registerType === 'admin'">
          <input 
            v-model="formData.adminToken"
            type="password"
            placeholder="请输入管理员口令"
            :class="{ 'error': errors.adminToken }"
          >
          <span class="error-message" v-if="errors.adminToken">{{ errors.adminToken }}</span>
        </div>

        <!-- 注册按钮 -->
        <button type="submit" class="register-button" :disabled="isLoading">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserRegister',
  data() {
    return {
      registerType: 'visitor', // visitor 或 admin
      showPassword: false,
      isLoading: false,
      formData: {
        phone: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        adminToken: ''
      },
      errors: {
        phone: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        adminToken: ''
      }
    }
  },
  methods: {
    validateForm() {
      let isValid = true
      this.errors = {
        phone: '',
        nickname: '',
        password: '',
        confirmPassword: '',
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

      // 昵称验证
      if (!this.formData.nickname) {
        this.errors.nickname = '请输入昵称'
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

      // 确认密码验证
      if (!this.formData.confirmPassword) {
        this.errors.confirmPassword = '请确认密码'
        isValid = false
      } else if (this.formData.confirmPassword !== this.formData.password) {
        this.errors.confirmPassword = '两次输入的密码不一致'
        isValid = false
      }

      // 管理员口令验证
      if (this.registerType === 'admin' && !this.formData.adminToken) {
        this.errors.adminToken = '请输入管理员口令'
        isValid = false
      }

      return isValid
    },
    async handleRegister() {
      if (!this.validateForm()) return

      this.isLoading = true
      try {
        // TODO: 实现实际的注册逻辑
        // 1. 调用后端API进行注册
        // const response = await api.register({
        //   type: this.registerType,
        //   ...this.formData
        // })
        
        // 2. 模拟注册请求
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 3. 注册成功后跳转到登录页
        this.$router.push('/login')
      } catch (error) {
        console.error('注册失败：', error)
      } finally {
        this.isLoading = false
      }
    },
    goBack() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 8px 16px;
  color: #2C7873;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  color: #52958B;
}

.register-box {
  width: 33.33%;
  min-width: 320px;
  max-width: 480px;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.register-box h2 {
  text-align: center;
  color: #2C7873;
  margin-bottom: 30px;
}

.register-tabs {
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

.register-button {
  width: 100%;
  padding: 12px;
  background-color: #2C7873;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.register-button:hover {
  background-color: #52958B;
}

.register-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>