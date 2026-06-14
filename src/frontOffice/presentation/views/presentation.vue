<script setup>
import { onMounted, ref } from "vue"
import { usepresentationStore } from "../store/presentationStore"
import { useRouter } from "vue-router"
import { usesettingsStore } from "../../../backOffice/setting/store/settingsStore"

const settingsStore = usesettingsStore()
const store = usepresentationStore()
const router = useRouter()
const tickDrag = ref(null)
const showForm = ref(false)
const showDetail = ref(false)
const ticketDetail = ref(null)
const titre = ref("")
const description = ref("")
const priorityId = ref(null)
const selectedAssets = ref([])
const statusSelectionne = ref(null)
const date = ref (null)
const showMoveModal = ref(false)

const nouveauTitre = ref("")
const nouvelleDescription = ref("")
const nouvelleDate = ref("")
const nouveauMontant = ref("")
const statusDestination = ref(null)

const modalInprogress = ref(false)
const montantInprogress = ref("")
const choixReouverture = ref(false)

onMounted(async () => {
  await store.loadAsset()
  await store.loadTickets()
  await settingsStore.loadSettings()
})

const startDrag = (ticket) => { tickDrag.value = ticket }

const getSetting = (statusId) => {
  return settingsStore.settings.find(s => s.status_id === statusId)
}
const dropTicket = async (stat) => {
  if (!tickDrag.value) return
  if (tickDrag.value.status_id === stat.id) return
  statusDestination.value = stat
  //allea2 
  const ancienSetting = getSetting(tickDrag.value.status_id)
  const ancienLabel = ancienSetting?.label?.toLowerCase() || ""
  const etaitClosed = ancienLabel.includes("closed") || ancienLabel.includes("terminé") || ancienLabel.includes("vita")
  const nouveauLabel = stat.label?.toLowerCase() || stat.name?.toLowerCase() || ""
  const devientInprogress = nouveauLabel.includes("in progress") || nouveauLabel.includes("en cours") || nouveauLabel.includes("efa manao")
  if(etaitClosed && devientInprogress){
    nouveauMontant.value =""
    choixReouverture.value = false
    modalInprogress.value = true
    return
  }
  nouveauTitre.value = tickDrag.value.titre
  nouvelleDescription.value = tickDrag.value.description
  nouvelleDate.value = tickDrag.value.date || ""
  nouveauMontant.value = ""
  showMoveModal.value = true
}
const confirmerDeplacement = async () => {
  if (!nouveauTitre.value) { alert("Titre obligatoire"); return }
  if (!nouvelleDescription.value) { alert("Description obligatoire"); return }
  if (!nouvelleDate.value) { alert("Date obligatoire"); return }
  const label = getSetting(statusDestination.value.id)?.label?.toLowerCase() || ""
  const estClosed = label.includes("closed") || label.includes("terminé") || label.includes("vita")
  const estInprogress = 
  await store.changeStatus(
    tickDrag.value.id,
    statusDestination.value.id,
    nouveauTitre.value,
    nouvelleDescription.value,
    nouvelleDate.value
  )
  if (estClosed && nouveauMontant.value) {
    let items = []
    try { items = JSON.parse(tickDrag.value.items) } catch { items = [] }
    if (items.length > 0) {
      const montantParItem = Number(nouveauMontant.value) / items.length
      const groupeId = Date.now().toString()   // ← ajouter ici
      for (const tag of items) {
        const asset = store.assets.find(a => a.asset_tag === tag)
        const categoryName = asset?.category?.name || "Inconnu"
        await store.addCost(tickDrag.value.id, montantParItem, categoryName, groupeId)  // ← ajouter groupeId
      }
    }
  }
  showMoveModal.value = false
  tickDrag.value = null
}
const voirDetail = (tick) => {
  ticketDetail.value = tick
  showDetail.value = true
}
const makaId = (statusId) => {
  selectedAssets.value = statusId
  showForm.value = true
}
const findNew = store.status.find (s => s.name === "vaovao")
const enregistrer = async () => {
  if (!titre.value) { alert("Titre obligatoire"); return }
  if (selectedAssets.value.length === 0) { alert("Veuillez saisir un Asset"); return }
  if (!priorityId.value) { alert("Veuillez sélectionner une priorité"); return }
  try {
    await store.createTicket({
      num_ticket: Date.now(),
      date: new Date().toLocaleDateString(),
      heure: new Date().toLocaleTimeString(),
      titre: titre.value,
      description: description.value,
      status_id: findNew.id,
      priority_id: priorityId.value,
      date : date.value,
      items: JSON.stringify(selectedAssets.value)
    })
    titre.value = ""
    description.value = ""
    priorityId.value = null
    selectedAssets.value = []
    showForm.value = false
    await store.loadTickets()
  } catch (err) {
    console.error(err)
    alert("Erreur création")
  }
}

