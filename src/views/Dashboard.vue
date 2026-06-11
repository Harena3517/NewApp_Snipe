<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>🛠️ NewApp — Outil d'Importation Snipe-IT</h1>
    </header>

    <div class="container">
      <section class="card">
        <h2>📥 Étape 1 : Importer le fichier JSON</h2>
        <div class="file-upload">
          <input type="file" @change="chargerFichier" accept=".json" id="file" />
          <label for="file" class="btn-secondary">📁 Sélectionner le fichier</label>
          <span v-if="nomFichier" class="file-name">{{ nomFichier }}</span>
        </div>
        
        <button v-if="donneesChargees.length > 0" @click="traiterImportation" class="btn-success">
          🚀 Lancer l'importation locale & Snipe-IT
        </button>
      </section>

      <section class="card">
        <h2>📦 Étape 2 : Données synchronisées en local (SQLite)</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom / Prénom</th>
                <th>Identifiant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="lignesBaseDeDonnees.length === 0">
                <td colspan="4" class="text-center">Aucune donnée en base locale. Importez un fichier.</td>
              </tr>
              <tr v-for="ligne in lignesBaseDeDonnees" :key="ligne.id">
                <td>{{ ligne.id }}</td>
                <td>{{ ligne.nom }}</td>
                <td>{{ ligne.username }}</td>
                <td><span class="badge-success">OK — Sauvegardé</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api'; 

const nomFichier = ref('');
const donneesChargees = ref([]);
const lignesBaseDeDonnees = ref([]);

// Fonction pour lire le fichier JSON
const chargerFichier = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  nomFichier.value = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      donneesChargees.value = Array.isArray(json) ? json : [json];
    } catch (err) {
      alert("Le fichier JSON n'est pas valide.");
      donneesChargees.value = [];
    }
  };
  reader.readAsText(file);
};

// Fonction pour envoyer les données
const traiterImportation = async () => {
  alert("Fichier lu ! On va brancher le vrai SQLite juste après.");
  lignesBaseDeDonnees.value = donneesChargees.value.map((item, index) => ({
    id: index + 1,
    nom: `${item.first_name || ''} ${item.last_name || ''}`,
    username: item.username || item.identifiant
  }));
};

// Fonction de réinitialisation
const reinitialiserApplication = () => {
  if (confirm("Vider la base SQLite locale ?")) {
    lignesBaseDeDonnees.value = [];
    donneesChargees.value = [];
    nomFichier.value = '';
  }
};
</script>

<style scoped>
.dashboard-header { background-color: #1e293b; color: white; padding: 20px; text-align: center; }
.dashboard-header h1 { margin: 0; font-size: 1.6rem; }
.container { max-width: 900px; margin: 30px auto; padding: 0 20px; }
.card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 25px; font-family: sans-serif; }
.danger-zone { border: 2px dashed #dc3545; background: #fff5f5; }
h2 { margin-top: 0; color: #333; font-size: 1.4rem; }
.file-upload { margin: 20px 0; display: flex; align-items: center; gap: 15px; }
input[type="file"] { display: none; }
.btn-secondary { background: #6c757d; color: white; padding: 10px 15px; border-radius: 5px; cursor: pointer; }
.btn-success { background: #28a745; color: white; border: none; padding: 12px 20px; border-radius: 5px; cursor: pointer; font-size: 1rem; width: 100%; margin-top: 15px; }
.btn-danger { background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; }
.file-name { color: #555; font-style: italic; }
.table-container { overflow-x: auto; margin-top: 15px; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 12px; border-bottom: 1px solid #ddd; }
th { background: #f8f9fa; color: #555; }
.text-center { text-align: center; color: #777; }
.badge-success { background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; }
</style>