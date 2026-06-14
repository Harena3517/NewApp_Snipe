<script setup>
import { useImportStore } from "../store/importStore"
import { ref, computed, watch, nextTick } from "vue"
import Papa from "papaparse"

const store = useImportStore()
const activeTab = ref("assets") // "assets" | "tickets"

const file = ref(null)
const ticketFile = ref(null)

const parsedAssets = ref([])
const parsedTickets = ref([])

const assetSearchQuery = ref("")
const ticketSearchQuery = ref("")

const assetFilter = ref("all") // "all" | "valid" | "error" | "warning"
const ticketFilter = ref("all") // "all" | "valid" | "error" | "warning"

const ignoreErrorsAsset = ref(true)
const ignoreErrorsTicket = ref(true)

const message = ref("")
const erreur = ref("")

const logConsole = ref(null)

// Auto scroll for logs
watch(() => store.importLogs.length, async () => {
  await nextTick()
  if (logConsole.value) {
    logConsole.value.scrollTop = logConsole.value.scrollHeight
  }
})

// =============================================
// UTILS NETTOYAGE & VALIDATION DATE/NB
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

const isValidDateValue = (year, month, day) => {
  const y = parseInt(year, 10)
  const m = parseInt(month, 10)
  const d = parseInt(day, 10)
  if (isNaN(y) || isNaN(m) || isNaN(d)) return false
  if (m < 1 || m > 12) return false
  if (d < 1 || d > 31) return false
  const dateObj = new Date(y, m - 1, d)
  return dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d
}

const formaterDate = (val) => {
  if (!val) return null

  // Nettoyer tous les caractères invisibles
  val = String(val)
    .trim()
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .replace(/\t/g, "")

  let match
  if ((match = val.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/))) {
    const [_, d, m, y] = match
    if (isValidDateValue(y, m, d)) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
  } else if ((match = val.match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})$/))) {
    const [_, y, m, d] = match
    if (isValidDateValue(y, m, d)) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
  }

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
    asset_tag:     get("asset_tag", "Asset Tag", "AssetTag", "tag"),
    name:          get("name", "Name", "nom"),
    serial:        get("serial", "Serial", "numero_serie", "serial_number"),
    category:      get("category", "Category", "categorie"),
    manufacturer:  get("manufacturer", "Manufacturer", "manufacturier", "constructeur"),
    model:         get("model", "Model", "modele"),
    status:        get("status", "Status", "statut"),
    company:       get("company", "Company", "compagnie"),
    department:    get("department", "Department", "departement"),
    user:          get("user", "User", "utilisateur"),
    email:         get("email", "Email", "e-mail"),
    purchase_date: formaterDate(get("purchase_date", "Purchase Date", "PurchaseDate", "date_achat")),
    purchase_cost: nettoyerNombre(get("purchase_cost", "Purchase Cost", "PurchaseCost", "prix_achat"))
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
// VALIDATION LOGIC
// =============================================

const validateAssets = (rawData) => {
  const parsedRows = []
  const seenAssetTags = new Set()
  const seenSerials = new Set()

  rawData.forEach((rawRow, index) => {
    const lineNum = index + 2 // line 1 is header
    const cleaned = nettoyerRow(rawRow)
    const errors = []
    const warnings = []

    // 1. Asset Tag is empty
    if (!cleaned.asset_tag) {
      errors.push("Asset Tag obligatoire.")
    } else {
      // 2. Duplicate Asset Tag inside CSV
      if (seenAssetTags.has(cleaned.asset_tag)) {
        errors.push(`Asset Tag '${cleaned.asset_tag}' en double dans le fichier.`)
      } else {
        seenAssetTags.add(cleaned.asset_tag)
      }
    }

    // 3. Duplicate Serial inside CSV
    if (cleaned.serial) {
      if (seenSerials.has(cleaned.serial)) {
        warnings.push(`Numero de serie '${cleaned.serial}' en double dans le fichier.`)
      } else {
        seenSerials.add(cleaned.serial)
      }
    }

    // 4. Status is Deployed but User or Email is missing
    if (cleaned.status && cleaned.status.toLowerCase() === "deployed") {
      if (!cleaned.user || !cleaned.email) {
        errors.push("Le statut 'Deployed' exige d'indiquer un utilisateur et son e-mail.")
      }
    }

    // 5. Invalid Date
    const rawDate = rawRow.purchase_date || rawRow["Purchase Date"] || rawRow["PurchaseDate"] || rawRow["date_achat"]
    if (rawDate && String(rawDate).trim() !== "" && !cleaned.purchase_date) {
      errors.push(`Date d'achat '${rawDate}' invalide (attendu: JJ/MM/AAAA ou AAAA-MM-JJ).`)
    }

    // 6. Invalid Cost
    const rawCost = rawRow.purchase_cost || rawRow["Purchase Cost"] || rawRow["PurchaseCost"] || rawRow["prix_achat"]
    if (rawCost && String(rawCost).trim() !== "") {
      const num = nettoyerNombre(rawCost)
      if (num === null) {
        errors.push(`Cout d'achat '${rawCost}' invalide (doit etre un nombre).`)
      } else if (num < 0) {
        errors.push(`Le cout d'achat '${rawCost}' ne peut pas etre negatif.`)
      }
    }

    const rowStatus = errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "valid"

    parsedRows.push({
      lineNum,
      status: rowStatus,
      errors,
      warnings,
      data: cleaned,
      raw: rawRow
    })
  })

  return parsedRows
}

