<script setup>
import { onMounted } from "vue"
import { usepresentationStore } from "../store/presentationStore"

const store = usepresentationStore()

onMounted(() => {
  store.loadHistory()
})
</script>

<template>

<h2>Historique des tickets</h2>

<table>

  <thead>
    <tr>
      <th>ID</th>
      <th>Ticket</th>
      <th>Status</th>
      <th>Date</th>
    </tr>
  </thead>

  <tbody>

    <tr
      v-for="h in store.history"
      :key="h.id"
    >
      <td>{{ h.id }}</td>
      <td>{{ h.titre }}</td>
      <td>{{ h.status_name }}</td>
      <td>{{ h.date_time }}</td>
    </tr>

  </tbody>

</table>

</template>