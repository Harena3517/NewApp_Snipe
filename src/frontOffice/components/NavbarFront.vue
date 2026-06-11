<script setup>
import { useRouter } from "vue-router"

const router = useRouter()
</script>

<template>
  <nav class="navbar">
    <div class="navbar-left">
      <span class="logo">📦 SnipeApp</span>
      <router-link to="/hardware">Assets</router-link>
      <router-link to="/tickcreate">Tickets</router-link>
      <router-link to="/presentation">Presentation Ticket</router-link>
    </div>
    <div class="navbar-right">
      <button @click="router.push('/login')">🔒 Backoffice</button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2c3e50;
  padding: 12px 24px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}

.navbar-left a {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 0.95rem;
}

.navbar-left a:hover,
.navbar-left a.router-link-active {
  color: #3498db;
  border-bottom: 2px solid #3498db;
  padding-bottom: 2px;
}

.navbar-right button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.navbar-right button:hover {
  background-color: #c0392b;
}
</style>