const validateTickets = (rawData) => {
  const parsedRows = []
  const seenTicketNums = new Set()

  rawData.forEach((rawRow, index) => {
    const lineNum = index + 2
    const cleaned = nettoyerTicketRow(rawRow)
    const errors = []
    const warnings = []

    // 1. Ticket Number is empty or invalid
    if (!cleaned.Num_Ticket) {
      errors.push("Le numero de ticket (Num_Ticket) est obligatoire.")
    } else {
      const ticketNumStr = String(cleaned.Num_Ticket)
      if (isNaN(parseInt(ticketNumStr, 10))) {
        errors.push(`Le numero de ticket '${ticketNumStr}' n'est pas un nombre valide.`)
      } else if (seenTicketNums.has(ticketNumStr)) {
        errors.push(`Num_Ticket '${ticketNumStr}' en double dans ce fichier.`)
      } else {
        seenTicketNums.add(ticketNumStr)
      }
    }

    // 2. Date format warning
    const rawDate = rawRow.Date || rawRow.date
    if (rawDate && String(rawDate).trim() !== "") {
      const formatted = formaterDate(rawDate)
      if (!formatted) {
        warnings.push(`Format de date de ticket '${rawDate}' non standard.`)
      }
    }

    // 3. JSON Items validation
    if (cleaned.Items && cleaned.Items.trim() !== "" && cleaned.Items !== "[]") {
      try {
        const parsed = JSON.parse(cleaned.Items)
        if (!Array.isArray(parsed)) {
          errors.push("La colonne Items doit etre un tableau JSON, ex: [\"PC-001\"].")
        }
      } catch (err) {
        errors.push(`Format JSON invalide dans Items: '${cleaned.Items}'`)
      }
    }

    // 4. Priority warning
    const standardPriorities = ["low", "medium", "high", "critical", "new", "closed", "in progress"]
    if (cleaned.Priority && !standardPriorities.includes(cleaned.Priority.toLowerCase())) {
      warnings.push(`Priorite '${cleaned.Priority}' non standard.`)
    }

    const rowStatus = errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "valid"

    parsedRows.push({
      lineNum,
      status: rowStatus,
      errors,
      warnings,
      data: cleaned,
      raw: rawRow
    })
  })

  return parsedRows
}

// =============================================
// HANDLERS
// =============================================

const choisirFichier = (event) => {
  const fileObj = event.target.files[0]
  if (!fileObj) return
  
  file.value = fileObj
  parsedAssets.value = []
  store.resetImportState()
  erreur.value = ""
  message.value = ""

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target.result
    const sep = detectSeparateur(text)

    Papa.parse(fileObj, {
      header: true,
      delimiter: sep,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().replace(/^\uFEFF/, ""),
      complete: (results) => {
        const headers = results.meta.fields || []
        
        // Validation basique de format
        const isTicketFile = headers.some(h => ["num_ticket", "numticket"].includes(h.toLowerCase().trim()))
        const hasAssetTag = headers.some(h => ["asset_tag", "assettag", "tag"].includes(h.toLowerCase().trim().replace(/[\s\-\_]/g, "")))
        
        if (isTicketFile || !hasAssetTag) {
          erreur.value = "Le fichier selectionne ne semble pas etre un fichier d'Assets valide (colonne 'asset_tag' absente)."
          file.value = null
          return
        }

        parsedAssets.value = validateAssets(results.data)
        if (parsedAssets.value.length > 0) {
          message.value = `Fichier charge : ${parsedAssets.value.length} ligne(s) pretes pour l'analyse.`
        }
      },
      error: (err) => {
        erreur.value = "Erreur lors de la lecture : " + err.message
      }
    })
  }
  reader.readAsText(fileObj, "UTF-8")
}

