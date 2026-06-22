import axios from "axios"

const ticketApi = axios.create({
  baseURL: "http://localhost:3099"
})

const costService = {
  async getCost() {
    const response = await ticketApi.get("/ticket-cost")
    return response.data
  },

  async getCostByTicket() {
    const response = await ticketApi.get("/ticket-cost-by-ticket")
    return response.data
  },

  async getCostDetail() {
    const response = await ticketApi.get("/ticket-cost-detail")
    return response.data
  }
}

export default costService