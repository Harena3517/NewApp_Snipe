# Guide de Référence Vue 3 & JavaScript pour l'Évaluation

Ce document regroupe toutes les syntaxes, structures JavaScript et fonctions clés de Vue 3 (Composition API) et Pinia pour vous permettre de développer de manière autonome et de retrouver rapidement les informations nécessaires lors de l'évaluation pratique.

---

## 1. Structure de base d'un composant Vue 3 (`.vue`)

Dans Vue 3 avec `<script setup>`, le code JavaScript, le template HTML et les styles CSS sont regroupés dans un seul fichier.

```vue
<script setup>
// 1. Imports
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'

// 2. Initialisation des stores
const authStore = useAuthStore()

// 3. Variables réactives
const searchQuery = ref('')
const items = ref([])

// 4. Fonctions
const loadItems = async () => {
  try {
    // simulation ou appel api
    items.value = [{ id: 1, name: 'Clavier' }, { id: 2, name: 'Souris' }]
  } catch (err) {
    console.error(err)
  }
}

// 5. Hooks de cycle de vie
onMounted(() => {
  loadItems()
})
</script>

<template>
  <div class="page">
    <input v-model="searchQuery" placeholder="Rechercher..." />
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<style scoped>
.page { padding: 20px; }
</style>
```

---

## 2. Choix de la Valeur Initiale : `ref(null)` vs `ref('')` vs Autres

Il est crucial de bien initialiser vos `ref` pour éviter des erreurs `undefined` ou des comportements inattendus lors des liaisons avec le template.

