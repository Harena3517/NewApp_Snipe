import { defineStore } from "pinia";
import DashService from "../services/DashService";

export const useDashStore = 
  defineStore("dash" , {
    state: () =>({
      totalHardware: 0,
      details: [],          // objet par catégorie
      totalTickets: 0,
      ticketDetail: []
    }),
    actions : {
      async loadHardware () {
        const data = await DashService.getHardwareCount()
      this.totalHardware = data.total
        const compteur = {}
        data.rows.forEach(asset => {
          const cat = asset.category?.name
          if(!cat) return
          if(!compteur[cat]){
            compteur[cat] = 0
          }
          compteur[cat]++
        })
        this.details = compteur
      },
async loadTickets() {
  try {
    const data = await DashService.getTicketCount()
    console.log("dashboard tickets =", data)
    this.totalTickets = data.total
    this.ticketDetail = data.details
  } catch (error) {
    console.error("Erreur dashboard :", error)
  }
}
  }
  })