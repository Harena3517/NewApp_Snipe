<script setup>
import { onMounted, ref } from "vue"
import { useticketStore } from "../store/ticketStore"
import { useRouter } from "vue-router"

const store = useticketStore()
const router = useRouter()
const titre = ref("")
const description = ref("")
const statusId = ref(null)
const priorityId = ref(null)
const selectedAssets = ref([])
const date = ref(null)

onMounted(() => {
  store.loadAsset(),
  store.loadTickets()
})

const enregistrer = async () => {
  try {
    await store.createTicket({
      num_ticket: Date.now(),
      date: new Date().toLocaleDateString(),
      heure: new Date().toLocaleTimeString(),
      titre: titre.value,
      description: description.value,
      status_id: 1,
      priority_id: priorityId.value,
      date: date.value,
      items: JSON.stringify(selectedAssets.value)
    })
    alert("Ticket Créé")
    titre.value = ""
    description.value = ""
    selectedAssets.value = []
  } catch (err) {
    console.error(err)
    alert("Erreur création")
  }
}

const voirFiche = (tick) => {
  store.setSelectedTicket(tick)
  router.push("/tickcreate/" + tick.id)
}
</script>

<template>
  <div class="page">

    <!-- LISTE TICKETS -->
    <div class="section">
      <h2>Mes Tickets</h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Date</th>
              <th>Titre</th>
              <th>Status</th>
              <th>Priorité</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tick in store.ticks" :key="tick.id">
              <td><span class="tag">#{{ tick.num_ticket }}</span></td>
              <td>{{ tick.date }}</td>
              <td>{{ tick.titre }}</td>
              <td>
                <span class="badge-status" :class="tick.status_name?.toLowerCase().replace(' ', '-')">
                  {{ tick.status_name }}
                </span>
              </td>
              <td>
                <span class="badge-priority" :class="tick.priority_name?.toLowerCase()">
                  {{ tick.priority_name }}
                </span>
              </td>
              <td>
                <span class="badge-status" :class="tick.date?.toLowerCase().replace(' ', '-')">
                  {{ tick.date }}
                </span>
              </td>
              <td>
                <button class="btn-voir" @click="voirFiche(tick)">Voir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FORMULAIRE CREATION -->
    <div class="section">
      <h2>Créer un ticket</h2>
      <div class="form-card">

        <div class="field">
          <label>Titre</label>
          <input v-model="titre" type="text" placeholder="Titre du ticket" />
        </div>

        <div class="field">
          <label>Description</label>
          <input v-model="description" type="text" placeholder="Description..." />
        </div>
        <div class="field">
          <label>Date</label>
          <input v-model="date" type="date" placeholder="Date" />
        </div>
        <div class="field">
          <label>Priorité</label>
          <select v-model="priorityId">
            <option value="">Choisir...</option>
            <option v-for="priority in store.priorities" :key="priority.id" :value="priority.id">
              {{ priority.name }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Matériels associés</label>
          <div class="assets-list">
            <div v-for="asset in store.assets" :key="asset.id" class="asset-item">
              <input type="checkbox" :value="asset.asset_tag" v-model="selectedAssets" />
              <span>{{ asset.asset_tag }} — {{ asset.name }} — {{ asset.category?.name }}</span>
            </div>
          </div>
        </div>

        <button class="btn-submit" @click="enregistrer">Créer Ticket</button>

      </div>
    </div>

  </div>
</template>

<style scoped>
.page {
  padding: 24px;
  background: #f4f6f8;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section h2 {
  color: #2c3e50;
  margin-bottom: 14px;
  font-size: 1.2rem;
}

/* TABLEAU */
.table-wrapper {
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #2c3e50;
  color: white;
}

thead th {
  padding: 11px 16px;
  text-align: left;
  font-size: 0.85rem;
}

tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}

tbody tr:hover { background: #f8f9fa; }

tbody td {
  padding: 11px 16px;
  font-size: 0.88rem;
  color: #444;
}

.tag {
  background: #eaf4fb;
  color: #2980b9;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.8rem;
}

.badge-status {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
}

.badge-status.new           { background: #d6eaf8; color: #1a5276; }
.badge-status.in-progress   { background: #fef9e7; color: #d4ac0d; }
.badge-status.closed        { background: #d5f5e3; color: #1e8449; }

.badge-priority {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
}

.badge-priority.low    { background: #d5f5e3; color: #1e8449; }
.badge-priority.medium { background: #fef9e7; color: #d4ac0d; }
.badge-priority.high   { background: #fdebd0; color: #e67e22; }

.btn-voir {
  background: #3498db;
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.82rem;
}

.btn-voir:hover { background: #2980b9; }

/* FORMULAIRE */
.form-card {
  background: white;
  border-radius: 10px;
  padding: 24px;
  max-width: 520px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
}

.field input,
.field select {
  padding: 9px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.assets-list {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.asset-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: #444;
}

.btn-submit {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
}

.btn-submit:hover { background: #2980b9; }
</style>