### A. `ref(null)`
*   **Quand l'utiliser ?**
    1.  **Référence à un élément du DOM** (pour manipuler directement une balise HTML avec `ref="nomDuRef"`).
    2.  **Donnée complexe non encore chargée** (ex: le fichier sélectionné par l'utilisateur, un objet d'API qui n'est pas encore récupéré).
*   **Exemples :**
    ```javascript
    const fileInput = ref(null) // Référence vers <input ref="fileInput" type="file" />
    const selectedFile = ref(null) // Fichier chargé (File object ou null)
    const currentUser = ref(null) // Aucun utilisateur connecté au départ
    ```

### B. `ref('')` (Chaîne vide)
*   **Quand l'utiliser ?**
    1.  **Champs de texte de formulaire** liés à un input textuel ou un textarea via `v-model`.
    2.  **Filtres de recherche**.
*   **Exemples :**
    ```javascript
    const search = ref('') // Lié à <input type="text" v-model="search" />
    const email = ref('')
    const comment = ref('')
    ```

### C. Autres Initialisations Communes
*   `ref([])` (Tableau vide) : Toujours initialiser vos listes (ex: liste d'assets, liste de tickets) par un tableau vide pour pouvoir faire des `.push()`, `.filter()`, ou des boucles `v-for` immédiatement sans erreur.
*   `ref(0)` (Nombre) : Pour les compteurs, les index, ou les prix.
*   `ref(false)` ou `ref(true)` (Booléens) : Pour gérer l'affichage d'un chargement (`loading`), d'une modale ouverte, ou d'une checkbox.

---

## 3. Propriétés Calculées (`computed`)

Une propriété calculée (`computed`) permet de dériver une valeur de manière réactive. Elle met en cache le résultat et ne se recalcule que si ses dépendances changent.

### Exemple : Filtrage et Recherche Combinée
```javascript
import { ref, computed } from 'vue'

const items = ref([
  { id: 1, name: 'Poste Direction', status: 'deployed' },
  { id: 2, name: 'Serveur Web', status: 'deployed' },
  { id: 3, name: 'Imprimante', status: 'available' }
])
const searchQuery = ref('')
const filterStatus = ref('all') // 'all', 'deployed', 'available'

// Propriété calculée filtrant la liste automatiquement
const filteredItems = computed(() => {
  return items.value.filter(item => {
    // 1. Filtre par texte de recherche (insensible à la casse)
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase().trim())
    
    // 2. Filtre par statut sélectionné
    const matchesStatus = filterStatus.value === 'all' || item.status === filterStatus.value
    
    return matchesSearch && matchesStatus
  })
})
```

Dans le template, il suffit de boucler sur la propriété calculée (sans mettre `.value`) :
```html
<tr v-for="item in filteredItems" :key="item.id">
  <td>{{ item.name }}</td>
</tr>
```

---

## 4. cycle de vie : `onMounted()` et Chargement de Données (`load`)

Le hook `onMounted()` est exécuté après le rendu initial du composant. C'est le moment idéal pour charger des données de l'API.

### Structure type de Chargement avec `onMounted` et Gestion d'Erreur :
```javascript
import { ref, onMounted } from 'vue'
import axios from 'axios'

const items = ref([])
const loading = ref(false)
const errorMsg = ref('')

// Définition de la fonction de chargement autonome
const loadData = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const response = await axios.get('http://localhost:3000/api/items')
    items.value = response.data
  } catch (error) {
    errorMsg.value = "Impossible de charger les données : " + (error.response?.data?.message || error.message)
  } finally {
    loading.value = false
  }
}

// Appel systématique lors du montage du composant
onMounted(() => {
  loadData()
})
```

---

## 5. Méthodes JavaScript Indispensables pour les Tableaux et Chaînes

Ces fonctions natives sont essentielles pour le traitement, la validation, et le filtrage des formulaires ou des listes.

### A. Méthodes pour les Chaînes de Caractères (Strings)

#### 1. `.trim()`
Supprime les espaces blancs (espaces, tabulations, sauts de ligne) au début et à la fin d'une chaîne.
```javascript
const input = "   mon_texte_saisi   \n"
const clean = input.trim() 
console.log(clean) // "mon_texte_saisi"
```

#### 2. `.split(separateur)`
Divise une chaîne de caractères en un tableau de sous-chaînes en se basant sur un séparateur.
```javascript
const tags = "PC-001;SER002;LAP003"
const array = tags.split(";")
console.log(array) // ["PC-001", "SER002", "LAP003"]

// Récupérer la première ligne d'un texte multiline
const premierLigne = texte.split("\n")[0]
```

---

### B. Méthodes pour les Tableaux (Arrays)

#### 1. `.filter(callback)`
Crée un **nouveau tableau** contenant **tous** les éléments qui valident la condition du callback. S'il n'y a aucun résultat, retourne un tableau vide `[]`.
```javascript
const prices = [10, 50, 120, -5, 200]

// Filtrer les prix positifs
const positivePrices = prices.filter(p => p > 0)
console.log(positivePrices) // [10, 50, 120, 200]
```

#### 2. `.find(callback)`
Retourne le **premier élément** du tableau qui valide la condition du callback. Si aucun élément ne valide la condition, il retourne `undefined`.
```javascript
const users = [
  { email: 'jean@test.com', name: 'Jean' },
  { email: 'marie@test.com', name: 'Marie' }
]

// Trouver l'utilisateur qui a l'email 'marie@test.com'
const user = users.find(u => u.email === 'marie@test.com')
console.log(user) // { email: 'marie@test.com', name: 'Marie' }
```

#### 3. `.map(callback)`
Crée un **nouveau tableau** en appliquant une transformation à chaque élément du tableau d'origine.
```javascript
const items = [{ name: 'clavier', price: 10 }, { name: 'souris', price: 5 }]

// Créer une liste contenant uniquement les noms des éléments en majuscules
const uppercaseNames = items.map(item => item.name.toUpperCase())
console.log(uppercaseNames) // ["CLAVIER", "SOURIS"]
```

#### 4. `.some(callback)`
Retourne `true` si **au moins un** élément valide la condition. Sinon, retourne `false`.
```javascript
const errors = ['Tag manquant', 'Format date invalide']
const hasErrors = errors.length > 0 // ou errors.some(e => e !== '')
```

#### 5. `.every(callback)`
Retourne `true` si **tous** les éléments valident la condition.
```javascript
const rows = [
  { status: 'valid' },
  { status: 'valid' },
  { status: 'error' }
]
const allValid = rows.every(r => r.status === 'valid')
console.log(allValid) // false
```

---

## 6. Directives de Template & CSS Dynamique

| Directive | Syntaxe abrégée | Rôle | Exemple d'utilisation |
| :--- | :--- | :--- | :--- |
| `v-bind:class` | `:class` | Applique une classe conditionnellement | `:class="{ 'active-tab': activeTab === 'assets' }"` |
| `v-bind:disabled`| `:disabled`| Active/désactive un bouton | `:disabled="loading || items.length === 0"` |
| `v-on:click` | `@click` | Écoute un événement clic | `@click="validerFormulaire"` |
| `v-model` | - | Liaison bidirectionnelle sur input | `<input v-model="email" />` |

---

## 7. Gestion d'État Global avec Pinia (Store)

Définir un store pour centraliser l'état global et les appels API asynchrones.

### Définition du Store (`src/store/appStore.js`)
```javascript
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAppStore = defineStore('app', {
  state: () => ({
    loading: false,
    records: [],
    logs: []
  }),

  actions: {
    addLog(msg) {
      this.logs.push(msg)
    },
    
    async fetchRecords() {
      this.loading = true
      try {
        const res = await axios.get('http://localhost:3000/api/records')
        this.records = res.data
        this.addLog("Données rechargées avec succès.")
      } catch (err) {
        this.addLog("Erreur de chargement.")
        console.error(err)
      } finally {
        this.loading = false
      }
    }
  }
})
```

### Utilisation dans un composant Vue
```javascript
import { useAppStore } from '../store/appStore'

const store = useAppStore()

// Appel d'une action du store
const refresh = () => {
  store.fetchRecords()
}
```

---

## 8. Appels API avec Axios (GET et POST)

### A. Requête GET simple avec paramètres de recherche
```javascript
import axios from 'axios'

const searchApi = async (query) => {
  try {
    const response = await axios.get('http://localhost:3000/api/search', {
      params: { q: query } // Envoie ?q=votre_query
    })
    return response.data
  } catch (error) {
    console.error("Erreur GET", error.message)
  }
}
```

### B. Requête POST (Création d'un élément)
```javascript
const createRecord = async (newRecord) => {
  try {
    const response = await axios.post('http://localhost:3000/api/records', newRecord, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data // Retourne l'objet créé (souvent avec son nouvel ID)
  } catch (error) {
    console.error("Erreur de création", error.response?.data || error.message)
    throw error // Renvoie l'erreur pour la gérer dans le composant
  }
}
```
