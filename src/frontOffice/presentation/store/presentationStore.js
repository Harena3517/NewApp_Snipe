<<<<<<< HEAD
import { defineStore } from "pinia"
import presentationService
from "../services/presentationService"

export const usepresentationStore =defineStore("usepresentationStore",
  {
    state: () => ({
      assets: [],
      status: [],
      priorities: [],
      ticks: [],
      selectedTicket: null,
      history: [],
      rapport: [],
      cat: [],
      costs: []
    }),

    actions: {
      async loadAsset() {
        this.assets = await presentationService.getAssets()
        this.status = await presentationService.getStatus()
        this.priorities = await presentationService.getPriorities()
      },
      async createTicket(data) {
        return await presentationService.createTicket( data)
      },
      async loadTickets() {
        this.ticks = await presentationService.getAllTickets()
=======
import { defineStore } from "pinia";
import presentationStore from "../services/presentationService";

export const usepresentationStore = defineStore("usepresentationStore" , {
    state :() =>({
        assets : [],
        status : [],
        priorities : [],
        ticks: [],
        selectedTicket: null,
        history :[]
    }),
    actions : {
        async loadAsset() {
            this.assets = await presentationStore.getAssets()
            this.status = await presentationStore.getStatus()
            this.priorities = await presentationStore.getPriorities()
        },
        async createTicket (data){
            return await presentationStore.createTicket(data)
        } ,
      async loadTickets(){
        const data = await presentationStore.getAllTickets()
        console.log(data)
        this.ticks = data 
>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
      },
      setSelectedTicket(ticket) {
        this.selectedTicket = ticket
      },
<<<<<<< HEAD
      async changeStatus(
        ticketId,
        statusId,
        titre,
        description,
        date
      ) {
        await presentationService.changeStatus(
=======
      async changeStatus(ticketId, statusId, titre, description, date) {

        console.log("ticketId =", ticketId)
        console.log("statusId =", statusId)
        console.log("date =", date)

        await presentationStore.changeStatus(
>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
          ticketId,
          statusId,
          titre,
          description,
          date
        )
<<<<<<< HEAD
        await presentationService.addHistory(
          ticketId,
          statusId,
          new Date().toISOString()
        )
        await this.loadTickets()
      },
      async loadHistory() {
        this.history = await presentationService.getHistory()
      },
      async loadCost() {
        const data = await presentationService.getCost()
        this.costs = data
      },
      async addCost(ticketId, montant, categoryName, groupeId) {
  await presentationService.addCost(ticketId, montant, categoryName, groupeId)
},
async deleteTicketCosts(ticketId) {
  await presentationService.deleteLastCost(ticketId)
}
    }
  }
)
=======

        await presentationStore.addHistory(
          ticketId,
          statusId,
          date
        )

        await this.loadTickets()
      },
    async loadHistiry(){
      const data = await presentationStore.getHistory()
      this.history = data
    }
    }
})
>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