const choisirTicket = (event) => {
  const fileObj = event.target.files[0]
  if (!fileObj) return

  ticketFile.value = fileObj
  parsedTickets.value = []
  store.resetImportState()
  erreur.value = ""
  message.value = ""

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target.result
    const sep = detectSeparateur(text)

    Papa.parse(fileObj, {
      header: true,
      delimiter: sep,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().replace(/^\uFEFF/, ""),
      complete: (results) => {
        const headers = results.meta.fields || []
        
        // Validation basique de format
        const isAssetFile = headers.some(h => ["asset_tag", "assettag"].includes(h.toLowerCase().trim()))
        const hasNumTicket = headers.some(h => ["num_ticket", "numticket", "num-ticket"].includes(h.toLowerCase().trim().replace(/[\s\-\_]/g, "")))

        if (isAssetFile || !hasNumTicket) {
          erreur.value = "Le fichier selectionne ne semble pas etre un fichier de Tickets (colonne 'Num_Ticket' absente)."
          ticketFile.value = null
          return
        }

        parsedTickets.value = validateTickets(results.data)
        if (parsedTickets.value.length > 0) {
          message.value = `Fichier charge : ${parsedTickets.value.length} ticket(s) prets pour l'analyse.`
        }
      },
      error: (err) => {
        erreur.value = "Erreur lors de la lecture : " + err.message
      }
    })
  }
  reader.readAsText(fileObj, "UTF-8")
}

// =============================================
// IMPORT EXECUTIONS
// =============================================

const importer = async () => {
  if (parsedAssets.value.length === 0) return

  const rowsToImport = ignoreErrorsAsset.value
    ? parsedAssets.value.filter(r => r.status !== "error").map(r => r.data)
    : parsedAssets.value.map(r => r.data)

  if (rowsToImport.length === 0) {
    erreur.value = "Aucun materiel valide a importer."
    return
  }

  erreur.value = ""
  message.value = ""
  
  try {
    await store.import(rowsToImport)
    if (store.importStatus === "success") {
      message.value = "Importation des materiels terminee avec succes !"
    } else {
      message.value = "Importation terminee. Veuillez verifier le journal pour voir les alertes/erreurs."
    }
  } catch (err) {
    erreur.value = "Une erreur est survenue lors de l'importation."
  }
}

const importerTickets = async () => {
  if (parsedTickets.value.length === 0) return

  const rowsToImport = ignoreErrorsTicket.value
    ? parsedTickets.value.filter(r => r.status !== "error").map(r => r.data)
    : parsedTickets.value.map(r => r.data)

  if (rowsToImport.length === 0) {
    erreur.value = "Aucun ticket valide a importer."
    return
  }

  erreur.value = ""
  message.value = ""

  try {
    await store.importTickets(rowsToImport)
    if (store.importStatus === "success") {
      message.value = "Importation des tickets terminee avec succes !"
    } else {
      message.value = "Importation terminee. Veuillez verifier le journal pour voir les alertes/erreurs."
    }
  } catch (err) {
    erreur.value = "Une erreur est survenue lors de l'importation."
  }
}

// =============================================
// COMPUTED PROPERTIES (STATS & FILTERS)
// =============================================

const assetStats = computed(() => {
  const total = parsedAssets.value.length
  const valid = parsedAssets.value.filter(r => r.status === "valid").length
  const error = parsedAssets.value.filter(r => r.status === "error").length
  const warning = parsedAssets.value.filter(r => r.status === "warning").length
  return { total, valid, error, warning }
})

const ticketStats = computed(() => {
  const total = parsedTickets.value.length
  const valid = parsedTickets.value.filter(r => r.status === "valid").length
  const error = parsedTickets.value.filter(r => r.status === "error").length
  const warning = parsedTickets.value.filter(r => r.status === "warning").length
  return { total, valid, error, warning }
})

const filteredAssets = computed(() => {
  let list = parsedAssets.value
  
  if (assetFilter.value === "valid") list = list.filter(r => r.status === "valid")
  else if (assetFilter.value === "error") list = list.filter(r => r.status === "error")
  else if (assetFilter.value === "warning") list = list.filter(r => r.status === "warning")
  
  if (assetSearchQuery.value) {
    const q = assetSearchQuery.value.toLowerCase()
    list = list.filter(r => 
      (r.data.asset_tag && r.data.asset_tag.toLowerCase().includes(q)) ||
      (r.data.name && r.data.name.toLowerCase().includes(q)) ||
      (r.data.serial && r.data.serial.toLowerCase().includes(q)) ||
      (r.data.user && r.data.user.toLowerCase().includes(q)) ||
      (r.data.model && r.data.model.toLowerCase().includes(q))
    )
  }
  return list
})

