import { defineStore } from "pinia";
import ticketsService from "../services/ticketsService";

export const useticketStore = defineStore("ticketStore" , {
    state :() =>({
        assets : [],
        status : [],
        priorities : [],
        ticks: [],
        selectedTicket: null
    }),
    actions : {
        async loadAsset() {
            this.assets = await ticketsService.getAssets()
            this.status = await ticketsService.getStatus()
            this.priorities = await ticketsService.getPriorities()
        },
        async createTicket (data){
            return await ticketsService.createTicket(data)
        } ,
      async loadTickets(){
        const data = await ticketsService.getAllTickets()
        console.log(data)
        this.ticks = data 
      },
      setSelectedTicket(ticket) {
        this.selectedTicket = ticket
      }
    }
})