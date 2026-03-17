<template>
  <div>
    <!-- 根據 isLoggedIn 狀態切換元件 -->
    <Login v-if="!isLoggedIn" @login-success="handleLogin" />
    <Dashboard v-else :user="user" @logout="handleLogout" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'

const isLoggedIn = ref(false)
const user = ref(null)

// 處理登入成功事件
const handleLogin = (userData) => {
  user.value = userData
  isLoggedIn.value = true
}

// 處理登出事件
const handleLogout = () => {
  user.value = null
  isLoggedIn.value = false
}
</script>
