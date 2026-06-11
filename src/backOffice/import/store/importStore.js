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
            model_id: modelMap[row.model] || null,
            company_id: companyMap[row.company] || null,
            status_id: statusMap[row.status] || null,
            ...(row.purchase_date ? { purchase_date: row.purchase_date } : {}),
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

})