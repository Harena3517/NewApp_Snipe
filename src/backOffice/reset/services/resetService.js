import axios from "axios";

export const resetData = async (currentUserId) => {
  const response = await axios.get(
    `http://localhost:3099/reset-data?currentUserId=${currentUserId}`
  )

  return response.data
}