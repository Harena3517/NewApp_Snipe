// src/frontOffice/cost/service/costService.js

import axios from "axios"

const ticketApi = axios.create({
  baseURL: "http://localhost:3099"
})

export const useCostService = {

async getCost () {
  console.log("TEST SERVICE")

  return [
    { category_name: "Desktop", total: 850 },
    { category_name: "Laptop", total: 425 }
  ]
}

}