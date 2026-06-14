import { defineStore } from "pinia"
import importServiceAsset from "../services/importService"
import importTicketService from "../services/importTicketService"

const companyMap = {}
const departmentMap = {}
const categoryMap = {}
const manufacturerMap = {}
const modelMap = {}
const statusMap = {}
const userMap = {}
const assetMap = {}
<<<<<<< HEAD

export const useImportStore = defineStore("import", {
  state: () => ({
    importStatus: "idle", // "idle" | "running" | "success" | "warning" | "error"
    importProgress: 0,
    importTotal: 0,
    importLogs: [], // Array of { type: "info"|"success"|"warning"|"error", text: string, timestamp: string }
  }),

  actions: {
    addLog(type, text) {
      const timestamp = new Date().toLocaleTimeString("fr-FR")
      this.importLogs.push({ type, text, timestamp })
      console.log(`[${type.toUpperCase()}] ${text}`)
    },

    resetImportState() {
      this.importStatus = "idle"
      this.importProgress = 0
      this.importTotal = 0
      this.importLogs = []
    },

    async import(rows) {
      this.importStatus = "running"
      this.importProgress = 0
      this.importTotal = rows.length
      this.importLogs = []

      this.addLog("info", `Début de l'importation de ${rows.length} asset(s)...`)

      // Nettoyer le cache local pour éviter les stale IDs lors de réimportations après réinitialisation
      const maps = [companyMap, departmentMap, categoryMap, manufacturerMap, modelMap, statusMap, userMap, assetMap]
      maps.forEach(m => { for (const k in m) delete m[k] })

      // =========================
      // COMPANIES
      // =========================
      const companies = [...new Set(rows.map(r => r.company).filter(Boolean))]
      if (companies.length > 0) {
        this.addLog("info", `Traitement des compagnies (${companies.length} trouvées)...`)
        for (const company of companies) {
          try {
            const result = await importServiceAsset.createCompany(company)
            if (result?.payload?.id) {
              companyMap[company] = result.payload.id
              this.addLog("success", `Compagnie "${company}" associée à l'ID ${result.payload.id}`)
            } else {
              this.addLog("warning", `Impossible de créer/trouver la compagnie "${company}"`)
            }
          } catch (err) {
            this.addLog("error", `Erreur création compagnie "${company}": ${err.message || err}`)
          }
        }
      }

      // =========================
      // DEPARTMENTS
      // =========================
      const departments = [...new Set(rows.map(r => r.department).filter(Boolean))]
      if (departments.length > 0) {
        this.addLog("info", `Traitement des départements (${departments.length} trouvés)...`)
        for (const dept of departments) {
          try {
            const result = await importServiceAsset.createDepartment(dept)
            if (result?.payload?.id) {
              departmentMap[dept] = result.payload.id
              this.addLog("success", `Département "${dept}" associé à l'ID ${result.payload.id}`)
            } else {
              this.addLog("warning", `Impossible de créer/trouver le département "${dept}"`)
            }
          } catch (err) {
            this.addLog("error", `Erreur création département "${dept}": ${err.message || err}`)
          }
        }
      }

      // =========================
      // CATEGORIES
      // =========================
      const categories = [...new Set(rows.map(r => r.category).filter(Boolean))]
      if (categories.length > 0) {
        this.addLog("info", `Traitement des catégories (${categories.length} trouvées)...`)
        for (const cat of categories) {
          try {
            const result = await importServiceAsset.createCategory(cat)
            if (result?.payload?.id) {
              categoryMap[cat] = result.payload.id
              this.addLog("success", `Catégorie "${cat}" associée à l'ID ${result.payload.id}`)
            } else {
              this.addLog("warning", `Impossible de créer/trouver la catégorie "${cat}"`)
            }
          } catch (err) {
            this.addLog("error", `Erreur création catégorie "${cat}": ${err.message || err}`)
          }
        }
      }

      // =========================
      // MANUFACTURERS
      // =========================
      const manufacturers = [...new Set(rows.map(r => r.manufacturer).filter(Boolean))]
      if (manufacturers.length > 0) {
        this.addLog("info", `Traitement des constructeurs (${manufacturers.length} trouvés)...`)
        for (const manuf of manufacturers) {
          try {
            const result = await importServiceAsset.createManufact(manuf)
            if (result?.payload?.id) {
              manufacturerMap[manuf] = result.payload.id
              this.addLog("success", `Constructeur "${manuf}" associé à l'ID ${result.payload.id}`)
            } else {
              this.addLog("warning", `Impossible de créer/trouver le constructeur "${manuf}"`)
            }
          } catch (err) {
            this.addLog("error", `Erreur création constructeur "${manuf}": ${err.message || err}`)
          }
        }
      }

      // =========================
      // STATUSES
      // =========================
      const statuses = [...new Set(rows.map(r => r.status).filter(Boolean))]
      if (statuses.length > 0) {
        this.addLog("info", `Traitement des statuts (${statuses.length} trouvés)...`)
        for (const statusName of statuses) {
          try {
            const result = await importServiceAsset.createStatusLabel({
              name: statusName,
              type: "deployable",
              color: "#4CAF50",
              show_in_nav: false,
              default_label: false
            })
            if (result?.payload?.id) {
              statusMap[statusName] = result.payload.id
              this.addLog("success", `Statut "${statusName}" associé à l'ID ${result.payload.id}`)
            } else {
              this.addLog("warning", `Impossible de créer/trouver le statut "${statusName}"`)
            }
          } catch (err) {
            this.addLog("error", `Erreur création statut "${statusName}": ${err.message || err}`)
          }
        }
      }

      // =========================
      // MODELS
      // =========================
      const modelsToCreate = rows.filter(r => r.model)
      if (modelsToCreate.length > 0) {
        this.addLog("info", "Traitement des modèles d'assets...")
        for (const row of modelsToCreate) {
          if (modelMap[row.model]) continue
          try {
            const result = await importServiceAsset.createModel({
              name: row.model,
              manufacturer_id: manufacturerMap[row.manufacturer] || null,
              category_id: categoryMap[row.category] || null
            })
            if (result?.payload?.id) {
              modelMap[row.model] = result.payload.id
              this.addLog("success", `Modèle "${row.model}" associé à l'ID ${result.payload.id}`)
            } else {
              this.addLog("warning", `Impossible de créer/trouver le modèle "${row.model}"`)
            }
          } catch (err) {
            this.addLog("error", `Erreur création modèle "${row.model}": ${err.message || err}`)
          }
        }
      }

      // =========================
      // USERS
      // =========================
      const usersToCreate = rows.filter(r => r.user && r.email)
      if (usersToCreate.length > 0) {
        this.addLog("info", `Traitement des utilisateurs (${usersToCreate.length} trouvés)...`)
        for (const row of usersToCreate) {
          if (userMap[row.email]) continue
          try {
            const names = row.user.trim().split(/\s+/)
            const firstName = names[0] || ""
            const lastName = names.slice(1).join(" ") || "Nom"

            const result = await importServiceAsset.createUser({
              first_name: firstName,
              last_name: lastName,
              username: row.email.split("@")[0],
              email: row.email,
              department_id: departmentMap[row.department] || null
            })

            if (result?.payload?.id) {
              userMap[row.email] = result.payload.id
              this.addLog("success", `Utilisateur "${row.user}" (${row.email}) associé à l'ID ${result.payload.id}`)
            } else {
              this.addLog("warning", `Impossible de créer/trouver l'utilisateur "${row.user}"`)
            }
          } catch (err) {
            this.addLog("error", `Erreur création utilisateur "${row.user}": ${err.message || err}`)
          }
        }
      }

      // =========================
      // ASSETS & CHECKOUTS
      // =========================
      this.addLog("info", "Création des matériels (assets) et attribution...")
      let successCount = 0
      let failCount = 0

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const tag = row.asset_tag
        this.importProgress = i + 1

        try {
          this.addLog("info", `[${i + 1}/${rows.length}] Création de l'asset "${tag}" - ${row.name || 'Sans Nom'}...`)

          const payload = {
            asset_tag: tag,
            serial: row.serial || null,
            name: row.name || `Matériel #${tag}`,
=======
function convertDate(date) {

  if (!date) return null

  const [day, month, year] = date.split("/")

  return `${year}-${month}-${day}`
}

export const useImportStore = defineStore("import", {

  actions: {
    
    async import(rows) {

      // Supprimer les lignes vides du CSV
      rows = rows.filter(row =>
        row &&
        row.asset_tag &&
        row.asset_tag.trim() !== ""
      )

      console.log("Rows à importer :", rows)

      try {
        const companies = [...new Set(rows.map(r => r.company).filter(Boolean))]

        for (const company of companies) {

          const result = await importServiceAsset.createCompany(company)

          if (!result?.payload?.id) {
            console.error("Erreur création company :", company, result)
            continue
          }

          companyMap[company] = result.payload.id
        }

        // =========================
        // DEPARTMENTS
        // =========================
        const departments = [...new Set(rows.map(r => r.department).filter(Boolean))]

        for (const dept of departments) {

          const result = await importServiceAsset.createDepartment(dept)

          if (!result?.payload?.id) {
            console.error("Erreur création department :", dept, result)
            continue
          }

          departmentMap[dept] = result.payload.id
        }

        // =========================
        // CATEGORIES
        // =========================
        const categories = [...new Set(rows.map(r => r.category).filter(Boolean))]

        for (const cat of categories) {

          const result = await importServiceAsset.createCategory(cat)

          if (!result?.payload?.id) {
            console.error("Erreur création category :", cat, result)
            continue
          }

          categoryMap[cat] = result.payload.id
        }

        // =========================
        // MANUFACTURERS
        // =========================
        const manufacturers = [...new Set(rows.map(r => r.manufacturer).filter(Boolean))]

        for (const manuf of manufacturers) {

          const result = await importServiceAsset.createManufact(manuf)

          if (!result?.payload?.id) {
            console.error("Erreur création manufacturer :", manuf, result)
            continue
          }

          manufacturerMap[manuf] = result.payload.id
        }
        const statuses = [...new Set(rows.map(r => r.status).filter(Boolean))]
        for (const statutsLabel of statuses) {
        const result =
          await importServiceAsset.createStatusLabel({
            name: statutsLabel,
            type: "deployable",
            color: "#4CAF50",
            show_in_nav: false,
            default_label: false
          })
            if (!result?.payload?.id) {
            console.error("Erreur création status :", statuses, result)
            continue
          }
        statusMap[statutsLabel] =
          result.payload.id
      }

        // =========================
        // MODELS
        // =========================
        for (const row of rows) {

          if (!row.model || modelMap[row.model]) {
            continue
          }

          const result = await importServiceAsset.createModel({
            name: row.model,
            manufacturer_id: manufacturerMap[row.manufacturer],
            category_id: categoryMap[row.category]
          })

          if (!result?.payload?.id) {
            console.error("Erreur création model :", row.model, result)
            continue
          }

          modelMap[row.model] = result.payload.id
        }

        // =========================
        // USERS
        // =========================
        const users = rows.filter(r => r.user && r.email)

        for (const row of users) {

          if (userMap[row.email]) {
            continue
          }

          const names = row.user.split(" ")

          const result = await importServiceAsset.createUser({
            first_name: names[0] || "",
            last_name: names.slice(1).join(" "),
            username: row.email,
            email: row.email,
            department_id: departmentMap[row.department]
          })

          if (!result?.payload?.id) {
            console.error("Erreur création user :", row.email, result)
            continue
          }

          userMap[row.email] = result.payload.id
        }
        for (const row of rows) {

          if (!row.asset_tag) {
            continue
          }
          console.log("purchase_date envoyé:", row.purchase_date)
          const result = await importServiceAsset.createAsset({
            asset_tag: row.asset_tag,
            serial: row.serial,
            name: row.name,
>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
            model_id: modelMap[row.model] || null,
            company_id: companyMap[row.company] || null,
            status_id: statusMap[row.status] || null,
            ...(row.purchase_date ? { purchase_date: row.purchase_date } : {}),
<<<<<<< HEAD
            ...(row.purchase_cost !== null && row.purchase_cost !== undefined ? { purchase_cost: row.purchase_cost } : {})
          }

          const result = await importServiceAsset.createAsset(payload)

          if (result?.payload?.id) {
            const assetId = result.payload.id
            assetMap[tag] = assetId
            this.addLog("success", `Asset "${tag}" créé/trouvé avec succès (ID: ${assetId})`)
            successCount++

            // Attribution (Checkout)
            if (row.user && row.email) {
              const userId = userMap[row.email]
              if (userId) {
                this.addLog("info", `Attribution de l'asset "${tag}" à "${row.user}" (${row.email})...`)
                try {
                  await importServiceAsset.checkoutAsset(assetId, userId)
                  this.addLog("success", `Asset "${tag}" attribué avec succès à "${row.user}"`)
                } catch (checkoutErr) {
                  this.addLog("warning", `Échec de l'attribution de "${tag}": ${checkoutErr.message || checkoutErr}`)
                }
              } else {
                this.addLog("warning", `Attribution ignorée: Utilisateur non trouvé pour ${row.email}`)
              }
            }
          } else {
            failCount++
            this.addLog("error", `Échec de création de l'asset "${tag}": Réponse API invalide`)
          }
        } catch (err) {
          failCount++
          let apiErrMsg = err.message
          if (err.response?.data?.messages) {
            apiErrMsg = typeof err.response.data.messages === "object"
              ? JSON.stringify(err.response.data.messages)
              : err.response.data.messages
          }
          this.addLog("error", `Échec pour l'asset "${tag}": ${apiErrMsg}`)
        }
      }

      this.importStatus = failCount === 0 ? "success" : "warning"
      this.addLog("success", `Import terminé : ${successCount} créé(s) avec succès, ${failCount} échec(s)`)
    },

    async importTickets(rows) {
      this.importStatus = "running"
      this.importProgress = 0
      this.importTotal = rows.length
      this.importLogs = []

      this.addLog("info", `Début de l'importation de ${rows.length} ticket(s)...`)

      const ticketStatusMap = {}
      const ticketPriorityMap = {}

      try {
        // =========================
        // STATUS
        // =========================
        const statuses = [...new Set(rows.map(r => r.Status).filter(Boolean))]
        if (statuses.length > 0) {
          this.addLog("info", `Vérification et création des statuts de tickets (${statuses.length} trouvés)...`)
          for (const s of statuses) {
            try {
              const res = await importTicketService.createStatus(s)
              ticketStatusMap[s] = res.id
              this.addLog("success", `Statut ticket "${s}" associé à l'ID ${res.id}`)
            } catch (err) {
              this.addLog("error", `Erreur statut ticket "${s}": ${err.message}`)
            }
          }
        }

        // =========================
        // PRIORITIES
        // =========================
        const priorities = [...new Set(rows.map(r => r.Priority).filter(Boolean))]
        if (priorities.length > 0) {
          this.addLog("info", `Vérification et création des priorités de tickets (${priorities.length} trouvées)...`)
          for (const p of priorities) {
            try {
              const res = await importTicketService.createPriority(p)
              ticketPriorityMap[p] = res.id
              this.addLog("success", `Priorité ticket "${p}" associée à l'ID ${res.id}`)
            } catch (err) {
              this.addLog("error", `Erreur priorité ticket "${p}": ${err.message}`)
            }
          }
        }

        // =========================
        // TICKETS
        // =========================
        this.addLog("info", "Création des tickets...")
        let ticketSuccess = 0
        let ticketFail = 0

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]
          this.importProgress = i + 1
          try {
            this.addLog("info", `[${i + 1}/${rows.length}] Création du ticket #${row.Num_Ticket} - ${row.Titre || 'Sans Titre'}...`)

            await importTicketService.createTicket({
              num_ticket: Number(row.Num_Ticket),
              date: row.Date,
              heure: row.Heure,
              titre: row.Titre,
              description: row.Description,
              status_id: ticketStatusMap[row.Status] || null,
              priority_id: ticketPriorityMap[row.Priority] || null,
              items: row.Items
            })

            this.addLog("success", `Ticket #${row.Num_Ticket} importé avec succès`)
            ticketSuccess++
          } catch (err) {
            ticketFail++
            this.addLog("error", `Échec ticket #${row.Num_Ticket}: ${err.message}`)
          }
        }

        this.importStatus = ticketFail === 0 ? "success" : "warning"
        this.addLog("success", `Import tickets terminé : ${ticketSuccess} créé(s) avec succès, ${ticketFail} échec(s)`)

      } catch (error) {
        this.importStatus = "error"
        this.addLog("error", `Erreur globale import tickets : ${error.message || error}`)
        throw error
      }
    }
  }
=======
            ...(row.purchase_cost ? { purchase_cost: row.purchase_cost } : {})
          })
          if (!result?.payload?.id) {
            console.error("Erreur création asset :", row.asset_tag, result)
            continue
          }

          assetMap[row.asset_tag] = result.payload.id
        }

        // =========================
        // CHECKOUT
        // =========================
        for (const row of rows) {

          if (!row.user || !row.email) {
            continue
          }

          const assetId = assetMap[row.asset_tag]
          const userId = userMap[row.email]

          if (!assetId || !userId) {
            console.warn(
              "Checkout ignoré :",
              row.asset_tag,
              row.email
            )
            continue
          }

          await importServiceAsset.checkoutAsset(
            assetId,
            userId
          )
        }

        console.log("Import terminé avec succès")

      } catch (error) {
        console.error("Erreur globale import :", error)
        throw error
      }
    } , 
    async importTickets(rows) {

  rows = rows.filter(
    row =>
      row &&
      row.Num_Ticket &&
      row.Num_Ticket.toString().trim() !== ""
  )

  const ticketStatusMap = {}
  const ticketPriorityMap = {}

  try {

    // =========================
    // STATUS
    // =========================

    const statuses = [
      ...new Set(
        rows.map(r => r.Status).filter(Boolean)
      )
    ]

    for (const status of statuses) {

      const result =
        await importTicketService.createStatus(
          status
        )

      ticketStatusMap[status] =
        result.id
    }

    // =========================
    // PRIORITIES
    // =========================

    const priorities = [
      ...new Set(
        rows.map(r => r.Priority).filter(Boolean)
      )
    ]

    for (const priority of priorities) {

      const result =
        await importTicketService.createPriority(
          priority
        )

      ticketPriorityMap[priority] =
        result.id
    }

    // =========================
    // TICKETS
    // =========================

    for (const row of rows) {

      await importTicketService.createTicket({

        num_ticket:
          Number(row.Num_Ticket),

        date:
          row.Date,

        heure:
          row.Heure,

        titre:
          row.Titre,

        description:
          row.Description,

        status_id:
          ticketStatusMap[row.Status],

        priority_id:
          ticketPriorityMap[row.Priority],

        items:
          row.Items
      })
    }
    
    console.log(
      "Import tickets terminé"
    )

  } catch (error) {

    console.error(
      "Erreur import tickets :",
      error
    )

    throw error
  }
}
  }

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
})