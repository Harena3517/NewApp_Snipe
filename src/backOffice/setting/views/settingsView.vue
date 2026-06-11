<script setup>
import { onMounted } from "vue"
import { usesettingsStore } from "../store/settingsStore"

const store = usesettingsStore()

onMounted(async () => {
  await store.loadSettings()
})

const enregistrer = async () => {
  await store.saveSettings()
  alert("Configuration enregistrée")
}
</script>

<template>

  <h2>Paramètres Kanban</h2>

  <div
    v-for="setting in store.settings"
    :key="setting.id"
    class="setting-card"
  >

    <h3>
      {{ setting.status_name }}
    </h3>

    <div>
      <label>Couleur</label>
      <input
        type="color"
        v-model="setting.color"
      />
    </div>

    <div>
      <label>Libellé Malagasy</label>
      <input
        v-model="setting.label"
      />
    </div>

  </div>

  <button @click="enregistrer">
    Enregistrer
  </button>

</template>

<style scoped>

.setting-card{
  border:1px solid #ccc;
  padding:15px;
  margin-bottom:15px;
  border-radius:8px;
}

</style>