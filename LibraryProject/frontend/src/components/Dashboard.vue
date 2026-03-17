<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <span class="ml-2 text-xl font-bold text-gray-900">Library System (Vue)</span>
          </div>
          <div class="flex items-center">
            <!-- Vue 的 {{ }} 預設會進行 HTML Escape，有效防止 XSS 攻擊 -->
            <span class="text-gray-700 mr-4">Welcome, {{ user.userName }}</span>
            <button
              @click="$emit('logout')"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div v-if="error" class="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>
      <div v-if="message" class="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
        <p class="text-sm text-green-700">{{ message }}</p>
      </div>

      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'inventory'"
            :class="[
              activeTab === 'inventory' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            Available Books
          </button>
          <button
            @click="activeTab = 'records'"
            :class="[
              activeTab === 'records' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            My Borrowing Records
          </button>
        </nav>
      </div>

      <div v-if="activeTab === 'inventory'" class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          <li v-for="item in inventory" :key="item.InventoryId">
            <div class="px-4 py-4 flex items-center sm:px-6">
              <div class="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <div class="flex text-sm font-medium text-indigo-600 truncate">
                    {{ item.Name }}
                  </div>
                  <div class="mt-2 flex">
                    <div class="flex items-center text-sm text-gray-500">
                      <span class="truncate">Author: {{ item.Author }} | ISBN: {{ item.ISBN }}</span>
                    </div>
                  </div>
                </div>
                <div class="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                  <div class="flex space-x-4 items-center">
                    <span :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      item.Status === '可借閱' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]">
                      {{ item.Status }}
                    </span>
                    <button
                      v-if="item.Status === '可借閱'"
                      @click="handleBorrow(item.InventoryId)"
                      class="ml-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Borrow
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <li v-if="inventory.length === 0" class="px-4 py-8 text-center text-gray-500">
            No books available.
          </li>
        </ul>
      </div>

      <div v-if="activeTab === 'records'" class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          <li v-for="record in records" :key="record.RecordId">
            <div class="px-4 py-4 flex items-center sm:px-6">
              <div class="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <div class="flex text-sm font-medium text-indigo-600 truncate">
                    {{ record.Name }}
                  </div>
                  <div class="mt-2 flex">
                    <div class="flex items-center text-sm text-gray-500">
                      <span class="truncate">
                        Borrowed: {{ new Date(record.BorrowingTime).toLocaleString() }}
                        <span v-if="record.ReturnTime"> | Returned: {{ new Date(record.ReturnTime).toLocaleString() }}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                  <div class="flex space-x-4 items-center">
                    <span :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      !record.ReturnTime ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    ]">
                      {{ !record.ReturnTime ? 'Currently Borrowed' : 'Returned' }}
                    </span>
                    <button
                      v-if="!record.ReturnTime"
                      @click="handleReturn(record.InventoryId)"
                      class="ml-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                    >
                      Return
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <li v-if="records.length === 0" class="px-4 py-8 text-center text-gray-500">
            No borrowing records found.
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['logout'])

const activeTab = ref('inventory')
const inventory = ref([])
const records = ref([])
const error = ref('')
const message = ref('')

const fetchInventory = async () => {
  try {
    const res = await axios.get('/api/inventory')
    inventory.value = res.data
  } catch (err) {
    console.error(err)
  }
}

const fetchRecords = async () => {
  try {
    const res = await axios.get(`/api/borrowing-records/me?userId=${props.user.userId}`)
    records.value = res.data
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  fetchInventory()
  fetchRecords()
})

const handleBorrow = async (inventoryId) => {
  error.value = ''
  message.value = ''
  try {
    const res = await axios.post('/api/borrow', {
      userId: props.user.userId,
      inventoryId
    })
    
    if (res.data.p_success) {
      message.value = res.data.p_message
      fetchInventory()
      fetchRecords()
    } else {
      error.value = res.data.p_message
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to borrow book'
  }
}

const handleReturn = async (inventoryId) => {
  error.value = ''
  message.value = ''
  try {
    const res = await axios.post('/api/return', {
      userId: props.user.userId,
      inventoryId
    })
    
    if (res.data.p_success) {
      message.value = res.data.p_message
      fetchInventory()
      fetchRecords()
    } else {
      error.value = res.data.p_message
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to return book'
  }
}
</script>
