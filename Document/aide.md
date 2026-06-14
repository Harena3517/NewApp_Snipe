# 🎓 GUIDE DE SURVIE ULTIME - COMPACT & PHOTO-FRIENDLY (VUE 3 & BAGISTO)
> Ce guide regroupe les structures de code indispensables sous format **ultra-court**, débarrassé de tout style CSS inutile ou décoration, afin d'être facilement photographié et lu.

---

## 📂 1. SYNTAXE DE BASE VUE 3 (`<script setup>`)

```vue
<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';

const items = ref([]);
const search = ref('');

const filtered = computed(() => 
  items.value.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()))
);

onMounted(async () => {
  const res = await api.get('/v1/products');
  items.value = res.data.data;
});
</script>

<template>
  <div>
    <input v-model="search" placeholder="Rechercher..." />
    <ul>
      <li v-for="p in filtered" :key="p.id">{{ p.name }} - {{ p.price }} $</li>
    </ul>
  </div>
</template>
```

---

## 🛒 2. ALÉAS BOUTIQUE & FRONT-OFFICE

### A. Tri dynamique (Prix et Nom)
```html
<!-- TEMPLATE -->
<select v-model="sortBy">
  <option value="default">Nouveautés</option>
  <option value="price-asc">Prix Croissant</option>
  <option value="price-desc">Prix Décroissant</option>
  <option value="name-asc">Nom A-Z</option>
</select>
```
```javascript
// SCRIPT
const sortBy = ref("default");
const produitsTries = computed(() => {
  const list = [...produits.value];
  if (sortBy.value === "price-asc") return list.sort((a, b) => (a.special_price || a.price) - (b.special_price || b.price));
  if (sortBy.value === "price-desc") return list.sort((a, b) => (b.special_price || b.price) - (a.special_price || a.price));
  if (sortBy.value === "name-asc") return list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
});
```

### B. LE SUPER-FILTRE (Tous les filtres possibles combinés & triés)
> Voici l'unique computed à copier-coller. Active ou désactive simplement les lignes selon ce que demande le prof !

```html
<!-- TEMPLATE FILTRES -->
<div>
  <input v-model="search" placeholder="Recherche par nom ou SKU..." />
  <input v-model.number="minPrice" type="number" placeholder="Prix Min" />
  <input v-model.number="maxPrice" type="number" placeholder="Prix Max" />
  
  <select v-model="selectedCat">
    <option value="">Toutes les catégories</option>
    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
  </select>

  <label><input v-model="onlyStock" type="checkbox" /> Uniquement en Stock</label>
  <label><input v-model="onlyPromo" type="checkbox" /> Uniquement en Promo</label>
</div>
```
```javascript
// SCRIPT ULTRA-COMBINÉ (Filtre + Tri)
const search = ref('');
const minPrice = ref(null);
const maxPrice = ref(null);
const selectedCat = ref('');
const onlyStock = ref(false);
const onlyPromo = ref(false);
const sortBy = ref('default');

const produitsFiltres = computed(() => {
  return produits.value
    .filter(p => {
      // 1. Recherche mot-clé (Nom ou SKU)
      const q = search.value.toLowerCase().trim();
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;

      // 2. Prix min & max (Prend en compte special_price promo si existant)
      const prix = Number(p.special_price || p.price || 0);
      if (minPrice.value && prix < minPrice.value) return false;
      if (maxPrice.value && prix > maxPrice.value) return false;

      // 3. Stock disponible
      const stock = p.inventories?.reduce((sum, i) => sum + Number(i.qty || 0), 0) || 0;
      if (onlyStock.value && stock <= 0) return false;

      // 4. Produits en Promotion uniquement
      if (onlyPromo.value && !p.special_price) return false;

      // 5. Catégorie sélectionnée (Compare l'ID ou le nom de la catégorie)
      if (selectedCat.value) {
        const catIds = p.categories?.map(c => String(c.id || c.name)) || [];
        if (!catIds.includes(String(selectedCat.value))) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // 6. Tri intégré direct
      const pA = Number(a.special_price || a.price || 0);
      const pB = Number(b.special_price || b.price || 0);
      if (sortBy.value === 'price-asc') return pA - pB;
      if (sortBy.value === 'price-desc') return pB - pA;
      if (sortBy.value === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });
});
```

