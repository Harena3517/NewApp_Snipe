# 🟢 GUIDE COMPLET VUE.JS — APPRENDRE & CODER SEULE

> **Ce guide est ton seul outil.** Il couvre tout : apprendre Vue.js de zéro, comprendre les concepts, et coder le front d'une grande API (Bagisto, WooCommerce, etc.) sans aide extérieure.

---

## 📋 TABLE DES MATIÈRES

1. [Comment Vue.js fonctionne — La grande image](#1-comment-vuejs-fonctionne--la-grande-image)
2. [Structure d'un projet Vue.js](#2-structure-dun-projet-vuejs)
3. [Le fichier `.vue` — Anatomie complète](#3-le-fichier-vue--anatomie-complète)
4. [Les bases absolues — Syntaxes à maîtriser](#4-les-bases-absolues--syntaxes-à-maîtriser)
5. [Communiquer avec une API — Axios](#5-communiquer-avec-une-api--axios)
6. [Le Routeur — Naviguer entre les pages](#6-le-routeur--naviguer-entre-les-pages)
7. [Les 6 blocs de code types](#7-les-6-blocs-de-code-types)
8. [Recettes pour une grande API (Bagisto-style)](#8-recettes-pour-une-grande-api-bagisto-style)
9. [Erreurs fréquentes et solutions](#9-erreurs-fréquentes-et-solutions)
10. [Checklist avant de rendre ton projet](#10-checklist-avant-de-rendre-ton-projet)

---

## 1. Comment Vue.js fonctionne — La grande image

### Le principe fondamental
Vue.js est un **framework JavaScript** : il prend tes données et les affiche automatiquement dans le navigateur. Quand les données changent, l'écran se met à jour **tout seul** — tu n'as pas besoin de toucher au HTML manuellement.

```
Tes données (variables) ──► Vue.js ──► Ce que l'utilisateur voit
        ↑                                         |
        └─────────────────────────────────────────┘
              Quand l'utilisateur interagit
```

### Vue 3 avec `<script setup>` — La syntaxe moderne
Dans ce guide, on utilise toujours **`<script setup>`**. C'est la façon moderne et la plus courte d'écrire du Vue 3. Tout ce que tu déclares dans ce bloc est automatiquement disponible dans le `<template>`.

---

## 2. Structure d'un projet Vue.js

### Créer un projet depuis zéro
```bash
npm create vue@latest mon-projet
cd mon-projet
npm install
npm run dev        # Lance le serveur local sur http://localhost:5173
```

### Arborescence typique
```
mon-projet/
├── src/
│   ├── main.js              ← Point d'entrée de l'application
│   ├── App.vue              ← Composant racine (la coque de toute l'app)
│   ├── router/
│   │   └── index.js         ← Toutes tes routes (pages)
│   ├── views/               ← Tes pages complètes
│   │   ├── HomeView.vue
│   │   ├── LoginView.vue
│   │   └── ProductView.vue
│   └── components/          ← Tes petits blocs réutilisables
│       ├── NavBar.vue
│       └── ProductCard.vue
├── index.html
└── package.json
```

### `main.js` — Ce fichier ne change presque jamais
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

### `App.vue` — La coque principale
```html
<template>
  <!-- RouterView affiche la page correspondant à l'URL actuelle -->
  <RouterView />
</template>
```

---

## 3. Le fichier `.vue` — Anatomie complète

Chaque fichier `.vue` a 3 blocs distincts :

```html
<!-- BLOC 1 : La logique (JavaScript) -->
<script setup>
  // Ici : tes variables, tes fonctions, tes appels API
</script>

<!-- BLOC 2 : L'affichage (HTML enrichi) -->
<template>
  <!-- Ici : ce que l'utilisateur voit -->
  <!-- Tu peux utiliser tes variables directement avec {{ }} -->
</template>

<!-- BLOC 3 : Le style (CSS) — optionnel -->
<style scoped>
  /* "scoped" = ce CSS s'applique UNIQUEMENT à ce fichier */
</style>
```

> ⚠️ **Règle importante** : Le `<template>` doit avoir **un seul élément racine** (une `<div>` qui englobe tout), ou utiliser `<template>` vide comme racine.

---

## 4. Les bases absolues — Syntaxes à maîtriser

### 4.1 `ref()` — Rendre une variable réactive

```javascript
import { ref } from 'vue'

const nom = ref('Inconnu')      // Texte
const prix = ref(0)             // Nombre
const estConnecte = ref(false)  // Booléen
const produits = ref([])        // Tableau (liste vide au départ)
const utilisateur = ref(null)   // Objet (vide au départ)
```

**Règle d'or :**
- Dans `<script setup>` → tu dois écrire `.value` : `nom.value = 'Chantal'`
- Dans `<template>` → tu écris directement : `{{ nom }}`

```html
<script setup>
import { ref } from 'vue'
const compteur = ref(0)
const incrementer = () => { compteur.value++ }
</script>

<template>
  <p>Compteur : {{ compteur }}</p>
  <button @click="incrementer">+1</button>
</template>
```

---

### 4.2 `v-model` — Lier un formulaire à une variable

```html
<script setup>
import { ref } from 'vue'
const email = ref('')
const choixCategorie = ref('')
</script>

<template>
  <!-- Input texte -->
  <input v-model="email" type="email" placeholder="Votre email" />

  <!-- Select -->
  <select v-model="choixCategorie">
    <option value="vetements">Vêtements</option>
    <option value="electronique">Électronique</option>
  </select>

  <!-- Aperçu en temps réel -->
  <p>Tu as tapé : {{ email }}</p>
</template>
```

---

### 4.3 `@click` et `@submit.prevent` — Les événements

```html
<!-- Déclenche une fonction au clic -->
<button @click="maFonction">Cliquer ici</button>

<!-- Passer un argument -->
<button @click="ajouterAuPanier(produit)">Ajouter</button>

<!-- Sur un formulaire : bloque le rechargement de page -->
<form @submit.prevent="validerFormulaire">
  <button type="submit">Envoyer</button>
</form>
```

---

### 4.4 `v-for` — Les boucles

```html
<script setup>
import { ref } from 'vue'
const fruits = ref(['Pomme', 'Banane', 'Mangue'])
const produits = ref([
  { id: 1, name: 'Chaussures', price: 49.99 },
  { id: 2, name: 'T-shirt', price: 19.99 }
])
</script>

<template>
  <!-- Boucle simple sur un tableau de textes -->
  <ul>
    <li v-for="fruit in fruits" :key="fruit">{{ fruit }}</li>
  </ul>

  <!-- Boucle sur un tableau d'objets -->
  <div v-for="produit in produits" :key="produit.id">
    <h3>{{ produit.name }}</h3>
    <p>{{ produit.price }} €</p>
  </div>
</template>
```

> ⚠️ **Toujours mettre `:key`** avec une valeur unique (l'`id` de l'objet). Vue en a besoin pour fonctionner correctement.

---

### 4.5 `v-if`, `v-else-if`, `v-else` — Les conditions

```html
<script setup>
import { ref } from 'vue'
const chargement = ref(true)
const panier = ref([])
</script>

<template>
  <p v-if="chargement">⏳ Chargement en cours...</p>
  <p v-else-if="panier.length === 0">Votre panier est vide.</p>
  <div v-else>
    <p>Votre panier contient {{ panier.length }} article(s).</p>
  </div>
</template>
```

---

### 4.6 `:attribut` — Lier un attribut HTML à une variable

Le `:` est le raccourci de `v-bind`. Il rend n'importe quel attribut HTML dynamique.

```html
<!-- Désactiver un bouton pendant un envoi -->
<button :disabled="envoiEnCours">Valider</button>

<!-- Afficher une image dont l'URL vient de l'API -->
<img :src="produit.image_url" :alt="produit.name" />

<!-- Lier une classe CSS conditionnellement -->
<div :class="{ 'actif': estSelectionne, 'erreur': aUneErreur }">...</div>

<!-- Lien dynamique -->
<a :href="'/produit/' + produit.id">Voir le produit</a>
```

---

### 4.7 `computed` — Calculs automatiques

```javascript
import { ref, computed } from 'vue'

const panier = ref([
  { name: 'Chaussures', price: 49.99, quantite: 2 },
  { name: 'T-shirt', price: 19.99, quantite: 1 }
])

// Se recalcule automatiquement quand `panier` change
const totalPanier = computed(() => {
  return panier.value.reduce((somme, item) => {
    return somme + (item.price * item.quantite)
  }, 0)
})

const nombreArticles = computed(() => {
  return panier.value.reduce((total, item) => total + item.quantite, 0)
})
```

```html
<p>Total : {{ totalPanier.toFixed(2) }} €</p>
<p>{{ nombreArticles }} article(s) dans le panier</p>
```

---

### 4.8 `onMounted` — Exécuter du code au chargement de la page

```javascript
import { ref, onMounted } from 'vue'
import axios from 'axios'

const produits = ref([])

// Cette fonction sera appelée automatiquement quand la page s'affiche
onMounted(() => {
  chargerLesProduits()
})

const chargerLesProduits = async () => {
  const response = await axios.get('https://mon-api.com/products')
  produits.value = response.data
}
```

---

### 4.9 `watch` — Surveiller une variable

```javascript
import { ref, watch } from 'vue'

const panier = ref([])

// Exécute le code à chaque modification du panier
watch(panier, (nouvelleValeur) => {
  localStorage.setItem('panier', JSON.stringify(nouvelleValeur))
}, { deep: true }) // deep: true = surveille aussi les changements internes (quantités, etc.)
```

---

## 5. Communiquer avec une API — Axios

### Installation
```bash
npm install axios
```

### Les 4 types de requêtes

```javascript
import axios from 'axios'

// ─── LIRE des données (GET) ───
const response = await axios.get('https://api.com/products')
const response = await axios.get('https://api.com/products/42')        // Un seul produit
const response = await axios.get('https://api.com/products?page=2')    // Avec paramètre

// ─── CRÉER une donnée (POST) ───
const response = await axios.post('https://api.com/products', {
  name: 'Nouveau produit',
  price: 29.99
})

// ─── MODIFIER une donnée (PUT) ───
const response = await axios.put('https://api.com/products/42', {
  name: 'Nom modifié',
  price: 35.00
})

// ─── SUPPRIMER une donnée (DELETE) ───
await axios.delete('https://api.com/products/42')
```

### Envoyer un token d'authentification (Bearer Token)

```javascript
// Option 1 : Dans chaque requête
const token = localStorage.getItem('user_token')
const response = await axios.get('https://api.com/orders', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// Option 2 : Configurer une fois pour toutes (dans main.js ou un fichier api.js)
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
```

### Template complet avec gestion d'erreurs

```javascript
const donnees = ref([])
const enChargement = ref(true)
const messageErreur = ref('')

const chargerDonnees = async () => {
  enChargement.value = true
  messageErreur.value = ''
  
  try {
    const response = await axios.get('https://api.com/products')
    donnees.value = response.data
  } catch (error) {
    if (error.response) {
      // L'API a répondu avec une erreur (404, 500, etc.)
      messageErreur.value = `Erreur ${error.response.status} : ${error.response.data.message}`
    } else {
      // Problème de réseau
      messageErreur.value = "Impossible de contacter le serveur."
    }
  } finally {
    // S'exécute toujours, que ce soit succès ou erreur
    enChargement.value = false
  }
}
```

---

## 6. Le Routeur — Naviguer entre les pages

### Installation et configuration (`router/index.js`)

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProductView from '../views/ProductView.vue'
import AdminView from '../views/AdminView.vue'

const routes = [
  { path: '/',          component: HomeView },
  { path: '/login',     component: LoginView },
  { path: '/produit/:id', component: ProductView },  // :id = paramètre dynamique
  {
    path: '/admin',
    component: AdminView,
    meta: { requiresAuth: true }   // ← Cette page nécessite une connexion
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ─── GARDE DE NAVIGATION (sécurité) ───
router.beforeEach((to, from, next) => {
  const pageProtegee = to.matched.some(record => record.meta.requiresAuth)
  const token = localStorage.getItem('user_token')

  if (pageProtegee && !token) {
    next('/login')   // Pas connecté → redirection vers login
  } else {
    next()           // Autorisé
  }
})

export default router
```

### Naviguer dans les templates

```html
<!-- Lien statique -->
<RouterLink to="/">Accueil</RouterLink>
<RouterLink to="/login">Connexion</RouterLink>

<!-- Lien dynamique (avec variable) -->
<RouterLink :to="'/produit/' + produit.id">Voir le produit</RouterLink>

<!-- Active automatiquement une classe CSS quand c'est la page actuelle -->
<RouterLink to="/admin" active-class="menu-actif">Administration</RouterLink>
```

### Naviguer dans le script (JavaScript)

```javascript
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()   // Pour naviguer
const route = useRoute()     // Pour lire l'URL actuelle

// Aller vers une page
router.push('/accueil')
router.push('/produit/' + produit.id)

// Lire un paramètre d'URL (/produit/:id → id = 42)
const idDuProduit = route.params.id

// Lire un paramètre de requête (/recherche?q=chaussures)
const motCle = route.query.q
```

---

## 7. Les 6 blocs de code types

### 🔐 Bloc 1 — Connexion (LoginView.vue)

```html
<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const erreur = ref('')
const enCours = ref(false)

const executerConnexion = async () => {
  erreur.value = ''
  enCours.value = true
  
  try {
    const response = await axios.post('https://ton-api.com/api/login', {
      email: email.value,
      password: password.value
    })
    
    // Sauvegarder le token reçu de l'API
    localStorage.setItem('user_token', response.data.token)
    
    // Rediriger vers l'espace admin ou la page d'accueil
    router.push('/admin')
  } catch (err) {
    erreur.value = "Email ou mot de passe incorrect."
  } finally {
    enCours.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <h2>Connexion</h2>
    
    <p v-if="erreur" style="color: red;">{{ erreur }}</p>
    
    <form @submit.prevent="executerConnexion">
      <input v-model="email"    type="email"    placeholder="Email"       required />
      <input v-model="password" type="password" placeholder="Mot de passe" required />
      <button type="submit" :disabled="enCours">
        {{ enCours ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>
  </div>
</template>
```

---

### 🏷️ Bloc 2 — Liste de produits (ProductListView.vue)

```html
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const produits = ref([])
const enChargement = ref(true)
const erreur = ref('')

const chargerProduits = async () => {
  try {
    const response = await axios.get('https://ton-api.com/api/products')
    // Adapter selon la structure de ta réponse API :
    // response.data           si c'est un tableau direct
    // response.data.data      si l'API enveloppe dans { data: [...] }
    // response.data.products  si l'API enveloppe dans { products: [...] }
    produits.value = response.data.data || response.data
  } catch (error) {
    erreur.value = "Impossible de charger les produits."
  } finally {
    enChargement.value = false
  }
}

onMounted(chargerProduits)
</script>

<template>
  <div>
    <h1>Nos Produits</h1>
    
    <p v-if="enChargement">⏳ Chargement...</p>
    <p v-else-if="erreur" style="color:red">{{ erreur }}</p>
    <p v-else-if="produits.length === 0">Aucun produit disponible.</p>
    
    <div class="grille-produits" v-else>
      <div v-for="produit in produits" :key="produit.id" class="carte-produit">
        <img :src="produit.images?.[0]?.url || produit.image_url" :alt="produit.name" />
        <h3>{{ produit.name }}</h3>
        <p>{{ produit.price }} €</p>
        <RouterLink :to="'/produit/' + produit.id">Voir la fiche</RouterLink>
      </div>
    </div>
  </div>
</template>
```

---

### 🛒 Bloc 3 — Gestion du panier

```javascript
// fichier: src/composables/usePanier.js
// (Un "composable" = une fonction réutilisable qui contient de la logique Vue)

import { ref, computed, watch } from 'vue'

const panier = ref([])

// Charger le panier sauvegardé au démarrage
const donneesSauvegardees = localStorage.getItem('mon_panier')
if (donneesSauvegardees) {
  panier.value = JSON.parse(donneesSauvegardees)
}

// Sauvegarder automatiquement à chaque changement
watch(panier, (nouveauPanier) => {
  localStorage.setItem('mon_panier', JSON.stringify(nouveauPanier))
}, { deep: true })

// ─── ACTIONS ───

const ajouterAuPanier = (produit, quantite = 1) => {
  const articleExistant = panier.value.find(item => item.id === produit.id)
  if (articleExistant) {
    articleExistant.quantite += quantite
  } else {
    panier.value.push({ ...produit, quantite })
  }
}

const retirerDuPanier = (produitId) => {
  panier.value = panier.value.filter(item => item.id !== produitId)
}

const modifierQuantite = (produitId, nouvelleQuantite) => {
  const article = panier.value.find(item => item.id === produitId)
  if (article) {
    if (nouvelleQuantite <= 0) {
      retirerDuPanier(produitId)
    } else {
      article.quantite = nouvelleQuantite
    }
  }
}

const viderLePanier = () => {
  panier.value = []
}

// ─── CALCULS ───

const nombreArticles = computed(() =>
  panier.value.reduce((total, item) => total + item.quantite, 0)
)

const prixTotal = computed(() =>
  panier.value.reduce((somme, item) => somme + (item.price * item.quantite), 0)
)

export function usePanier() {
  return { panier, ajouterAuPanier, retirerDuPanier, modifierQuantite, viderLePanier, nombreArticles, prixTotal }
}
```

**Utilisation dans n'importe quelle page :**
```html
<script setup>
import { usePanier } from '../composables/usePanier.js'

const { panier, ajouterAuPanier, prixTotal, nombreArticles } = usePanier()
</script>

<template>
  <button @click="ajouterAuPanier(produit)">Ajouter au panier</button>
  <p>{{ nombreArticles }} article(s) — Total : {{ prixTotal.toFixed(2) }} €</p>
</template>
```

---

### 📦 Bloc 4 — Validation de commande (CheckoutView.vue)

```html
<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { usePanier } from '../composables/usePanier.js'

const router = useRouter()
const { panier, viderLePanier, prixTotal } = usePanier()

const acheteur = ref({ nom: '', adresse: '', telephone: '', email: '' })
const envoiEnCours = ref(false)
const erreur = ref('')

const validerCommande = async () => {
  // Validation côté client
  if (!acheteur.value.nom || !acheteur.value.adresse || !acheteur.value.telephone) {
    erreur.value = "Veuillez remplir tous les champs obligatoires."
    return
  }
  if (panier.value.length === 0) {
    erreur.value = "Votre panier est vide."
    return
  }

  envoiEnCours.value = true
  erreur.value = ''

  // Construction du payload — adapter les noms de champs selon l'API !
  const commandePayload = {
    customer: {
      name:  acheteur.value.nom,
      email: acheteur.value.email,
      phone: acheteur.value.telephone,
    },
    shipping_address: acheteur.value.adresse,
    items: panier.value.map(item => ({
      product_id: item.id,
      quantity:   item.quantite,
      price:      item.price
    })),
    payment_method: 'cash_on_delivery',
    shipping_fees:  0
  }

  try {
    const token = localStorage.getItem('user_token')
    const response = await axios.post('https://ton-api.com/api/orders', commandePayload, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    viderLePanier()
    alert("Commande enregistrée ! Numéro : " + response.data.id)
    router.push('/confirmation')
  } catch (error) {
    erreur.value = "Erreur lors de la commande. Veuillez réessayer."
  } finally {
    envoiEnCours.value = false
  }
}
</script>

<template>
  <div class="checkout">
    <h2>Finaliser la commande</h2>
    
    <p v-if="erreur" style="color:red">{{ erreur }}</p>
    
    <div class="resume-panier">
      <h3>Résumé — {{ prixTotal.toFixed(2) }} €</h3>
      <div v-for="item in panier" :key="item.id">
        {{ item.name }} × {{ item.quantite }} = {{ (item.price * item.quantite).toFixed(2) }} €
      </div>
    </div>

    <h3>Informations de livraison</h3>
    <input v-model="acheteur.nom"       type="text"  placeholder="Nom et Prénom *"  />
    <input v-model="acheteur.email"     type="email" placeholder="Email *"          />
    <input v-model="acheteur.adresse"   type="text"  placeholder="Adresse *"        />
    <input v-model="acheteur.telephone" type="tel"   placeholder="Téléphone *"      />

    <p><em>Paiement à la livraison — Livraison gratuite</em></p>

    <button :disabled="envoiEnCours" @click="validerCommande">
      {{ envoiEnCours ? "Traitement en cours..." : "Confirmer l'achat" }}
    </button>
  </div>
</template>
```

---

### 🔐 Bloc 5 — Authentification & Protection des routes

```javascript
// router/index.js — Version complète avec sécurité

import { createRouter, createWebHistory } from 'vue-router'
// ... imports des vues ...

const routes = [
  { path: '/',       component: HomeView   },
  { path: '/login',  component: LoginView  },
  { path: '/panier', component: PanierView },
  {
    path: '/admin',
    component: AdminView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/commandes',
    component: CommandesView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const estProtege = to.matched.some(record => record.meta.requiresAuth)
  const token = localStorage.getItem('user_token')

  if (estProtege && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

**Se déconnecter :**
```javascript
const seDeconnecter = () => {
  localStorage.removeItem('user_token')
  router.push('/login')
}
```

---

### 📥 Bloc 6 — Upload de fichier (FormData)

```html
<script setup>
import { ref } from 'vue'
import axios from 'axios'

const fichierSelectionne = ref(null)
const envoiEnCours = ref(false)
const messageResultat = ref('')

const capturerFichier = (event) => {
  fichierSelectionne.value = event.target.files[0]
}

const envoyerFichier = async () => {
  if (!fichierSelectionne.value) {
    alert("Veuillez d'abord sélectionner un fichier.")
    return
  }

  envoiEnCours.value = true

  // FormData est OBLIGATOIRE pour envoyer des fichiers
  const formData = new FormData()
  formData.append('import_file', fichierSelectionne.value)
  // Ajouter d'autres champs si nécessaire :
  // formData.append('type', 'produits')

  try {
    const token = localStorage.getItem('user_token')
    await axios.post('https://ton-api.com/api/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    })
    messageResultat.value = "✅ Fichier importé avec succès !"
  } catch (error) {
    messageResultat.value = "❌ Erreur lors de l'importation."
  } finally {
    envoiEnCours.value = false
  }
}
</script>

<template>
  <div>
    <h3>Importer un fichier (.csv, .xlsx, .zip)</h3>
    <input type="file" @change="capturerFichier" accept=".csv,.xlsx,.zip" />
    <button @click="envoyerFichier" :disabled="envoiEnCours">
      {{ envoiEnCours ? 'Import en cours...' : "Lancer l'importation" }}
    </button>
    <p v-if="messageResultat">{{ messageResultat }}</p>
  </div>
</template>
```

---

## 8. Recettes pour une grande API (Bagisto-style)

### 8.1 Lire la documentation d'une API inconnue

Quand tu arrives sur un nouveau projet, pose-toi ces questions :

1. **Quelle est l'URL de base ?** (ex: `https://monsite.com/api/v1`)
2. **Comment s'authentifier ?** (Bearer token ? Cookie ? Basic auth ?)
3. **Comment la réponse est-elle structurée ?** (tableau direct, ou objet avec une clé `data` ?)

```javascript
// Réponse API directe (tableau) :
// [ { id: 1, name: "..." }, { id: 2, name: "..." } ]
produits.value = response.data

// Réponse API enveloppée :
// { data: [ { id: 1, name: "..." } ], total: 50, page: 1 }
produits.value = response.data.data

// Bagisto en particulier :
// { data: { data: [ ... ], meta: { ... } } }
produits.value = response.data.data.data
```

### 8.2 Recette — Catalogue avec pagination

```html
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const produits = ref([])
const pageCourante = ref(1)
const totalPages = ref(1)
const enChargement = ref(false)

const chargerProduits = async (page = 1) => {
  enChargement.value = true
  try {
    const response = await axios.get(`https://ton-api.com/api/products?page=${page}`)
    produits.value = response.data.data      // ← adapter si besoin
    totalPages.value = response.data.last_page || response.data.meta?.last_page || 1
    pageCourante.value = page
  } finally {
    enChargement.value = false
  }
}

onMounted(() => chargerProduits(1))
</script>

<template>
  <div v-for="p in produits" :key="p.id">{{ p.name }}</div>

  <div class="pagination">
    <button @click="chargerProduits(pageCourante - 1)" :disabled="pageCourante <= 1">
      ← Précédent
    </button>
    <span>Page {{ pageCourante }} / {{ totalPages }}</span>
    <button @click="chargerProduits(pageCourante + 1)" :disabled="pageCourante >= totalPages">
      Suivant →
    </button>
  </div>
</template>
```

### 8.3 Recette — Fiche produit dynamique (avec paramètre d'URL)

```html
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const produit = ref(null)
const enChargement = ref(true)

onMounted(async () => {
  const id = route.params.id   // récupère l'ID dans l'URL /produit/:id
  try {
    const response = await axios.get(`https://ton-api.com/api/products/${id}`)
    produit.value = response.data.data || response.data
  } finally {
    enChargement.value = false
  }
})
</script>

<template>
  <div v-if="enChargement">Chargement...</div>
  <div v-else-if="produit">
    <h1>{{ produit.name }}</h1>
    <img :src="produit.images?.[0]?.url" :alt="produit.name" />
    <p>{{ produit.price }} €</p>
    <p>{{ produit.description }}</p>
  </div>
</template>
```

### 8.4 Recette — Recherche et filtres

```html
<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

const resultats = ref([])
const recherche = ref('')
const categorieChoisie = ref('')
let timerRecherche = null

// Recherche "debounced" : attend 500ms après la dernière frappe avant d'appeler l'API
watch(recherche, (nouvelleRecherche) => {
  clearTimeout(timerRecherche)
  timerRecherche = setTimeout(() => {
    lancerRecherche()
  }, 500)
})

const lancerRecherche = async () => {
  const params = new URLSearchParams()
  if (recherche.value)         params.append('q',        recherche.value)
  if (categorieChoisie.value)  params.append('category', categorieChoisie.value)

  const response = await axios.get(`https://ton-api.com/api/products?${params}`)
  resultats.value = response.data.data || response.data
}
</script>

<template>
  <input v-model="recherche" type="text" placeholder="Rechercher..." />
  <select v-model="categorieChoisie" @change="lancerRecherche">
    <option value="">Toutes catégories</option>
    <option value="vetements">Vêtements</option>
    <option value="electronique">Électronique</option>
  </select>

  <div v-for="item in resultats" :key="item.id">{{ item.name }}</div>
</template>
```

### 8.5 Recette — Backoffice CRUD (liste + supprimer + modifier)

```html
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const items = ref([])
const itemEnEdition = ref(null)  // null = aucun en cours d'édition

const headers = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
})

const charger = async () => {
  const r = await axios.get('https://ton-api.com/api/admin/products', headers())
  items.value = r.data.data || r.data
}

const supprimer = async (id) => {
  if (!confirm("Supprimer cet élément ?")) return
  await axios.delete(`https://ton-api.com/api/admin/products/${id}`, headers())
  items.value = items.value.filter(i => i.id !== id)
}

const commencerEdition = (item) => {
  itemEnEdition.value = { ...item }   // Copie pour ne pas modifier l'original
}

const sauvegarder = async () => {
  await axios.put(
    `https://ton-api.com/api/admin/products/${itemEnEdition.value.id}`,
    itemEnEdition.value,
    headers()
  )
  const index = items.value.findIndex(i => i.id === itemEnEdition.value.id)
  items.value[index] = { ...itemEnEdition.value }
  itemEnEdition.value = null
}

onMounted(charger)
</script>

<template>
  <!-- Formulaire d'édition -->
  <div v-if="itemEnEdition" class="modal">
    <h3>Modifier</h3>
    <input v-model="itemEnEdition.name"  placeholder="Nom" />
    <input v-model="itemEnEdition.price" type="number" placeholder="Prix" />
    <button @click="sauvegarder">💾 Sauvegarder</button>
    <button @click="itemEnEdition = null">Annuler</button>
  </div>

  <!-- Liste -->
  <table>
    <thead><tr><th>ID</th><th>Nom</th><th>Prix</th><th>Actions</th></tr></thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.price }} €</td>
        <td>
          <button @click="commencerEdition(item)">✏️ Modifier</button>
          <button @click="supprimer(item.id)">🗑️ Supprimer</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

---

## 9. Erreurs fréquentes et solutions

### ❌ "Cannot read properties of undefined (reading 'value')"
**Cause :** Tu essaies d'accéder à `.value` sur une variable qui n'est pas un `ref`.
```javascript
// ❌ Mauvais
const produit = null
produit.value = response.data  // Erreur !

// ✅ Correct
const produit = ref(null)
produit.value = response.data  // OK
```

---

### ❌ La liste ne s'affiche pas après l'appel API
**Cause :** Tu as mal ciblé la propriété de la réponse.
```javascript
// ❌ Mauvais — si l'API renvoie { data: [...] }
produits.value = response.data.products  // undefined !

// ✅ Déboguer d'abord
console.log(response.data)               // Voir la vraie structure
// Puis adapter :
produits.value = response.data.data      // selon ce que tu vois dans la console
```

---

### ❌ CORS Error
**Cause :** L'API bloque les requêtes depuis ton domaine local.
**Solution :** Ce problème vient du **serveur** (l'API), pas de ton code Vue. Si tu es en local, utilise un proxy dans `vite.config.js` :
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://ton-api.com',
        changeOrigin: true
      }
    }
  }
}
// Ensuite utilise '/api/products' au lieu de 'https://ton-api.com/api/products'
```

---

### ❌ Le `v-for` affiche rien même si les données sont là
**Cause fréquente :** Tu as oublié `.value` en affectant le tableau.
```javascript
// ❌ Mauvais
produits = response.data   // N'utilise pas .value → Vue ne voit pas le changement

// ✅ Correct
produits.value = response.data
```

---

### ❌ Le formulaire recharge la page
**Cause :** Tu n'as pas mis `@submit.prevent` sur la balise `<form>`.
```html
<!-- ❌ Mauvais -->
<form @submit="valider">

<!-- ✅ Correct -->
<form @submit.prevent="valider">
```

---

### ❌ Erreur 401 Unauthorized sur une requête API
**Cause :** Le token n'est pas envoyé ou est expiré.
```javascript
// Vérifier d'abord que le token existe
console.log(localStorage.getItem('user_token'))

// Puis s'assurer qu'il est bien envoyé dans les headers
const response = await axios.get('/api/orders', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
})
```

---

### ❌ `router.push` ne fonctionne pas
**Cause :** Tu as oublié d'importer et d'appeler `useRouter()`.
```javascript
// ❌ Mauvais
import { useRouter } from 'vue-router'
router.push('/home')   // router n'est pas défini !

// ✅ Correct
import { useRouter } from 'vue-router'
const router = useRouter()   // ← obligatoire
router.push('/home')
```

---

## 10. Checklist avant de rendre ton projet

### ✅ Fonctionnalités
- [ ] La page d'accueil charge les produits depuis l'API
- [ ] On peut naviguer vers une fiche produit
- [ ] On peut ajouter des produits au panier
- [ ] Le panier est persistant (localStorage)
- [ ] Le total du panier est calculé automatiquement
- [ ] Le formulaire de commande valide les champs vides
- [ ] La commande est envoyée à l'API et le panier est vidé après succès
- [ ] Le login fonctionne et sauvegarde le token
- [ ] Les pages admin sont protégées (redirection si non connecté)
- [ ] La déconnexion supprime le token et redirige

### ✅ Qualité du code
- [ ] Toutes les variables réactives utilisent `ref()`
- [ ] Tous les `v-for` ont un `:key` unique
- [ ] Tous les appels API sont dans des blocs `try/catch`
- [ ] L'utilisateur voit un message de chargement pendant les requêtes
- [ ] L'utilisateur voit un message d'erreur si une requête échoue
- [ ] Les boutons sont désactivés (`:disabled`) pendant les envois

### ✅ Vérifications finales
- [ ] La console du navigateur ne montre pas d'erreurs rouges
- [ ] `npm run build` se termine sans erreurs
- [ ] Tester dans un onglet en navigation privée (pas de données en cache)

---

## 📌 MÉMO RAPIDE — Tout sur une page

| Ce que tu veux faire | La syntaxe |
|---|---|
| Variable réactive | `const x = ref(valeur)` |
| Lire dans le script | `x.value` |
| Afficher dans le HTML | `{{ x }}` |
| Lier un input | `v-model="x"` |
| Boucle | `v-for="item in liste" :key="item.id"` |
| Condition | `v-if="condition"` / `v-else` |
| Attribut dynamique | `:src="url"` / `:disabled="bool"` |
| Clic | `@click="maFonction"` |
| Formulaire | `@submit.prevent="maFonction"` |
| Calcul automatique | `const total = computed(() => ...)` |
| Au chargement de page | `onMounted(() => ...)` |
| Surveiller un changement | `watch(x, (newVal) => ...)` |
| Naviguer | `router.push('/page')` |
| Lire l'URL | `route.params.id` |
| Appel GET | `axios.get('url')` |
| Appel POST | `axios.post('url', données)` |
| Envoyer un token | `headers: { Authorization: 'Bearer ' + token }` |
| Envoyer un fichier | `new FormData()` + `axios.post(..., formData)` |
| Sauvegarder localement | `localStorage.setItem('clé', JSON.stringify(data))` |
| Lire en local | `JSON.parse(localStorage.getItem('clé'))` |

---

*Ce guide a été conçu pour être autonome. Bonne chance ! 💪*