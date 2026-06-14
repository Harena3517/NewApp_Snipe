import axios from "axios"

const ticketapi = axios.create({ baseURL: "http://localhost:3099" })

export default {
    async getSettings() {
    const response = await ticketapi.get("/settings")
    return response.data
  },
  async saveSettings(data){
    const response = await ticketapi.put("/settings" , data)
    return response.data
  }
}