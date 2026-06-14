import { defineStore } from "pinia"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: sessionStorage.getItem("bo_auth") === "true"
  }),

  actions: {
    login(code) {
      if (code === import.meta.env.VITE_BACKOFFICE_CODE) {
        this.isAuthenticated = true
        sessionStorage.setItem("bo_auth", "true")
        return true
      }
      return false
    },

    logout() {
      this.isAuthenticated = false
      sessionStorage.removeItem("bo_auth")
    }
  }
})