const itemsParsed = (items) => {
  try { return JSON.parse(items) } catch { return [] }
}

const gererReouverture = async () => {
  if (!nouveauMontant.value || Number(nouveauMontant.value) <= 0) {
    alert("Veuillez saisir un montant valide.")
    return
  }
  await store.changeStatus(
    tickDrag.value.id,
    statusDestination.value.id,
    tickDrag.value.titre,
    tickDrag.value.description,
    tickDrag.value.date || new Date().toISOString().split('T')[0]
  )
  let items = []
  try { items = JSON.parse(tickDrag.value.items) } catch { items = [] }
    if (items.length > 0) {
      const montantAdditionnelParItem = Number(nouveauMontant.value) / items.length
      const groupeId = Date.now().toString()   // ← ajouter ici
      for (const tag of items) {
        const asset = store.assets.find(a => a.asset_tag === tag)
        const categoryName = asset?.category?.name || "Inconnu"
        await store.addCost(tickDrag.value.id, montantAdditionnelParItem, categoryName, groupeId)  // ← ajouter groupeId
      }
    }
  modalInprogress.value = false
  tickDrag.value = null
  await store.loadTickets() 
}
const gererAnnulation = async () => {
  if (confirm("Confirmez-vous l'annulation ? Le montant inséré dans Closed sera supprimé.")) {
    try {
      // 1. Supprimer le dernier montant
      await store.deleteTicketCosts(tickDrag.value.id)
      await store.changeStatus(
        tickDrag.value.id,
        statusDestination.value.id,
        tickDrag.value.titre,
        tickDrag.value.description,
        tickDrag.value.date || new Date().toISOString().split("T")[0]
      )

      modalInprogress.value = false
      tickDrag.value = null
      await store.loadTickets()
    } catch (error) {
      console.error("Erreur annulation :", error)
      alert("Impossible d'annuler.")
    }
  }
}
</script>

