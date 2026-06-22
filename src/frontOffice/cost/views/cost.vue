<script setup>
import { onMounted, ref } from "vue"
import { useCostStore } from "../store/costStore"

const store = useCostStore()

const selectedCategory = ref(null)

const showDetails = async (category) => {
  selectedCategory.value = category

  if (store.details.length === 0) {
    await store.loadDetails()
  }
}

onMounted(async () => {
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
          <th>Coût Saisie</th>
          <th>Réouverture</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cost in store.cost" :key="cost.category_name">
          <td>
            <button @click="showDetails(cost.category_name)">
              {{ cost.category_name }}
            </button>
          </td>
          <td>{{ cost.cout_saisie }} Ar</td>
          <td>{{ cost.reouverture }} Ar</td>
          <td>{{ cost.total }} Ar</td>
        </tr>
      </tbody>
    </table>
    <h2>Coûts par ticket</h2>
    <table border="1">
      <thead>
        <tr>
          <th>Ticket</th>
          <th>Coût Saisie</th>
          <th>Réouverture</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="ticket in store.ticketCosts"
          :key="ticket.ticket_id"
        >
          <td>#{{ ticket.num_ticket }} - {{ ticket.titre }}</td>
          <td>{{ ticket.cout_saisie }} Ar</td>
          <td>{{ ticket.reouverture }} Ar</td>
          <td>{{ ticket.total }} Ar</td>
        </tr>
      </tbody>
    </table>
    <div v-if="selectedCategory">
  <h3>Détail : {{ selectedCategory }}</h3>

  <table border="1">
    <thead>
      <tr>
        <th>Ticket</th>
        <th>Assets</th>
        <th>Type</th>
        <th>Montant</th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="d in store.details.filter(
          x => x.category_name === selectedCategory
        )"
        :key="d.ticket_id + '-' + d.montant + '-' + d.type"
      >
        <td>#{{ d.num_ticket }} - {{ d.titre }}</td>

        <td>{{ d.assets.join(", ") }}</td>

        <td>{{ d.type }}</td>

        <td>{{ d.montant }} Ar</td>
      </tr>
    </tbody>
  </table>
</div>
  </div>
</template>