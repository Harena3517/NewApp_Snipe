import { defineStore } from "pinia"
import ticketService from "../services/ticketService"


export const useTicketStore =
  defineStore("ticket", {

    state: () => ({
      tickets: [],
      statuses : [],
      priorities :[],
      selectedTicket: null
    }),

    actions: {

      async loadTickets() {
        const data = await ticketService.getallTickets()
        this.tickets = data
      },
      setSelectedTicket(ticket) {
        this.selectedTicket = ticket
      },
      async removeTicket (ticketId){
        try{
                  await ticketService.removeTickets(ticketId)
        this.tickets = this.tickets.filter(t => t.id !== ticketId)
        }catch{
          console.log("Erreur de suppression")
        }
      } ,
      async saveTicket (ticket){
        try{
                  await ticketService.editTickets(
          ticket.id,
          ticket.titre ,
          ticket.description,
          ticket.status_id,
          ticket.priority_id,
          ticket.date
        )
      await this.loadTickets()
        }catch{
          console.log ("Erreur modification")
        }
      },
      async loadStatus (){
        const data = await ticketService.getStatuses()
        this.statuses = data
      },
      async loadPriorities (){
        const data = await ticketService.getPriorities()
        this.priorities = data
      }
    }
  })