<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useTicketStore } from "../store/ticketStore"

const route = useRoute()
const router = useRouter()
const store = useTicketStore()

const ticket = ref(null)

onMounted(async () => {

  try {

    await store.loadTickets()
    await store.loadStatus()
    await store.loadPriorities()

    ticket.value = store.tickets.find(
      t => Number(t.id) === Number(route.params.id)
    )

    console.log("Ticket trouvé :", ticket.value)
    console.log("Statuses :", store.statuses)
    console.log("Priorities :", store.priorities)

  } catch (error) {

    console.error(error)

  }
  ticket.value = store.tickets.find(
  t => Number(t.id) === Number(route.params.id)
)

if (ticket.value?.date) {

  const [jour, mois, annee] =
    ticket.value.date.split("/")

  ticket.value.date =
    `${annee}/${mois}/${jour}`
}

})

const enregistrer = async () => {

  try {

    await store.saveTicket(ticket.value)

    alert("Ticket modifié avec succès")

    router.push("/tickets")

  } catch (error) {

    console.error(error)

    alert("Erreur lors de la modification")

  }

}
</script>
<template>

<h2>Modifier Ticket</h2>

<div v-if="ticket">

  <label>Titre</label>
  <input
    v-model="ticket.titre"
    type="text"
  >

  <br><br>

  <label>Description</label>

  <textarea
    v-model="ticket.description"
  ></textarea>

  <br><br>

  <label>Status</label>

  <select v-model="ticket.status_id">

    <option
      v-for="status in store.statuses"
      :key="status.id"
      :value="status.id"
    >
      {{ status.name }}
    </option>

  </select>

  <br><br>

  <label>Priorité</label>

  <select v-model="ticket.priority_id">

    <option
      v-for="priority in store.priorities"
      :key="priority.id"
      :value="priority.id"
    >
      {{ priority.name }}
    </option>

  </select>

  <br><br>
  <label>Date</label>
  <input type="date" v-model="ticket.date">

  <br><br>

  <button @click="enregistrer">
    Enregistrer
  </button>

</div>

<div v-else>

  Ticket introuvable

</div>

</template>