const filteredTickets = computed(() => {
  let list = parsedTickets.value
  
  if (ticketFilter.value === "valid") list = list.filter(r => r.status === "valid")
  else if (ticketFilter.value === "error") list = list.filter(r => r.status === "error")
  else if (ticketFilter.value === "warning") list = list.filter(r => r.status === "warning")
  
  if (ticketSearchQuery.value) {
    const q = ticketSearchQuery.value.toLowerCase()
    list = list.filter(r => 
      (r.data.Num_Ticket && String(r.data.Num_Ticket).includes(q)) ||
      (r.data.Titre && r.data.Titre.toLowerCase().includes(q)) ||
      (r.data.Description && r.data.Description.toLowerCase().includes(q)) ||
      (r.data.Priority && r.data.Priority.toLowerCase().includes(q)) ||
      (r.data.Status && r.data.Status.toLowerCase().includes(q))
    )
  }
  return list
})

const canImportAssets = computed(() => {
  if (parsedAssets.value.length === 0) return false
  if (store.importStatus === "running") return false
  
  const hasErrors = parsedAssets.value.some(r => r.status === "error")
  if (hasErrors && !ignoreErrorsAsset.value) return false

  const count = ignoreErrorsAsset.value
    ? parsedAssets.value.filter(r => r.status !== "error").length
    : parsedAssets.value.length
    
  return count > 0
})

const canImportTickets = computed(() => {
  if (parsedTickets.value.length === 0) return false
  if (store.importStatus === "running") return false
  
  const hasErrors = parsedTickets.value.some(r => r.status === "error")
  if (hasErrors && !ignoreErrorsTicket.value) return false

  const count = ignoreErrorsTicket.value
    ? parsedTickets.value.filter(r => r.status !== "error").length
    : parsedTickets.value.length
    
  return count > 0
})

// Tab Switch Reset
watch(activeTab, () => {
  file.value = null
  ticketFile.value = null
  parsedAssets.value = []
  parsedTickets.value = []
  erreur.value = ""
  message.value = ""
  store.resetImportState()
})

const statusBadgeClass = (status) => {
  if (status === "valid") return "badge-valid"
  if (status === "warning") return "badge-warning"
  return "badge-error"
}

