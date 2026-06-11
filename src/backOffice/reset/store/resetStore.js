import { defineStore } from "pinia"
import { resetData } from "../services/resetService"

export const useResetStore = defineStore("reset", {
  state: () => ({
    loading: false,
    result: null,
    steps: []
  }),

  actions: {

    async reset(currentUserId) {

      this.loading = true
      this.result = null
      this.steps = []

      try {

        const data = await resetData(currentUserId)

        this.result = {
          success: true,
          message: data.message
        }

        this.steps = (data.results || []).map(r => ({
        label: r.table,
        detail: `${r.deleted} supprimé(s)`,
        status: "ok"
      }))

      } catch (error) {

        this.result = {
          success: false,
          message:
            error.response?.data?.message ||
            error.message
        }

      } finally {

        this.loading = false

      }
    }
  }
})