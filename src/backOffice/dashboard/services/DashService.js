import api from "../../../services/api.js"

export default {
<<<<<<< HEAD

  async getHardwareCount() {

    const response =
      await api.get(`/hardware/`)
    return response.data
  } ,
    async getTicketCount() {

    const response =
      await api.get(
        "http://localhost:3099/tickets/dashboard"
      )

=======
  async getHardwareCount() {
    const response = await api.get(`/hardware/`)
    return response.data
  } ,
    async getTicketCount() {
    const response = await api.get("http://localhost:3099/tickets/dashboard")
>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    return response.data
  }
}