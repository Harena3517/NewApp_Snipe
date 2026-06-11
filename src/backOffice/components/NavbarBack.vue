<script setup>
import { useAuthStore } from "../login/store/logStore.js"
import { useRouter } from "vue-router"

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push("/hardware")
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-left">
      <span class="logo"> Backoffice</span>
      <router-link to="/dash">Dashboard</router-link>
      <router-link to="/import">Import</router-link>
      <router-link to="/reset">Réinitialisation</router-link>
      <router-link to="/tickets">Tickets</router-link>
      <router-link to="/setting">Setting</router-link>
    </div>
    <div class="navbar-right">
      <button @click="logout"> Déconnexion</button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1a252f;
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
  color: #bdc3c7;
  text-decoration: none;
  font-size: 0.95rem;
}

.navbar-left a:hover,
.navbar-left a.router-link-active {
  color: #2ecc71;
  border-bottom: 2px solid #2ecc71;
  padding-bottom: 2px;
}

.navbar-right button {
  background-color: #7f8c8d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.navbar-right button:hover {
  background-color: #636e72;
}
</style>