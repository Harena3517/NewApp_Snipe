import { defineStore } from "pinia"
import costService from "../service/costService"

export const useCostStore = defineStore("cost", {
  state: () => ({
    cost: [],
    ticketCosts: [],
    details: []
  }),

  actions: {
    async loadRapport() {
      this.cost = await costService.getCost()
      this.ticketCosts = await costService.getCostByTicket()
    },

    async loadDetails() {
      this.details = await costService.getCostDetail()
    }
  }
})