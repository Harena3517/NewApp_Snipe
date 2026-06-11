<script setup>
import { onMounted } from "vue"
import { useDashStore } from "../store/dashStore"

const store = useDashStore()

onMounted(() => {
  store.loadHardware()
  store.loadTickets()
})
</script>

<template>
  <div class="page">
    <h1 class="page-title">Dashboard</h1>
    <div class="cards-row">
      <div class="section-card">
        <div class="section-header">
          <div>
            <p class="section-label">Total Hardware</p>
            <p class="section-total">{{ store.totalHardware }}</p>
          </div>
        </div>
        <div class="detail-list">
          <div
            v-for="(nombre, cat) in store.details"
            :key="cat"
            class="detail-item"
          >
            <span class="detail-name">{{ cat }}</span>
            <span class="detail-count">{{ nombre }}</span>
          </div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-header">
          <div>
            <p class="section-label">Total Tickets</p>
            <p class="section-total">{{ store.totalTickets }}</p>
          </div>
        </div>

        <div class="detail-list">
          <div
            v-for="tick in store.ticketDetail"
            :key="tick.status"
            class="detail-item"
          >
            <span class="detail-name">
              <span
                class="dot"
                :class="tick.status?.toLowerCase().replace(' ', '-')"
              ></span>
              {{ tick.status }}
            </span>
            <span class="detail-count">{{ tick.total }}</span>
          </div>
        </div>
      </div>

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

.cards-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

/* CARD */
.section-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  flex: 1;
  min-width: 260px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-icon {
  font-size: 2rem;
  background: #f4f6f8;
  padding: 10px;
  border-radius: 10px;
}

.section-label {
  font-size: 0.78rem;
  color: #999;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin: 0;
}

.section-total {
  font-size: 2rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 4px 0 0 0;
  line-height: 1;
}

/* DETAIL LIST */
.detail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.detail-name {
  font-size: 0.88rem;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-count {
  font-weight: 700;
  font-size: 0.95rem;
  color: #2c3e50;
  background: #e8ecef;
  padding: 2px 10px;
  border-radius: 12px;
}

/* DOTS STATUS TICKETS */
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot.new         { background: #3498db; }
.dot.in-progress { background: #f39c12; }
.dot.closed      { background: #2ecc71; }
</style>