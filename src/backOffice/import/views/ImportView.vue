<script setup>
import { useImportStore } from "../store/importStore"
import { ref } from "vue"
import Papa from "papaparse"

const store = useImportStore()
const file = ref(null)
const loading = ref(false)
const message = ref("")
const erreur = ref("")

// =============================================
// UTILS NETTOYAGE
// =============================================

const detectSeparateur = (text) => {
  const premiere = text.split("\n")[0]
  const nbVirgule = (premiere.match(/,/g) || []).length
  const nbPointVirgule = (premiere.match(/;/g) || []).length
  const nbTab = (premiere.match(/\t/g) || []).length
  if (nbPointVirgule >= nbVirgule && nbPointVirgule >= nbTab) return ";"
  if (nbTab >= nbVirgule) return "\t"
  return ","
}

const nettoyerNombre = (val) => {
  if (val === null || val === undefined || val === "") return null
  const str = String(val)
    .replace(/\s/g, "")      // espaces : "1 000" → "1000"
    .replace(/,/g, ".")       // virgule décimale : "1,5" → "1.5"
  const num = parseFloat(str)
  return isNaN(num) ? null : num
}

const formaterDate = (val) => {
  if (!val) return null

  // Nettoyer tous les caractères invisibles
  val = String(val)
    .trim()
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .replace(/\t/g, "")

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const [d, m, y] = val.split("/")
    return `${y}-${m}-${d}`
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
    const [d, m, y] = val.split("-")
    return `${y}-${m}-${d}`
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(val)) return val.replace(/\//g, "-")

  const d = new Date(val)
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0]

  return null
}

const nettoyerRow = (row) => {
  const get = (...keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
        return String(row[k]).trim()
      }
    }
    return ""
  }

  return {
    ...row,
    asset_tag:     get("asset_tag", "Asset Tag", "AssetTag"),
    name:          get("name", "Name"),
    serial:        get("serial", "Serial"),
    category:      get("category", "Category"),
    manufacturer:  get("manufacturer", "Manufacturer"),
    model:         get("model", "Model"),
    status:        get("status", "Status"),
    company:       get("company", "Company"),
    department:    get("department", "Department"),
    user:          get("user", "User"),
    email:         get("email", "Email"),
    purchase_date: formaterDate(get("purchase_date", "Purchase Date", "PurchaseDate")),
    purchase_cost: nettoyerNombre(get("purchase_cost", "Purchase Cost", "PurchaseCost"))
  }
}

const nettoyerTicketRow = (row) => {
  const get = (...keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
        return String(row[k]).trim()
      }
    }
    return ""
  }

  return {
    ...row,
    Num_Ticket:  get("Num_Ticket", "num_ticket", "NumTicket"),
    Date:        get("Date", "date"),
    Heure:       get("Heure", "heure"),
    Titre:       get("Titre", "titre"),
    Description: get("Description", "description"),
    Status:      get("Status", "status"),
    Priority:    get("Priority", "priority"),
    Items:       get("Items", "items")
  }
}

// =============================================
// IMPORT ASSETS
// =============================================

const choisirFichier = (event) => {
  file.value = event.target.files[0]
  message.value = ""
  erreur.value = ""
}

const importer = () => {
  if (!file.value) {
    erreur.value = "Veuillez choisir un fichier CSV"
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target.result
    const sep = detectSeparateur(text)

    Papa.parse(file.value, {
      header: true,
      delimiter: sep,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().replace(/^\uFEFF/, ""),

      complete: async (results) => {
        loading.value = true
        message.value = ""
        erreur.value = ""

        try {
          const rows = results.data
            .map(nettoyerRow)
            .filter(r => r.asset_tag)

          await store.import(rows)
          message.value = `Import terminé : ${rows.length} assets importés`
        } catch (e) {
          erreur.value = "Erreur lors de l'import"
        } finally {
          loading.value = false
        }
      }
    })
  }
  reader.readAsText(file.value, "UTF-8")
}

// =============================================
// IMPORT TICKETS
// =============================================

const ticketFile = ref(null)
const loadingTickets = ref(false)

const choisirTicket = (event) => {
  ticketFile.value = event.target.files[0]
  message.value = ""
  erreur.value = ""
}

