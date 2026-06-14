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
      },
      setSelectedTicket(ticket) {
        this.selectedTicket = ticket
      },
      async changeStatus(
        ticketId,
        statusId,
        titre,
        description,
        date
      ) {
        await presentationService.changeStatus(
          ticketId,
          statusId,
          titre,
          description,
          date
        )
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