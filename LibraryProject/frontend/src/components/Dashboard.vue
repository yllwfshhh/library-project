<template>
  <div class="dashboard">

    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-inner">
        <div class="navbar-brand">
          <div class="nav-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
            </svg>
          </div>
          <span class="nav-title">Library System</span>
        </div>
        <div class="navbar-right">
          <span class="welcome-text">Welcome, {{ user.userName }}</span>
          <button @click="$emit('logout')" class="btn-logout">Logout</button>
        </div>
      </div>
    </nav>

    <!-- Main -->
    <main class="main-content">

      <!-- Alerts -->
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="message" class="alert alert-success">{{ message }}</div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          @click="activeTab = 'inventory'"
          :class="['tab-btn', activeTab === 'inventory' ? 'tab-active' : '']"
        >Available Books</button>
        <button
          @click="activeTab = 'records'"
          :class="['tab-btn', activeTab === 'records' ? 'tab-active' : '']"
        >My Borrowing Records</button>
      </div>

      <!-- Inventory Tab -->
      <div v-if="activeTab === 'inventory'" class="card-list">
        <div v-if="inventory.length === 0" class="empty-state">No books available.</div>
        <div v-for="item in inventory" :key="item.InventoryId" class="book-card">
          <div class="book-info">
            <div class="book-title">{{ item.Name }}</div>
            <div class="book-meta">{{ item.Author }} &nbsp;|&nbsp; ISBN: {{ item.ISBN }}</div>
            <div v-if="item.Status === '已借閱'" class="book-return-date">
              Expected return: {{ item.ExpectedReturnTime ? new Date(item.ExpectedReturnTime).toLocaleDateString() : 'N/A' }}
            </div>
          </div>
          <div class="book-actions">
            <span :class="['status-badge', item.Status === '可借閱' ? 'status-available' : 'status-borrowed']">
              {{ item.Status }}
            </span>
            <button
              v-if="item.Status === '可借閱'"
              @click="handleBorrow(item.InventoryId)"
              class="btn-borrow"
            >Borrow</button>
          </div>
        </div>
      </div>

      <!-- Records Tab -->
      <div v-if="activeTab === 'records'" class="card-list">
        <div v-if="records.length === 0" class="empty-state">No borrowing records found.</div>
        <div v-for="record in records" :key="record.RecordId" class="book-card">
          <div class="book-info">
            <div class="book-title">{{ record.Name }}</div>
            <div class="book-meta">
              Borrowed: {{ new Date(record.BorrowingTime).toLocaleString() }}
              <span v-if="record.ReturnTime"> &nbsp;|&nbsp; Returned: {{ new Date(record.ReturnTime).toLocaleString() }}</span>
            </div>
            <div v-if="!record.ReturnTime" class="book-return-date">
              Please return by: {{ new Date(record.ExpectedReturnTime).toLocaleDateString() }}
            </div>
          </div>
          <div class="book-actions">
            <span :class="['status-badge', !record.ReturnTime ? 'status-borrowed' : 'status-returned']">
              {{ !record.ReturnTime ? 'Borrowing' : 'Returned' }}
            </span>
            <button
              v-if="!record.ReturnTime"
              @click="handleReturn(record.InventoryId)"
              class="btn-return"
            >Return</button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  user: { type: Object, required: true }
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
    const res = await axios.post('/api/borrow', { userId: props.user.userId, inventoryId })
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
    const res = await axios.post('/api/return', { userId: props.user.userId, inventoryId })
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

<style scoped>
/* Layout */
.dashboard {
  min-height: 100vh;
  background: #f4f6fb;
  font-family: 'Segoe UI', sans-serif;
}

/* Navbar */
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 1.5rem;
  box-shadow: 0 2px 12px rgba(102,126,234,0.3);
}

.navbar-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.nav-logo {
  width: 32px;
  height: 32px;
  color: white;
}

.nav-logo svg {
  width: 100%;
  height: 100%;
}

.nav-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.3px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-text {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.85);
}

.btn-logout {
  background: rgba(255,255,255,0.15);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 0.35rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: rgba(255,255,255,0.25);
}

/* Main */
.main-content {
  max-width: 960px;
  margin: 2rem auto;
  padding: 0 1rem;
}

/* Alerts */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
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

/* Tabs */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e8e8e8;
  padding-bottom: 0;
}

.tab-btn {
  padding: 0.6rem 1.2rem;
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: #888;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s, border-color 0.2s;
}

.tab-btn:hover {
  color: #667eea;
}

.tab-active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}

/* Book Cards */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.book-card {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
}

.book-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.book-info {
  flex: 1;
}

.book-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d2d2d;
  margin-bottom: 0.25rem;
}

.book-meta {
  font-size: 0.82rem;
  color: #888;
}

.book-return-date {
  font-size: 0.82rem;
  color: #e17055;
  margin-top: 0.2rem;
}

/* Actions */
.book-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.status-badge {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
}

.status-available {
  background: #e8f8f0;
  color: #00b894;
}

.status-borrowed {
  background: #fff3e0;
  color: #e17055;
}

.status-returned {
  background: #f0f0f0;
  color: #888;
}

.btn-borrow {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.btn-borrow:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.btn-return {
  background: #00b894;
  color: white;
  border: none;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.btn-return:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #bbb;
  font-size: 0.9rem;
}
</style>