const statusBadgeText = (status) => {
  if (status === "valid") return "Conforme"
  if (status === "warning") return "Alerte"
  return "Invalide"
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Portail d'Importation</h1>
      <p class="page-subtitle">Visualisez, analysez et validez vos donnees CSV avant de lancer l'importation.</p>
    </div>

    <!-- TABS NAVIGATION -->
    <div class="tabs-nav">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'assets' }" 
        @click="activeTab = 'assets'"
      >
        Materiels (Assets Snipe-IT)
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'tickets' }" 
        @click="activeTab = 'tickets'"
      >
        Tickets (SQLite Support)
      </button>
    </div>

    <!-- MAIN CARD -->
    <div class="import-card">
      
      <!-- FOR ASSETS -->
      <div v-if="activeTab === 'assets'" class="tab-content">
        <div class="card-header">
          <div class="header-text">
            <h2>Importation de Materiels</h2>
            <p class="help-text">
              Format CSV requis (delimite par ; ou ,) : asset_tag, serial, name, category, manufacturer, model, status, company, user, email, department, purchase_date, purchase_cost
            </p>
          </div>
        </div>

        <!-- FILE ZONE -->
        <div class="file-zone">
          <input
            type="file"
            accept=".csv"
            @change="choisirFichier"
            :disabled="store.importStatus === 'running'"
            id="fileAsset"
            class="file-input"
          />
          <label for="fileAsset" class="file-label" :class="{ disabled: store.importStatus === 'running' }">
            <span class="upload-icon-text">CSV</span>
            <span class="upload-text">
              {{ file ? `Fichier selectionne : ${file.name}` : "Cliquez ou glissez-deposez le fichier CSV d'Assets ici" }}
            </span>
            <span v-if="file" class="file-size">{{ (file.size / 1024).toFixed(1) }} KB</span>
          </label>
        </div>

        <!-- CONTROLS ROW - DESSUS DE LA TABLE -->
        <div class="actions-row">
          <div class="safety-toggle">
            <label class="checkbox-label">
              <input type="checkbox" v-model="ignoreErrorsAsset" />
              <span class="custom-checkbox"></span>
              Ignorer les lignes contenant des erreurs critiques
            </label>
          </div>
          
          <button 
            class="btn-import btn-primary" 
            :disabled="!canImportAssets" 
            @click="importer"
          >
            {{ store.importStatus === 'running' ? 'Importation en cours...' : `Lancer l'importation (${ignoreErrorsAsset ? parsedAssets.filter(r => r.status !== 'error').length : parsedAssets.length} ligne(s))` }}
          </button>
        </div>
      </div>

      <!-- FOR TICKETS -->
      <div v-else class="tab-content">
        <div class="card-header">
          <div class="header-text">
            <h2>Importation de Tickets de Support</h2>
            <p class="help-text">
              Format CSV requis (delimite par ; ou ,) : Num_Ticket, Date, Heure, Titre, Description, Status, Priority, Items
            </p>
          </div>
        </div>

        <!-- FILE ZONE -->
        <div class="file-zone">
          <input
            type="file"
            accept=".csv"
            @change="choisirTicket"
            :disabled="store.importStatus === 'running'"
            id="fileTicket"
            class="file-input"
          />
          <label for="fileTicket" class="file-label" :class="{ disabled: store.importStatus === 'running' }">
            <span class="upload-icon-text">CSV</span>
            <span class="upload-text">
              {{ ticketFile ? `Fichier selectionne : ${ticketFile.name}` : "Cliquez ou glissez-deposez le fichier CSV de Tickets ici" }}
            </span>
            <span v-if="ticketFile" class="file-size">{{ (ticketFile.size / 1024).toFixed(1) }} KB</span>
          </label>
        </div>

        <!-- CONTROLS ROW - DESSUS DE LA TABLE -->
        <div class="actions-row">
          <div class="safety-toggle">
            <label class="checkbox-label">
              <input type="checkbox" v-model="ignoreErrorsTicket" />
              <span class="custom-checkbox"></span>
              Ignorer les tickets contenant des erreurs critiques
            </label>
          </div>

          <button 
            class="btn-import btn-primary" 
            :disabled="!canImportTickets" 
            @click="importerTickets"
          >
            {{ store.importStatus === 'running' ? 'Importation en cours...' : `Lancer l'importation (${ignoreErrorsTicket ? parsedTickets.filter(r => r.status !== 'error').length : parsedTickets.length} ticket(s))` }}
          </button>
        </div>
      </div>

      <!-- MESSAGES STATIQUES -->
      <div v-if="erreur" class="msg-box error-box">Erreur : {{ erreur }}</div>
      <div v-if="message" class="msg-box success-box">Succes : {{ message }}</div>

      <!-- VISUAL ANALYSIS SECTION (ASSETS) -->
      <div v-if="activeTab === 'assets' && parsedAssets.length > 0" class="analysis-section">
        <h3 class="section-title">Analyse de coherence du fichier</h3>
        
        <!-- STATS GRID -->
        <div class="stats-grid">
          <div class="stat-card total" :class="{ active: assetFilter === 'all' }" @click="assetFilter = 'all'">
            <span class="stat-val">{{ assetStats.total }}</span>
            <span class="stat-lbl">Lignes totales</span>
          </div>
          <div class="stat-card valid" :class="{ active: assetFilter === 'valid' }" @click="assetFilter = 'valid'">
            <span class="stat-val">{{ assetStats.valid }}</span>
            <span class="stat-lbl">Pretes à l'import</span>
          </div>
          <div class="stat-card warning" :class="{ active: assetFilter === 'warning' }" @click="assetFilter = 'warning'">
            <span class="stat-val">{{ assetStats.warning }}</span>
            <span class="stat-lbl">Avec alertes</span>
          </div>
          <div class="stat-card error" :class="{ active: assetFilter === 'error' }" @click="assetFilter = 'error'">
            <span class="stat-val">{{ assetStats.error }}</span>
            <span class="stat-lbl">Critiques</span>
          </div>
        </div>

        <!-- SEARCH AND FILTER BAR -->
        <div class="table-controls">
          <input 
            type="text" 
            v-model="assetSearchQuery" 
            placeholder="Rechercher par tag, nom, serie, utilisateur..." 
            class="search-input"
          />
          <div class="filter-info">
            Affichage : <strong>{{ filteredAssets.length }} / {{ parsedAssets.length }}</strong> lignes
          </div>
        </div>

        <!-- PREVIEW TABLE -->
        <div class="table-container">
          <table class="preview-table">
            <thead>
              <tr>
                <th>Ligne</th>
                <th>Asset Tag</th>
                <th>Nom</th>
                <th>Modele / Statut</th>
                <th>Utilisateur / Email</th>
                <th>Cout</th>
                <th>Date</th>
                <th>Validation</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredAssets" :key="row.lineNum" :class="'row-' + row.status">
                <td class="col-line">#{{ row.lineNum }}</td>
                <td class="bold">{{ row.data.asset_tag || '—' }}</td>
                <td>{{ row.data.name || '—' }}</td>
                <td>
                  <div class="sub-info">{{ row.data.model || '—' }}</div>
                  <div class="sub-tag">{{ row.data.status || '—' }}</div>
                </td>
                <td>
                  <div v-if="row.data.user" class="bold">{{ row.data.user }}</div>
                  <div v-if="row.data.email" class="sub-info">{{ row.data.email }}</div>
                  <div v-if="!row.data.user && !row.data.email" class="muted">Non attribue</div>
                </td>
                <td>{{ row.data.purchase_cost !== null ? `${row.data.purchase_cost} EUR` : '—' }}</td>
                <td>{{ row.data.purchase_date || '—' }}</td>
                <td>
                  <span class="badge" :class="statusBadgeClass(row.status)">
                    {{ statusBadgeText(row.status) }}
                  </span>
                  
                  <!-- Erreur/Avertissement info list -->
                  <div v-if="row.errors.length > 0 || row.warnings.length > 0" class="row-issues">
                    <div v-for="err in row.errors" :key="err" class="issue-item err-text">- {{ err }}</div>
                    <div v-for="warn in row.warnings" :key="warn" class="issue-item warn-text">- {{ warn }}</div>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredAssets.length === 0">
                <td colspan="8" class="empty-table">Aucune ligne ne correspond aux filtres.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="action-zone-bottom">
          <button 
            class="btn-import btn-primary" 
            :disabled="!canImportAssets" 
            @click="importer"
          >
            {{ store.importStatus === 'running' ? 'Importation en cours...' : `Lancer l'importation (${ignoreErrorsAsset ? parsedAssets.filter(r => r.status !== 'error').length : parsedAssets.length} ligne(s))` }}
          </button>
        </div>
      </div>

      <!-- VISUAL ANALYSIS SECTION (TICKETS) -->
      <div v-if="activeTab === 'tickets' && parsedTickets.length > 0" class="analysis-section">
        <h3 class="section-title">Analyse de coherence des tickets</h3>

        <!-- STATS GRID -->
        <div class="stats-grid">
          <div class="stat-card total" :class="{ active: ticketFilter === 'all' }" @click="ticketFilter = 'all'">
            <span class="stat-val">{{ ticketStats.total }}</span>
            <span class="stat-lbl">Tickets totaux</span>
          </div>
          <div class="stat-card valid" :class="{ active: ticketFilter === 'valid' }" @click="ticketFilter = 'valid'">
            <span class="stat-val">{{ ticketStats.valid }}</span>
            <span class="stat-lbl">Prets a l'import</span>
          </div>
          <div class="stat-card warning" :class="{ active: ticketFilter === 'warning' }" @click="ticketFilter = 'warning'">
            <span class="stat-val">{{ ticketStats.warning }}</span>
            <span class="stat-lbl">Alertes</span>
          </div>
          <div class="stat-card error" :class="{ active: ticketFilter === 'error' }" @click="ticketFilter = 'error'">
            <span class="stat-val">{{ ticketStats.error }}</span>
            <span class="stat-lbl">Critiques</span>
          </div>
        </div>

        <!-- SEARCH AND FILTER BAR -->
        <div class="table-controls">
          <input 
            type="text" 
            v-model="ticketSearchQuery" 
            placeholder="Rechercher par Num_Ticket, Titre, priorite..." 
            class="search-input"
          />
          <div class="filter-info">
            Affichage : <strong>{{ filteredTickets.length }} / {{ parsedTickets.length }}</strong> tickets
          </div>
        </div>

        <!-- PREVIEW TABLE -->
        <div class="table-container">
          <table class="preview-table">
            <thead>
              <tr>
                <th>Ligne</th>
                <th>Num Ticket</th>
                <th>Titre / Description</th>
                <th>Date & Heure</th>
                <th>Priorite / Statut</th>
                <th>Items Rattaches</th>
                <th>Validation</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredTickets" :key="row.lineNum" :class="'row-' + row.status">
                <td class="col-line">#{{ row.lineNum }}</td>
                <td class="bold">{{ row.data.Num_Ticket || '—' }}</td>
                <td>
                  <div class="bold truncate-text" :title="row.data.Titre">{{ row.data.Titre || '—' }}</div>
                  <div class="sub-info truncate-text" :title="row.data.Description">{{ row.data.Description || '—' }}</div>
                </td>
                <td>{{ row.data.Date }} - {{ row.data.Heure }}</td>
                <td>
                  <span class="priority-label">{{ row.data.Priority }}</span> / 
                  <span class="status-label">{{ row.data.Status }}</span>
                </td>
                <td>
                  <code class="items-code">{{ row.data.Items }}</code>
                </td>
                <td>
                  <span class="badge" :class="statusBadgeClass(row.status)">
                    {{ statusBadgeText(row.status) }}
                  </span>
                  
                  <div v-if="row.errors.length > 0 || row.warnings.length > 0" class="row-issues">
                    <div v-for="err in row.errors" :key="err" class="issue-item err-text">- {{ err }}</div>
                    <div v-for="warn in row.warnings" :key="warn" class="issue-item warn-text">- {{ warn }}</div>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredTickets.length === 0">
                <td colspan="7" class="empty-table">Aucun ticket ne correspond aux criteres.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="action-zone-bottom">
          <button 
            class="btn-import btn-primary" 
            :disabled="!canImportTickets" 
            @click="importerTickets"
          >
            {{ store.importStatus === 'running' ? 'Importation en cours...' : `Lancer l'importation (${ignoreErrorsTicket ? parsedTickets.filter(r => r.status !== 'error').length : parsedTickets.length} ticket(s))` }}
          </button>
        </div>
      </div>

      <!-- REAL-TIME LOGS & PROGRESS CONSOLE -->
      <div v-if="store.importStatus !== 'idle'" class="logs-console-card">
        <div class="console-header">
          <h3>Journal d'Execution en Direct</h3>
          <span class="status-indicator" :class="'status-' + store.importStatus">
            {{ store.importStatus === 'running' ? 'IMPORTATION EN COURS' : 'TERMINE' }}
          </span>
        </div>

        <!-- PROGRESS BAR -->
        <div class="progress-container">
          <div class="progress-bar-wrapper">
            <div 
              class="progress-bar" 
              :style="{ width: `${(store.importProgress / store.importTotal) * 100}%` }"
            ></div>
          </div>
          <div class="progress-numbers">
            Progression : {{ store.importProgress }} / {{ store.importTotal }} elements ({{ Math.round((store.importProgress / store.importTotal) * 100) || 0 }}%)
          </div>
        </div>

        <!-- TERMINAL LOGS -->
        <div ref="logConsole" class="terminal-box">
          <div 
            v-for="(log, idx) in store.importLogs" 
            :key="idx" 
            class="log-line" 
            :class="'log-' + log.type"
          >
            <span class="log-time">[{{ log.timestamp }}]</span>
            <span class="log-prefix">[{{ log.type.toUpperCase() }}]</span>
            <span class="log-text">{{ log.text }}</span>
          </div>
          <div v-if="store.importLogs.length === 0" class="log-line log-info">
            <span class="log-text">Console en attente d'instructions...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 40px 24px;
  background: var(--bg);
  min-height: 100vh;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 32px;
  text-align: left;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-h);
  margin: 0 0 8px 0;
  letter-spacing: -0.8px;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text);
  margin: 0;
}

