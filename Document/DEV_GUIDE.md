# DEV_GUIDE — Vue 3 / SnipeIT
## Manuel Technique de Développement — Référence Hors Ligne

> **Usage :** Document de référence pendant le développement et les évaluations.
> Stack : Vue 3 · Composition API · Pinia · Axios · Service / Store / View · CRUD

---

## TABLE DES MATIÈRES

1. [Architecture Complète](#1-architecture-complète)
2. [Workflow de Développement](#2-workflow-de-développement)
3. [Templates Service](#3-templates-service)
4. [Templates Store](#4-templates-store)
5. [Templates View](#5-templates-view)
6. [Fonctions Utilitaires](#6-fonctions-utilitaires)
7. [Cas d'Usage CRUD Complets](#7-cas-dusage-crud-complets)
8. [Fonctionnalités Avancées](#8-fonctionnalités-avancées)
9. [Dashboard & Statistiques](#9-dashboard--statistiques)
10. [Structure d'un Module Complet](#10-structure-dun-module-complet)
11. [Pièges Fréquents — 30 Erreurs](#11-pièges-fréquents--30-erreurs)

---

## 1. ARCHITECTURE COMPLÈTE

### 1.1 Vue d'ensemble des couches

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVIGATEUR                               │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   VIEW       │    │   STORE      │    │    SERVICE       │  │
│  │  (Vue 3 SFC) │◄──►│   (Pinia)   │◄──►│    (Axios)       │  │
│  │              │    │              │    │                  │  │
│  │ - Template   │    │ - state      │    │ - HTTP calls     │  │
│  │ - Script     │    │ - getters    │    │ - baseURL        │  │
│  │ - Style      │    │ - actions    │    │ - interceptors   │  │
│  └──────────────┘    └──────────────┘    └────────┬─────────┘  │
│                                                   │            │
└───────────────────────────────────────────────────┼────────────┘
                                                    │ HTTP
                                                    ▼
                                        ┌───────────────────────┐
                                        │     API REST          │
                                        │   (SnipeIT Backend)   │
                                        │                       │
                                        │  GET    /api/v1/...   │
                                        │  POST   /api/v1/...   │
                                        │  PUT    /api/v1/...   │
                                        │  PATCH  /api/v1/...   │
                                        │  DELETE /api/v1/...   │
                                        └───────────────────────┘
```

### 1.2 Cycle complet — Requête utilisateur

```
UTILISATEUR
    │
    │  (clic / saisie / soumission)
    ▼
┌──────────────────────────────────────┐
│  VIEW                                │
│  Ex: UserList.vue                    │
│  → appelle store.fetchUsers()        │
└──────────────┬───────────────────────┘
               │
               │  store.fetchUsers()
               ▼
┌──────────────────────────────────────┐
│  STORE (Pinia)                       │
│  Ex: useUserStore                    │
│  → loading = true                    │
│  → appelle userService.getAll()      │
└──────────────┬───────────────────────┘
               │
               │  userService.getAll()
               ▼
┌──────────────────────────────────────┐
│  SERVICE                             │
│  Ex: userService.js                  │
│  → axios.get('/api/v1/users')        │
└──────────────┬───────────────────────┘
               │
               │  HTTP GET /api/v1/users
               ▼
┌──────────────────────────────────────┐
│  API REST (SnipeIT)                  │
│  → Traite la requête                 │
│  → Retourne JSON                     │
└──────────────┬───────────────────────┘
               │
               │  { rows: [...], total: N }
               ▼
┌──────────────────────────────────────┐
│  SERVICE                             │
│  → Retourne data au Store            │
└──────────────┬───────────────────────┘
               │
               │  data reçue
               ▼
┌──────────────────────────────────────┐
│  STORE (Pinia)                       │
│  → users = data.rows                 │
│  → total = data.total                │
│  → loading = false                   │
└──────────────┬───────────────────────┘
               │
               │  réactivité Pinia
               ▼
┌──────────────────────────────────────┐
│  VIEW                                │
│  → Liste se met à jour               │
│  → Affiche les utilisateurs          │
└──────────────┬───────────────────────┘
               │
               │  DOM mis à jour
               ▼
         UTILISATEUR
         (voit la liste)
```

### 1.3 Structure des dossiers projet

```
src/
├── assets/
│   └── main.css
├── components/
│   ├── common/
│   │   ├── AppPagination.vue
│   │   ├── AppModal.vue
│   │   ├── AppAlert.vue
│   │   └── AppLoader.vue
│   └── dashboard/
│       ├── StatCard.vue
│       └── ChartBar.vue
├── services/
│   ├── api.js               ← instance Axios
│   ├── userService.js
│   ├── assetService.js
│   ├── categoryService.js
│   └── ...
├── stores/
│   ├── useUserStore.js
│   ├── useAssetStore.js
│   ├── useCategoryStore.js
│   └── ...
├── views/
│   ├── users/
│   │   ├── UserList.vue
│   │   ├── UserForm.vue
│   │   └── UserDetail.vue
│   ├── assets/
│   │   ├── AssetList.vue
│   │   ├── AssetForm.vue
│   │   └── AssetDetail.vue
│   └── dashboard/
│       └── DashboardView.vue
├── router/
│   └── index.js
├── utils/
│   └── helpers.js
└── main.js
```

### 1.4 Configuration Axios (api.js)

```javascript
// src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Intercepteur requête — ajout token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur réponse — gestion erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## 2. WORKFLOW DE DÉVELOPPEMENT

### 2.1 Étapes pour chaque nouvelle fonctionnalité

```
┌─────────────────────────────────────────────────────────┐
│         NOUVELLE FONCTIONNALITÉ — WORKFLOW               │
├──────┬──────────────────────────────────────────────────┤
│  1   │ Analyse du besoin                                │
│      │ → Quels données ? Quels endpoints ? Quels rôles?│
├──────┼──────────────────────────────────────────────────┤
│  2   │ Définition des données                           │
│      │ → Structure objet, champs requis, types         │
├──────┼──────────────────────────────────────────────────┤
│  3   │ Création du Service                              │
│      │ → Méthodes HTTP (get, post, put, delete...)     │
├──────┼──────────────────────────────────────────────────┤
│  4   │ Création du Store                                │
│      │ → state, getters, actions, loading, error       │
├──────┼──────────────────────────────────────────────────┤
│  5   │ Création de la View                              │
│      │ → Liste / Formulaire / Détail                   │
├──────┼──────────────────────────────────────────────────┤
│  6   │ Gestion des erreurs                              │
│      │ → try/catch, messages utilisateur               │
├──────┼──────────────────────────────────────────────────┤
│  7   │ Gestion du loading                               │
│      │ → spinner, boutons désactivés                   │
├──────┼──────────────────────────────────────────────────┤
│  8   │ Tests                                            │
│      │ → tester manuellement chaque cas                │
└──────┴──────────────────────────────────────────────────┘
```

### 2.2 Checklist réutilisable — Nouvelle fonctionnalité

```
CHECKLIST — MODULE [NOM]
═══════════════════════════════════════════════════════

SERVICE
  [ ] Fichier créé dans src/services/
  [ ] Instance api importée
  [ ] Méthode getAll() avec params pagination
  [ ] Méthode getById(id)
  [ ] Méthode create(data)
  [ ] Méthode update(id, data)
  [ ] Méthode delete(id)
  [ ] Méthode search(query) si besoin
  [ ] Gestion des erreurs retournées

STORE (Pinia)
  [ ] Fichier créé dans src/stores/
  [ ] defineStore avec id unique
  [ ] state : liste, item, loading, error, pagination
  [ ] getter : filteredItems, totalPages si besoin
  [ ] action fetchAll() — appelle service.getAll()
  [ ] action fetchById(id)
  [ ] action create(data)
  [ ] action update(id, data)
  [ ] action delete(id)
  [ ] loading = true avant appel / false après
  [ ] error = null avant appel / message si échec

VIEW LISTE
  [ ] Importation et utilisation du store
  [ ] onMounted → store.fetchAll()
  [ ] Affichage loader si store.loading
  [ ] Affichage erreur si store.error
  [ ] Tableau ou liste des éléments
  [ ] Bouton Nouveau / Éditer / Supprimer
  [ ] Pagination si nécessaire
  [ ] Recherche si nécessaire

VIEW FORMULAIRE
  [ ] Objet form réactif (ref ou reactive)
  [ ] Champs liés avec v-model
  [ ] Validation avant soumission
  [ ] Appel store.create() ou store.update()
  [ ] Redirection après succès
  [ ] Bouton Annuler fonctionnel

VIEW DÉTAIL
  [ ] onMounted → store.fetchById(route.params.id)
  [ ] Affichage de tous les champs
  [ ] Bouton Éditer → router.push('/edit/id')
  [ ] Bouton Supprimer avec confirmation

ERREURS & LOADING
  [ ] Chaque action a try/catch/finally
  [ ] loading false dans finally
  [ ] Message d'erreur visible à l'utilisateur
  [ ] Boutons désactivés pendant loading

ROUTER
  [ ] Route liste ajoutée
  [ ] Route formulaire create ajoutée
  [ ] Route formulaire edit ajoutée
  [ ] Route détail ajoutée
  [ ] Navigation breadcrumb si besoin
```

---

## 3. TEMPLATES SERVICE

### 3.1 Template Service complet

```javascript
// src/services/entityService.js
import api from './api'

const BASE_URL = '/entities'  // ← changer selon le module

const entityService = {

  // ─── GET ALL (avec pagination + filtres) ───────────────────────
  getAll(params = {}) {
    return api.get(BASE_URL, { params })
    // params ex: { limit: 10, offset: 0, sort: 'name', order: 'asc' }
  },

  // ─── GET BY ID ─────────────────────────────────────────────────
  getById(id) {
    return api.get(`${BASE_URL}/${id}`)
  },

  // ─── POST (créer) ──────────────────────────────────────────────
  create(data) {
    return api.post(BASE_URL, data)
  },

  // ─── PUT (remplacer entièrement) ───────────────────────────────
  replace(id, data) {
    return api.put(`${BASE_URL}/${id}`, data)
  },

  // ─── PATCH (mise à jour partielle) ─────────────────────────────
  update(id, data) {
    return api.patch(`${BASE_URL}/${id}`, data)
  },

  // ─── DELETE ────────────────────────────────────────────────────
  delete(id) {
    return api.delete(`${BASE_URL}/${id}`)
  },

  // ─── SEARCH ────────────────────────────────────────────────────
  search(query, params = {}) {
    return api.get(BASE_URL, {
      params: { search: query, ...params }
    })
  },

  // ─── FILTER (par critères multiples) ──────────────────────────
  filter(filters = {}) {
    return api.get(BASE_URL, { params: filters })
    // filters ex: { status: 'active', category_id: 3 }
  },

  // ─── PAGINATION ────────────────────────────────────────────────
  paginate(page = 1, perPage = 25, params = {}) {
    const offset = (page - 1) * perPage
    return api.get(BASE_URL, {
      params: { limit: perPage, offset, ...params }
    })
  },

  // ─── CHECKOUT / CHECKIN (SnipeIT) ─────────────────────────────
  checkout(id, data) {
    return api.post(`${BASE_URL}/${id}/checkout`, data)
  },

  checkin(id, data) {
    return api.post(`${BASE_URL}/${id}/checkin`, data)
  },

  // ─── RESTORE (soft delete) ────────────────────────────────────
  restore(id) {
    return api.post(`${BASE_URL}/${id}/restore`)
  },

  // ─── UPLOAD IMAGE ─────────────────────────────────────────────
  uploadImage(id, formData) {
    return api.post(`${BASE_URL}/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // ─── EXPORT ───────────────────────────────────────────────────
  export(params = {}) {
    return api.get(`${BASE_URL}/export`, {
      params,
      responseType: 'blob'
    })
  },
}

export default entityService
```

---

## 4. TEMPLATES STORE

### 4.1 Template Store complet (Pinia — Setup Store)

```javascript
// src/stores/useEntityStore.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import entityService from '@/services/entityService'

export const useEntityStore = defineStore('entity', () => {

  // ─── STATE ────────────────────────────────────────────────────
  const items       = ref([])
  const currentItem = ref(null)
  const loading     = ref(false)
  const error       = ref(null)

  // ─── PAGINATION ───────────────────────────────────────────────
  const pagination = ref({
    total:      0,
    perPage:    25,
    currentPage:1,
  })

  // ─── FILTRES ──────────────────────────────────────────────────
  const filters = ref({
    search:   '',
    status:   '',
    category: '',
    sortBy:   'name',
    sortDir:  'asc',
  })

  // ─── GETTERS ──────────────────────────────────────────────────
  const totalPages = computed(() =>
    Math.ceil(pagination.value.total / pagination.value.perPage)
  )

  const isEmpty = computed(() => !loading.value && items.value.length === 0)

  const activeItems = computed(() =>
    items.value.filter(i => i.status?.id === 1)
  )

  // ─── ACTIONS ──────────────────────────────────────────────────

  async function fetchAll(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const queryParams = {
        limit:  pagination.value.perPage,
        offset: (pagination.value.currentPage - 1) * pagination.value.perPage,
        sort:   filters.value.sortBy,
        order:  filters.value.sortDir,
        search: filters.value.search || undefined,
        ...params,
      }
      const res = await entityService.getAll(queryParams)
      items.value = res.data.rows ?? res.data
      pagination.value.total = res.data.total ?? items.value.length
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement'
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id) {
    loading.value = true
    error.value   = null
    try {
      const res = await entityService.getById(id)
      currentItem.value = res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Élément introuvable'
    } finally {
      loading.value = false
    }
  }

  async function create(data) {
    loading.value = true
    error.value   = null
    try {
      const res = await entityService.create(data)
      await fetchAll()
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la création'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update(id, data) {
    loading.value = true
    error.value   = null
    try {
      const res = await entityService.update(id, data)
      await fetchAll()
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    loading.value = true
    error.value   = null
    try {
      await entityService.delete(id)
      items.value = items.value.filter(i => i.id !== id)
      pagination.value.total--
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ─── PAGINATION ACTIONS ───────────────────────────────────────
  function goToPage(page) {
    pagination.value.currentPage = page
    fetchAll()
  }

  function setPerPage(n) {
    pagination.value.perPage    = n
    pagination.value.currentPage = 1
    fetchAll()
  }

  // ─── FILTER ACTIONS ───────────────────────────────────────────
  function applyFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.currentPage = 1
    fetchAll()
  }

  function resetFilters() {
    filters.value = { search: '', status: '', category: '', sortBy: 'name', sortDir: 'asc' }
    pagination.value.currentPage = 1
    fetchAll()
  }

  function clearError() {
    error.value = null
  }

  return {
    // state
    items, currentItem, loading, error, pagination, filters,
    // getters
    totalPages, isEmpty, activeItems,
    // actions
    fetchAll, fetchById, create, update, remove,
    goToPage, setPerPage, applyFilters, resetFilters, clearError,
  }
})
```

---

## 5. TEMPLATES VIEW

### 5.1 Template Vue Liste

```vue
<!-- src/views/entities/EntityList.vue -->
<template>
  <div class="entity-list">
    <div class="list-header">
      <h1>Entités</h1>
      <router-link to="/entities/create" class="btn btn-primary">
        + Nouveau
      </router-link>
    </div>

    <!-- Barre de recherche -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        @input="onSearch"
        type="text"
        placeholder="Rechercher..."
        class="form-control"
      />
    </div>

    <!-- État de chargement -->
    <div v-if="store.loading" class="text-center py-4">
      <span>Chargement...</span>
    </div>

    <!-- Erreur -->
    <div v-else-if="store.error" class="alert alert-danger">
      {{ store.error }}
      <button @click="store.clearError()">✕</button>
    </div>

    <!-- Liste vide -->
    <div v-else-if="store.isEmpty" class="empty-state">
      Aucun élément trouvé.
    </div>

    <!-- Tableau -->
    <table v-else class="table">
      <thead>
        <tr>
          <th @click="sort('id')"># ID</th>
          <th @click="sort('name')">Nom</th>
          <th @click="sort('status')">Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in store.items" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>
            <span :class="`badge badge-${item.status?.id === 1 ? 'success' : 'secondary'}`">
              {{ item.status?.name }}
            </span>
          </td>
          <td>
            <router-link :to="`/entities/${item.id}`" class="btn btn-sm btn-info">
              Voir
            </router-link>
            <router-link :to="`/entities/${item.id}/edit`" class="btn btn-sm btn-warning">
              Éditer
            </router-link>
            <button
              @click="confirmDelete(item)"
              class="btn btn-sm btn-danger"
              :disabled="store.loading"
            >
              Supprimer
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination-wrapper">
      <button
        v-for="page in store.totalPages"
        :key="page"
        @click="store.goToPage(page)"
        :class="['btn btn-sm', page === store.pagination.currentPage ? 'btn-primary' : 'btn-outline']"
      >
        {{ page }}
      </button>
    </div>

    <!-- Modal confirmation suppression -->
    <div v-if="itemToDelete" class="modal-overlay">
      <div class="modal">
        <p>Supprimer <strong>{{ itemToDelete.name }}</strong> ?</p>
        <button @click="doDelete" :disabled="store.loading" class="btn btn-danger">
          Confirmer
        </button>
        <button @click="itemToDelete = null" class="btn btn-secondary">
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEntityStore } from '@/stores/useEntityStore'
import { debounce } from '@/utils/helpers'

const store = useEntityStore()
const searchQuery = ref('')
const itemToDelete = ref(null)

onMounted(() => {
  store.fetchAll()
})

const onSearch = debounce(() => {
  store.applyFilters({ search: searchQuery.value })
}, 400)

function sort(field) {
  const dir = store.filters.sortBy === field && store.filters.sortDir === 'asc' ? 'desc' : 'asc'
  store.applyFilters({ sortBy: field, sortDir: dir })
}

function confirmDelete(item) {
  itemToDelete.value = item
}

async function doDelete() {
  await store.remove(itemToDelete.value.id)
  itemToDelete.value = null
}
</script>
```

### 5.2 Template Vue Formulaire (Création + Édition)

```vue
<!-- src/views/entities/EntityForm.vue -->
<template>
  <div class="entity-form">
    <h1>{{ isEditing ? 'Modifier' : 'Créer' }} une entité</h1>

    <div v-if="store.loading" class="text-center">Chargement...</div>
    <div v-if="store.error" class="alert alert-danger">{{ store.error }}</div>

    <form @submit.prevent="handleSubmit" novalidate>

      <div class="form-group">
        <label for="name">Nom *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.name }"
          required
        />
        <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
      </div>

      <div class="form-group">
        <label for="notes">Notes</label>
        <textarea
          id="notes"
          v-model="form.notes"
          class="form-control"
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="status">Statut</label>
        <select id="status" v-model="form.status_id" class="form-control">
          <option value="">-- Choisir --</option>
          <option value="1">Actif</option>
          <option value="2">Inactif</option>
        </select>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="store.loading"
        >
          {{ store.loading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
        <button type="button" @click="router.back()" class="btn btn-secondary">
          Annuler
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEntityStore } from '@/stores/useEntityStore'

const router = useRouter()
const route  = useRoute()
const store  = useEntityStore()

const isEditing = computed(() => !!route.params.id)

const form = reactive({
  name:      '',
  notes:     '',
  status_id: '',
})

const errors = reactive({
  name: '',
})

onMounted(async () => {
  if (isEditing.value) {
    await store.fetchById(route.params.id)
    if (store.currentItem) {
      form.name      = store.currentItem.name
      form.notes     = store.currentItem.notes || ''
      form.status_id = store.currentItem.status?.id || ''
    }
  }
})

function validate() {
  errors.name = ''
  let valid = true
  if (!form.name.trim()) {
    errors.name = 'Le nom est obligatoire'
    valid = false
  }
  return valid
}

async function handleSubmit() {
  if (!validate()) return
  try {
    if (isEditing.value) {
      await store.update(route.params.id, form)
    } else {
      await store.create(form)
    }
    router.push('/entities')
  } catch {
    // erreur déjà dans store.error
  }
}
</script>
```

### 5.3 Template Vue Détail

```vue
<!-- src/views/entities/EntityDetail.vue -->
<template>
  <div class="entity-detail">
    <div v-if="store.loading">Chargement...</div>
    <div v-else-if="store.error" class="alert alert-danger">{{ store.error }}</div>
    <template v-else-if="store.currentItem">
      <div class="detail-header">
        <h1>{{ store.currentItem.name }}</h1>
        <div class="actions">
          <router-link :to="`/entities/${store.currentItem.id}/edit`" class="btn btn-warning">
            Éditer
          </router-link>
          <button @click="confirmDelete" class="btn btn-danger">Supprimer</button>
          <router-link to="/entities" class="btn btn-secondary">Retour</router-link>
        </div>
      </div>

      <div class="detail-body">
        <dl class="detail-list">
          <dt>ID</dt>       <dd>{{ store.currentItem.id }}</dd>
          <dt>Nom</dt>      <dd>{{ store.currentItem.name }}</dd>
          <dt>Statut</dt>   <dd>{{ store.currentItem.status?.name }}</dd>
          <dt>Notes</dt>    <dd>{{ store.currentItem.notes || '—' }}</dd>
          <dt>Créé le</dt>  <dd>{{ formatDate(store.currentItem.created_at) }}</dd>
          <dt>Modifié le</dt><dd>{{ formatDate(store.currentItem.updated_at) }}</dd>
        </dl>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEntityStore } from '@/stores/useEntityStore'
import { formatDate } from '@/utils/helpers'

const route  = useRoute()
const router = useRouter()
const store  = useEntityStore()

onMounted(() => {
  store.fetchById(route.params.id)
})

async function confirmDelete() {
  if (confirm(`Supprimer ${store.currentItem.name} ?`)) {
    await store.remove(store.currentItem.id)
    router.push('/entities')
  }
}
</script>
```

### 5.4 Template Vue Tableau (données denses)

```vue
<template>
  <div class="data-table-wrapper">
    <!-- Contrôles -->
    <div class="table-controls">
      <select v-model="perPage" @change="store.setPerPage(perPage)">
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
      <input v-model="search" @input="onSearch" placeholder="Rechercher..." />
    </div>

    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            @click="col.sortable && sort(col.key)"
            :class="{ sortable: col.sortable }"
          >
            {{ col.label }}
            <span v-if="col.sortable">
              {{ sortField === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅' }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="store.loading">
          <td :colspan="columns.length" class="text-center">Chargement...</td>
        </tr>
        <tr v-else-if="store.isEmpty">
          <td :colspan="columns.length" class="text-center">Aucun résultat</td>
        </tr>
        <tr v-for="item in store.items" :key="item.id">
          <td v-for="col in columns" :key="col.key">
            <slot :name="`cell-${col.key}`" :item="item">
              {{ item[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pied de tableau -->
    <div class="table-footer">
      <span>{{ store.pagination.total }} résultats</span>
      <div class="pagination">
        <button @click="store.goToPage(store.pagination.currentPage - 1)"
                :disabled="store.pagination.currentPage === 1">‹</button>
        <span>Page {{ store.pagination.currentPage }} / {{ store.totalPages }}</span>
        <button @click="store.goToPage(store.pagination.currentPage + 1)"
                :disabled="store.pagination.currentPage === store.totalPages">›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { debounce } from '@/utils/helpers'

const props = defineProps({
  store:   { type: Object, required: true },
  columns: { type: Array,  required: true },
})

const perPage    = ref(25)
const search     = ref('')
const sortField  = ref('name')
const sortDir    = ref('asc')

const onSearch = debounce(() => {
  props.store.applyFilters({ search: search.value })
}, 400)

function sort(field) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDir.value   = 'asc'
  }
  props.store.applyFilters({ sortBy: sortField.value, sortDir: sortDir.value })
}
</script>
```

### 5.5 Template Vue Modal

```vue
<!-- Composant AppModal.vue -->
<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal-box" :style="{ maxWidth: width }">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button @click="$emit('update:modelValue', false)" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button @click="$emit('update:modelValue', false)" class="btn btn-secondary">
              Fermer
            </button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title:      { type: String,  default: '' },
  width:      { type: String,  default: '600px' },
})
defineEmits(['update:modelValue'])
</script>

<!-- Utilisation dans une View : -->
<!--
<AppModal v-model="showModal" title="Détail équipement">
  <p>Contenu du modal</p>
  <template #footer>
    <button @click="showModal = false">Fermer</button>
    <button @click="confirm">Confirmer</button>
  </template>
</AppModal>
-->
```

### 5.6 Template Dashboard avec Cards

```vue
<!-- src/views/dashboard/DashboardView.vue -->
<template>
  <div class="dashboard">
    <h1>Tableau de bord — SnipeIT</h1>

    <!-- Cards statistiques -->
    <div class="stats-grid">
      <StatCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :icon="stat.icon"
        :color="stat.color"
        :loading="dashboardStore.loading"
      />
    </div>

    <!-- Graphiques -->
    <div class="charts-row">
      <div class="chart-card">
        <h3>Équipements par catégorie</h3>
        <canvas ref="barChartRef"></canvas>
      </div>
      <div class="chart-card">
        <h3>Répartition des statuts</h3>
        <canvas ref="pieChartRef"></canvas>
      </div>
    </div>

    <!-- Activités récentes -->
    <div class="recent-activity">
      <h3>Activités récentes</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Date</th><th>Action</th><th>Élément</th><th>Utilisateur</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="act in dashboardStore.recentActivity" :key="act.id">
            <td>{{ formatDate(act.created_at) }}</td>
            <td><span :class="`badge badge-${act.action_type}`">{{ act.action_type }}</span></td>
            <td>{{ act.item?.name }}</td>
            <td>{{ act.user?.name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/useDashboardStore'
import StatCard from '@/components/dashboard/StatCard.vue'
import { formatDate } from '@/utils/helpers'

const dashboardStore = useDashboardStore()

const stats = computed(() => [
  { label: 'Total équipements', value: dashboardStore.summary.total,       icon: '📦', color: 'blue'   },
  { label: 'Disponibles',       value: dashboardStore.summary.available,    icon: '✅', color: 'green'  },
  { label: 'Attribués',         value: dashboardStore.summary.deployed,     icon: '👤', color: 'orange' },
  { label: 'En maintenance',    value: dashboardStore.summary.maintenance,  icon: '🔧', color: 'yellow' },
  { label: 'Perdus/Volés',      value: dashboardStore.summary.lost,         icon: '⚠️', color: 'red'   },
  { label: 'Archivés',          value: dashboardStore.summary.archived,     icon: '🗄️', color: 'gray'  },
])

onMounted(() => {
  dashboardStore.loadAll()
})
</script>
```

---

## 6. FONCTIONS UTILITAIRES

```javascript
// src/utils/helpers.js

// ─── FORMAT DATE ───────────────────────────────────────────────────
export function formatDate(dateStr, locale = 'fr-FR') {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(locale, {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  })
}

export function formatDateTime(dateStr, locale = 'fr-FR') {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString(locale)
}

// ─── FORMAT MONNAIE ────────────────────────────────────────────────
export function formatCurrency(amount, currency = 'EUR', locale = 'fr-FR') {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat(locale, {
    style:    'currency',
    currency: currency,
  }).format(amount)
}

// ─── DEBOUNCE ──────────────────────────────────────────────────────
export function debounce(fn, delay = 300) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// ─── RESET FORMULAIRE ─────────────────────────────────────────────
export function resetForm(formObj, defaults = {}) {
  Object.keys(formObj).forEach(key => {
    formObj[key] = defaults[key] !== undefined ? defaults[key] : ''
  })
}

// ─── VALIDATION FORMULAIRE ────────────────────────────────────────
export function validateForm(fields, rules) {
  const errors = {}
  for (const [field, ruleList] of Object.entries(rules)) {
    for (const rule of ruleList) {
      if (rule.required && !fields[field]) {
        errors[field] = `${field} est obligatoire`
        break
      }
      if (rule.minLength && fields[field]?.length < rule.minLength) {
        errors[field] = `Minimum ${rule.minLength} caractères`
        break
      }
      if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields[field])) {
        errors[field] = 'Email invalide'
        break
      }
    }
  }
  return { valid: Object.keys(errors).length === 0, errors }
}
// Utilisation :
// const { valid, errors } = validateForm(form, {
//   name:  [{ required: true }, { minLength: 2 }],
//   email: [{ required: true }, { email: true }],
// })

// ─── BUILD QUERY PARAMS ───────────────────────────────────────────
export function buildQueryParams(params = {}) {
  return Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
}

// ─── TRI TABLEAU ──────────────────────────────────────────────────
export function sortData(data, field, direction = 'asc') {
  return [...data].sort((a, b) => {
    const valA = a[field] ?? ''
    const valB = b[field] ?? ''
    const cmp  = String(valA).localeCompare(String(valB), undefined, { numeric: true })
    return direction === 'asc' ? cmp : -cmp
  })
}

// ─── FILTRE TABLEAU ────────────────────────────────────────────────
export function filterData(data, filters = {}) {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      const itemVal = String(item[key] ?? '').toLowerCase()
      return itemVal.includes(String(value).toLowerCase())
    })
  })
}

// ─── PAGINATION LOCALE ────────────────────────────────────────────
export function paginateData(data, page = 1, perPage = 25) {
  const start = (page - 1) * perPage
  return {
    rows:       data.slice(start, start + perPage),
    total:      data.length,
    totalPages: Math.ceil(data.length / perPage),
    page,
    perPage,
  }
}

// ─── POURCENTAGE ─────────────────────────────────────────────────
export function calculatePercentage(part, total, decimals = 1) {
  if (!total) return 0
  return parseFloat(((part / total) * 100).toFixed(decimals))
}

// ─── GROUP BY ────────────────────────────────────────────────────
export function groupBy(data, key) {
  return data.reduce((groups, item) => {
    const group = item[key] ?? 'Autre'
    if (!groups[group]) groups[group] = []
    groups[group].push(item)
    return groups
  }, {})
}
// Résultat: { 'Ordinateurs': [...], 'Téléphones': [...] }

// ─── SUM BY ──────────────────────────────────────────────────────
export function sumBy(data, key) {
  return data.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0)
}

// ─── COUNT BY STATUS ─────────────────────────────────────────────
export function countByStatus(data, statusKey = 'status') {
  return data.reduce((counts, item) => {
    const status = item[statusKey]?.name ?? item[statusKey] ?? 'Inconnu'
    counts[status] = (counts[status] || 0) + 1
    return counts
  }, {})
}

// ─── COUNT BY CATEGORY ───────────────────────────────────────────
export function countByCategory(data, categoryKey = 'category') {
  return data.reduce((counts, item) => {
    const cat = item[categoryKey]?.name ?? item[categoryKey] ?? 'Sans catégorie'
    counts[cat] = (counts[cat] || 0) + 1
    return counts
  }, {})
}
```

---

## 7. CAS D'USAGE CRUD COMPLETS

### 7.1 Utilisateurs (Users)

```javascript
// services/userService.js
import api from './api'
const userService = {
  getAll:    (p)     => api.get('/users', { params: p }),
  getById:   (id)    => api.get(`/users/${id}`),
  create:    (data)  => api.post('/users', data),
  update:    (id, d) => api.patch(`/users/${id}`, d),
  delete:    (id)    => api.delete(`/users/${id}`),
  search:    (q, p)  => api.get('/users', { params: { search: q, ...p } }),
  getAssets: (id)    => api.get(`/users/${id}/assets`),
}
export default userService
```

```javascript
// stores/useUserStore.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import userService from '@/services/userService'

export const useUserStore = defineStore('users', () => {
  const users       = ref([])
  const currentUser = ref(null)
  const loading     = ref(false)
  const error       = ref(null)
  const total       = ref(0)

  const activeUsers = computed(() => users.value.filter(u => u.activated))

  async function fetchAll(params = {}) {
    loading.value = true; error.value = null
    try {
      const res = await userService.getAll(params)
      users.value = res.data.rows
      total.value = res.data.total
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur chargement utilisateurs'
    } finally { loading.value = false }
  }

  async function fetchById(id) {
    loading.value = true; error.value = null
    try {
      const res = await userService.getById(id)
      currentUser.value = res.data
    } catch (e) {
      error.value = 'Utilisateur introuvable'
    } finally { loading.value = false }
  }

  async function create(data) {
    loading.value = true; error.value = null
    try {
      const res = await userService.create(data)
      await fetchAll()
      return res.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur création'
      throw e
    } finally { loading.value = false }
  }

  async function update(id, data) {
    loading.value = true; error.value = null
    try {
      const res = await userService.update(id, data)
      await fetchAll()
      return res.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur mise à jour'
      throw e
    } finally { loading.value = false }
  }

  async function remove(id) {
    loading.value = true; error.value = null
    try {
      await userService.delete(id)
      users.value = users.value.filter(u => u.id !== id)
      total.value--
    } catch (e) {
      error.value = 'Erreur suppression'
      throw e
    } finally { loading.value = false }
  }

  return { users, currentUser, loading, error, total, activeUsers,
           fetchAll, fetchById, create, update, remove }
})
```

---

### 7.2 Équipements / Assets (SnipeIT)

```javascript
// services/assetService.js
import api from './api'
const assetService = {
  getAll:    (p)     => api.get('/hardware', { params: p }),
  getById:   (id)    => api.get(`/hardware/${id}`),
  create:    (data)  => api.post('/hardware', data),
  update:    (id, d) => api.patch(`/hardware/${id}`, d),
  delete:    (id)    => api.delete(`/hardware/${id}`),
  checkout:  (id, d) => api.post(`/hardware/${id}/checkout`, d),
  checkin:   (id, d) => api.post(`/hardware/${id}/checkin`, d),
  restore:   (id)    => api.post(`/hardware/${id}/restore`),
  audit:     (id)    => api.post(`/hardware/audit`, { id }),
  search:    (q, p)  => api.get('/hardware', { params: { search: q, ...p } }),
  getByUser: (uid)   => api.get(`/users/${uid}/assets`),
  uploadFile:(id, f) => api.post(`/hardware/${id}/files`, f, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}
export default assetService
```

```javascript
// stores/useAssetStore.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import assetService from '@/services/assetService'

export const useAssetStore = defineStore('assets', () => {
  const assets      = ref([])
  const currentAsset = ref(null)
  const loading     = ref(false)
  const error       = ref(null)
  const total       = ref(0)
  const pagination  = ref({ currentPage: 1, perPage: 25 })
  const filters     = ref({ search: '', status_id: '', category_id: '' })

  const totalPages = computed(() =>
    Math.ceil(total.value / pagination.value.perPage)
  )
  const availableAssets = computed(() =>
    assets.value.filter(a => a.status_label === 'deployable')
  )
  const deployedAssets = computed(() =>
    assets.value.filter(a => a.assigned_to !== null)
  )

  async function fetchAll(params = {}) {
    loading.value = true; error.value = null
    try {
      const q = {
        limit:     pagination.value.perPage,
        offset:    (pagination.value.currentPage - 1) * pagination.value.perPage,
        search:    filters.value.search || undefined,
        status_id: filters.value.status_id || undefined,
        category_id: filters.value.category_id || undefined,
        ...params,
      }
      const res = await assetService.getAll(q)
      assets.value = res.data.rows
      total.value  = res.data.total
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur chargement équipements'
    } finally { loading.value = false }
  }

  async function fetchById(id) {
    loading.value = true; error.value = null
    try {
      const res = await assetService.getById(id)
      currentAsset.value = res.data
    } catch (e) {
      error.value = 'Équipement introuvable'
    } finally { loading.value = false }
  }

  async function checkout(id, userId, note = '') {
    loading.value = true; error.value = null
    try {
      await assetService.checkout(id, {
        assigned_user: userId,
        checkout_to_type: 'user',
        note,
      })
      await fetchById(id)
    } catch (e) {
      error.value = e.response?.data?.messages?.join(', ') || 'Erreur checkout'
      throw e
    } finally { loading.value = false }
  }

  async function checkin(id, note = '') {
    loading.value = true; error.value = null
    try {
      await assetService.checkin(id, { note })
      await fetchById(id)
    } catch (e) {
      error.value = 'Erreur checkin'
      throw e
    } finally { loading.value = false }
  }

  async function create(data) {
    loading.value = true; error.value = null
    try {
      const res = await assetService.create(data)
      await fetchAll()
      return res.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur création'
      throw e
    } finally { loading.value = false }
  }

  async function update(id, data) {
    loading.value = true; error.value = null
    try {
      const res = await assetService.update(id, data)
      await fetchAll()
      return res.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur mise à jour'
      throw e
    } finally { loading.value = false }
  }

  async function remove(id) {
    loading.value = true; error.value = null
    try {
      await assetService.delete(id)
      assets.value = assets.value.filter(a => a.id !== id)
      total.value--
    } catch (e) {
      error.value = 'Erreur suppression'
      throw e
    } finally { loading.value = false }
  }

  function goToPage(page) {
    pagination.value.currentPage = page
    fetchAll()
  }

  function applyFilters(f) {
    filters.value = { ...filters.value, ...f }
    pagination.value.currentPage = 1
    fetchAll()
  }

  return {
    assets, currentAsset, loading, error, total, pagination, filters,
    totalPages, availableAssets, deployedAssets,
    fetchAll, fetchById, create, update, remove,
    checkout, checkin, goToPage, applyFilters,
  }
})
```

---

### 7.3 Catégories

```javascript
// services/categoryService.js
import api from './api'
const categoryService = {
  getAll:  (p)     => api.get('/categories', { params: p }),
  getById: (id)    => api.get(`/categories/${id}`),
  create:  (data)  => api.post('/categories', data),
  update:  (id, d) => api.patch(`/categories/${id}`, d),
  delete:  (id)    => api.delete(`/categories/${id}`),
}
export default categoryService
```

### 7.4 Marques (Manufacturers)

```javascript
// services/manufacturerService.js
import api from './api'
const manufacturerService = {
  getAll:  (p)     => api.get('/manufacturers', { params: p }),
  getById: (id)    => api.get(`/manufacturers/${id}`),
  create:  (data)  => api.post('/manufacturers', data),
  update:  (id, d) => api.patch(`/manufacturers/${id}`, d),
  delete:  (id)    => api.delete(`/manufacturers/${id}`),
}
export default manufacturerService
```

### 7.5 Fournisseurs (Suppliers)

```javascript
// services/supplierService.js
import api from './api'
const supplierService = {
  getAll:  (p)     => api.get('/suppliers', { params: p }),
  getById: (id)    => api.get(`/suppliers/${id}`),
  create:  (data)  => api.post('/suppliers', data),
  update:  (id, d) => api.patch(`/suppliers/${id}`, d),
  delete:  (id)    => api.delete(`/suppliers/${id}`),
}
export default supplierService
```

### 7.6 Clients / Locations

```javascript
// services/locationService.js
import api from './api'
const locationService = {
  getAll:  (p)     => api.get('/locations', { params: p }),
  getById: (id)    => api.get(`/locations/${id}`),
  create:  (data)  => api.post('/locations', data),
  update:  (id, d) => api.patch(`/locations/${id}`, d),
  delete:  (id)    => api.delete(`/locations/${id}`),
  getAssets: (id)  => api.get(`/locations/${id}/assets`),
}
export default locationService
```

### 7.7 Commandes (Purchase Orders)

```javascript
// services/purchaseOrderService.js
import api from './api'
const purchaseOrderService = {
  getAll:   (p)     => api.get('/purchase-orders', { params: p }),
  getById:  (id)    => api.get(`/purchase-orders/${id}`),
  create:   (data)  => api.post('/purchase-orders', data),
  update:   (id, d) => api.patch(`/purchase-orders/${id}`, d),
  delete:   (id)    => api.delete(`/purchase-orders/${id}`),
  receive:  (id, d) => api.post(`/purchase-orders/${id}/receive`, d),
}
export default purchaseOrderService
```

### 7.8 Stocks / Consommables (Consumables)

```javascript
// services/consumableService.js
import api from './api'
const consumableService = {
  getAll:  (p)     => api.get('/consumables', { params: p }),
  getById: (id)    => api.get(`/consumables/${id}`),
  create:  (data)  => api.post('/consumables', data),
  update:  (id, d) => api.patch(`/consumables/${id}`, d),
  delete:  (id)    => api.delete(`/consumables/${id}`),
  checkout:(id, d) => api.post(`/consumables/${id}/checkout`, d),
  users:   (id)    => api.get(`/consumables/${id}/checkedout`),
}
export default consumableService
```

### 7.9 Mouvements de stock — Store complet

```javascript
// stores/useConsumableStore.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import consumableService from '@/services/consumableService'

export const useConsumableStore = defineStore('consumables', () => {
  const consumables   = ref([])
  const current       = ref(null)
  const loading       = ref(false)
  const error         = ref(null)
  const total         = ref(0)

  const lowStockItems = computed(() =>
    consumables.value.filter(c => c.qty < (c.min_qty || 5))
  )

  const stockAlerts = computed(() => lowStockItems.value.length)

  async function fetchAll(params = {}) {
    loading.value = true; error.value = null
    try {
      const res = await consumableService.getAll(params)
      consumables.value = res.data.rows
      total.value       = res.data.total
    } catch (e) {
      error.value = 'Erreur chargement stocks'
    } finally { loading.value = false }
  }

  async function checkout(id, userId, qty = 1, note = '') {
    loading.value = true; error.value = null
    try {
      await consumableService.checkout(id, {
        assigned_to: userId,
        quantity: qty,
        note,
      })
      // Mettre à jour localement
      const item = consumables.value.find(c => c.id === id)
      if (item) item.qty -= qty
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur sortie stock'
      throw e
    } finally { loading.value = false }
  }

  async function create(data) {
    loading.value = true; error.value = null
    try {
      const res = await consumableService.create(data)
      await fetchAll()
      return res.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur création'
      throw e
    } finally { loading.value = false }
  }

  async function update(id, data) {
    loading.value = true; error.value = null
    try {
      const res = await consumableService.update(id, data)
      await fetchAll()
      return res.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Erreur mise à jour'
      throw e
    } finally { loading.value = false }
  }

  async function remove(id) {
    loading.value = true; error.value = null
    try {
      await consumableService.delete(id)
      consumables.value = consumables.value.filter(c => c.id !== id)
    } catch (e) {
      error.value = 'Erreur suppression'
      throw e
    } finally { loading.value = false }
  }

  return {
    consumables, current, loading, error, total,
    lowStockItems, stockAlerts,
    fetchAll, checkout, create, update, remove,
  }
})
```

---

## 8. FONCTIONNALITÉS AVANCÉES

### 8.1 Recherche multicritère

```javascript
// Dans le Store
async function advancedSearch(criteria = {}) {
  loading.value = true
  error.value   = null
  try {
    const params = buildQueryParams({
      search:      criteria.text,
      status_id:   criteria.status,
      category_id: criteria.category,
      company_id:  criteria.company,
      location_id: criteria.location,
      date_from:   criteria.dateFrom,
      date_to:     criteria.dateTo,
    })
    const res = await assetService.getAll(params)
    items.value = res.data.rows
    total.value = res.data.total
  } catch (e) {
    error.value = 'Erreur de recherche'
  } finally { loading.value = false }
}
```

```vue
<!-- Vue Recherche multicritère -->
<template>
  <form @submit.prevent="search" class="search-form">
    <input v-model="criteria.text"     placeholder="Nom, tag, numéro série" />
    <select v-model="criteria.status"  >
      <option value="">Tous les statuts</option>
      <option value="1">Déployable</option>
      <option value="2">Déployé</option>
      <option value="3">Archivé</option>
    </select>
    <select v-model="criteria.category">
      <option value="">Toutes catégories</option>
      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
        {{ cat.name }}
      </option>
    </select>
    <input v-model="criteria.dateFrom" type="date" placeholder="Date début" />
    <input v-model="criteria.dateTo"   type="date" placeholder="Date fin" />
    <button type="submit">Rechercher</button>
    <button type="button" @click="resetSearch">Réinitialiser</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'
import { useAssetStore } from '@/stores/useAssetStore'

const store = useAssetStore()
const criteria = reactive({
  text: '', status: '', category: '', dateFrom: '', dateTo: '',
})

function search() {
  store.advancedSearch(criteria)
}

function resetSearch() {
  Object.keys(criteria).forEach(k => criteria[k] = '')
  store.fetchAll()
}
</script>
```

### 8.2 Pagination serveur

```javascript
// Gestion complète dans le Store
const pagination = ref({
  currentPage: 1,
  perPage:     25,
  total:       0,
  from:        0,
  to:          0,
})

const totalPages = computed(() =>
  Math.ceil(pagination.value.total / pagination.value.perPage)
)

async function fetchAll(params = {}) {
  const offset = (pagination.value.currentPage - 1) * pagination.value.perPage
  const res = await service.getAll({
    limit:  pagination.value.perPage,
    offset: offset,
    ...params,
  })
  items.value               = res.data.rows
  pagination.value.total    = res.data.total
  pagination.value.from     = offset + 1
  pagination.value.to       = Math.min(offset + pagination.value.perPage, res.data.total)
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  pagination.value.currentPage = page
  fetchAll()
}
```

### 8.3 Tri de colonnes

```vue
<template>
  <th
    v-for="col in columns"
    :key="col.key"
    @click="col.sortable && toggleSort(col.key)"
    :class="{ 'cursor-pointer': col.sortable }"
  >
    {{ col.label }}
    <span v-if="col.sortable && sortBy === col.key">
      {{ sortDir === 'asc' ? '▲' : '▼' }}
    </span>
  </th>
</template>

<script setup>
import { ref } from 'vue'
const sortBy  = ref('name')
const sortDir = ref('asc')

function toggleSort(field) {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value  = field
    sortDir.value = 'asc'
  }
  store.applyFilters({ sortBy: sortBy.value, sortDir: sortDir.value })
}
</script>
```

### 8.4 Export Excel

```javascript
// Dans le Service
export(params = {}) {
  return api.get('/hardware', {
    params: { ...params, format: 'csv' },
    responseType: 'blob',
  })
}

// Dans le Store ou la View
async function exportToExcel() {
  loading.value = true
  try {
    const res = await assetService.export(buildQueryParams(filters.value))
    const url  = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', `equipements-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    error.value = "Erreur lors de l'export"
  } finally { loading.value = false }
}
```

### 8.5 Soft Delete et Restauration

```javascript
// Service
softDelete: (id)  => api.delete(`/hardware/${id}`),       // soft delete SnipeIT
restore:    (id)  => api.post(`/hardware/${id}/restore`),  // restauration

// Store
async function softDelete(id) {
  loading.value = true
  try {
    await assetService.softDelete(id)
    // L'item reste dans la BD mais est marqué deleted_at
    items.value = items.value.filter(i => i.id !== id)
  } catch (e) {
    error.value = 'Erreur suppression'
    throw e
  } finally { loading.value = false }
}

async function restore(id) {
  loading.value = true
  try {
    await assetService.restore(id)
    await fetchAll()
  } catch (e) {
    error.value = 'Erreur restauration'
    throw e
  } finally { loading.value = false }
}
```

### 8.6 Upload Image / Fichier

```vue
<template>
  <div class="upload-zone">
    <input
      type="file"
      ref="fileInput"
      @change="handleFileChange"
      accept="image/*,.pdf"
      hidden
    />
    <button @click="$refs.fileInput.click()" :disabled="uploading">
      {{ uploading ? 'Envoi...' : 'Choisir un fichier' }}
    </button>
    <div v-if="previewUrl" class="preview">
      <img :src="previewUrl" alt="Aperçu" v-if="isImage" />
      <span v-else>📄 Fichier sélectionné</span>
    </div>
    <div v-if="uploadError" class="alert alert-danger">{{ uploadError }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import assetService from '@/services/assetService'

const props = defineProps({ assetId: { type: Number, required: true } })

const fileInput  = ref(null)
const previewUrl = ref(null)
const uploading  = ref(false)
const uploadError = ref(null)
const selectedFile = ref(null)

const isImage = computed(() => selectedFile.value?.type.startsWith('image/'))

function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return
  selectedFile.value = file
  if (file.type.startsWith('image/')) {
    previewUrl.value = URL.createObjectURL(file)
  }
  upload(file)
}

async function upload(file) {
  uploading.value  = true
  uploadError.value = null
  const formData   = new FormData()
  formData.append('image', file)
  try {
    await assetService.uploadFile(props.assetId, formData)
  } catch (e) {
    uploadError.value = "Erreur lors de l'upload"
  } finally { uploading.value = false }
}
</script>
```

### 8.7 Audit Log

```javascript
// services/activityService.js
import api from './api'
const activityService = {
  getAll:       (p)    => api.get('/reports/activity', { params: p }),
  getForAsset:  (id)   => api.get(`/hardware/${id}/history`),
  getForUser:   (id)   => api.get(`/users/${id}/history`),
}
export default activityService

// stores/useActivityStore.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import activityService from '@/services/activityService'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([])
  const loading    = ref(false)
  const error      = ref(null)

  async function fetchAll(params = {}) {
    loading.value = true; error.value = null
    try {
      const res = await activityService.getAll(params)
      activities.value = res.data.rows ?? res.data
    } catch (e) {
      error.value = 'Erreur chargement historique'
    } finally { loading.value = false }
  }

  async function fetchForAsset(id) {
    loading.value = true; error.value = null
    try {
      const res = await activityService.getForAsset(id)
      activities.value = res.data.rows ?? res.data
    } catch (e) {
      error.value = 'Erreur historique équipement'
    } finally { loading.value = false }
  }

  return { activities, loading, error, fetchAll, fetchForAsset }
})
```

### 8.8 Notifications

```javascript
// stores/useNotificationStore.js
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])

  function push(message, type = 'success', duration = 4000) {
    const id = Date.now()
    notifications.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
  }

  function remove(id) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  const success = (msg) => push(msg, 'success')
  const error   = (msg) => push(msg, 'error')
  const warning = (msg) => push(msg, 'warning')
  const info    = (msg) => push(msg, 'info')

  return { notifications, push, remove, success, error, warning, info }
})
```

```vue
<!-- AppNotifications.vue — à placer dans App.vue -->
<template>
  <div class="notifications-container">
    <TransitionGroup name="slide">
      <div
        v-for="n in notifStore.notifications"
        :key="n.id"
        :class="`notification notification-${n.type}`"
      >
        <span>{{ n.message }}</span>
        <button @click="notifStore.remove(n.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotificationStore } from '@/stores/useNotificationStore'
const notifStore = useNotificationStore()
</script>

<!-- Utilisation dans un Store : -->
<!--
import { useNotificationStore } from '@/stores/useNotificationStore'
const notifStore = useNotificationStore()

// Après create() réussi :
notifStore.success('Équipement créé avec succès !')
// Après erreur :
notifStore.error('Erreur lors de la création')
-->
```

### 8.9 Permissions et Rôles

```javascript
// stores/useAuthStore.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user        = ref(null)
  const token       = ref(localStorage.getItem('token') || null)
  const permissions = ref([])

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin    = computed(() => user.value?.permissions?.superuser === true)
  const isSuperAdmin = computed(() => user.value?.permissions?.admin === true)

  function can(permission) {
    if (isAdmin.value) return true
    return permissions.value.includes(permission)
  }

  async function login(credentials) {
    const res = await api.post('/oauth/personal-access-tokens', credentials)
    token.value = res.data.token
    localStorage.setItem('token', token.value)
    await fetchCurrentUser()
  }

  async function fetchCurrentUser() {
    const res = await api.get('/users/me')
    user.value        = res.data
    permissions.value = Object.keys(res.data.permissions || {})
      .filter(k => res.data.permissions[k])
  }

  function logout() {
    user.value  = null
    token.value = null
    localStorage.removeItem('token')
  }

  return { user, token, isLoggedIn, isAdmin, isSuperAdmin,
           can, login, logout, fetchCurrentUser }
})
```

```vue
<!-- Usage dans un template : -->
<template>
  <button v-if="authStore.can('assets.create')" @click="create">
    Nouveau
  </button>
  <button v-if="authStore.isAdmin" @click="deleteAll">
    Supprimer tout
  </button>
