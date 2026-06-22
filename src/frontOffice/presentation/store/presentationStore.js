import { defineStore } from "pinia"
import presentationService
from "../services/presentationService"

export const usepresentationStore =defineStore("usepresentationStore",
  {
    state: () => ({
      assets: [],
      status: [],
      priorities: [],
      ticks: [],
      selectedTicket: null,
      history: [],
      rapport: [],
      cat: [],
      costs: []
    }),

    actions: {
      async loadAsset() {
        this.assets = await presentationService.getAssets()
        this.status = await presentationService.getStatus()
        this.priorities = await presentationService.getPriorities()
      },
      async createTicket(data) {
        return await presentationService.createTicket( data)
      },
      async loadTickets() {
        this.ticks = await presentationService.getAllTickets()
      },
      setSelectedTicket(ticket) {
        this.selectedTicket = ticket
      },
      async changeStatus(
        ticketId,
        statusId,
        titre,
        description,
        date
      ) {
        await presentationService.changeStatus(
          ticketId,
          statusId,
          titre,
          description,
          date
        )
        await presentationService.addHistory(
          ticketId,
          statusId,
          new Date().toISOString()
        )
        await this.loadTickets()
      },
      async loadHistory() {
        this.history = await presentationService.getHistory()
      },
      async loadCost() {
        const data = await presentationService.getCost()
        this.costs = data
      },
      async addCost(ticketId, montant, categoryName, groupeId, type) {
        await presentationService.addCost(ticketId, montant, categoryName, groupeId, type)
      },

      async deleteTicketCosts(ticketId) {
        await presentationService.deleteLastCost(ticketId)
      },
      async fermerTicket(ticket, montant) {
        let items = []
        try {
          items = JSON.parse(ticket.items || "[]")
        } catch {
          items = []
        }
        if(items.length > 0){
          const montantParAsset = Number(montant) / items.length
          const groupeId = Date.now().toString()
          for(const tag of items){
            const asset = this.assets.find(
              a => a.asset_tag === tag
            )
            const categoryName = asset?.category?.name || "Inconnu"
            await this.addCost( ticket.id, montantParAsset, categoryName, groupeId,"cout_saisie")
          }
        }
        // CLOSED = adapter l'id
        const closedStatus =
          this.status.find(
            s => s.name?.toLowerCase().includes("closed")
          )
        if(closedStatus){
          await this.changeStatus( ticket.id,closedStatus.id,ticket.titre,ticket.description,ticket.date)
        }
      },
        async reouvrirTicket(ticket, montant) {
            let items = []
            try {
              items = JSON.parse(ticket.items || "[]")
            } catch {
              items = []
            }
            if(items.length > 0){
              const montantParAsset = Number(montant) / items.length
              const groupeId = Date.now().toString()
              for(const tag of items){
                const asset = this.assets.find(a => a.asset_tag === tag)
                const categoryName = asset?.category?.name || "Inconnu"
                await this.addCost(ticket.id,montantParAsset,categoryName,groupeId,"reouverture")
              }
            }
            const inProgress =
              this.status.find(
                s => s.name?.toLowerCase().includes("progress"))
            if(inProgress){
              await this.changeStatus(
                ticket.id,
                inProgress.id,
                ticket.titre,
                ticket.description,
                ticket.date
              )
            }
          },
          async annulerFermeture(ticket) {
          await this.deleteTicketCosts(
            ticket.id
          )
          const inProgress =
            this.status.find(
              s =>
                s.name?.toLowerCase().includes("progress")
            )

          if(inProgress){

            await this.changeStatus(
              ticket.id,
              inProgress.id,
              ticket.titre,
              ticket.description,
              ticket.date
            )
          }
        }
    }
  }
)