/* TABS */
.tabs-nav {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  background: var(--social-bg);
  color: var(--text-h);
}

.tab-btn.active {
  background: var(--accent-bg);
  color: var(--accent);
  border: 1px solid var(--accent-border);
}

/* CARD */
.import-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  text-align: left;
}

.card-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.card-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-h);
  margin: 0 0 6px 0;
}

.help-text {
  font-size: 0.85rem;
  color: var(--text);
  margin: 0;
  line-height: 1.4;
}

/* FILE UPLOAD ZONE */
.file-zone {
  position: relative;
  width: 100%;
}

.file-input {
  display: none;
}

.file-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 2px dashed var(--border);
  border-radius: 12px;
  cursor: pointer;
  background: var(--social-bg);
  transition: all 0.2s ease;
  text-align: center;
}

.file-label:hover:not(.disabled) {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.file-label.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-icon-text {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 12px;
  background: var(--border);
  padding: 6px 16px;
  border-radius: 8px;
  color: var(--text-h);
  display: inline-block;
}

.upload-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-h);
}

.file-size {
  font-size: 0.8rem;
  color: var(--text);
  margin-top: 6px;
  background: var(--border);
  padding: 2px 8px;
  border-radius: 20px;
}

/* ACTIONS ROW - ALWAYS VISIBLE BELOW THE FILE INPUT */
.actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.safety-toggle {
  text-align: left;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: var(--text-h);
  font-weight: 600;
  cursor: pointer;
}