### C. FILTRES INDIVIDUELS SIMPLES (1 par 1)
> Si le prof demande uniquement **un seul** filtre spécifique, voici les versions minimalistes en 1 ligne :

```javascript
// 1. Recherche texte (Nom)
const filtered = computed(() => produits.value.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase())));

// 2. Prix Max uniquement
const filtered = computed(() => produits.value.filter(p => Number(p.price) <= maxPrice.value));

// 3. Catégorie uniquement
const filtered = computed(() => produits.value.filter(p => p.categories?.some(c => c.id === selectedCatId.value)));

// 4. Produits en stock uniquement (Exclure les ruptures)
const filtered = computed(() => produits.value.filter(p => (p.inventories?.[0]?.qty || 0) > 0));

// 5. Produits en Promotion uniquement
const filtered = computed(() => produits.value.filter(p => p.special_price !== null));
```

### D. Wishlist (Bouton ❤️ Toggle)
```html
<!-- TEMPLATE -->
<button @click.stop="toggleWishlist(p)">{{ estFavori(p.id) ? '❤️' : '🤍' }}</button>
```
```javascript
// SCRIPT
const wishlistIds = ref([]);

const chargerWishlist = async () => {
  const res = await api.get("/v1/customer/wishlist");
  wishlistIds.value = res.data.data.map(i => i.product.id || i.product_id);
};

const estFavori = (id) => wishlistIds.value.includes(id);

const toggleWishlist = async (p) => {
  await api.post(`/v1/customer/wishlist/${p.id}`);
  if (estFavori(p.id)) wishlistIds.value = wishlistIds.value.filter(id => id !== p.id);
  else wishlistIds.value.push(p.id);
};
```

### E. Alerte Stock Bas (< 5)
```html
<div v-if="stockQty > 0 && stockQty <= 5" class="warning">
  ⚠️ Attention ! Il ne reste plus que {{ stockQty }} articles !
</div>
```

---

## 🧾 3. BACK-OFFICE & IMPORTS (VALIDATIONS)

### A. Détecter les doublons de SKU dans le fichier d'import
```javascript
// À mettre dans validateProducts(rows) de ImportAll.vue
const skusVus = new Set();
rows.forEach((row, i) => {
  const line = i + 2;
  const sku = String(row.sku || "").trim();
  if (sku) {
    if (skusVus.has(sku)) errors.push(`❌ Ligne ${line} : SKU "${sku}" en doublon.`);
    else skusVus.add(sku);
  }
});
```

### B. Validation et Conversion Date DD/MM/YYYY
```javascript
// Validation Strict DD/MM/YYYY
const isValidDDMMYYYY = (v) => /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(String(v).trim());

// Convertir DD/MM/YYYY en AAAA-MM-JJ pour Bagisto
const formatToISO = (v) => {
  const s = String(v).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split("/");
    return `${y}-${m}-${d}`;
  }
  return s;
};
```

---

## 📦 4. MISE À JOUR DU STOCK VIA API ADMIN

