<script setup>
import { onMounted, ref, computed } from "vue"
import { useHardwareStore } from "../store/assetStore"

const store = useHardwareStore()
const recherche = ref("")
const filtreCategorie = ref("")
const filtreModel = ref("")
const filtreStatus = ref("")
const filtreSerial = ref("")

const filtresActifs = ref({
  recherche: "",
  categorie: "",
  model: "",
  status: "",
  serial: ""
})

onMounted(() => {
  store.loadAssets()
})

const appliquerFiltres = () => {
  filtresActifs.value = {
    recherche: recherche.value,
    categorie: filtreCategorie.value,
    model: filtreModel.value,
    status: filtreStatus.value,
    serial: filtreSerial.value
  }
}

const reinitialiserFiltres = () => {
  recherche.value = ""
  filtreCategorie.value = ""
  filtreModel.value = ""
  filtreStatus.value = ""
  filtreSerial.value = ""
  appliquerFiltres()
}

const assetsFiltres = computed(() => {
  const mots = filtresActifs.value.recherche
    .toLowerCase().trim().split(" ").filter(Boolean)

  return store.assets.filter(asset => {

    if (mots.length > 0) {
      const texte = [
        asset.asset_tag,
        asset.name,
        asset.category?.name,
        asset.model?.name,
        asset.status?.name,
        asset.serial
      ].join(" ").toLowerCase()
      if (!mots.every(mot => texte.includes(mot))) return false
    }

    if (filtresActifs.value.categorie) {
      const cat = asset.category?.name?.toLowerCase() || ""
      if (!cat.includes(filtresActifs.value.categorie.toLowerCase())) return false
    }

    if (filtresActifs.value.model) {
      const model = asset.model?.name?.toLowerCase() || ""
      if (!model.includes(filtresActifs.value.model.toLowerCase())) return false
    }

    if (filtresActifs.value.status) {
      const status = asset.status?.name?.toLowerCase() || ""
      if (!status.includes(filtresActifs.value.status.toLowerCase())) return false
    }

    if (filtresActifs.value.serial) {
      const serial = asset.serial?.toLowerCase() || ""
      if (!serial.includes(filtresActifs.value.serial.toLowerCase())) return false
    }

    return true
  })
})
</script>

<template>
  <div class="page">

    <div class="page-header">
      <h2>Liste des matériels</h2>
      <span class="result-count">{{ assetsFiltres.length }} résultat(s)</span>
    </div>

    <!-- FILTRES -->
    <div class="filtres-card">
      <input v-model="recherche" placeholder="🔍 Recherche globale..." class="input-large" />

      <div class="filtres-row">
        <input v-model="filtreCategorie" placeholder="Catégorie" />
        <input v-model="filtreModel" placeholder="Modèle" />
        <input v-model="filtreStatus" placeholder="Status" />
        <input v-model="filtreSerial" placeholder="Serial" />
      </div>

      <div class="filtres-actions">
        <button class="btn-primary" @click="appliquerFiltres">🔍 Rechercher</button>
        <button class="btn-secondary" @click="reinitialiserFiltres">✕ Réinitialiser</button>
      </div>
    </div>

    <!-- TABLEAU -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Tag</th>
            <th>Nom</th>
            <th>Catégorie</th>
            <th>Modèle</th>
            <th>Status</th>
            <th>Serial</th>
            <th>Prix</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="asset in assetsFiltres" :key="asset.id">
            <td><span class="tag">{{ asset.asset_tag }}</span></td>
            <td>{{ asset.name }}</td>
            <td>{{ asset.category?.name }}</td>
            <td>{{ asset.model?.name }}</td>
            <td>
              <span class="badge-status" :class="asset.status?.name?.toLowerCase().replace(' ', '-')">
                {{ asset.status?.name }}
              </span>
            </td>
            <td class="serial">{{ asset.serial }}</td>
            <td>{{ asset.purchase_cost }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
.page {
  padding: 24px;
  background: #f4f6f8;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 1.4rem;
  color: #2c3e50;
  margin: 0;
}

.result-count {
  background: #3498db;
  color: white;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
}

/* FILTRES */
.filtres-card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-large {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.filtres-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filtres-row input {
  flex: 1;
  min-width: 140px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.filtres-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary:hover { background: #2980b9; }

.btn-secondary {
  background: #ecf0f1;
  color: #555;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-secondary:hover { background: #dfe6e9; }

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
  padding: 12px 16px;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}

tbody tr:hover { background: #f8f9fa; }

tbody td {
  padding: 12px 16px;
  font-size: 0.9rem;
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

.serial {
  font-family: monospace;
  font-size: 0.82rem;
  color: #888;
}

/* BADGES STATUS */
.badge-status {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
}

.badge-status.ready-to-deploy { background: #d5f5e3; color: #1e8449; }
.badge-status.deployed        { background: #d6eaf8; color: #1a5276; }
.badge-status.pending         { background: #fef9e7; color: #d4ac0d; }
.badge-status.archived        { background: #f2f3f4; color: #7f8c8d; }
</style>