.checkbox-label input {
  display: none;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-radius: 4px;
  display: inline-block;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label input:checked + .custom-checkbox {
  background: var(--accent);
  border-color: var(--accent);
}

.checkbox-label input:checked + .custom-checkbox::after {
  content: "✓";
  color: white;
  font-size: 0.85rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
}

.btn-import {
  font-size: 1rem;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #902be3;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* MESSAGES BOXES */
.msg-box {
  padding: 14px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  text-align: left;
  margin-top: 10px;
}

.error-box {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.success-box {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* STATS GRID */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin: 16px 0;
}

.stat-card {
  padding: 16px;
  border-radius: 12px;
  background: var(--social-bg);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.stat-card.active {
  border-width: 2px;
}

.stat-card.total.active { border-color: var(--accent); background: var(--accent-bg); }
.stat-card.valid.active { border-color: #10b981; background: rgba(16, 185, 129, 0.1); }
.stat-card.warning.active { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
.stat-card.error.active { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }

.stat-val {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.total .stat-val { color: var(--accent); }
.valid .stat-val { color: #10b981; }
.warning .stat-val { color: #f59e0b; }
.error .stat-val { color: #ef4444; }

.stat-lbl {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* TABLE CONTROLS */
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 280px;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
}

.filter-info {
  font-size: 0.9rem;
  color: var(--text);
}

/* PREVIEW TABLE WITH SCROLL */
.table-container {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-top: 16px;
  background: var(--bg);
  max-height: 250px; /* Scrollable max-height */
}

.preview-table {
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
  font-size: 0.88rem;
  text-align: left;
}

.preview-table th {
  background: var(--bg);
  color: var(--text-h);
  padding: 14px 16px;
  font-weight: 700;
  border-bottom: 2px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.preview-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

.row-valid:hover { background: rgba(16, 185, 129, 0.03); }
.row-warning { background: rgba(245, 158, 11, 0.02); }
.row-warning:hover { background: rgba(245, 158, 11, 0.05); }
.row-error { background: rgba(239, 68, 68, 0.03); }
.row-error:hover { background: rgba(239, 68, 68, 0.06); }

.col-line {
  font-family: var(--mono);
  color: var(--text);
  font-weight: 600;
}

.bold {
  font-weight: 600;
  color: var(--text-h);
}

.muted {
  color: var(--text);
  font-style: italic;
}

.sub-info {
  font-size: 0.8rem;
  color: var(--text);
  margin-top: 2px;
}

.sub-tag {
  display: inline-block;
  font-size: 0.75rem;
  background: var(--border);
  color: var(--text-h);
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
}

.truncate-text {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.items-code {
  font-size: 0.8rem;
  background: var(--code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  max-width: 180px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* BADGES */
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.badge-valid {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.badge-error {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

.row-issues {
  margin-top: 8px;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.issue-item {
  line-height: 1.3;
  white-space: normal;
  word-break: break-word;
}

.err-text { color: #dc2626; }
.warn-text { color: #b45309; }

.empty-table {
  text-align: center;
  color: var(--text);
  padding: 32px !important;
  font-style: italic;
}

.action-zone-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid var(--border);
}

/* LOGS CONSOLE */
.logs-console-card {
  margin-top: 32px;
  background: #0e1117;
  border: 1px solid #2d3139;
  border-radius: 12px;
  padding: 24px;
  color: #c9d1d9;
  text-align: left;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #21262d;
  padding-bottom: 12px;
}

.console-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f0f6fc;
}

.status-indicator {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.status-running {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  animation: pulse 1.5s infinite;
}

.status-success { background: rgba(52, 211, 153, 0.15); color: #34d399; }
.status-warning { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
.status-error { background: rgba(248, 113, 113, 0.15); color: #f87171; }

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* PROGRESS BAR */
.progress-container {
  margin-bottom: 20px;
}

.progress-bar-wrapper {
  background: #21262d;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-bar {
  background: var(--accent);
  height: 100%;
  transition: width 0.3s ease;
}

.progress-numbers {
  font-size: 0.8rem;
  color: #8b949e;
  text-align: right;
}

/* TERMINAL */
.terminal-box {
  background: #0b0d12;
  border-radius: 8px;
  padding: 16px;
  height: 250px;
  overflow-y: auto;
  font-family: var(--mono);
  font-size: 0.85rem;
  line-height: 1.5;
  border: 1px solid #161b22;
}

.log-line {
  display: flex;
  gap: 10px;
  margin-bottom: 6px;
  align-items: flex-start;
}

.log-time {
  color: #58a6ff;
  white-space: nowrap;
}

.log-prefix {
  flex-shrink: 0;
  font-weight: 700;
}

.log-text {
  word-break: break-all;
}

.log-info { color: #c9d1d9; }
.log-success { color: #34d399; }
.log-warning { color: #fbbf24; }
.log-error { color: #f87171; }
</style>