# Allea.md — Scenarios d'Évaluation Possibles

> Ce document décrit exactement **où coller ou modifier le code** pour chaque fonctionnalité aléatoire que le prof peut demander.
> Chaque scénario indique : le fichier à modifier, le code à ajouter, et où l'insérer.

---

## Légende des chemins de fichiers
```
SERVICE  (appel API HTTP)  → src/frontOffice/.../services/xxx.js   ou  src/backOffice/.../service/xxx.js
STORE    (état global)     → src/frontOffice/.../store/xxxStore.js  ou  src/backOffice/.../store/xxxStore.js
VIEW     (interface HTML)  → src/frontOffice/.../views/xxx.vue      ou  src/backOffice/.../views/xxx.vue
```

---

## SCENARIO 1 — Colorer les lignes d'un tableau selon statut / priorité / date

> **Fichiers concernés : VIEW uniquement**
> Le tableau est dans `assetView.vue` ou n'importe quel `<tr v-for="...">`.

### Étape 1 : Ajouter `:class` sur le `<tr>` dans le template
**Fichier :** `src/frontOffice/assets/views/assetView.vue`

Trouver cette ligne :
```html
<tr v-for="asset in assetsFiltres" :key="asset.id">
```
La remplacer par :
```html
<tr v-for="asset in assetsFiltres" :key="asset.id" :class="rowClass(asset)">
```

### Étape 2 : Ajouter la fonction `rowClass` dans le `<script setup>`
Coller cette fonction avant `</script>` :
```javascript
const rowClass = (asset) => {
  const status = asset.status?.name?.toLowerCase() || ''
  if (status === 'deployed') return 'row-deployed'
  if (status === 'ready to deploy') return 'row-ready'
  if (status === 'archived') return 'row-archived'
  return ''
}
```

> **Pour colorer par priorité (tableau Tickets) :**
```javascript
const rowClass = (ticket) => {
  const p = ticket.priority_name?.toLowerCase() || ''
  if (p === 'high') return 'row-high'
  if (p === 'medium') return 'row-medium'
  if (p === 'low') return 'row-low'
  return ''
}
```

> **Pour colorer par date dépassée :**
```javascript
const rowClass = (ticket) => {
  if (!ticket.date) return ''
  const today = new Date()
  const due = new Date(ticket.date)
  return due < today ? 'row-overdue' : ''
}
```

### Étape 3 : Ajouter les classes CSS dans `<style scoped>`
```css
.row-deployed  { background: #d6eaf8; }
.row-ready     { background: #d5f5e3; }
.row-archived  { background: #f2f3f4; color: #aaa; }
.row-high      { background: #fdebd0; }
.row-medium    { background: #fef9e7; }
.row-low       { background: #d5f5e3; }
.row-overdue   { background: #f8d7da; color: #721c24; font-weight: 600; }
```

---

## SCENARIO 2 — Boutons Checkin / Checkout dans la liste Assets

> **Fichiers concernés : SERVICE → STORE → VIEW**

### SERVICE (`src/frontOffice/assets/services/assetService.js`)
Ajouter ces deux fonctions dans l'objet `export default {}` :
```javascript
async checkout(assetId, assignedUser) {
  const response = await api.post(`/hardware/${assetId}/checkout`, {
    assigned_user: assignedUser,
    checkout_to_type: 'user'
  })
  return response.data
},
async checkin(assetId) {
  const response = await api.post(`/hardware/${assetId}/checkin`)
  return response.data
}
```

### STORE (`src/frontOffice/assets/store/assetStore.js`)
Ajouter ces actions dans `actions: {}` :
```javascript
async checkout(assetId, userId) {
  await hardwareService.checkout(assetId, userId)
  await this.loadAssets() // Recharge la liste après l'opération
},
async checkin(assetId) {
  await hardwareService.checkin(assetId)
  await this.loadAssets()
}
```

### VIEW (`src/frontOffice/assets/views/assetView.vue`)

**1) Ajouter les fonctions dans `<script setup>` :**
```javascript
const doCheckout = async (asset) => {
  const userId = prompt('ID utilisateur à qui assigner cet asset :')
  if (!userId) return
  try {
    await store.checkout(asset.id, userId)
    alert('Checkout effectué !')
  } catch(err) {
    alert('Erreur checkout : ' + err.message)
  }
}

const doCheckin = async (asset) => {
  if (!confirm(`Retirer ${asset.name} de son utilisateur ?`)) return
  try {
    await store.checkin(asset.id)
    alert('Checkin effectué !')
  } catch(err) {
    alert('Erreur checkin : ' + err.message)
  }
}
```

