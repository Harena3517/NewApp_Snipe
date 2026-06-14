<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import api from '../services/api'

    const hardwarelist = ref([])
    const loading = ref(false)
    const error = ref("")
    const router = useRouter()
    const categories = ref([])

    const recupererhardware = async () => {
        loading.value = true
        try {
            const res = await api.get('/hardware')
            hardwarelist.value = res.data.rows || []
        } catch (error) {
            error.value = "Impossible de charger les hardwarelist"
        } finally {
            loading.value = false
        }
    }

    const recupererCat = async () => {
                loading.value = true
        try {
            const res = await api.get('/categories?limit=50&offset=0')
            categories.value = res.data.rows || []
        } catch (error) {
            error.value = "Impossible de charger les hardwarelist"
        } finally {
            loading.value = false
        }
    }

    const ouvrirhardware = (id) => {
        router.push('/hardware/' + id)
    }

    const ovurirCat = (id) => {
        router.push('/categories/' + id)
    }

    onMounted(() => {
        recupererhardware()
        recupererCat()
    })
</script>

<template>
    <h1>Nos hardwarelist</h1>
    <p v-if="loading">En chargement</p>
    <p v-else-if="error" style="color:red">{{ error }}</p>
    <p v-else-if="hardwarelist.length === 0">Aucun hardware disponible.</p>
    <div 
        v-for="hardware in hardwarelist" 
        :key=hardware.id
        @click="ouvrirhardware(hardware.id)">
        <strong>{{hardware.id}}</strong>
        <strong>{{hardware.model?.name || 'Sans modèle'}}</strong>
        <strong>{{hardware.category?.name || 'Sans categorie'}}</strong>
        
    </div>

    <div>
    <h1>Nos categories</h1>
    <p v-if="loading">En chargement</p>
    <p v-else-if="error" style="color:red">{{ error }}</p>
    <p v-else-if="categories.length === 0">Aucun hardware disponible.</p>
    <div 
        v-for="cat in categories" 
        :key=cat.id
        @click="ouvrirCat(cat.id)">
        <strong>Nom : {{cat.name }}</strong>
        
    </div>
    </div>

</template>