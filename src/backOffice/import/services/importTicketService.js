import axios from "axios"

const API_URL =
  "http://localhost:3099"

const importTicketService = {

  async createStatus(name) {

    const response =
      await axios.post(
        `${API_URL}/tickets/status`,
        { name }
      )

    return response.data
  },

  async createPriority(name) {

    const response =
      await axios.post(
        `${API_URL}/tickets/priority`,
        { name }
      )

    return response.data
  },

  async createTicket(data) {

    const response =
      await axios.post(
        `${API_URL}/tickets`,
        data
      )

    return response.data
  }
}

export default importTicketService