**2) Ajouter une colonne `<th>` dans le `<thead>` :**
```html
<th>Actions</th>
```

**3) Ajouter les boutons dans le `<td>` du `<tbody>` (dans le v-for) :**
```html
<td>
  <button class="btn-checkout" @click.stop="doCheckout(asset)">Checkout</button>
  <button class="btn-checkin"  @click.stop="doCheckin(asset)">Checkin</button>
</td>
```

**4) CSS à ajouter dans `<style scoped>` :**
```css
.btn-checkout {
  background: #2ecc71; color: white;
  border: none; padding: 4px 10px;
  border-radius: 4px; cursor: pointer;
  font-size: 0.78rem; margin-right: 4px;
}
.btn-checkin {
  background: #e74c3c; color: white;
  border: none; padding: 4px 10px;
  border-radius: 4px; cursor: pointer;
  font-size: 0.78rem;
}
```

---

## SCENARIO 3 — Interdire de rétrograder le statut d'un ticket (presentation.vue)

> **Logique : si le ticket est "closed", il ne peut pas revenir à "new".**
> **Fichier concerné : VIEW → `presentation.vue` uniquement (modification de `dropTicket`)**

### Où : dans `<script setup>` de `src/frontOffice/presentation/views/presentation.vue`

L'ordre de priorité des status est défini comme une liste. Modifier la fonction `dropTicket` :
```javascript
// Ordre des statuts (du plus petit au plus grand)
// Adapte les noms selon tes vrais noms de status dans la base
const STATUS_ORDER = ['vaovao', 'en cours', 'fermé']

const dropTicket = async (stat) => {
  if (!tickDrag.value) return
  if (tickDrag.value.status_id === stat.id) return

  // NOUVELLE PROTECTION : trouver le rang des deux statuts
  const currentStatus = store.status.find(s => s.id === tickDrag.value.status_id)
  const currentRank = STATUS_ORDER.indexOf(currentStatus?.name?.toLowerCase())
  const newRank = STATUS_ORDER.indexOf(stat.name?.toLowerCase())

  if (newRank < currentRank) {
    alert(`Impossible : un ticket "${currentStatus?.name}" ne peut pas revenir à "${stat.name}".`)
    tickDrag.value = null
    return
  }

  // Suite normale : prompts et changement de statut
  const nouveauTitre = prompt("Nouveau titre", tickDrag.value.titre)
  if (!nouveauTitre) return
  const nouvelleDescription = prompt("Nouvelle description", tickDrag.value.description)
  if (!nouvelleDescription) return
  const nouvelleDate = prompt("Date prévue (AAAA-MM-JJ)", tickDrag.value.date || "")
  if (!nouvelleDate) { alert("Veuillez saisir une date"); return }

  await store.changeStatus(tickDrag.value.id, stat.id, nouveauTitre, nouvelleDescription, nouvelleDate)
  tickDrag.value = null
}
```

