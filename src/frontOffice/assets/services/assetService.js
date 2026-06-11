import api from "../../../services/api.js"

export default {
  async getHardware() {
    const response = await api.get(`/hardware/`)
    return response.data
  }
}