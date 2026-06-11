import api from "../../../services/api.js"
import axios from "axios"
const ticketApi = axios.create({ baseURL: "http://localhost:3099" })

export default {
  async getAllTickets() {
    const response = await ticketApi.get(`/tickets`)
    return response.data
  },
  async createTicket(ticket) {
    const response = await ticketApi.post(`/tickets`,ticket)
    return response.data
  } ,
    async getAssets() {
    const response = await api.get("/hardware", { params: { limit: 500 } })
    return response.data.rows || []
  } ,
    async getStatus() {
    const response = await ticketApi.get(`/status`)
    return response.data
  },
  async getPriorities() {
    const response = await ticketApi.get(`/priorities`)
    return response.data
  },
}