<template>
  <div class="login-page">
    <div class="login-card">

      <!-- Title / Branding -->
      <div class="login-header">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
          </svg>
        </div>
        <h1 class="app-title">Library System</h1>
        <p class="app-subtitle">{{ isRegister ? 'Create a new account' : 'Sign in to your account' }}</p>
      </div>

      <!-- Form -->
      <form class="login-form" @submit.prevent="handleSubmit">
        <div v-if="isRegister" class="form-group">
          <label>Full Name</label>
          <input type="text" required placeholder="Enter your full name" v-model="userName" />
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="text" required placeholder="Enter your phone number" v-model="phoneNumber" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" required placeholder="Enter your password" v-model="password" />
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div v-if="message" class="alert alert-success">{{ message }}</div>

        <button type="submit" class="btn-primary">
          {{ isRegister ? 'Register' : 'Sign in' }}
        </button>
      </form>

      <!-- Toggle -->
      <p class="toggle-text">
        {{ isRegister ? 'Already have an account?' : "Don't have an account?" }}
        <a href="#" @click.prevent="isRegister = !isRegister">
          {{ isRegister ? 'Sign in' : 'Register' }}
        </a>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const emit = defineEmits(['login-success'])

const isRegister = ref(false)
const userName = ref('')
const phoneNumber = ref('')
const password = ref('')
const error = ref('')
const message = ref('')

const handleSubmit = async () => {
  error.value = ''
  message.value = ''

  if (isRegister.value) {
    try {
      const res = await axios.post('/api/register', {
        phoneNumber: phoneNumber.value,
        password: password.value,
        userName: userName.value
      })
      if (res.data.success) {
        message.value = 'Registration successful! Please sign in.'
        isRegister.value = false
        password.value = ''
        userName.value = ''
      } else {
        error.value = res.data.message || 'Registration failed'
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration error'
    }
  } else {
    try {
      const res = await axios.post('/api/login', {
        phoneNumber: phoneNumber.value,
        password: password.value
      })
      if (res.data.success) {
        emit('login-success', {
          userId: res.data.userId,
          userName: res.data.userName,
          phoneNumber: phoneNumber.value
        })
      } else {
        error.value = res.data.message || 'Login failed'
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login error'
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

.logo-icon svg {
  width: 30px;
  height: 30px;
}

.app-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.25rem;
}

.app-subtitle {
  font-size: 0.9rem;
  color: #888;
  margin: 0;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
}

.form-group input {
  padding: 0.65rem 0.9rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #333;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #667eea;
}

/* Alerts */
.alert {
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

.alert-error {
  background: #fff0f0;
  color: #d63031;
  border: 1px solid #fab8b8;
}

.alert-success {
  background: #f0fff4;
  color: #00b894;
  border: 1px solid #b8f0cc;
}

/* Button */
.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  margin-top: 0.25rem;
}

.btn-primary:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Toggle link */
.toggle-text {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.875rem;
  color: #888;
}

.toggle-text a {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}

.toggle-text a:hover {
  text-decoration: underline;
}
</style>
