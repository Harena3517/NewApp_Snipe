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
      },
      setSelectedTicket(ticket) {
        this.selectedTicket = ticket
      },
      async changeStatus(ticketId, statusId, titre, description, date) {

        console.log("ticketId =", ticketId)
        console.log("statusId =", statusId)
        console.log("date =", date)

        await presentationStore.changeStatus(
          ticketId,
          statusId,
          titre,
          description,
          date
        )

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