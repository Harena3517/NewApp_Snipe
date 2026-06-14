<script setup>
import { onMounted } from "vue"
import { useTicketStore} from "../store/ticketStore"
import {useRouter} from "vue-router"

const store = useTicketStore()
const router = useRouter()

const ticket = store.selectedTicket
const items = () =>{
    try{
        return JSON.parse(ticket.items)
    }catch{
        return []
    }
}
const retour = () =>{
    router.push("/tickets")
}
</script>

<template>
<div v-if="ticket">
<button @click="retour">Retour</button>

<h2>Fiche ticket #{{ticket.num_ticket}}</h2>
            <p><strong>Date</strong>{{ticket.date}}</p>
            <p><strong>Titre</strong>{{ticket.titre}}</p>
            <p><strong>Description</strong>{{ticket.description}}</p>
            <p><strong>Status</strong>{{ticket.status_name}}</p>
            <p><strong>Proprity</strong>{{ticket.priority_name}}</p>
            <p><strong>Date</strong>{{ticket.date}}</p>
           <h3>Asset associe</h3>
           <ul>
            <li v-for="item in items()" :key="item">{{item}}</li>
           </ul>
</div>
<div v-else="">
    <p>Aucun ticket selectionne
    <button @click="retour">Retour</button>
    </p>
</div>

</template>
