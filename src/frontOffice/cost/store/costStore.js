import { defineStore } from "pinia"
import presentationService from "../../presentation/services/presentationService"

export const useCostStore = defineStore("costStore", {
  state: () => ({
    cost: [],
    loading: false
  }),

  actions: {
async loadRapport() {
  try {
    console.log("LOAD RAPPORT START")

    const data = await presentationService.getCost()

    console.log("API COST =>", data)

    this.cost = data
  } catch (error) {
    console.error("❌ ERROR API COST =>", error)
  }
}
  }
})