```javascript
// ATTENTION : 'manage_stock: 1' est indispensable !
const updateStock = async (prodId, qtyAjout) => {
  const token = localStorage.getItem("admin_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // 1. Get current stock
  const detail = await axios.get(`http://127.0.0.1:8000/api/v1/admin/catalog/products/${prodId}`, { headers });
  const curQty = detail.data.data.inventories.find(i => i.inventory_source_id === 1)?.qty || 0;
  const finalQty = Number(curQty) + qtyAjout;

  // 2. Activer manage_stock
  await axios.post(`http://127.0.0.1:8000/api/v1/admin/catalog/products/${prodId}`, {
    sku: detail.data.data.sku, name: detail.data.data.name, manage_stock: 1
  }, { headers });

  // 3. Update stock global sur source ID "1"
  await axios.post(`http://127.0.0.1:8000/api/v1/admin/catalog/products/${prodId}/inventories`, {
    inventories: { "1": finalQty }
  }, { headers });
};
```

---

## 🧾 5. FACTURATION & EXPÉDITION (COMMANDE)

```javascript
// Facturer (Invoice) -> Passe à Payé
const invoiceOrder = async (orderId, itemId, qty) => {
  await axios.post(`http://127.0.0.1:8000/api/v1/admin/sales/invoices/${orderId}`, {
    invoice: { items: { [itemId]: qty } }
  }, { headers: adminHeaders() });
};

// Expédier (Shipment) -> Passe à Expédié et décrémente le stock
const shipOrder = async (orderId, itemId, qty) => {
  await axios.post(`http://127.0.0.1:8000/api/v1/admin/sales/shipments/${orderId}`, {
    shipment: { order_id: orderId, source: "1", carrier_title: "Manual", track_number: "", comment: "", notify: 0,
      items: { [itemId]: { "1": qty } } }
  }, { headers: adminHeaders() });
};
```

---

## 🎯 6. DUPLICATION DE COMMANDE AVEC CONTRÔLE DES STOCKS

```html
<!-- TEMPLATE -->
<div>
  <input v-model.number="dupQty" type="number" min="1" placeholder="Nb duplications" />
  <button @click="dupliquer(order, dupQty)">Lancer Duplication</button>
</div>
```
```javascript
// SCRIPT
const dupQty = ref(1);

const dupliquer = async (order, n) => {
  const headers = { Authorization: `Bearer ${localStorage.getItem("admin_token")}` };
  
  // 1. Vérification des stocks
  for (const item of order.items) {
    const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/catalog/products/${item.product_id}`, { headers });
    const prod = await res.json();
    const stock = prod.data.inventories.reduce((sum, inv) => sum + Number(inv.qty || 0), 0);
    const requis = Number(item.qty_ordered) * n;

    if (requis > stock) {
      alert(`❌ Stock insuffisant pour ${item.name} (${item.sku}). Requis: ${requis}, Dispo: ${stock}`);
      return;
    }
  }

  // 2. Exécution duplication (Simulée ou API)
  alert(`✅ Stock validé ! Création de ${n} duplications...`);
  for (let i = 0; i < n; i++) {
    console.log(`Copie #${i + 1} créée.`);
  }
};
```

---

## 📊 7. INDICATEURS FINANCIERS & STOCKS PAR CATÉGORIE

```javascript
// SCRIPT
const stats = ref({ ca: 0, achat: 0, benef: 0, benefCat: {}, stockCat: {} });

