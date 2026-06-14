import { defineStore } from "pinia"
import hardwareService from "../services/assetService"

export const useHardwareStore =
  defineStore("hardware", {

    state: () => ({
      assets: []
    }),
    actions: {
      async loadAssets() {
        const data = await hardwareService.getHardware()
        this.assets = data.rows
      }
    }
  })