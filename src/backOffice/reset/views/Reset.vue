<template>
  <div class="reset-page container-dark">
    <div class="header-section">
      <h1>Réinitialisation des données</h1>
      <span class="accent-line"></span>
    </div>

    <div class="warning-box card">
      <div class="warning-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <h3>Action Critique</h3>
      </div>
      <p>Supprime tous les assets, licences, accessoires, logs et les utilisateurs non-admin.</p>
      <p class="bold-warning">Le compte connecté et les admins sont conservés.</p>
      <p class="bold-warning">Cette opération est irréversible.</p>
    </div>

    <div v-if="steps.length > 0" class="steps-container card">
      <h2>Progression</h2>
      <div class="steps-list">
        <div v-for="step in steps" :key="step.label" class="step-item">
          <div class="step-status">
            <span v-if="step.status === 'ok'"    class="status-indicator status-ok">✅</span>
            <span v-else-if="step.status === 'error'" class="status-indicator status-error">❌</span>
            <span v-else                          class="status-indicator status-pending">⏳</span>
          </div>
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
        class="btn-reset"
        :disabled="loading"
        @click="confirmer"
      >
        {{ loading ? "Réinitialisation en cours..." : "Réinitialiser les données" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import api from "../../../services/api.js"
import { useResetStore } from "../store/resetStore.js"
import { storeToRefs } from "pinia"

const resetStore = useResetStore()

const { loading, result, steps } = storeToRefs(resetStore)

const confirmer = async () => {
  const ok = confirm(
    "Confirmer la réinitialisation ? Cette action est irréversible."
  )

  if (!ok) return

  try {

    const meRes = await api.get("/users/me")

    const currentUserId = meRes.data.id

    await resetStore.reset(currentUserId)

  } catch (error) {

    console.error(error)

  }
}
</script>

<style scoped>
.reset-page {
  --red: #f87171;
  --green: #4ade80;
  --border: rgba(255,255,255,0.1);
  --muted: #888;
  --mono: 'Courier New', monospace;
  
  padding: 40px 24px;
  background: #0f1117;
  min-height: 100vh;
  color: white;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.header-section h1 {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -1.5px;
  margin: 0;
}

.accent-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.warning-box {
  background: rgba(248, 113, 113, 0.05);
  border: 1px solid rgba(248, 113, 113, 0.2);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--red);
  margin-bottom: 12px;
}

.warning-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.warning-box p {
  color: #ccc;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 4px 0;
}

.bold-warning {
  font-weight: 700;
  color: var(--red) !important;
  margin-top: 12px !important;
}

.steps-container h2 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #fff;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 14px;
  background: #111;
  border: 1px solid var(--border);
  border-radius: 6px;
}

.status-indicator {
  font-size: 1rem;
  font-weight: 700;
  display: inline-block;
  min-width: 32px;
  text-align: center;
}

.step-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-label {
  font-size: 0.9rem;
  color: #fff;
}

.step-detail {
  font-family: var(--mono);
  font-size: 0.8rem;
  color: var(--muted);
  background: #222;
  padding: 1px 6px;
  border-radius: 4px;
}

.result-message {
  padding: 16px;
  border-radius: 8px;
  font-family: var(--mono);
  font-size: 0.9rem;
  margin-top: 25px;
  line-height: 1.5;
}

.result-message.msg-success {
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid var(--green);
  color: var(--green);
}

.result-message.msg-error {
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid var(--red);
  color: var(--red);
}

.actions-container {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}

.btn-reset {
  background: var(--red);
  color: #dad2d2;
  border: none;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover:not(:disabled) {
  background: #ef4444;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
}

.btn-reset:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0);    }
}
</style>