const calcStats = (allProducts, allOrders) => {
  // Map produits rapide : { id: { cost, category, name } }
  const prodMap = {};
  allProducts.forEach(p => {
    const cat = p.categories?.[0]?.name || p.category || "Sans Catégorie";
    prodMap[p.id] = { cost: Number(p.cost || 0), category: cat, name: p.name };
    
    // Calcul Stock par Catégorie (Ex: Ordinateur 11 : Laptop 5, Mac 6)
    const stock = p.inventories?.reduce((sum, inv) => sum + Number(inv.qty || 0), 0) || 0;
    if (!stats.value.stockCat[cat]) stats.value.stockCat[cat] = { total: 0, details: {} };
    stats.value.stockCat[cat].total += stock;
    stats.value.stockCat[cat].details[p.name] = stock;
  });

  // Calcul CA / Bénéfice
  allOrders.forEach(o => {
    if (['completed', 'processing'].includes(o.status)) {
      o.items.forEach(item => {
        const qty = Number(item.qty_ordered);
        const caItem = Number(item.price) * qty;
        const achatItem = (prodMap[item.product_id]?.cost || 0) * qty;
        
        stats.value.ca += caItem;
        stats.value.achat += achatItem;
        
        // Bénéfice par Catégorie
        const cat = prodMap[item.product_id]?.category || "Sans Catégorie";
        stats.value.benefCat[cat] = (stats.value.benefCat[cat] || 0) + (caItem - achatItem);
      });
    }
  });
  stats.value.benef = stats.value.ca - stats.value.achat;
};
```
```html
<!-- TEMPLATE STATS -->
<div>
  <p>CA: {{ stats.ca }} $ | Achat: {{ stats.achat }} $ | Bénéfice: {{ stats.benef }} $</p>

  <h3>💰 Bénéfice par Catégorie</h3>
  <div v-for="(b, cat) in stats.benefCat" :key="cat">{{ cat }} : +{{ b }} $</div>

  <h3>📦 Stock par Catégorie</h3>
  <div v-for="(info, cat) in stats.stockCat" :key="cat">
    <strong>{{ cat }} (Total: {{ info.total }})</strong>
    <div v-for="(qty, name) in info.details" :key="name"> - {{ name }} : {{ qty }}</div>
  </div>
</div>
```

---

## 🚀 8. AUTRES ALÉAS TRÈS PROBABLES DU PROFESSEUR

### A. Exportation en CSV
```javascript
const exportCSV = (list, file = "data.csv") => {
  const headers = Object.keys(list[0]).join(";");
  const rows = list.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"));
  const blob = new Blob(["\uFEFF" + [headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = file;
  a.click();
};
```

### B. Limite Achat Max par Produit dans le Panier (Ex: max 3)
```javascript
const addToCart = (prod, qtyRequested) => {
  if (qtyRequested > 3) {
    alert("❌ Limite d'achat : 3 unités maximum par produit !");
    return;
  }
  // Appel API normal...
};
```

### C. Recherche Instantanée avec Debounce (Anti-rebond 300ms)
```javascript
let timer = null;
const searchDebounce = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    chargerProduits(searchQuery.value);
  }, 300);
};
```

### D. Produits Récemment Consultés (LocalStorage)
```javascript
const trackView = (prod) => {
  let list = JSON.parse(localStorage.getItem("recent") || "[]").filter(x => x.id !== prod.id);
  list.unshift({ id: prod.id, name: prod.name });
  localStorage.setItem("recent", JSON.stringify(list.slice(0, 4)));
};
```

### E. Badge de réduction automatique (-X%)
```html
<span v-if="p.special_price">
  -{{ Math.round(((p.price - p.special_price) / p.price) * 100) }}%
</span>
```

### F. Bascule de Thème (Light / Dark Mode)
```javascript
const isLight = ref(false);
const toggleTheme = () => {
  isLight.value = !isLight.value;
  const root = document.documentElement.style;
  if (isLight.value) {
    root.setProperty('--bg', '#fff'); root.setProperty('--surface', '#f1f5f9'); root.setProperty('--text', '#000');
  } else {
    root.setProperty('--bg', '#0f172a'); root.setProperty('--surface', '#1e293b'); root.setProperty('--text', '#fff');
  }
};
```

---
**Tu as le guide ultra-condensé parfait pour tes photos ! Bonne chance ! 📸🚀**





filtre par cate 
<select v-model="selectedCat">
  <option value="">Toutes les catégories</option>
  <option v-for="c in categories" :key="c.id" :value="c.id">
    {{ c.name }}
  </option>
</select>

const selectedCat = ref('');

const filtered = computed(() => {
  return produits.value.filter(p => {
    if (!selectedCat.value) return true;

    return p.categories?.some(c => 
      String(c.id) === String(selectedCat.value)
    );
  });
});