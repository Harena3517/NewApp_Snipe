import axios from "axios"
const api = axios.create({ baseURL: "http://localhost:3099" })

export default {
    async getallTickets() {
    const response =
      await api.get("/tickets")
    return response.data
  },
  async removeTickets(ticketId){
    const response = await api.delete(`/tickets/${ticketId}`)
    return response.data
  },
    async editTickets(ticketId, titre, description, statusId, priorityId, date) {

      console.log("Date envoyée :", date)

      const response = await api.put(
        `/tickets/${ticketId}`,
        {
          titre,
          description,
          status_id: statusId,
          priority_id: priorityId,
          date: date
        }
      )

      return response.data
    },
      async getStatuses() {
      const response = await api.get("/status")
      return response.data
    },

    async getPriorities() {
      const response = await api.get("/priorities")
      return response.data
    }

}