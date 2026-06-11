<script setup>
import { useticketStore } from "../store/ticketStore"
import { useRouter } from "vue-router"

const store = useticketStore()
const router = useRouter()

const ticket = store.selectedTicket

const items = () => {
  try {
    return JSON.parse(ticket.items)
  } catch {
    return []
  }
}

const retour = () => {
  router.push("/tickcreate")
}
</script>

<template>
  <div class="page">

    <div v-if="ticket" class="fiche-card">

      <button class="btn-retour" @click="retour">← Retour</button>

      <h2>Ticket #{{ ticket.num_ticket }}</h2>

      <div class="info-grid">

        <div class="info-item">
          <span class="info-label">Date</span>
          <span>{{ ticket.date }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">Heure</span>
          <span>{{ ticket.heure }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">Status</span>
          <span class="badge-status" :class="ticket.status_name?.toLowerCase().replace(' ', '-')">
            {{ ticket.status_name }}
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">Priorité</span>
          <span class="badge-priority" :class="ticket.priority_name?.toLowerCase()">
            {{ ticket.priority_name }}
          </span>
        </div>

      </div>

      <div class="info-block">
        <span class="info-label">Titre</span>
        <p>{{ ticket.titre }}</p>
      </div>

      <div class="info-block">
        <span class="info-label">Description</span>
        <p>{{ ticket.description }}</p>
      </div>

      <div class="info-block">
        <span class="info-label">Assets associés</span>
        <div class="assets-tags">
          <span v-for="item in items()" :key="item" class="asset-tag">
            {{ item }}
          </span>
          <span v-if="items().length === 0" class="empty">Aucun asset</span>
        </div>
      </div>

    </div>

    <div v-else class="fiche-card empty-state">
      <p>Aucun ticket sélectionné.</p>
      <button class="btn-retour" @click="retour">← Retour</button>
    </div>

  </div>
</template>

<style scoped>
.page {
  padding: 24px;
  background: #f4f6f8;
  min-height: 100vh;
}

.fiche-card {
  background: white;
  border-radius: 10px;
  padding: 28px;
  max-width: 580px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.btn-retour {
  background: none;
  border: 1px solid #ddd;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  color: #555;
  font-size: 0.88rem;
  align-self: flex-start;
}

.btn-retour:hover { background: #f0f0f0; }

h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.3rem;
}

/* GRID 2 colonnes */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
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
  color: #444;
  font-size: 0.92rem;
  background: #f8f9fa;
  padding: 10px 12px;
  border-radius: 6px;
}

.info-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* BADGES */
.badge-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  align-self: flex-start;
}

.badge-status.new         { background: #d6eaf8; color: #1a5276; }
.badge-status.in-progress { background: #fef9e7; color: #d4ac0d; }
.badge-status.closed      { background: #d5f5e3; color: #1e8449; }

.badge-priority {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  align-self: flex-start;
}

.badge-priority.low    { background: #d5f5e3; color: #1e8449; }
.badge-priority.medium { background: #fef9e7; color: #d4ac0d; }
.badge-priority.high   { background: #fdebd0; color: #e67e22; }

/* ASSETS */
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

.empty {
  color: #aaa;
  font-size: 0.88rem;
}

.empty-state {
  align-items: center;
  text-align: center;
  color: #888;
}
</style>