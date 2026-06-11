# Guide JS & Vue.js — Référence rapide

> Utilise `Ctrl+F` (ou `Cmd+F`) pour rechercher un mot-clé.

---

## TABLE DES MATIÈRES

- [PARTIE 1 — JavaScript Fondamental](#partie-1--javascript-fondamental)
  - [Variables & Types](#1-variables--types)
  - [Opérateurs](#2-opérateurs)
  - [Structures de contrôle](#3-structures-de-contrôle)
  - [Fonctions](#4-fonctions)
  - [Tableaux](#5-tableaux)
  - [Objets](#6-objets)
  - [Classes & POO](#7-classes--poo)
  - [Destructuring & Spread](#8-destructuring--spread)
  - [Modules](#9-modules)
  - [Async / Await](#10-async--await)
  - [Gestion des erreurs](#11-gestion-des-erreurs)
  - [DOM & Événements](#12-dom--événements)
  - [LocalStorage](#13-localstorage)
- [PARTIE 2 — API REST](#partie-2--api-rest)
  - [HTTP & fetch](#14-http--fetch)
  - [Axios](#15-axios)
  - [CRUD complet](#16-crud-complet)
  - [Auth & Tokens](#17-auth--tokens)
  - [Gestion erreurs API](#18-gestion-erreurs-api)
- [PARTIE 3 — Vue.js Fondamental](#partie-3--vuejs-fondamental)
  - [ref & reactive](#19-ref--reactive)
  - [Computed & Watch](#20-computed--watch)
  - [Directives](#21-directives)
  - [Formulaires v-model](#22-formulaires--v-model)
  - [Lifecycle Hooks](#23-lifecycle-hooks)
- [PARTIE 4 — Vue.js Intermédiaire](#partie-4--vuejs-intermédiaire)
  - [Props & Emit](#24-props--emit)
  - [Slots](#25-slots)
  - [Vue Router](#26-vue-router)
  - [Pinia](#27-pinia)
- [PARTIE 5 — Vue.js + API REST](#partie-5--vuejs--api-rest)
  - [Appels API dans Vue](#28-appels-api-dans-vue)
  - [Formulaire POST](#29-formulaire-post)
  - [CRUD dans Vue](#30-crud-dans-vue)
  - [Auth JWT](#31-auth-jwt)
  - [Intercepteurs Axios](#32-intercepteurs-axios)
- [PARTIE 6 — Pro Tips](#partie-6--pro-tips)
  - [Composables](#33-composables)
  - [Provide / Inject](#34-provide--inject)
  - [Bonnes pratiques](#35-bonnes-pratiques--anti-patterns)
- [ANNEXE — Cheatsheet rapide](#annexe--cheatsheet-rapide)

---

# PARTIE 1 — JavaScript Fondamental

---

## 1. Variables & Types

**Règle d'or :** `const` par défaut → `let` si besoin de modifier → jamais `var`.

```js
const PI = 3.14;        // constante
let age = 25;           // modifiable
age = 26;               // OK
```

### Types primitifs

```js
let nom     = "Alice";           // string
let age     = 42;                // number
let actif   = true;              // boolean
let vide    = null;              // null (vide intentionnel)
let resultat;                    // undefined (pas assigné)
const id    = Symbol("id");      // symbol
const grand = 9999999999999999n; // bigint
```

### Vérifier le type

```js
typeof "bonjour"     // "string"
typeof 42            // "number"
typeof true          // "boolean"
typeof undefined     // "undefined"
typeof null          // "object"  ← bug historique JS
typeof []            // "object"  ← array est un object !

Array.isArray([1,2]) // true  ← toujours utiliser ça pour les arrays
```

### Conversion de types

```js
Number("42")        // 42
parseInt("42px")    // 42
parseFloat("3.14")  // 3.14
+"42"               // 42

String(42)          // "42"
(42).toString()     // "42"

Boolean(0)          // false
Boolean("")         // false
Boolean(null)       // false
Boolean("hello")    // true
Boolean([])         // true  ← attention !
```

---

## 2. Opérateurs

### Comparaison — toujours `===` et `!==`

```js
"5" == 5    // true  ← DANGER (conversion de type)
"5" === 5   // false ← CORRECT (type + valeur)
5 === 5     // true
```

### Nullish Coalescing `??`

```js
const val = donnee ?? "défaut";
// Prend "défaut" uniquement si donnee est null ou undefined
// (pas si donnee = 0 ou "")
```

### Optional Chaining `?.`

```js
const ville = utilisateur?.adresse?.ville;
// Retourne undefined si utilisateur ou adresse est null/undefined
// Sans ?. → TypeError crash
```

### Ternaire

```js
const msg = age >= 18 ? "Majeur" : "Mineur";
```

### Assignation raccourcie

```js
x += 5;   // x = x + 5
x -= 3;   // x = x - 3
x *= 2;   // x = x * 2
x ??= "défaut"; // x = x ?? "défaut"
```

---

## 3. Structures de contrôle

### if / else if / else

```js
if (note >= 90) {
  console.log("Excellent");
} else if (note >= 70) {
  console.log("Bien");
} else {
  console.log("Insuffisant");
}
```

### switch

```js
switch (jour) {
  case "lundi":
  case "mardi":
    console.log("Début de semaine");
    break;
  default:
    console.log("Milieu de semaine");
}
```

### Boucles

```js
// for classique
for (let i = 0; i < 5; i++) { console.log(i); }

// for...of  (tableau)
for (const fruit of fruits) { console.log(fruit); }

// for...in  (clés d'un objet)
for (const cle in objet) { console.log(cle, objet[cle]); }

// while
while (compteur < 3) { compteur++; }
```

---

## 4. Fonctions

### Arrow function (syntaxe moderne)

```js
const double  = n => n * 2;                 // 1 param, retour implicite
const add     = (a, b) => a + b;            // 2 params
const saluer  = () => "Bonjour!";           // sans param
const complet = (a, b) => { return a + b; }; // avec bloc
```

### Paramètres par défaut & rest

```js
function saluer(nom = "Monde") {
  return `Bonjour, ${nom}!`;
}

function somme(...nombres) {
  return nombres.reduce((acc, n) => acc + n, 0);
}
somme(1, 2, 3, 4); // 10
```

### Méthodes de tableau essentielles

```js
const n = [1, 2, 3, 4, 5];

n.map(x => x * 2)            // [2, 4, 6, 8, 10]  — transformer
n.filter(x => x > 2)         // [3, 4, 5]          — filtrer
n.reduce((acc,x) => acc+x,0) // 15                 — réduire
n.find(x => x > 3)           // 4                  — premier trouvé
n.findIndex(x => x > 3)      // 3                  — index du premier
n.some(x => x > 4)           // true               — au moins un
n.every(x => x > 0)          // true               — tous
n.includes(3)                // true               — existe ?
n.forEach(x => console.log(x)) // parcourir sans retour
```

---

## 5. Tableaux

### Ajouter / supprimer

```js
arr.push(4)        // ajoute à la fin
arr.pop()          // supprime la fin
arr.unshift(0)     // ajoute au début
arr.shift()        // supprime le début
```

### Splice, Slice, Concat

```js
arr.splice(1, 1)         // supprime 1 élément à l'index 1
arr.splice(1, 0, 99)     // insère 99 à l'index 1
arr.slice(1, 3)          // extrait index 1 à 2 (sans modifier)
arr.slice(-2)            // 2 derniers éléments
[1,2].concat([3,4])      // [1, 2, 3, 4]
```

### Trier

```js
["c","a","b"].sort()               // ["a","b","c"]
[10,2,1].sort((a,b) => a - b)     // [1, 2, 10]  croissant
[10,2,1].sort((a,b) => b - a)     // [10, 2, 1]  décroissant
```

---

## 6. Objets

```js
const personne = {
  nom: "Alice",
  age: 30,
  saluer() { return `Je m'appelle ${this.nom}`; }
};

personne.nom           // "Alice"
personne["age"]        // 30  (notation crochet — utile pour clés dynamiques)
personne.email = "a@b.com"  // ajouter une propriété
delete personne.email       // supprimer
```

### Méthodes utiles

```js
Object.keys(obj)      // ["a","b","c"]
Object.values(obj)    // [1, 2, 3]
Object.entries(obj)   // [["a",1],["b",2]]

const fusion = { ...obj1, ...obj2 }       // fusionner
const updated = { ...obj, b: 99 }         // copier + modifier
"a" in obj                                // vérifier si propriété existe
```

---

## 7. Classes & POO

```js
class Animal {
  constructor(nom, age) {
    this.nom = nom;
    this.age = age;
  }

  parler() { return `${this.nom} fait un bruit.`; }

  get description() { return `${this.nom}, ${this.age} ans`; }

  static creer(nom) { return new Animal(nom, 0); }
}

// Héritage
class Chien extends Animal {
  constructor(nom, age, race) {
    super(nom, age);   // constructeur parent obligatoire
    this.race = race;
  }
  parler() { return `${this.nom} aboie!`; }
}

const rex = new Chien("Rex", 2, "Labrador");
rex instanceof Chien   // true
rex instanceof Animal  // true
```

---

## 8. Destructuring & Spread

### Destructuring d'objet

```js
const { nom, age } = personne;                   // basique
const { nom: prenom } = personne;                // renommer
const { email = "?" } = personne;               // valeur par défaut
const { nom: n, ...reste } = personne;           // rest
function afficher({ nom, age }) { ... }          // dans les params
```

### Destructuring de tableau

```js
const [a, b, ...reste] = [1, 2, 3, 4, 5];
const [,, troisieme] = [1, 2, 3];               // ignorer des éléments
let x=1, y=2;
[x, y] = [y, x];                               // swap
```

### Spread `...`

```js
const arr = [...arr1, ...arr2];                 // fusion tableau
const copie = [...arr1];                        // copie shallow
const obj = { ...obj1, ...obj2 };              // fusion objet
const updated = { ...obj1, b: 99 };            // copier + modifier
```

---

## 9. Modules

### Export

```js
// exports nommés
export const PI = 3.14;
export function additionner(a, b) { return a + b; }

// export par défaut (un seul par fichier)
export default function principale() { ... }
```

### Import

```js
import { PI, additionner } from "./utils.js";
import { additionner as add } from "./utils.js"; // alias
import * as Utils from "./utils.js";             // namespace
import principale from "./utils.js";             // défaut
import principale, { PI } from "./utils.js";    // mixte
```

---

## 10. Async / Await

### Syntaxe de base

```js
async function charger() {
  try {
    const reponse = await fetch("https://api.exemple.com/data");
    const donnees = await reponse.json();
    return donnees;
  } catch (erreur) {
    console.error("Erreur:", erreur);
    throw erreur;
  }
}
```

### Plusieurs promesses en parallèle

```js
// Toutes en parallèle — échoue si une échoue
const [users, posts] = await Promise.all([
  fetch("/api/users").then(r => r.json()),
  fetch("/api/posts").then(r => r.json()),
]);

// Toutes en parallèle — ne s'arrête pas aux erreurs
const resultats = await Promise.allSettled([p1, p2]);
resultats.forEach(r => {
  if (r.status === "fulfilled") console.log(r.value);
  if (r.status === "rejected") console.error(r.reason);
});
```

---

## 11. Gestion des erreurs

```js
try {
  const data = JSON.parse("invalid {{{");
} catch (err) {
  console.error(err.name);    // "SyntaxError"
  console.error(err.message);
} finally {
  console.log("Toujours exécuté");
}

// Erreur personnalisée
class ErreurAPI extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "ErreurAPI";
    this.statusCode = statusCode;
  }
}
throw new ErreurAPI("Non trouvé", 404);
```

---

## 12. DOM & Événements

### Sélection & modification

```js
document.getElementById("monId")
document.querySelector(".maClasse")       // premier
document.querySelectorAll(".maClasse")    // tous

el.textContent = "Texte";                 // modifier (sécurisé)
el.innerHTML = "<strong>HTML</strong>";   // HTML (attention XSS)

el.classList.add("active")
el.classList.remove("active")
el.classList.toggle("active")
el.classList.contains("active")           // true/false

el.setAttribute("href", "/page")
el.getAttribute("href")
```

### Événements

```js
bouton.addEventListener("click", (e) => {
  e.preventDefault();   // stoppe comportement par défaut
  e.stopPropagation();  // stoppe le bubbling
  console.log(e.target);
});

// Événements courants
"click" "dblclick" "mouseenter" "mouseleave"
"keydown" "keyup"
"submit" "change" "input" "focus" "blur"
"load" "resize" "scroll"
```

---

## 13. LocalStorage

```js
localStorage.setItem("cle", "valeur")
localStorage.getItem("cle")           // "valeur"
localStorage.removeItem("cle")
localStorage.clear()

// Stocker un objet
localStorage.setItem("user", JSON.stringify({ nom: "Alice" }))
const user = JSON.parse(localStorage.getItem("user"))

// sessionStorage — disparaît à la fermeture de l'onglet
sessionStorage.setItem("token", "abc123")
```

---

# PARTIE 2 — API REST

---

## 14. HTTP & fetch

### Méthodes HTTP

| Méthode | Usage             |
|---------|-------------------|
| GET     | Lire              |
| POST    | Créer             |
| PUT     | Remplacer         |
| PATCH   | Modifier partiel  |
| DELETE  | Supprimer         |

### Codes de statut

| Code | Signification          |
|------|------------------------|
| 200  | OK                     |
| 201  | Created                |
| 204  | No Content             |
| 400  | Bad Request            |
| 401  | Non authentifié        |
| 403  | Interdit               |
| 404  | Non trouvé             |
| 500  | Erreur serveur         |

### fetch GET

```js
async function getUsers() {
  const res = await fetch("https://api.exemple.com/users");
  if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
  return res.json();
}
```

### fetch POST

```js
async function creer(data) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
```

### fetch PUT / PATCH / DELETE

```js
// PUT
await fetch(`/api/users/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

// DELETE
await fetch(`/api/users/${id}`, { method: "DELETE" });
```

---

## 15. Axios

### Installation

```bash
npm install axios
```

### Instance centralisée (bonne pratique)

```js
// services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.exemple.com",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export default api;
```

### CRUD avec Axios

```js
const { data } = await api.get("/users");
const { data } = await api.get("/users/42");
const { data } = await api.post("/users", payload);
const { data } = await api.put("/users/42", payload);
const { data } = await api.patch("/users/42", changes);
await api.delete("/users/42");
```

---

## 16. CRUD complet (service pattern)

```js
// services/userService.js
import api from "./api";

export const userService = {
  getAll:   ()           => api.get("/users").then(r => r.data),
  getById:  (id)         => api.get(`/users/${id}`).then(r => r.data),
  create:   (data)       => api.post("/users", data).then(r => r.data),
  update:   (id, data)   => api.put(`/users/${id}`, data).then(r => r.data),
  patch:    (id, changes) => api.patch(`/users/${id}`, changes).then(r => r.data),
  delete:   (id)         => api.delete(`/users/${id}`),
};
```

---

## 17. Auth & Tokens

### Ajouter le token à chaque requête (intercepteur)

```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Avec fetch (manuel)

```js
const token = localStorage.getItem("token");
const res = await fetch("/api/profil", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

---

## 18. Gestion erreurs API

```js
try {
  const { data } = await api.get("/users");
} catch (err) {
  if (err.response) {
    // Serveur a répondu avec une erreur
    console.error("Status:", err.response.status);
    console.error("Data:", err.response.data);
    if (err.response.status === 401) router.push("/login");
    if (err.response.status === 404) console.error("Non trouvé");
  } else if (err.request) {
    // Requête envoyée, pas de réponse
    console.error("Pas de réponse du serveur");
  } else {
    console.error("Erreur:", err.message);
  }
}
```

---

# PARTIE 3 — Vue.js Fondamental

---

## 19. ref & reactive

### ref — primitives

> Dans le **script** → `.value` obligatoire.  
> Dans le **template** → pas besoin de `.value`.

```js
const compteur = ref(0);
const nom      = ref("Alice");
const actif    = ref(false);
const liste    = ref([]);

// script
compteur.value++;
compteur.value = 10;

// template
// {{ compteur }}  ← fonctionne directement
```

### reactive — objets

> Pas de `.value`. Ne jamais réassigner l'objet entier.

```js
const form = reactive({ nom: "", email: "", age: null });

form.nom = "Alice";       // direct
form.age = 30;            // direct

// Réinitialiser
Object.assign(form, { nom: "", email: "", age: null });
// ❌ form = { nom: "" }  → perd la réactivité !
```

### Quand utiliser quoi ?

| Cas                     | Utiliser       |
|-------------------------|----------------|
| Nombre, string, boolean | `ref`          |
| Formulaire / objet      | `reactive`     |
| Besoin de réassigner    | `ref`          |
| Doute                   | `ref`          |

---

## 20. Computed & Watch

### computed — valeur dérivée (mise en cache)

```js
const nomComplet = computed(() => `${prenom.value} ${nom.value}`);
const prixTTC    = computed(() => prix.value * 1.2);
const pairsSeulement = computed(() =>
  items.value.filter(n => n % 2 === 0)
);

// computed get/set (modifiable)
const nomCompletRW = computed({
  get() { return `${prenom.value} ${nom.value}`; },
  set(val) {
    const [p, n] = val.split(" ");
    prenom.value = p;
    nom.value = n || "";
  },
});
```

### watch — réagir aux changements

```js
// Surveiller une ref
watch(recherche, (newVal, oldVal) => {
  console.log(`${oldVal} → ${newVal}`);
});

// Avec options
watch(compteur, (val) => {
  console.log(val);
}, { immediate: true, deep: true });

// Surveiller plusieurs sources
watch([recherche, compteur], ([r, c]) => {
  console.log(r, c);
});

// watchEffect — surveille automatiquement toutes les dépendances
watchEffect(() => {
  console.log(recherche.value, compteur.value);
});
```

---

## 21. Directives

### v-if / v-else-if / v-else

```html
<div v-if="statut === 'charge'">Chargement...</div>
<div v-else-if="statut === 'erreur'">Erreur !</div>
<div v-else>Contenu chargé</div>
```

### v-show (reste dans le DOM)

```html
<!-- v-show → display:none (préférer si toggle fréquent) -->
<!-- v-if  → retire du DOM (préférer si rarement visible) -->
<div v-show="estVisible">Visible: {{ estVisible }}</div>
```

### v-for

```html
<!-- Tableau d'objets -->
<li v-for="user in users" :key="user.id">
  {{ user.nom }}
</li>

<!-- Avec index -->
<li v-for="(item, index) in items" :key="index">
  {{ index }} : {{ item }}
</li>

<!-- Objet -->
<div v-for="(val, cle) in objet" :key="cle">
  {{ cle }}: {{ val }}
</div>

<!-- N fois -->
<span v-for="n in 5" :key="n">{{ n }}</span>
```

> ⚠️ **Toujours `:key`**. Préférer un `id` unique plutôt que l'index.

### v-bind (`:`)

```html
<img :src="url" :alt="desc" />
<button :disabled="!valide">Envoyer</button>
<div :class="{ active: estActif }"></div>
<div :class="['base', estActif ? 'active' : '']"></div>
<p :style="{ color: couleur, fontSize: taille + 'px' }"></p>
```

### v-on (`@`) et modificateurs

```html
<button @click="incrementer">+</button>
<button @click="compteur++">Inline</button>
<form @submit.prevent="envoyer">...</form>
<input @keyup.enter="soumettre" />
<input @keyup.escape="annuler" />

<!-- Modificateurs courants -->
@click.stop          <!-- stopPropagation -->
@click.prevent       <!-- preventDefault -->
@click.once          <!-- une seule fois -->
@keyup.ctrl.enter    <!-- Ctrl + Entrée -->
```

---

## 22. Formulaires & v-model

```html
<input v-model="form.nom" type="text" />
<textarea v-model="form.message"></textarea>

<!-- Checkbox simple -->
<input type="checkbox" v-model="form.accepte" />

<!-- Checkboxes multiples (tableau) -->
<input type="checkbox" value="a" v-model="form.options" />
<input type="checkbox" value="b" v-model="form.options" />

<!-- Radio -->
<input type="radio" value="homme" v-model="form.genre" />
<input type="radio" value="femme" v-model="form.genre" />

<!-- Select -->
<select v-model="form.pays">
  <option value="">Choisir...</option>
  <option value="fr">France</option>
  <option value="mg">Madagascar</option>
</select>
```

### Modificateurs v-model

```html
<input v-model.lazy="texte" />    <!-- maj au blur, pas à chaque frappe -->
<input v-model.number="age" />    <!-- convertit en number automatiquement -->
<input v-model.trim="nom" />      <!-- supprime espaces début/fin -->
```

---

## 23. Lifecycle Hooks

```
Ordre d'exécution :
1. setup() / <script setup>
2. onBeforeMount
3. onMounted          ← idéal pour fetch API
4. onBeforeUpdate
5. onUpdated
6. onBeforeUnmount    ← nettoyage (timers, listeners)
7. onUnmounted
```

```js
import { onMounted, onUnmounted } from "vue";

onMounted(() => {
  chargerDonnees(); // fetch API ici
});

onUnmounted(() => {
  clearInterval(timer); // nettoyage
});
```

---

# PARTIE 4 — Vue.js Intermédiaire

---

## 24. Props & Emit

### defineProps

```js
const props = defineProps({
  nom:    { type: String,  required: true },
  age:    { type: Number,  default: null },
  actif:  { type: Boolean, default: false },
  liste:  { type: Array,   default: () => [] },
  config: { type: Object,  default: () => ({}) },
  valide: {
    type: Number,
    validator: (val) => val >= 0 && val <= 100,
  },
});

// Accès dans le script
console.log(props.nom);
```

### defineEmits (enfant → parent)

```js
// Enfant
const emit = defineEmits(["mise-a-jour", "suppression"]);
emit("mise-a-jour", nouvelleValeur);

// Parent
// <MonComposant @mise-a-jour="surMiseAJour" />
```

### Utiliser un composant

```html
<CarteUser nom="Alice" email="alice@mail.com" :age="30" />

<!-- Dynamique -->
<CarteUser v-for="u in users" :key="u.id" v-bind="u" />
```

---

## 25. Slots

```html
<!-- Composant Carte.vue -->
<template>
  <div>
    <slot />                          <!-- slot par défaut -->
    <slot name="entete" />            <!-- slot nommé -->
    <slot name="item" :data="data" /> <!-- scoped slot -->
  </div>
</template>

<!-- Utilisation -->
<Carte>
  <p>Contenu par défaut</p>

  <template #entete>
    <h2>Mon entête</h2>
  </template>

  <template #item="{ data }">
    <p>{{ data }}</p>
  </template>
</Carte>
```

---

## 26. Vue Router

### Configuration

```js
// router/index.js
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/",              name: "accueil",  component: AccueilView },
    { path: "/users",         name: "users",    component: () => import("@/views/UsersView.vue") },
    { path: "/users/:id",     name: "user-detail", component: () => import("@/views/UserDetailView.vue") },
    { path: "/profil",        component: ProfilView, meta: { requiresAuth: true } },
    { path: "/:pathMatch(.*)*", component: NotFoundView },
  ],
});

// Guard de navigation (protection de routes)
router.beforeEach((to) => {
  const connected = !!localStorage.getItem("token");
  if (to.meta.requiresAuth && !connected) return { name: "login" };
});
```

### Navigation template

```html
<RouterLink to="/">Accueil</RouterLink>
<RouterLink :to="{ name: 'user-detail', params: { id: 42 } }">Profil</RouterLink>
<RouterView />
```

### Navigation script

```js
const router = useRouter();
const route  = useRoute();

const id   = route.params.id;   // lire param URL
const page = route.query.page;  // lire ?page=1

router.push("/accueil");
router.push({ name: "user-detail", params: { id: 42 } });
router.back();
router.replace("/login");       // sans historique
```

---

## 27. Pinia

### Créer un store

```js
// stores/userStore.js
export const useUserStore = defineStore("user", () => {
  // State
  const users     = ref([]);
  const loading   = ref(false);
  const error     = ref(null);

  // Getters
  const total = computed(() => users.value.length);

  // Actions
  async function charger() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get("/users");
      users.value = data;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function ajouter(data) {
    const { data: newUser } = await api.post("/users", data);
    users.value.push(newUser);
  }

  return { users, loading, error, total, charger, ajouter };
});
```

### Utiliser dans un composant

```js
const store = useUserStore();

// storeToRefs pour state et getters (garde la réactivité)
const { users, loading, error, total } = storeToRefs(store);

// Actions directement
const { charger, ajouter } = store;

onMounted(charger);
```

---

# PARTIE 5 — Vue.js + API REST

---

## 28. Appels API dans Vue

### Instance Axios avec intercepteurs

```js
// services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
```

### Pattern charge / erreur / données

```html
<div v-if="loading">Chargement...</div>
<div v-else-if="error">{{ error }} <button @click="charger">Réessayer</button></div>
<ul v-else>
  <li v-for="item in items" :key="item.id">{{ item.titre }}</li>
</ul>
```

```js
const items   = ref([]);
const loading = ref(false);
const error   = ref(null);

async function charger() {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await api.get("/posts");
    items.value = data;
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur de chargement";
  } finally {
    loading.value = false;
  }
}

onMounted(charger);
```

---

## 29. Formulaire POST

```js
const form    = reactive({ titre: "", contenu: "" });
const loading = ref(false);
const error   = ref(null);
const success = ref(false);

// Validation
const erreurTitre = computed(() => {
  if (!form.titre) return "Requis";
  if (form.titre.length < 3) return "Min 3 caractères";
  return null;
});

const formValide = computed(() => !erreurTitre.value && form.contenu);

async function creer() {
  if (!formValide.value) return;
  loading.value = true;
  error.value = null;
  try {
    await api.post("/posts", form);
    success.value = true;
    Object.assign(form, { titre: "", contenu: "" }); // reset
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur";
  } finally {
    loading.value = false;
  }
}
```

---

## 30. CRUD dans Vue

```js
const items      = ref([]);
const modeEdit   = ref(false);
const itemEdit   = ref(null);
const form       = reactive({ titre: "", contenu: "" });

// READ
async function charger() {
  const { data } = await api.get("/posts");
  items.value = data;
}

// CREATE / UPDATE
async function sauvegarder() {
  if (modeEdit.value) {
    const { data } = await api.put(`/posts/${itemEdit.value.id}`, form);
    const i = items.value.findIndex(p => p.id === data.id);
    items.value[i] = data;
  } else {
    const { data } = await api.post("/posts", form);
    items.value.push(data);
  }
  annuler();
}

// Préparer modification
function editer(item) {
  modeEdit.value = true;
  itemEdit.value = item;
  form.titre   = item.titre;
  form.contenu = item.contenu;
}

function annuler() {
  modeEdit.value = false;
  itemEdit.value = null;
  Object.assign(form, { titre: "", contenu: "" });
}

// DELETE
async function supprimer(id) {
  if (!confirm("Confirmer ?")) return;
  await api.delete(`/posts/${id}`);
  items.value = items.value.filter(p => p.id !== id);
}

onMounted(charger);
```

---

## 31. Auth JWT

```js
// stores/authStore.js
export const useAuthStore = defineStore("auth", () => {
  const token       = ref(localStorage.getItem("token") || null);
  const utilisateur = ref(JSON.parse(localStorage.getItem("user") || "null"));

  const estConnecte = computed(() => !!token.value);

  async function seConnecter(credentials) {
    const { data } = await api.post("/auth/login", credentials);
    token.value       = data.token;
    utilisateur.value = data.user;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    router.push("/");
  }

  function seDeconnecter() {
    token.value       = null;
    utilisateur.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return { token, utilisateur, estConnecte, seConnecter, seDeconnecter };
});
```

---

## 32. Intercepteurs Axios

```js
// Refresh token automatique si 401
api.interceptors.response.use(
  res => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem("refreshToken");
        const { data } = await axios.post("/auth/refresh", { refreshToken: refresh });
        localStorage.setItem("token", data.token);
        original.headers.Authorization = `Bearer ${data.token}`;
        return api(original); // relancer la requête
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);
```

---

# PARTIE 6 — Pro Tips

---

## 33. Composables

```js
// composables/useAPI.js
export function useAPI(endpoint) {
  const items   = ref([]);
  const loading = ref(false);
  const error   = ref(null);

  async function lireTout() {
    loading.value = true;
    try {
      const { data } = await api.get(endpoint);
      items.value = data;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function creer(data) {
    const { data: item } = await api.post(endpoint, data);
    items.value.push(item);
    return item;
  }

  async function modifier(id, data) {
    const { data: item } = await api.put(`${endpoint}/${id}`, data);
    const i = items.value.findIndex(x => x.id === id);
    if (i !== -1) items.value[i] = item;
    return item;
  }

  async function supprimer(id) {
    await api.delete(`${endpoint}/${id}`);
    items.value = items.value.filter(x => x.id !== id);
  }

  return { items, loading, error, lireTout, creer, modifier, supprimer };
}
```

### Utilisation

```js
const { items: posts, loading, lireTout, supprimer } = useAPI("/posts");
onMounted(lireTout);
```

---

## 34. Provide / Inject

```js
// Ancêtre (App.vue ou layout)
const theme = ref("clair");
provide("theme", theme);
provide("basculerTheme", () => {
  theme.value = theme.value === "clair" ? "sombre" : "clair";
});

// Descendant (n'importe quelle profondeur)
const theme          = inject("theme");
const basculerTheme  = inject("basculerTheme");
const config         = inject("config", { langue: "fr" }); // avec défaut
```

---

## 35. Bonnes pratiques & Anti-patterns

### ✅ À faire

```js
// 1. :key unique dans v-for
<li v-for="item in items" :key="item.id">

// 2. storeToRefs pour destructurer un store
const { users, loading } = storeToRefs(store);

// 3. computed pour la logique complexe
const filtres = computed(() => items.value.filter(x => x.actif));

// 4. Services séparés pour les appels API
// api.js → userService.js → store → composant

// 5. v-show si toggle fréquent
<div v-show="modal">...</div>

// 6. Gérer loading + error + données
<div v-if="loading">...</div>
<div v-else-if="error">...</div>
<div v-else>...</div>
```

### ❌ Erreurs courantes

```js
// ❌ Muter les props directement
props.titre = "nouveau";

// ❌ Oublier .value avec ref dans le script
const compteur = ref(0);
compteur = 1;           // ERREUR → compteur.value = 1

// ❌ Réassigner un reactive entier
const state = reactive({ a: 1 });
state = { a: 2 };       // perd la réactivité → Object.assign(state, {...})

// ❌ v-if + v-for sur le même élément
<li v-if="ok" v-for="x in list"> // ERREUR → wrapper ou computed filtré

// ❌ Index comme key si la liste peut changer
<li v-for="(x, i) in items" :key="i"> // bug potentiel

// ❌ Logique complexe dans le template
{{ users.filter(u=>u.actif).map(u=>u.nom).join(", ") }} // → computed !
```

---

# ANNEXE — Cheatsheet rapide

## Raccourcis de directives

| Complet       | Raccourci |
|---------------|-----------|
| `v-bind:src`  | `:src`    |
| `v-on:click`  | `@click`  |
| `v-slot:nom`  | `#nom`    |

## API Composition — références rapides

| API              | Usage                                        |
|------------------|----------------------------------------------|
| `ref()`          | Variable réactive (primitive)                |
| `reactive()`     | Objet réactif                                |
| `computed()`     | Valeur dérivée mise en cache                 |
| `watch()`        | Réagir à un changement                       |
| `watchEffect()`  | Réagir automatiquement aux dépendances       |
| `onMounted()`    | Code au montage → fetch API                  |
| `onUnmounted()`  | Nettoyage → clearInterval, removeListener    |
| `defineProps()`  | Déclarer les entrées du composant            |
| `defineEmits()`  | Déclarer les événements émis                 |
| `provide()`      | Fournir une valeur à tous les descendants    |
| `inject()`       | Recevoir une valeur d'un ancêtre             |
| `useRouter()`    | Navigation programmatique                    |
| `useRoute()`     | Lire params/query de la route courante       |
| `defineStore()`  | Créer un store Pinia                         |
| `storeToRefs()`  | Destructurer un store avec réactivité        |

## Commandes essentielles

```bash
npm create vue@latest mon-projet   # créer un projet
npm install                        # installer les dépendances
npm run dev                        # démarrer en dev
npm run build                      # build production
npm install axios pinia vue-router # packages courants
```

## Structure de projet recommandée

```
src/
├── assets/
├── components/
│   ├── ui/           # Bouton, Modal, Input...
│   └── feature/      # Composants liés aux features
├── composables/      # logique réutilisable (useAPI, useAuth...)
├── layouts/
├── router/index.js
├── services/
│   ├── api.js        # Instance Axios configurée
│   └── userService.js
├── stores/
│   └── authStore.js
├── views/            # Une par route
├── App.vue
└── main.js
```

---

*Vue 3 · Composition API · Pinia · Vue Router 4*