> **Astuce :** Si les noms des status viennent de la base et peuvent changer, utiliser l'index de `store.status` directement :
```javascript
const currentRank = store.status.findIndex(s => s.id === tickDrag.value.status_id)
const newRank = store.status.findIndex(s => s.id === stat.id)
if (newRank < currentRank) {
  alert("Rétrogradation interdite !")
  tickDrag.value = null
  return
}
```
*(Cela suppose que `store.status` est déjà trié dans l'ordre voulu côté backend.)*

---

## SCENARIO 4 — Bouton "Traduire" les colonnes selon le setting (presentation.vue)

> Les labels traduits sont déjà dans `settingsStore.settings[].label` (ex: "Vaovao" pour "New").
> Il faut juste basculer un flag pour afficher soit le nom original, soit le label traduit.
> **Fichier concerné : VIEW → `presentation.vue`**

### Dans `<script setup>` de `presentation.vue` — ajouter :
```javascript
const traduit = ref(false) // false = noms originaux, true = labels malagasy
const toggleTrad = () => { traduit.value = !traduit.value }
```

### Dans le template, modifier l'affichage du titre de la colonne :
Remplacer :
```html
{{ getSetting(stat.id)?.label || stat.name }}
```
Par :
```html
{{ traduit ? (getSetting(stat.id)?.label || stat.name) : stat.name }}
```

### Ajouter le bouton dans le `<div class="kanban-header">` :
```html
<button @click="toggleTrad" class="btn-trad">
  {{ traduit ? 'Afficher original' : 'Traduire en Malagasy' }}
</button>
```

### CSS :
```css
.btn-trad {
  background: #8e44ad; color: white;
  border: none; padding: 8px 16px;
  border-radius: 6px; cursor: pointer;
  font-size: 0.88rem;
}
.btn-trad:hover { background: #7d3c98; }
```

---

## SCENARIO 5 — Bouton "Appliquer la couleur" depuis Setting (presentation.vue)

> La couleur des colonnes Kanban est déjà stockée dans `settingsStore.settings[].color`.
> Un bouton permet d'activer/désactiver la colorisation.
> **Fichier : VIEW → `presentation.vue`**

### Dans `<script setup>` de `presentation.vue` — ajouter :
```javascript
const colorise = ref(true) // true = couleurs actives par défaut
```

### Modifier le `:style` de la colonne Kanban :
Remplacer :
```html
:style="{ background: getSetting(stat.id)?.color || '#ecf0f1' }"
```
Par :
```html
:style="colorise ? { background: getSetting(stat.id)?.color || '#ecf0f1' } : {}"
```

### Ajouter le bouton dans le `<div class="kanban-header">` :
```html
<button @click="colorise = !colorise" class="btn-color">
  {{ colorise ? 'Retirer couleurs' : 'Appliquer couleurs' }}
</button>
```

### CSS :
```css
.btn-color {
  background: #e67e22; color: white;
  border: none; padding: 8px 16px;
  border-radius: 6px; cursor: pointer;
  font-size: 0.88rem;
}
```

---

## SCENARIO 6 — Nombre de tickets associés à chaque Asset (assetView.vue)

> **Fichiers : SERVICE → STORE → VIEW (assetView)**

### SERVICE (`src/frontOffice/assets/services/assetService.js`)
Ajouter :
```javascript
async getTickets() {
  const axios = (await import('axios')).default
  const ticketApi = axios.create({ baseURL: 'http://localhost:3099' })
  const response = await ticketApi.get('/tickets')
  return response.data
}
```

### STORE (`src/frontOffice/assets/store/assetStore.js`)
Ajouter dans `state` :
```javascript
tickets: []
```
Ajouter dans `actions` :
```javascript
async loadTickets() {
  this.tickets = await hardwareService.getTickets()
},
ticketCountForAsset(assetTag) {
  return this.tickets.filter(t => {
    try {
      const items = JSON.parse(t.items || '[]')
      return items.includes(assetTag)
    } catch { return false }
  }).length
}
```

### VIEW (`src/frontOffice/assets/views/assetView.vue`)

Dans `onMounted` — ajouter après `store.loadAssets()` :
```javascript
store.loadTickets()
```

Dans le `<thead>`, ajouter :
```html
<th>Tickets</th>
```

Dans le `<tbody>` (dans le `v-for`), ajouter une cellule :
```html
<td>
  <span class="badge-ticket">{{ store.ticketCountForAsset(asset.asset_tag) }}</span>
</td>
```

CSS :
```css
.badge-ticket {
  background: #8e44ad; color: white;
  padding: 2px 10px; border-radius: 12px;
  font-size: 0.78rem; font-weight: 700;
}
```

---

## SCENARIO 7 — Sélectionner et déplacer plusieurs tickets (presentation.vue)

> Au lieu de drag & drop d'un seul ticket, cocher plusieurs et les déplacer en lot.
> **Fichier : VIEW → `presentation.vue`**

### Dans `<script setup>` — ajouter :
```javascript
const selectedTickets = ref([]) // Liste des IDs cochés

const toggleSelect = (ticketId) => {
  const idx = selectedTickets.value.indexOf(ticketId)
  if (idx === -1) selectedTickets.value.push(ticketId)
  else selectedTickets.value.splice(idx, 1)
}

const moveSelectedTo = async (stat) => {
  if (selectedTickets.value.length === 0) {
    alert('Aucun ticket sélectionné.'); return
  }
  if (!confirm(`Déplacer ${selectedTickets.value.length} ticket(s) vers "${stat.name}" ?`)) return

  for (const ticketId of selectedTickets.value) {
    const ticket = store.ticks.find(t => t.id === ticketId)
    if (!ticket) continue
    await store.changeStatus(ticket.id, stat.id, ticket.titre, ticket.description, ticket.date || new Date().toISOString().split('T')[0])
  }
  selectedTickets.value = []
}
```

### Dans le template — dans chaque `.ticket-card`, ajouter une checkbox :
```html
<div
  v-for="tick in store.ticks.filter(t => t.status_id === stat.id)"
  :key="tick.id"
  class="ticket-card"
  draggable="true"
  @dragstart="startDrag(tick)"
  @click="voirDetail(tick)"
>
  <!-- CHECKBOX SELECTION -->
  <input
    type="checkbox"
    :value="tick.id"
    v-model="selectedTickets"
    @click.stop
    style="margin-bottom:6px;"
  />
  <div class="ticket-num">#{{ tick.num_ticket }}</div>
  <div class="ticket-titre">{{ tick.titre }}</div>
  <div class="ticket-priority" :class="tick.priority_name?.toLowerCase()">
    {{ tick.priority_name }}
  </div>
</div>
```

### Ajouter un bouton "Déplacer vers..." dans l'en-tête de chaque colonne :
```html
<button
  v-if="selectedTickets.length > 0"
  class="btn-move-here"
  @click="moveSelectedTo(stat)"
>
  Déplacer ici ({{ selectedTickets.length }})
</button>
```

### CSS :
```css
.btn-move-here {
  width: 100%; background: #2980b9; color: white;
  border: none; border-radius: 6px;
  padding: 6px 0; cursor: pointer;
  font-size: 0.82rem; margin-bottom: 8px;
}
```

---

## SCENARIO 8 — Bouton par colonne dans Settings.vue (modifier label et couleur séparément)

> Remplacer le bouton global "Enregistrer" par un bouton par colonne.
> **Fichier : VIEW → `settingsView.vue` + STORE → `settingsStore.js`**

### STORE (`src/backOffice/setting/store/settingsStore.js`)
Ajouter une action pour sauvegarder UN SEUL setting :
```javascript
async saveSingleSetting(setting) {
  const axios = (await import('axios')).default
  const ticketapi = axios.create({ baseURL: 'http://localhost:3099' })
  await ticketapi.put(`/settings/${setting.id}`, setting)
}
```

### VIEW (`src/backOffice/setting/views/settingsView.vue`)

Remplacer le template actuel par :
```html
<template>
  <h2>Paramètres Kanban</h2>

  <div v-for="setting in store.settings" :key="setting.id" class="setting-card">

    <h3>{{ setting.status_name }}</h3>

    <div>
      <label>Couleur</label>
      <input type="color" v-model="setting.color" />
    </div>

    <div>
      <label>Libellé Malagasy</label>
      <input v-model="setting.label" />
    </div>

    <!-- BOUTON PAR COLONNE -->
    <button class="btn-save-col" @click="saveSingle(setting)">
      Enregistrer cette colonne
    </button>

  </div>

  <button @click="enregistrer" class="btn-global">Tout enregistrer</button>
</template>
```

Et dans `<script setup>` ajouter :
```javascript
const saveSingle = async (setting) => {
  await store.saveSingleSetting(setting)
  alert(`"${setting.status_name}" sauvegardé !`)
}
```

CSS à ajouter :
```css
.btn-save-col {
  background: #2ecc71; color: white;
  border: none; padding: 7px 14px;
  border-radius: 6px; cursor: pointer;
  font-size: 0.85rem; margin-top: 10px;
}
.btn-global {
  background: #2c3e50; color: white;
  border: none; padding: 10px 24px;
  border-radius: 6px; cursor: pointer;
  font-size: 0.9rem; margin-top: 16px;
}
```

---

## SCENARIO 9 — Compteur de tickets par priorité + Détail par Asset (PC0001 : 3 tickets → 2 High, 1 Medium)

> **Partie A** : Badges globaux (total High/Medium/Low dans toute la liste des tickets).
> **Partie B** : Dans `assetView.vue`, afficher pour chaque asset combien de tickets il a et combien par priorité.
> **Fichiers : SERVICE + STORE + VIEW**

---

### PARTIE A — Badges globaux dans la liste des tickets (VIEW only)

**Fichier :** `src/frontOffice/presentation/views/presentation.vue` (ou `ticketFiche.vue`)

Dans `<script setup>`, ajouter :
```javascript
import { computed } from 'vue'

// countByPriority se calcule automatiquement depuis store.ticks
const countByPriority = computed(() => ({
  high:   store.ticks.filter(t => t.priority_name?.toLowerCase() === 'high').length,
  medium: store.ticks.filter(t => t.priority_name?.toLowerCase() === 'medium').length,
  low:    store.ticks.filter(t => t.priority_name?.toLowerCase() === 'low').length,
}))
```

Dans le template, **avant le tableau ou le board Kanban** :
```html
<div class="priority-summary">
  <span class="p-badge high">Haute : {{ countByPriority.high }}</span>
  <span class="p-badge medium">Moyenne : {{ countByPriority.medium }}</span>
  <span class="p-badge low">Basse : {{ countByPriority.low }}</span>
</div>
```

CSS :
```css
.priority-summary { display: flex; gap: 10px; margin-bottom: 16px; }
.p-badge { padding: 4px 14px; border-radius: 20px; font-weight: 700; font-size: 0.82rem; }
.p-badge.high   { background: #fdebd0; color: #e67e22; }
.p-badge.medium { background: #fef9e7; color: #d4ac0d; }
.p-badge.low    { background: #d5f5e3; color: #1e8449; }
```

---

### PARTIE B — Détail des tickets par Asset dans assetView.vue (SERVICE + STORE + VIEW)

> Résultat visible : une colonne "Tickets" dans le tableau des assets affichant :
> `PC-001 : 3 tickets — 2 Haute, 1 Basse`

#### ÉTAPE 1 — SERVICE
**Fichier :** `src/frontOffice/assets/services/assetService.js`

Ajouter à la fin de `export default {}` (avant le `}` final), **après la virgule de `getHardware`** :
```javascript
// Ajouter au début du fichier :
import axios from 'axios'
const ticketApi = axios.create({ baseURL: 'http://localhost:3099' })

// Ajouter dans export default {} :
async getTickets() {
  const response = await ticketApi.get('/tickets')
  return response.data
}
```

#### ÉTAPE 2 — STORE
**Fichier :** `src/frontOffice/assets/store/assetStore.js`

Ajouter `tickets: []` dans `state`, puis ajouter deux actions :
```javascript
// Dans state :
tickets: []

// Dans actions (ajouter après loadAssets) :
async loadTickets() {
  this.tickets = await hardwareService.getTickets()
},

// Fonction helper (pas async) — retourne { total, high, medium, low }
ticketSummaryForAsset(assetTag) {
  const linked = this.tickets.filter(t => {
    try { return JSON.parse(t.items || '[]').includes(assetTag) }
    catch { return false }
  })
  return {
    total:  linked.length,
    high:   linked.filter(t => t.priority_name?.toLowerCase() === 'high').length,
    medium: linked.filter(t => t.priority_name?.toLowerCase() === 'medium').length,
    low:    linked.filter(t => t.priority_name?.toLowerCase() === 'low').length,
  }
}
```

#### ÉTAPE 3 — VIEW
**Fichier :** `src/frontOffice/assets/views/assetView.vue`

**1) Dans `onMounted`, ajouter l'appel à `loadTickets` :**
```javascript
onMounted(() => {
  store.loadAssets()
  store.loadTickets()   // <-- ajouter cette ligne
})
```

