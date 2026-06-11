import api from "../../../services/api.js"

export default {
  async getHardwareCount() {
    const response = await api.get(`/hardware/`)
    return response.data
  } ,
    async getTicketCount() {
    const response = await api.get("http://localhost:3099/tickets/dashboard")
    return response.data
  }
}