const importerTickets = () => {
  if (!ticketFile.value) {
    erreur.value = "Veuillez choisir un fichier CSV Tickets"
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target.result
    const sep = detectSeparateur(text)

    Papa.parse(ticketFile.value, {
      header: true,
      delimiter: sep,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().replace(/^\uFEFF/, ""),

      complete: async (results) => {
        loadingTickets.value = true
        message.value = ""
        erreur.value = ""

        try {
          const rows = results.data
            .map(nettoyerTicketRow)
            .filter(r => r.Num_Ticket)

          await store.importTickets(rows)
          message.value = `Import tickets terminé : ${rows.length} ticket(s)`
        } catch (e) {
          console.error(e)
          erreur.value = "Erreur lors de l'import tickets"
        } finally {
          loadingTickets.value = false
        }
      }
    })
  }
  reader.readAsText(ticketFile.value, "UTF-8")
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">Import de données</h1>

    <!-- ASSETS -->
    <div class="import-card">
      <div class="card-header">
        <span class="card-icon">📦</span>
        <div>
          <h2>Assets CSV</h2>
          <p>Importer les matériels vers Snipe-IT</p>
        </div>
      </div>

      <div class="file-zone">
        <input
          type="file"
          accept=".csv"
          @change="choisirFichier"
          :disabled="loading"
          id="fileAsset"
          class="file-input"
        />
        <label for="fileAsset" class="file-label" :class="{ disabled: loading }">
          📂 {{ file ? file.name : "Choisir un fichier CSV" }}
        </label>
      </div>

      <button class="btn-import" @click="importer" :disabled="loading">
        {{ loading ? "⏳ Import en cours..." : "Importer les assets" }}
      </button>

      <p v-if="loading" class="msg-loading">⏳ Chargement en cours...</p>
      <p v-if="message" class="msg-success">✅ {{ message }}</p>
      <p v-if="erreur" class="msg-error">❌ {{ erreur }}</p>
    </div>

    <div class="separator"></div>

    <!-- TICKETS -->
    <div class="import-card">
      <div class="card-header">
        <span class="card-icon">🎫</span>
        <div>
          <h2>Tickets CSV</h2>
          <p>Importer les tickets vers SQLite</p>
        </div>
      </div>

      <div class="file-zone">
        <input
          type="file"
          accept=".csv"
          @change="choisirTicket"
          :disabled="loadingTickets"
          id="fileTicket"
          class="file-input"
        />
        <label for="fileTicket" class="file-label" :class="{ disabled: loadingTickets }">
          📂 {{ ticketFile ? ticketFile.name : "Choisir un fichier CSV" }}
        </label>
      </div>

      <button class="btn-import" @click="importerTickets" :disabled="loadingTickets">
        {{ loadingTickets ? "⏳ Import en cours..." : "Importer les tickets" }}
      </button>

      <p v-if="loadingTickets" class="msg-loading">⏳ Chargement en cours...</p>
      <p v-if="message" class="msg-success">✅ {{ message }}</p>
      <p v-if="erreur" class="msg-error">❌ {{ erreur }}</p>
    </div>

  </div>
</template>

<style scoped>
.page {
  padding: 32px 24px;
  background: #f4f6f8;
  min-height: 100vh;
}

.page-title {
  font-size: 1.6rem;
  color: #2c3e50;
  margin-bottom: 28px;
  font-weight: 700;
}

/* CARD */
.import-card {
  background: white;
  border-radius: 12px;
  padding: 28px;
  max-width: 580px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-icon {
  font-size: 2rem;
  background: #f4f6f8;
  padding: 10px;
  border-radius: 10px;
}

.card-header h2 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.card-header p {
  font-size: 0.82rem;
  color: #999;
  margin: 0;
}

/* FILE INPUT */
.file-input {
  display: none;
}

.file-label {
  display: block;
  padding: 12px 16px;
  border: 2px dashed #d0d7de;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
}

.file-label:hover {
  border-color: #3498db;
  background: #eaf4fb;
  color: #2980b9;
}

.file-label.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* BOUTON */
.btn-import {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 11px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-import:hover:not(:disabled) { background: #1a252f; }

.btn-import:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* MESSAGES */
.msg-loading { color: #888; font-size: 0.88rem; }
.msg-success { color: #27ae60; font-size: 0.88rem; font-weight: 600; }
.msg-error   { color: #e74c3c; font-size: 0.88rem; font-weight: 600; }

/* SEPARATEUR */
.separator {
  height: 1px;
  background: #e0e0e0;
  max-width: 580px;
  margin: 8px 0;
}
</style>