**2) Dans `<thead>`, ajouter une colonne :**
```html
<th>Tickets</th>
```

**3) Dans le `<tbody>` (dans le `v-for`), ajouter la cellule suivante :**
```html
<td>
  <template v-if="store.ticketSummaryForAsset(asset.asset_tag).total > 0">
    <span class="badge-ticket-total">
      {{ store.ticketSummaryForAsset(asset.asset_tag).total }} ticket(s)
    </span>
    <div class="ticket-detail-row">
      <span v-if="store.ticketSummaryForAsset(asset.asset_tag).high > 0"   class="mini-badge high">{{ store.ticketSummaryForAsset(asset.asset_tag).high }} H</span>
      <span v-if="store.ticketSummaryForAsset(asset.asset_tag).medium > 0" class="mini-badge medium">{{ store.ticketSummaryForAsset(asset.asset_tag).medium }} M</span>
      <span v-if="store.ticketSummaryForAsset(asset.asset_tag).low > 0"    class="mini-badge low">{{ store.ticketSummaryForAsset(asset.asset_tag).low }} B</span>
    </div>
  </template>
  <span v-else class="muted-text">—</span>
</td>
```

**4) CSS à ajouter dans `<style scoped>` :**
```css
.badge-ticket-total {
  background: #8e44ad; color: white;
  padding: 2px 8px; border-radius: 12px;
  font-size: 0.75rem; font-weight: 700;
  display: inline-block; margin-bottom: 4px;
}
.ticket-detail-row { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 3px; }
.mini-badge {
  padding: 1px 7px; border-radius: 10px;
  font-size: 0.7rem; font-weight: 700;
}
.mini-badge.high   { background: #fdebd0; color: #e67e22; }
.mini-badge.medium { background: #fef9e7; color: #d4ac0d; }
.mini-badge.low    { background: #d5f5e3; color: #1e8449; }
.muted-text { color: #bbb; font-style: italic; font-size: 0.82rem; }
```

