🟢 Leçon 2 : L'Affichage Dynamique (Interpolation)
Pour afficher une variable du script dans ton HTML, on l'entoure de doubles accolades {{ }}.


<script setup>
const prenom = "Alex"
</script>

<template>
  <p>Bonjour {{ prenom }} !</p>
</template>

🟢 Leçon 3 : La Réactivité avec ref()
Par défaut, changer une variable ne met pas à jour l'écran. Pour rendre une variable "vivante" (réactive), on utilise ref().

Dans le <script setup> : On doit obligatoirement écrire .value pour modifier ou lire la variable.

Dans le <template> : On l'utilise normalement (pas de .value).

HTML
<script setup>
import { ref } from 'vue'

const score = ref(0)
score.value = 10 // On utilise .value dans le script
</script>

<template>
  <p>Le score est : {{ score }}</p> </template>

🟢 Leçon 4 : Écouter les Événements (@click)
Pour déclencher une fonction lors d'une action utilisateur (comme un clic sur un bouton), on utilise le raccourci @ suivi de l'événement.

HTML
<script setup>
import { ref } from 'vue'

const compteur = ref(0)
function incrementer() {
  compteur.value++
}
</script>

<template>
  <p>Compteur : {{ compteur }}</p>
  <button @click="incrementer">Ajouter 1</button>
</template>

🟢 Leçon 5 : Les Conditions (v-if et v-else)
Pour afficher ou masquer un élément HTML selon une condition, on utilise les directives v-if et v-else. La balise v-else doit suivre immédiatement le v-if.

HTML
<script setup>
import { ref } from 'vue'
const estMajeur = ref(true)
</script>

<template>
  <p v-if="estMajeur">Accès autorisé ✅</p>
  <p v-else>Accès refusé ❌</p>
</template>
🟢 Leçon 6 : La liaison à double sens (v-model)
Pour lier un champ de saisie (<input>) à une variable réactive pour que les deux se mettent à jour instantanément en temps réel.

HTML
<script setup>
import { ref } from 'vue'
const message = ref('')
</script>

<template>
  <input v-model="message" placeholder="Tape un truc..." />
  <p>Tu écris : {{ message }}</p>
</template>
🟢 Leçon 7 : Les Listes (v-for)
Pour répéter un élément HTML à partir d'un tableau (une liste). On utilise la syntaxe v-for="item in liste" et on fournit toujours une clé unique avec :key.

HTML
<script setup>
import { ref } from 'vue'
const courses = ref(['Pain', 'Lait', 'Chocolat'])
</script>

<template>
  <ul>
    <li v-for="article in courses" :key="article">
      {{ article }}
    </li>
  </ul>
</template>

🟢 Leçon 8 : Les Propriétés Calculées (computed)

<script setup>
import { ref, computed } from 'vue'

const tableDeChocolat = ref([1, 2, 3])

// computed prend TOUJOURS une fonction qui fait un "return"
const carrésRestants = computed(() => {
  return tableDeChocolat.value.length
})
</script>

<template>
  <p>Il reste {{ carrésRestants }} morceaux.</p>
</template>

🟢 Leçon 9 : Les Props (Partager des données)
La Logique
On utilise defineProps() dans le composant enfant pour déclarer ce qu'il a le droit de recevoir.

Composant Enfant (ProfilMembre.vue) :

HTML
<script setup>
// On liste les variables qu'on attend du parent
defineProps(['nomUtilisateur'])
</script>

<template>
  <div class="badge">Membre : {{ nomUtilisateur }}</div>
</template>
Composant Parent (App.vue) :

HTML
<template>
  <ProfilMembre :nomUtilisateur="'Alex'" />
</template>

calculée moyenne pour obtenir la première note du tableau (notes.value[0]) ? (Dis-moi juste la ligne du computed).
const calculMoyenne = computed(() => {
  return notes.value[0] // Pas de point avant le crochet
}) 
Dia raha ny angezany .length


Gestion Erreur :
<p v-if="EnChargement">Chargement en cours...</p>
<p v-else-if="erreur">Erreur : {{ erreur }}</p>
<p v-else>Liste des produits chargés !</p>

import { ref } from 'vue'

// 1. Déclaration des états de la requête
const produits = ref([])
const EnChargement = ref(false)
const erreur = ref(null)

// 2. La fonction asynchrone avec gestion des erreurs (try/catch)
const chargerProduits = async () => {
  EnChargement.value = true
  erreur.value = null
  
  try {
    const reponse = await fetch('https://api.mon-egame.com/products')
    
    if (!reponse.ok) {
      throw new Error('Impossible de récupérer les produits')
    }
    
    // Si tout va bien, on stocke les données
    produits.value = await reponse.json()
  } catch (err) {
    // Si ça échoue, on capture l'erreur pour l'afficher à l'écran
    erreur.value = err.message
  } finally {
    // Dans tous les cas (succès ou échec), le chargement est terminé
    EnChargement.value = false
  }
}


Tsy voatery declarena izy raha hoe zavtra cliquena sy apian eto exameple hoe : manampy produit
<script setup>
import { ref } from 'vue'

const panier = ref([])

// La fonction reçoit le produit sur lequel l'utilisateur a cliqué
const ajouterAuPanier = (produit) => {
  panier.value.push(produit)
}
</script>
OU 
const ajouterAuPanier = (produit) => {
  // On cherche si un article dans le panier a le même ID que le produit cliqué
  const articleExiste = panier.value.find(item => item.id === produit.id)

  if (articleExiste) {
    // Si on l'a trouvé, on augmente juste sa quantité
    articleExiste.quantite++
  } else {
    // Si on ne l'a pas trouvé, on l'ajoute au panier avec une quantité de départ de 1
    panier.value.push({ ...produit, quantite: 1 })
  }
}
<div v-for="prod in listeDesProduits" :key="prod.id">
  <h3>{{ prod.name }}</h3>
  <button @click="ajouterAuPanier(prod)">Ajouter au panier</button>
</div>