<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ isRegister ? 'Register your account' : 'Sign in to your account' }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          <a
            href="#"
            @click.prevent="isRegister = !isRegister"
            class="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {{ isRegister ? 'Already have an account? Sign in' : 'Need an account? Register' }}
          </a>
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div v-if="isRegister">
            <input
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Full Name"
              v-model="userName"
            />
          </div>
          <div>
            <input
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="{'rounded-t-md': !isRegister}"
              placeholder="Phone Number"
              v-model="phoneNumber"
            />
          </div>
          <div>
            <input
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              v-model="password"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm mt-2">
          {{ error }}
        </div>
        <div v-if="message" class="text-green-500 text-sm mt-2">
          {{ message }}
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {{ isRegister ? 'Register' : 'Sign in' }}
          </button>
        </div>
      </form>
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
