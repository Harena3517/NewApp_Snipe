<template>
  <div class="import-page container-dark">
    <div class="header-section">
      <h1>Portail d'Importation Snipe-IT</h1>
      <p class="subtitle">Matériels · Assets (Table: hardware)</p>
      <span class="accent-line"></span>
    </div>

    <div
      class="drop-zone card"
      :class="{ 'drop-active': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
      @click="$refs.fileInput.click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".csv"
        style="display:none"
        @change="onFileChange"
      />
      <p v-if="!fileName">📂 Glisse ton fichier CSV ici ou clique pour le chercher</p>
      <p v-else>✅ {{ fileName }} — {{ rows.length }} ligne(s) détectée(s)</p>
    </div>

    <div v-if="validationErrors.length > 0" class="card-warnings card">
      <strong>⚠️ Problèmes détectés (L'importation reste possible mais des valeurs par défaut seront appliquées) :</strong>
      <ul>
        <li v-for="(err, i) in validationErrors" :key="i">{{ err }}</li>
      </ul>
    </div>

    <div v-if="rows.length > 0" class="preview-card card">
      <h2>Aperçu des données à envoyer (Top 5)</h2>
      <div class="table-wrapper">
        <table class="preview-table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in rows.slice(0, 5)" :key="i">
              <td v-for="col in columns" :key="col">{{ row[col] || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="rows.length > 5" class="muted">... et {{ rows.length - 5 }} autre(s) ligne(s)</p>
    </div>

    <div v-if="steps.length > 0" class="steps-container card">
      <h2>Journal d'importation en direct</h2>
      <div class="steps-list">
        <div v-for="(step, idx) in steps" :key="idx" class="step-item">
          <span class="status-indicator">{{ statusIcon(step.status) }}</span>
          <div class="step-content">
            <span class="step-label">{{ step.label }}</span>
            <span v-if="step.detail" class="step-detail">— {{ step.detail }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="result" :class="['result-message', result.success ? 'msg-success' : 'msg-error']">
      {{ result.message }}
    </div>

    <div class="actions-container">
      <button
        class="btn-import"
        :disabled="rows.length === 0 || loading"
        @click="lancerImport"
      >
        {{ loading ? `⏳ Importation... (${progress}/${rows.length})` : `Lancer limportation de ${rows.length} asset(s)` }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import api from "../services/api.js"


const fileName         = ref("")
const rows             = ref([])
const columns          = ref([])
const loading          = ref(false)
const progress         = ref(0)
const result           = ref(null)
const steps            = ref([])
const validationErrors = ref([])
const isDragging       = ref(false)


const REQUIRED_COLS = ["name", "asset_tag", "model_id", "status_id"]

const addStep = (label) => {
  steps.value.push({ label, status: "pending", detail: "" })
  return steps.value.length - 1
}
const setStep = (index, status, detail = "") => {
  if (steps.value[index]) {
    steps.value[index].status = status
    steps.value[index].detail = detail
  }
}
const statusIcon = (s) => {
  if (s === "loading") return "⏳"
  if (s === "ok") return "✅"
  if (s === "error") return "❌"
  return "—"
}

/* ── UTILS DE NETTOYAGE ET SÉCURISATION ── */
const cleanHeader = (h) => {
  if (!h) return ""
  return h.replace(/^\uFEFF/, "") // Enlever le BOM UTF-8
          .trim()
          .toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
          .replace(/[\s\-\.]+/g, "_") // Remplacer espaces/tirets par _
          .replace(/[^a-z0-9_]/g, "") // Virer les caractères spéciaux
}

// Détecte si le fichier utilise la virgule ou le point-virgule
const detectSeparator = (headerLine) => {
  let inQuotes = false
  let counts = { ",": 0, ";": 0, "\t": 0 }
  
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i]
    if (char === '"') inQuotes = !inQuotes
    if (!inQuotes && counts[char] !== undefined) {
      counts[char]++
    }
  }
  return counts[";"] > counts[","] ? ";" : ","
}

// Découpe une ligne en gérant les guillemets (ex: "Nom, Prénom")
const parseCSVLine = (line, separator) => {
  const result = []
  let currentField = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (!inQuotes && currentField.trim() === "") {
        inQuotes = true
      } else if (inQuotes && line[i + 1] === '"') {
        currentField += '"' // Échappement du guillemet ""
        i++
      } else if (inQuotes) {
        inQuotes = false
      } else {
        currentField += char
      }
    } else if (char === separator && !inQuotes) {
      result.push(currentField.trim().replace(/^"+|"+$/g, ""))
      currentField = ""
    } else {
      currentField += char
    }
  }
  result.push(currentField.trim().replace(/^"+|"+$/g, ""))
  return result
}

/* ── PARSER CSV ULTRA TOLÉRANT ── */
const csvToJSON = (text) => {
  validationErrors.value = []
  
  // Normaliser les sauts de lignes (\r\n -> \n)
  const cleanText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const lines = cleanText.split("\n").map(l => l.trim()).filter(Boolean)

  if (lines.length < 2) return { headers: [], data: [] }

  const separator = detectSeparator(lines[0])
  
  // Extraction et nettoyage des en-têtes
  const rawHeaders = parseCSVLine(lines[0], separator)
  const headers = rawHeaders.map(cleanHeader).filter(h => h.length > 0)

  // Vérification des colonnes manquantes critiques
  REQUIRED_COLS.forEach(col => {
    if (!headers.includes(col)) {
      validationErrors.value.push(`Colonne '${col}' manquante dans le fichier. Une valeur par défaut sera utilisée ou la ligne échouera.`)
    }
  })

  // Conversion des lignes
  const data = lines.slice(1).map((line, lineIdx) => {
    const values = parseCSVLine(line, separator)
    const obj = {}
    
    // On mappe les en-têtes nettoyés avec les valeurs
    headers.forEach((h, i) => {
      obj[h] = values[i] !== undefined ? values[i].trim() : ""
    })
    
    // Validation rapide du coût numérique
    const costKey = headers.find(h => h.includes("cost") || h.includes("prix"))
    if (costKey && obj[costKey]) {
      const parsedCost = parseFloat(obj[costKey].replace(",", "."))
      if (isNaN(parsedCost)) {
        validationErrors.value.push(`Ligne ${lineIdx + 2}: Le coût '${obj[costKey]}' est invalide (converti en null).`)
      }
    }

    return obj
  })

  return { headers, data }
}

/* ── LECTURE DES FICHIERS ── */
const processFile = (file) => {
  if (!file || !file.name.endsWith(".csv")) {
    alert("Veuillez sélectionner un fichier au format .csv uniquement.")
    return
  }

  fileName.value = file.name
  const reader = new FileReader()
  
  reader.onload = (e) => {
    const { headers, data } = csvToJSON(e.target.result)
    columns.value = headers
    rows.value    = data
    steps.value   = []
    result.value  = null
    progress.value = 0
  }
  
  reader.readAsText(file, "UTF-8")
}

const onFileChange = (e) => processFile(e.target.files[0])
const onDrop       = (e) => processFile(e.dataTransfer.files[0])

/* ── ENVOI À L'API OFFICIELLE DE SNIPE-IT ── */
const lancerImport = async () => {
  steps.value    = []
  result.value   = null
  loading.value  = true
  progress.value = 0

  const mainStep = addStep(`Lancement de l'importation de ${rows.value.length} élément(s)`)
  setStep(mainStep, "loading")

  let inseres = 0
  let erreurs = 0

  for (let i = 0; i < rows.value.length; i++) {
    const csvRow = rows.value[i]
    progress.value = i + 1

    // Identification de la ligne pour le Log
    // Si la colonne 'asset_tag' est manquante ou vide, on génère un tag temporaire pour le log
    const currentTag = csvRow.asset_tag || csvRow.tag || `Ligne-${i + 2}-SANS-TAG`
    const currentLog = addStep(`Envoi matériel [${currentTag}]`)
    setStep(currentLog, "loading")

    try {
      // Normalisation complète des champs pour l'API Laravel de Snipe-IT
      const payload = {
        // Correction : On ajoute bien csvRow.asset_name en premier choix !
        name: csvRow.asset_name || csvRow.name || csvRow.nom || `Matériel #${currentTag}`,
        asset_tag:     currentTag, 
        serial:        csvRow.serial || csvRow.serial_number || csvRow.numero_serie || null,
        model_id:      parseInt(csvRow.model_id || csvRow.modele) || 1, // Fallback ID 1 si colonne manquante
        status_id:     parseInt(csvRow.status_id || csvRow.status_label_id || csvRow.statut) || 1, // Fallback ID 1
        location_id:   csvRow.location_id ? parseInt(csvRow.location_id) : null,
        purchase_date: csvRow.purchase_date || csvRow.date_achat || null,
        purchase_cost: csvRow.purchase_cost || csvRow.prix_achat ? parseFloat(String(csvRow.purchase_cost || csvRow.prix_achat).replace(",", ".")) : null,
        notes:         csvRow.notes || csvRow.commentaire || null
      }

      const response = await api.post("/hardware", payload)

      // Snipe-IT répond parfois avec { status: "error", messages: "..." } au lieu d'un crash HTTP
      if (response.data?.status === "error") {
        throw new Error(response.data.messages)
      }

      inseres++
      const createdId = response.data?.payload?.id || "OK"
      setStep(currentLog, "ok", `ID Snipe-IT : ${createdId}`)

    } catch (err) {
      erreurs++
      let backendMessage = err.message
      
      // Extraction des messages de validation Laravel détaillés
      if (err.response?.data?.messages) {
        backendMessage = typeof err.response.data.messages === "object"
          ? JSON.stringify(err.response.data.messages)
          : err.response.data.messages
      }
      
      setStep(currentLog, "error", backendMessage)
    }
  }

  // Finalisation du rapport
  setStep(mainStep, erreurs === 0 ? "ok" : "error", `${inseres} créé(s), ${erreurs} échec(s)`)
  
  result.value = {
    success: erreurs === 0,
    message: erreurs === 0 
      ? `✅ Importation terminée avec un succès total ! ${inseres} matériels créés.` 
      : `⚠️ Importation terminée. ${inseres} matériels ajoutés, ${erreurs} échec(s). Regarde les détails ci-dessus.`
  }
  
  loading.value = false
}
</script>

<style scoped>
.import-page { max-width: 900px; margin: 40px auto; padding: 20px; font-family: sans-serif; }
.container-dark { background-color: #111827; color: #f3f4f6; border-radius: 12px; padding: 30px; }
.header-section h1 { margin: 0; font-size: 1.8rem; }
.subtitle { color: #9ca3af; font-size: 0.95rem; margin-top: 5px; }
.accent-line { display: block; width: 60px; height: 4px; background: #6366f1; margin: 15px 0 25px 0; border-radius: 2px; }
.card { background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
.drop-zone { border: 2px dashed #4b5563; text-align: center; padding: 40px 20px; cursor: pointer; transition: all 0.2s ease; }
.drop-zone:hover, .drop-active { border-color: #6366f1; background: #252f3f; }
.card-warnings { background: #7c2d12; border-color: #9a3412; color: #ffedd5; }
.card-warnings ul { margin: 10px 0 0 0; padding-left: 20px; font-size: 0.9rem; }
.table-wrapper { overflow-x: auto; margin-top: 15px; }
.preview-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
.preview-table th, .preview-table td { padding: 10px; border-bottom: 1px solid #374151; }
.preview-table th { background: #111827; color: #a5b4fc; }
.muted { color: #9ca3af; font-size: 0.85rem; margin-top: 10px; }
.steps-container { max-height: 400px; overflow-y: auto; }
.step-item { display: flex; align-items: flex-start; margin-bottom: 10px; font-size: 0.9rem; border-bottom: 1px solid #2d3748; padding-bottom: 6px; }
.status-indicator { margin-right: 12px; font-size: 1.1rem; }
.step-detail { color: #9ca3af; font-size: 0.85rem; margin-left: 5px; font-family: monospace; }
.result-message { padding: 15px; border-radius: 6px; font-weight: bold; margin-bottom: 20px; text-align: center; }
.msg-success { background: #065f46; color: #a7f3d0; border: 1px solid #047857; }
.msg-error { background: #991b1b; color: #fee2e2; border: 1px solid #b91c1c; }
.actions-container { text-align: right; }
.btn-import { background: #4f46e5; color: white; border: none; padding: 12px 24px; font-size: 1rem; font-weight: bold; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
.btn-import:hover:not(:disabled) { background: #4338ca; }
.btn-import:disabled { opacity: 0.5; cursor: not-allowed; }
</style>