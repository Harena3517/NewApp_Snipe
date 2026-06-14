<script setup>
import { onMounted } from "vue"
import { useCostStore } from "../store/costStore.js"

const store = useCostStore()

onMounted(async () => {
  console.log("MOUNT COST VUE")
  await store.loadRapport()
})
</script>

<template>
  <div>
    <h2>Rapport des coûts par catégorie</h2>

    <table border="1">
      <thead>
        <tr>
          <th>Catégorie</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="cost in store.cost" :key="cost.category_name">
          <td>{{ cost.category_name }}</td>
          <td>{{ cost.total }} Ar</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>