</template>
```

---

## 9. DASHBOARD & STATISTIQUES

### 9.1 Service Dashboard

```javascript
// services/dashboardService.js
import api from './api'

const dashboardService = {

  // Statistiques équipements
  getAssetStats() {
    return api.get('/reports/assets/summary')
    // Ou agréger manuellement :
    // return api.get('/hardware', { params: { limit: 1 } })
    //   → utiliser res.data.total pour le total
  },

  // Toutes catégories
  getCategoryStats() {
    return api.get('/categories', { params: { limit: 100 } })
  },

  // Stats utilisateurs
  getUserStats() {
    return api.get('/users', { params: { limit: 1 } })
  },

  // Activité récente
  getRecentActivity(limit = 20) {
    return api.get('/reports/activity', { params: { limit } })
  },

  // Assets par statut
  getAssetsByStatus(statusId) {
    return api.get('/hardware', {
      params: { status_id: statusId, limit: 1 }
    })
  },

  // Alertes stock
  getLowStockAlerts(minQty = 5) {
    return api.get('/consumables', {
      params: { limit: 100 }
    })
  },
}

export default dashboardService
```

### 9.2 Store Dashboard

```javascript
// stores/useDashboardStore.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import dashboardService from '@/services/dashboardService'

export const useDashboardStore = defineStore('dashboard', () => {
  const loading        = ref(false)
  const error          = ref(null)
  const recentActivity = ref([])

  const summary = ref({
    total:       0,
    available:   0,
    deployed:    0,
    maintenance: 0,
    lost:        0,
    archived:    0,
  })

  const categoryStats = ref([])
  const userStats     = ref({ total: 0, active: 0 })
  const stockStats    = ref({ lowStock: [], totalAlerts: 0 })

  // ─── FONCTIONS DE CALCUL ─────────────────────────────────────────

  function getAssetStats(assets) {
    return {
      total:       assets.length,
      available:   assets.filter(a => a.status_label === 'deployable').length,
      deployed:    assets.filter(a => a.assigned_to !== null).length,
      maintenance: assets.filter(a => a.status_label === 'Undeployable').length,
      lost:        assets.filter(a => a.status_label === 'lost/stolen').length,
      archived:    assets.filter(a => a.archived).length,
    }
  }

  function getCategoryStats(categories) {
    return categories.map(cat => ({
      id:    cat.id,
      name:  cat.name,
      count: cat.assets_count || 0,
      type:  cat.category_type,
    }))
  }

  function getUserStats(users) {
    return {
      total:  users.length,
      active: users.filter(u => u.activated).length,
      topUsers: [...users]
        .sort((a, b) => (b.assets_count || 0) - (a.assets_count || 0))
        .slice(0, 5),
    }
  }

  function getStockStats(consumables) {
    const lowStock = consumables.filter(c => c.qty < (c.min_qty || 5))
    return {
      lowStock,
      totalAlerts: lowStock.length,
      totalItems:  consumables.length,
      entries:     consumables.reduce((s, c) => s + (c.qty || 0), 0),
    }
  }

  function buildChartData(data, labelKey = 'name', valueKey = 'count') {
    return {
      labels:   data.map(d => d[labelKey]),
      datasets: [{
        data:            data.map(d => d[valueKey]),
        backgroundColor: [
          '#3B82F6','#10B981','#F59E0B','#EF4444',
          '#8B5CF6','#06B6D4','#F97316','#84CC16',
        ],
      }]
    }
  }

  function getDashboardSummary() {
    return {
      assets:       summary.value,
      categories:   categoryStats.value,
      users:        userStats.value,
      stock:        stockStats.value,
      recentActivity: recentActivity.value.slice(0, 10),
    }
  }

  // ─── CHARGEMENT ──────────────────────────────────────────────────

  async function loadAll() {
    loading.value = true
    error.value   = null
    try {
      const [catRes, actRes] = await Promise.all([
        dashboardService.getCategoryStats(),
        dashboardService.getRecentActivity(20),
      ])

      categoryStats.value   = getCategoryStats(catRes.data.rows || catRes.data)
      recentActivity.value  = actRes.data.rows || actRes.data

      // Stats par statut (appels séparés si l'API ne fournit pas de résumé)
      const [avail, deployed, maint, lost] = await Promise.all([
        dashboardService.getAssetsByStatus('RTD'),      // Ready to Deploy
        dashboardService.getAssetsByStatus('Deployed'),
        dashboardService.getAssetsByStatus('Undeployable'),
        dashboardService.getAssetsByStatus('Lost'),
      ])

      summary.value = {
        total:       (avail.data.total || 0) + (deployed.data.total || 0) +
                     (maint.data.total || 0) + (lost.data.total || 0),
        available:   avail.data.total    || 0,
        deployed:    deployed.data.total || 0,
        maintenance: maint.data.total    || 0,
        lost:        lost.data.total     || 0,
        archived:    0,
      }

    } catch (e) {
      error.value = 'Erreur chargement tableau de bord'
    } finally { loading.value = false }
  }

  const assetChartData = computed(() =>
    buildChartData([
      { name: 'Disponibles',  count: summary.value.available   },
      { name: 'Attribués',    count: summary.value.deployed    },
      { name: 'Maintenance',  count: summary.value.maintenance },
      { name: 'Perdus',       count: summary.value.lost        },
    ])
  )

  const categoryChartData = computed(() =>
    buildChartData(categoryStats.value)
  )

  return {
    loading, error, summary, categoryStats, userStats, stockStats,
    recentActivity, assetChartData, categoryChartData,
    loadAll, getDashboardSummary, buildChartData,
    getAssetStats, getCategoryStats, getUserStats, getStockStats,
  }
})
```

### 9.3 Composant StatCard

```vue
<!-- components/dashboard/StatCard.vue -->
<template>
  <div :class="`stat-card stat-card--${color}`">
    <div class="stat-icon">{{ icon }}</div>
    <div class="stat-body">
      <div class="stat-value">
        <span v-if="loading">—</span>
        <span v-else>{{ value }}</span>
      </div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label:   { type: String,  required: true },
  value:   { type: Number,  default: 0 },
  icon:    { type: String,  default: '📊' },
  color:   { type: String,  default: 'blue' },
  loading: { type: Boolean, default: false },
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  background: white;
}
.stat-card--blue   { border-left: 4px solid #3B82F6; }
.stat-card--green  { border-left: 4px solid #10B981; }
.stat-card--orange { border-left: 4px solid #F59E0B; }
.stat-card--red    { border-left: 4px solid #EF4444; }
.stat-card--yellow { border-left: 4px solid #F59E0B; }
.stat-card--gray   { border-left: 4px solid #6B7280; }
.stat-icon  { font-size: 2rem; }
.stat-value { font-size: 2rem; font-weight: 700; }
.stat-label { font-size: 0.875rem; color: #6B7280; }
</style>
```

---

## 10. STRUCTURE D'UN MODULE COMPLET

### Exemple : Module Équipements (Assets) — Fichiers à créer

```
src/
├── services/
│   └── assetService.js          ← (voir section 7.2)
│
├── stores/
│   └── useAssetStore.js         ← (voir section 7.2)
│
└── views/
    └── assets/
        ├── AssetList.vue        ← liste + recherche + pagination
        ├── AssetForm.vue        ← create + edit (même composant)
        └── AssetDetail.vue      ← affichage + checkout/checkin
```

### Router — Entrées à ajouter

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // Dashboard
  { path: '/',                   component: () => import('@/views/dashboard/DashboardView.vue') },

  // Assets
  { path: '/assets',             component: () => import('@/views/assets/AssetList.vue'),
    meta: { requiresAuth: true } },
  { path: '/assets/create',      component: () => import('@/views/assets/AssetForm.vue'),
    meta: { requiresAuth: true } },
  { path: '/assets/:id',         component: () => import('@/views/assets/AssetDetail.vue'),
    meta: { requiresAuth: true } },
  { path: '/assets/:id/edit',    component: () => import('@/views/assets/AssetForm.vue'),
    meta: { requiresAuth: true } },

  // Users
  { path: '/users',              component: () => import('@/views/users/UserList.vue') },
  { path: '/users/create',       component: () => import('@/views/users/UserForm.vue') },
  { path: '/users/:id',          component: () => import('@/views/users/UserDetail.vue') },
  { path: '/users/:id/edit',     component: () => import('@/views/users/UserForm.vue') },

  // Categories
  { path: '/categories',         component: () => import('@/views/categories/CategoryList.vue') },
  // ... etc
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard de navigation
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

### AssetDetail.vue — Vue complète avec Checkout/Checkin

```vue
<!-- views/assets/AssetDetail.vue -->
<template>
  <div class="asset-detail">
    <div v-if="store.loading" class="loader">Chargement...</div>
    <div v-else-if="store.error" class="alert alert-danger">{{ store.error }}</div>

    <template v-else-if="asset">
      <!-- En-tête -->
      <div class="detail-header">
        <div>
          <h1>{{ asset.name }}</h1>
          <span class="asset-tag">Tag: {{ asset.asset_tag }}</span>
          <span :class="`badge badge-${asset.status_label}`">
            {{ asset.status?.name }}
          </span>
        </div>
        <div class="actions">
          <router-link :to="`/assets/${asset.id}/edit`" class="btn btn-warning">
            Éditer
          </router-link>
          <button
            v-if="!asset.assigned_to"
            @click="showCheckoutModal = true"
            class="btn btn-success"
          >
            Attribuer
          </button>
          <button
            v-else
            @click="doCheckin"
            :disabled="store.loading"
            class="btn btn-info"
          >
            Récupérer
          </button>
          <button @click="confirmDelete" class="btn btn-danger">Supprimer</button>
        </div>
      </div>

      <!-- Détails -->
      <div class="detail-grid">
        <div class="detail-section">
          <h3>Informations</h3>
          <dl>
            <dt>Numéro de série</dt><dd>{{ asset.serial || '—' }}</dd>
            <dt>Modèle</dt>         <dd>{{ asset.model?.name || '—' }}</dd>
            <dt>Catégorie</dt>      <dd>{{ asset.category?.name || '—' }}</dd>
            <dt>Fabricant</dt>      <dd>{{ asset.manufacturer?.name || '—' }}</dd>
            <dt>Fournisseur</dt>    <dd>{{ asset.supplier?.name || '—' }}</dd>
            <dt>Localisation</dt>   <dd>{{ asset.location?.name || '—' }}</dd>
            <dt>Valeur achat</dt>   <dd>{{ formatCurrency(asset.purchase_cost) }}</dd>
            <dt>Date achat</dt>     <dd>{{ formatDate(asset.purchase_date?.date) }}</dd>
            <dt>Date garantie</dt>  <dd>{{ formatDate(asset.warranty_expires?.date) }}</dd>
            <dt>Notes</dt>          <dd>{{ asset.notes || '—' }}</dd>
          </dl>
        </div>

        <div class="detail-section">
          <h3>Attribution actuelle</h3>
          <template v-if="asset.assigned_to">
            <dl>
              <dt>Attribué à</dt>   <dd>{{ asset.assigned_to?.name }}</dd>
              <dt>Type</dt>         <dd>{{ asset.assigned_type }}</dd>
              <dt>Depuis le</dt>    <dd>{{ formatDate(asset.last_checkout?.date) }}</dd>
            </dl>
          </template>
          <p v-else class="text-muted">Non attribué</p>
        </div>
      </div>

      <!-- Historique -->
      <div class="history-section">
        <h3>Historique</h3>
        <table class="table table-sm">
          <thead>
            <tr><th>Date</th><th>Action</th><th>Utilisateur</th><th>Note</th></tr>
          </thead>
          <tbody>
            <tr v-for="entry in activityStore.activities" :key="entry.id">
              <td>{{ formatDate(entry.created_at) }}</td>
              <td>{{ entry.action_type }}</td>
              <td>{{ entry.user?.name }}</td>
              <td>{{ entry.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Modal Checkout -->
    <AppModal v-model="showCheckoutModal" title="Attribuer l'équipement">
      <div class="form-group">
        <label>Utilisateur *</label>
        <select v-model="checkoutForm.userId" class="form-control">
          <option value="">-- Choisir un utilisateur --</option>
          <option v-for="u in userStore.users" :key="u.id" :value="u.id">
            {{ u.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Note</label>
        <textarea v-model="checkoutForm.note" class="form-control" rows="2"></textarea>
      </div>
      <template #footer>
        <button
          @click="doCheckout"
          :disabled="!checkoutForm.userId || store.loading"
          class="btn btn-success"
        >
          Attribuer
        </button>
        <button @click="showCheckoutModal = false" class="btn btn-secondary">Annuler</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAssetStore }    from '@/stores/useAssetStore'
import { useUserStore }     from '@/stores/useUserStore'
import { useActivityStore } from '@/stores/useActivityStore'
import AppModal from '@/components/common/AppModal.vue'
import { formatDate, formatCurrency } from '@/utils/helpers'

const route         = useRoute()
const router        = useRouter()
const store         = useAssetStore()
const userStore     = useUserStore()
const activityStore = useActivityStore()

const showCheckoutModal = ref(false)
const checkoutForm = ref({ userId: '', note: '' })

const asset = computed(() => store.currentAsset)

onMounted(async () => {
  await store.fetchById(route.params.id)
  await activityStore.fetchForAsset(route.params.id)
  await userStore.fetchAll({ limit: 200 })
})

async function doCheckout() {
  await store.checkout(asset.value.id, checkoutForm.value.userId, checkoutForm.value.note)
  showCheckoutModal.value = false
  checkoutForm.value = { userId: '', note: '' }
}

async function doCheckin() {
  if (!confirm('Récupérer cet équipement ?')) return
  await store.checkin(asset.value.id)
}

async function confirmDelete() {
  if (!confirm(`Supprimer ${asset.value.name} ?`)) return
  await store.remove(asset.value.id)
  router.push('/assets')
}
</script>
```

---

## 11. PIÈGES FRÉQUENTS — 30 ERREURS

### Erreurs Service

---

**Erreur 1 — Oublier d'exporter le service**

```javascript
// ❌ INCORRECT
const userService = { getAll: () => api.get('/users') }
// Oublier : export default userService

// ✅ CORRECT
const userService = { getAll: () => api.get('/users') }
export default userService
```
Cause : fichier créé sans export. Conséquence : import silencieusement vide, undefined. Solution : toujours terminer par `export default`.

---

**Erreur 2 — Utiliser axios directement au lieu de l'instance api**

```javascript
// ❌ INCORRECT — perd les intercepteurs, le baseURL, le token
import axios from 'axios'
const res = await axios.get('http://localhost:8000/api/v1/users')

// ✅ CORRECT
import api from './api'
const res = await api.get('/users')
```
Cause : confusion entre axios et l'instance configurée. Conséquence : appels sans token, sans gestion d'erreur globale.

---

**Erreur 3 — Oublier les params dans getAll**

```javascript
// ❌ INCORRECT — la pagination ne fonctionne jamais
getAll() { return api.get('/users') }

// ✅ CORRECT
getAll(params = {}) { return api.get('/users', { params }) }
```
Cause : template copié sans la signature `params`. Conséquence : toujours page 1, tri impossible.

---

**Erreur 4 — Confondre PUT et PATCH**

```
PUT   → remplace entièrement l'objet (tous les champs requis)
PATCH → mise à jour partielle (seulement les champs envoyés)
SnipeIT utilise PATCH pour les mises à jour partielles.
```

```javascript
// ✅ Mise à jour partielle
update(id, data) { return api.patch(`/hardware/${id}`, data) }
```

---

**Erreur 5 — Ne pas gérer le responseType pour l'export**

```javascript
// ❌ — reçoit du texte binaire illisible
export(params) { return api.get('/export', { params }) }

// ✅
export(params) {
  return api.get('/export', { params, responseType: 'blob' })
}
```

---

### Erreurs Store

---

**Erreur 6 — Oublier `loading = false` dans le finally**

```javascript
// ❌ — si erreur, loading reste true pour toujours
async function fetchAll() {
  loading.value = true
  try {
    const res = await service.getAll()
    items.value = res.data.rows
  } catch (e) {
    error.value = 'Erreur'
  }
  // ← loading.value = false oublié ici si catch
}

// ✅ — finally garantit l'exécution
async function fetchAll() {
  loading.value = true
  try {
    const res = await service.getAll()
    items.value = res.data.rows
  } catch (e) {
    error.value = 'Erreur'
  } finally {
    loading.value = false  // ← TOUJOURS exécuté
  }
}
```

---

**Erreur 7 — Oublier de réinitialiser error avant chaque appel**

```javascript
// ❌ — l'ancienne erreur reste affichée même si la requête réussit
async function fetchAll() {
  loading.value = true
  // error.value pas réinitialisé !
  try { ... }
}

// ✅
async function fetchAll() {
  loading.value = true
  error.value   = null   // ← réinitialiser toujours
  try { ... }
}
```

---

**Erreur 8 — Ne pas `throw` l'erreur dans les actions create/update**

```javascript
// ❌ — la View ne peut pas savoir si ça a échoué
async function create(data) {
  try {
    const res = await service.create(data)
    return res.data
  } catch (e) {
    error.value = 'Erreur'
    // oublier throw e → la View reçoit undefined, pense que c'est OK
  }
}

// ✅
async function create(data) {
  try {
    const res = await service.create(data)
    return res.data
  } catch (e) {
    error.value = 'Erreur'
    throw e   // ← permet à la View de gérer avec son propre try/catch
  }
}
```

---

**Erreur 9 — Modifier directement le state sans passer par une action**

```javascript
// ❌ — dans une View, ne JAMAIS faire :
const store = useUserStore()
store.users.push(newUser)   // BAD — contourne la logique du store

// ✅ — toujours passer par une action
await store.create(newUser)
```

---

**Erreur 10 — defineStore avec id non-unique**

```javascript
// ❌ — deux stores avec le même id se partagent le même état
export const useUserStore = defineStore('entity', () => { ... })
export const useAssetStore = defineStore('entity', () => { ... })  // conflit !

// ✅ — id unique pour chaque store
export const useUserStore  = defineStore('users',  () => { ... })
export const useAssetStore = defineStore('assets', () => { ... })
```

---

**Erreur 11 — Ne pas utiliser computed pour les getters**

```javascript
// ❌ — fonction ordinaire, pas réactive
function totalPages() {
  return Math.ceil(total.value / perPage.value)
}

// ✅ — computed = mise à jour automatique
const totalPages = computed(() =>
  Math.ceil(total.value / perPage.value)
)
```

---

**Erreur 12 — Accéder à res.data sans vérifier la structure**

```javascript
// ❌ — SnipeIT retourne { rows: [...], total: N }
items.value = res.data  // undefined ou objet incorrect

// ✅
items.value = res.data.rows
total.value = res.data.total
```

---

### Erreurs View

---

**Erreur 13 — Oublier onMounted pour charger les données**

```javascript
// ❌ — la liste reste vide au chargement
const store = useEntityStore()
// Les données ne sont jamais chargées

// ✅
onMounted(() => {
  store.fetchAll()
})
```

---

**Erreur 14 — Utiliser v-if et v-for sur le même élément**

```html
<!-- ❌ — Vue 3 interdit v-if et v-for sur le même élément -->
<tr v-for="item in store.items" v-if="item.active" :key="item.id">

<!-- ✅ — utiliser un template wrapper -->
<template v-for="item in store.items" :key="item.id">
  <tr v-if="item.active">...</tr>
</template>
```

---

**Erreur 15 — Oublier :key dans v-for**

```html
<!-- ❌ — Vue ne peut pas différencier les éléments, rendu bugué -->
<tr v-for="item in store.items">

<!-- ✅ — toujours un :key unique -->
<tr v-for="item in store.items" :key="item.id">
```

---

**Erreur 16 — Utiliser v-model sur une prop**

```javascript
// ❌ — les props sont en lecture seule
props: ['modelValue']
// <input v-model="modelValue" />  ← erreur Vue

// ✅ — passer par un computed avec get/set ou émettre update:
const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
```

---

**Erreur 17 — Ne pas désactiver les boutons pendant le loading**

```html
<!-- ❌ — l'utilisateur peut cliquer plusieurs fois -->
<button @click="store.create(form)">Enregistrer</button>

<!-- ✅ -->
<button @click="store.create(form)" :disabled="store.loading">
  {{ store.loading ? 'Enregistrement...' : 'Enregistrer' }}
</button>
```

---

**Erreur 18 — Naviguer avant que l'action soit terminée**

```javascript
// ❌ — navigation avant la fin de create
store.create(form)
router.push('/entities')  // arrive avant la réponse API

// ✅
await store.create(form)
router.push('/entities')
```

---

**Erreur 19 — Ne pas gérer le cas null de currentItem dans le formulaire**

```javascript
// ❌ — si currentItem est null, accès à .name plante
form.name = store.currentItem.name

// ✅
if (store.currentItem) {
  form.name = store.currentItem.name
}
```

---

**Erreur 20 — Confondre reactive et ref**

```javascript
// ref() → pour valeurs primitives (string, number, boolean) + objets simples
const loading = ref(false)
const name    = ref('')

// reactive() → pour objets complexes (formulaires, etc.)
const form = reactive({ name: '', email: '', status: '' })

// ❌ — ne pas déstructurer un reactive (perd la réactivité)
const { name } = form  // BAD

// ✅
const formName = computed(() => form.name)
// ou accéder directement : form.name
```

---

**Erreur 21 — Oublier `.value` avec ref()**

```javascript
const count = ref(0)

// ❌
count = count + 1      // ne modifie pas le ref
if (count > 5) { ... } // compare l'objet ref, pas la valeur

// ✅
count.value++
if (count.value > 5) { ... }
```

---

**Erreur 22 — Ne pas réinitialiser le formulaire après soumission**

```javascript
// ❌ — après succès, le formulaire garde les anciennes valeurs
async function handleSubmit() {
  await store.create(form)
  router.push('/entities')
}

// ✅ — si on reste sur la page, réinitialiser
async function handleSubmit() {
  await store.create(form)
  resetForm(form, { name: '', notes: '', status_id: '' })
  // ou router.push si on redirige
}
```

---

**Erreur 23 — Chercher en base locale au lieu d'appeler l'API**

```javascript
// ❌ — filtre seulement les items déjà chargés (page 1)
const results = store.items.filter(i =>
  i.name.includes(query)
)

// ✅ — appelle l'API pour chercher dans TOUTE la base
store.applyFilters({ search: query })
```

---

### Erreurs Axios / API

---

**Erreur 24 — Ne pas lire la vraie structure d'erreur SnipeIT**

```javascript
// ❌ — message générique inutile
error.value = 'Erreur'

// ✅ — SnipeIT retourne souvent :
// { status: 'error', messages: { field: ['message'] } }
// ou { status: 'error', payload: null }
error.value = e.response?.data?.messages
  ? Object.values(e.response.data.messages).flat().join(', ')
  : e.response?.data?.message || 'Erreur inconnue'
```

---

**Erreur 25 — Envoyer du JSON pour l'upload de fichier**

```javascript
// ❌ — l'API reçoit du JSON au lieu de multipart
const data = { image: file }
api.post('/upload', data)

// ✅
const formData = new FormData()
formData.append('image', file)
api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

---

**Erreur 26 — Confondre offset et page dans la pagination**

```javascript
// SnipeIT utilise offset (pas page)
// page 1 = offset 0
// page 2 = offset 25 (si perPage = 25)
// page 3 = offset 50

// ❌
params: { page: currentPage, limit: perPage }

// ✅
params: {
  offset: (currentPage - 1) * perPage,
  limit:  perPage,
}
```

---

**Erreur 27 — Ne pas annuler les requêtes en double (double-click)**

```javascript
// ✅ — désactiver le bouton suffit dans la plupart des cas
:disabled="store.loading"

// Pour cas avancés — AbortController
const controller = new AbortController()
api.get('/users', { signal: controller.signal })
// Plus tard : controller.abort()
```

---

### Erreurs Pinia / Réactivité

---

**Erreur 28 — Utiliser le store hors de setup() sans pinia initialisé**

```javascript
// ❌ — appel au store avant que l'app soit montée
const store = useEntityStore()  // en dehors d'un composant ou d'une action

// ✅ — toujours dans setup() ou dans une action d'un autre store
// Dans composant :
const store = useEntityStore()  // OK dans <script setup>

// Dans un guard router :
router.beforeEach(() => {
  const store = useAuthStore()  // OK car appelé après createApp + pinia
})
```

---

**Erreur 29 — Oublier d'installer Pinia dans main.js**

```javascript
// ❌ — store ne fonctionne pas
import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)
app.mount('#app')

// ✅
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
const app = createApp(App)
app.use(createPinia())   // ← obligatoire
app.mount('#app')
```

---

**Erreur 30 — Ne pas retourner les éléments du store dans setup()**

```javascript
// ❌ — les composants n'ont accès à rien
export const useEntityStore = defineStore('entity', () => {
  const items   = ref([])
  const loading = ref(false)
  async function fetchAll() { ... }
  // Oublier return !
})

// ✅ — tout ce qui est utilisé à l'extérieur doit être retourné
export const useEntityStore = defineStore('entity', () => {
  const items   = ref([])
  const loading = ref(false)
  async function fetchAll() { ... }
  return { items, loading, fetchAll }  // ← obligatoire
})
```

---

## RÉSUMÉ RAPIDE — ANTI-PATTERNS À ÉVITER

```
╔══════════════════════════════════════════════════════════════════╗
║  ✗  Modifier state directement dans une View                    ║
║  ✗  Oublier finally { loading = false }                         ║
║  ✗  Oublier error = null avant chaque appel                     ║
║  ✗  Oublier throw err dans create/update                        ║
║  ✗  Utiliser axios au lieu de l'instance api                    ║
║  ✗  Utiliser axios.get('/api/v1/...') au lieu de api.get('/...')║
║  ✗  Lire res.data au lieu de res.data.rows                      ║
║  ✗  Utiliser page au lieu de offset pour SnipeIT               ║
║  ✗  v-if + v-for sur le même élément                            ║
║  ✗  v-for sans :key                                             ║
║  ✗  Naviguer avant await store.action()                         ║
║  ✗  defineStore avec id dupliqué                                ║
║  ✗  Oublier return {} dans defineStore setup                    ║
║  ✗  Oublier onMounted pour fetchAll()                           ║
║  ✗  Boutons sans :disabled="store.loading"                      ║
╚══════════════════════════════════════════════════════════════════╝
```

---

*DEV_GUIDE v1.0 — Vue 3 / SnipeIT — Référence hors ligne*