<template>
  <div class="kanban-page">

    <div class="kanban-header">
      <h2>Kanban Tickets</h2>
    </div>

    <!-- BOARD -->
    <div class="kanban-board">
      <div
        v-for="stat in store.status"
        :key="stat.id"
        class="kanban-col"
        :style="{ background: getSetting(stat.id)?.color || '#ecf0f1' }"
        @dragover.prevent
        @drop="dropTicket(stat)"
      >
        <!-- HEADER COLONNE -->
        <div class="col-header">
          <span class="col-title">
            {{ getSetting(stat.id)?.label || stat.name }}
          </span>
          <span class="badge">
            {{ store.ticks.filter(t => t.status_id === stat.id).length }}
          </span>
        </div>
        <button
          v-if="stat.name === 'vaovao'"
          class="btn-add-ticket"
          @click="showForm = true"
        >
          + Nouveau ticket
        </button>
        <div
          v-for="tick in store.ticks.filter(t => t.status_id === stat.id)"
          :key="tick.id"
          class="ticket-card"
          draggable="true"
          @dragstart="startDrag(tick)"
          @click="voirDetail(tick)"
        >
          <div class="ticket-num">#{{ tick.num_ticket }}</div>
          <div class="ticket-titre">{{ tick.titre }}</div>
          <div class="ticket-priority" :class="tick.priority_name?.toLowerCase()">
            {{ tick.priority_name }}
          </div>
          
        </div>

      </div>
    </div>

    <!-- FORM OVERLAY -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-card">
        <button class="modal-close" @click="showForm = false">✕</button>
        <h3>Nouveau Ticket</h3>

        <div class="field">
          <label>Titre *</label>
          <input v-model="titre" placeholder="Titre du ticket" />
        </div>

        <div class="field">
          <label>Description</label>
          <textarea v-model="description" placeholder="Description..."></textarea>
        </div>
          <input
        type="date"
        v-model="date"
      />
        <div class="field">
          <label>Priorité</label>
          <select v-model="priorityId">
            <option value="">Choisir...</option>
            <option v-for="p in store.priorities" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>

        <div class="field">
          <label>Assets</label>
          <div class="assets-check">
            <div v-for="asset in store.assets" :key="asset.id" class="asset-item">
              <input type="checkbox" :value="asset.asset_tag" v-model="selectedAssets" />
              <span>{{ asset.asset_tag }} — {{ asset.name }}</span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-save" @click="enregistrer">Créer</button>
          <button class="btn-cancel" @click="showForm = false">Annuler</button>
        </div>
      </div>
    </div>

    <!-- MODAL DETAIL -->
    <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
      <div class="modal-card">
        <button class="modal-close" @click="showDetail = false">✕</button>
        <h3>Ticket #{{ ticketDetail.num_ticket }}</h3>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Date</span>
            <span>{{ ticketDetail.date }} à {{ ticketDetail.heure }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status</span>
            <span class="badge-status" :class="ticketDetail.status_name?.toLowerCase().replace(' ','-')">
              {{ ticketDetail.status_name }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Priorité</span>
            <span class="badge-priority" :class="ticketDetail.priority_name?.toLowerCase()">
              {{ ticketDetail.priority_name }}
            </span>
          </div>
        </div>

        <div class="info-block">
          <span class="info-label">Titre</span>
          <p>{{ ticketDetail.titre }}</p>
        </div>

        <div class="info-block">
          <span class="info-label">Description</span>
          <p>{{ ticketDetail.description }}</p>
        </div>

        <div class="info-block" v-if="itemsParsed(ticketDetail.items).length">
          <span class="info-label">Assets associés</span>
          <div class="assets-tags">
            <span v-for="item in itemsParsed(ticketDetail.items)" :key="item" class="asset-tag">
              {{ item }}
            </span>
          </div>
        </div>

      </div>
    </div>
    <div
  v-if="showMoveModal"
  class="modal-overlay"
>
  <div class="modal-card">

    <h3>Déplacement Ticket</h3>

    <div class="field">
      <label>Titre</label>
      <input v-model="nouveauTitre">
    </div>

    <div class="field">
      <label>Description</label>
      <textarea
        v-model="nouvelleDescription"
      ></textarea>
    </div>

    <div class="field">
      <label>Date</label>
      <input
        type="date"
        v-model="nouvelleDate"
      >
    </div>

    <div
      v-if="
        getSetting(statusDestination?.id)
          ?.label
          ?.toLowerCase()
          .includes('closed')
      "
      class="field"
    >
      <label>Montant</label>

      <input
        type="number"
        v-model="nouveauMontant"
      >
    </div>

    <button
      class="btn-save"
      @click="confirmerDeplacement"
    >
      Valider
    </button>

    <button
      class="btn-cancel"
      @click="showMoveModal = false"
    >
      Annuler
    </button>
  </div>
</div>
   <div v-if="modalInprogress" class="modal-overlay">
  <div class="modal-card">
    <h3>Que voulez-vous faire avec ce ticket ?</h3>

    <div v-if="!choixReouverture" class="choix-actions">
      
      <button class="btn-save" @click="choixReouverture = true">
         Réouverture (Ajouter un montant)
      </button>
      <button class="btn-danger" @click="gererAnnulation">
         Annulation (Supprimer le montant Closed)
      </button>
      <button class="btn-cancel" @click="modalInprogress = false">
        Quitter
      </button>
    </div>

    <div v-else class="form-montant">
      <div class="field">
        <label>Saisir le montant à additionner :</label>
        <input type="number" v-model="nouveauMontant" placeholder="Ex: 5000">
      </div>

      <div class="form-actions">
        <button class="btn-save" @click="gererReouverture">
          Confirmer la Réouverture
        </button>
        <button class="btn-cancel" @click="choixReouverture = false">
          Retour
        </button>
      </div>
    </div>
  </div>
</div>
</div>
</template>

<style scoped>
.kanban-page {
  padding: 20px;
  background: #f4f6f8;
  min-height: 100vh;
}

.kanban-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.kanban-header h2 {
  color: #2c3e50;
  margin: 0;
}

/* BOARD */
.kanban-board {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.kanban-col {
  flex: 1;
  border-radius: 10px;
  padding: 14px;
  min-height: 500px;
}

/* HEADER COLONNE */
.col-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(0,0,0,0.1);
}

.col-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #2c3e50;
}

.badge {
  background: #2c3e50;
  color: white;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 0.82rem;
}

/* BOUTON ADD */
.btn-add-ticket {
  width: 100%;
  background: rgba(255,255,255,0.7);
  border: 1px dashed #aaa;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  font-size: 0.88rem;
  color: #555;
  margin-bottom: 10px;
}

.btn-add-ticket:hover {
  background: rgba(255,255,255,0.95);
}

/* TICKET CARD */
.ticket-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: grab;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s, transform 0.1s;
}

