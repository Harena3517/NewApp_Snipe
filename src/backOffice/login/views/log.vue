<script setup>
import { ref } from "vue"
import { useAuthStore } from "../store/logStore"
import { useRouter } from "vue-router"

const authStore = useAuthStore()
const router = useRouter()

// Code pré-rempli par défaut
const code = ref(import.meta.env.VITE_BACKOFFICE_CODE)
const erreur = ref("")

const seConnecter = () => {
  console.log("code saisi:", code.value)
  console.log("code env:", import.meta.env.VITE_BACKOFFICE_CODE)
  const ok = authStore.login(code.value)
  console.log("résultat login:", ok)
  if (ok) {
    router.push("/reset")
  } else {
    erreur.value = "Code incorrect"
  }
}
</script>

<template>
  <div class="login-container">
    <h2>Backoffice</h2>

    <input
      v-model="code"
      type="password"
      placeholder="Code d'accès"
    />

    <p v-if="erreur" class="erreur">{{ erreur }}</p>

    <button @click="seConnecter">Entrer</button>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 300px;
  margin: 100px auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}
input {
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 8px;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.erreur {
  color: red;
  font-size: 0.85rem;
}
</style>