---

## SCENARIO 10 — Filtre rapide par statut (clic sur un badge = filtre le tableau)

> Un exemple générique applicable dans n'importe quelle view avec un tableau.
> **Fichier : VIEW uniquement**

### Dans `<script setup>` :
```javascript
import { ref, computed } from 'vue'

const filtreActif = ref('all')

const ticketsFiltres = computed(() => {
  if (filtreActif.value === 'all') return store.ticks
  return store.ticks.filter(t => t.status_name?.toLowerCase() === filtreActif.value)
})
```

### Dans le template :
```html
<div class="filter-tabs">
  <button :class="{ active: filtreActif === 'all' }" @click="filtreActif = 'all'">Tous</button>
  <button :class="{ active: filtreActif === 'new' }" @click="filtreActif = 'new'">Nouveau</button>
  <button :class="{ active: filtreActif === 'closed' }" @click="filtreActif = 'closed'">Fermé</button>
</div>

<tr v-for="ticket in ticketsFiltres" :key="ticket.id">
  ...
</tr>
```

### CSS :
```css
.filter-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.filter-tabs button {
  background: #f0f0f0; border: none; padding: 6px 14px;
  border-radius: 6px; cursor: pointer; font-size: 0.88rem;
}
.filter-tabs button.active {
  background: #2c3e50; color: white;
}
```