.ticket-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  transform: translateY(-1px);
}

.ticket-card:active { cursor: grabbing; }

.ticket-num { font-size: 0.72rem; color: #aaa; margin-bottom: 4px; }
.ticket-titre { font-weight: 600; font-size: 0.9rem; color: #2c3e50; margin-bottom: 6px; }

.ticket-priority {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
  font-weight: 600;
}

.ticket-priority.low    { background: #d5f5e3; color: #1e8449; }
.ticket-priority.medium { background: #fef9e7; color: #d4ac0d; }
.ticket-priority.high   { background: #fdebd0; color: #e67e22; }

/* MODAL OVERLAY */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-card {
  background: white;
  border-radius: 12px;
  padding: 28px;
  min-width: 400px;
  max-width: 520px;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-close {
  position: absolute;
  top: 14px; right: 16px;
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #aaa;
}

.modal-card h3 {
  margin: 0;
  color: #2c3e50;
}

/* CHAMPS FORM */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
}

.field input,
.field textarea,
.field select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.field textarea { height: 80px; resize: vertical; }

.assets-check {
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 8px;
}

.asset-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.86rem;
  color: #444;
  padding: 3px 0;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-save {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 9px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-cancel {
  background: #ecf0f1;
  color: #555;
  border: none;
  padding: 9px 20px;
  border-radius: 6px;
  cursor: pointer;
}

/* MODAL DETAIL */
.info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-block p {
  margin: 0;
  background: #f8f9fa;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #444;
}

.info-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-status {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
}

.badge-status.new         { background: #d6eaf8; color: #1a5276; }
.badge-status.in-progress { background: #fef9e7; color: #d4ac0d; }
.badge-status.closed      { background: #d5f5e3; color: #1e8449; }

.badge-priority {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
}

.badge-priority.low    { background: #d5f5e3; color: #1e8449; }
.badge-priority.medium { background: #fef9e7; color: #d4ac0d; }
.badge-priority.high   { background: #fdebd0; color: #e67e22; }

.assets-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.asset-tag {
  background: #eaf4fb;
  color: #2980b9;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
}
</style>