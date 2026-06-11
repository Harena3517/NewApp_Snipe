import { defineStore } from "pinia"
import settingsService from "../service/settingsService"

export const usesettingsStore =
  defineStore("settings", {

    state: () => ({
      settings: []
    }),

    actions: {

      async loadSettings() {

        const data =
          await settingsService.getSettings()

        this.settings = data

      },

      async saveSettings() {

        await settingsService.saveSettings(
          this.settings
        )

      }

    }

  })