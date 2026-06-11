<script setup>
import { onMounted } from "vue"
import { useTicketStore} from "../store/ticketStore"
import {useRouter} from "vue-router"

const store = useTicketStore()
const router = useRouter()

onMounted(() => {
  store.loadTickets()
})

const voirFiche = (ticket) =>{
    store.setSelectedTicket(ticket)
    router.push("/tickets/" + ticket.id)
}
const supprimerTick = async (ticketId) =>{
    const confirmation = confirm ("Supprimer ce ticket ?")
    if(!confirmation) return
    await store.removeTicket(ticketId)
}
const editTick =  (ticket) =>{
    store.saveTicket(ticket)
    router.push("/tickets/edit/" + ticket.id)
}
const formatDate = (date) => {

  if (!date) return ""

  if (date.includes("/")) {
    return date
  }

  const [year, month, day] = date.split("-")

  return `${day}/${month}/${year}`
}
</script>

<template>
<h2>Liste des tickets</h2>

<table>
    <thead>
        <tr>
            <th>N°</th>
            <th>Date</th>
            <th>Titre</th>
            <th>Status</th>
            <th>Propriet</th>
            <th>Action</th>
            <th>Date</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="ticket in store.tickets" :key="ticket.id">
            <td>{{ticket.num_ticket}}</td>
            <td>{{ticket.date}}</td>
            <td>{{ticket.titre}}</td>
            <td>{{ticket.status_name}}</td>
            <td>{{ticket.priority_name}}</td>
            <td>{{ formatDate(ticket.date) }}</td>
            <td>
                <button @click="voirFiche(ticket)">Voir</button>
                <button @click="supprimerTick(ticket.id)">Supprimer</button>
                <button @click="router.push('/tickets/edit/' + ticket.id)">Modifier </button>
            </td>

        </tr>
    </tbody>
</table>
</template>