---

## SCENARIO 11 — Exporter la liste filtrée en CSV (téléchargement direct)

> Ajouter un bouton "Exporter CSV" sur n'importe quelle vue avec un tableau.
> **Fichier : VIEW uniquement — zéro dépendance**

### Dans `<script setup>` :
```javascript
const exporterCSV = () => {
  const headers = ['Asset Tag', 'Nom', 'Catégorie', 'Statut', 'Serial']
  const rows = assetsFiltres.value.map(a => [
    a.asset_tag,
    a.name,
    a.category?.name || '',
    a.status?.name || '',
    a.serial || ''
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'export_assets.csv'
  link.click()
  URL.revokeObjectURL(url)
}
```

### Dans le template :
```html
<button class="btn-export" @click="exporterCSV">Exporter CSV</button>
```

### CSS :
```css
.btn-export {
  background: #27ae60; color: white;
  border: none; padding: 8px 16px;
  border-radius: 6px; cursor: pointer;
}
```

---

## Récapitulatif — Quelle structure modifier pour quelle tâche

| Tâche | SERVICE | STORE | VIEW |
| :--- | :---: | :---: | :---: |
| Colorer lignes tableau | ✗ | ✗ | **✓** |
| Checkin / Checkout | **✓** | **✓** | **✓** |
| Interdire rétrogradation | ✗ | ✗ | **✓** |
| Bouton Traduire colonnes | ✗ | ✗ | **✓** |
| Bouton Coloriser Kanban | ✗ | ✗ | **✓** |
| Nb tickets par asset | **✓** | **✓** | **✓** |
| Déplacer plusieurs tickets | ✗ | ✗ | **✓** |
| Bouton par colonne Setting | ✗ | **✓** | **✓** |
| Compteur par priorité | ✗ | ✗ | **✓** |
| Filtre rapide par statut | ✗ | ✗ | **✓** |
| Exporter CSV | ✗ | ✗ | **✓** |
