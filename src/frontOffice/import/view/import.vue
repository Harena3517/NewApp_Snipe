<script setup>
import { ref, onMounted } from "vue"
import Papa from "papaparse"
import { usepresentationStore } from "../../presentation/store/presentationStore"

const store = usepresentationStore()

const file = ref(null)
const preview = ref([])
const message = ref("")

onMounted(async () => {
  await store.loadAsset()
  await store.loadTickets()
})

const choisir = (e) => {
  file.value = e.target.files[0]
  if (!file.value) return
  Papa.parse(file.value, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      preview.value = result.data
      console.log("CSV :", preview.value)
    }
  })
}
const importer = async () => {
  if (preview.value.length === 0) {
    alert("Aucune donnée")
    return
  }
  for (const row of preview.value) {
    const ticket = store.ticks.find(
      t =>
      Number(t.num_ticket) ===
      Number(row.num_ticket)
    )

    if (!ticket) {
      console.log(
        "Ticket introuvable",
        row.num_ticket
      )
      continue
    }

    const mvt =
      row.mvt?.toLowerCase().trim()

    if (
      mvt === "closed" ||
      mvt === "close"
    ) {

      await store.fermerTicket(
        ticket,
        Number(row.montant)
      )
    }

    else if (
      mvt === "open" ||
      mvt === "reouverture"
    ) {

      await store.reouvrirTicket(
        ticket,
        Number(row.montant)
      )
    }

    else if (
      mvt === "cancel" ||
      mvt === "annule"
    ) {

      await store.annulerFermeture(
        ticket
      )
    }
  }

  await store.loadTickets()

  message.value =
    "Import terminé : " +
    preview.value.length +
    " ligne(s)"
}
</script>

<template>

  <div>

    <h2>Import Ticket MVT</h2>

    <input
      type="file"
      accept=".csv"
      @change="choisir"
    >

    <button @click="importer">
      Importer
    </button>

    <p v-if="message">
      {{ message }}
    </p>

    <table
      border="1"
      v-if="preview.length > 0"
    >

      <thead>
        <tr>
          <th>Num Ticket</th>
          <th>MVT</th>
          <th>Montant</th>
        </tr>
      </thead>

      <tbody>

        <tr
          v-for="(row,index) in preview"
          :key="index"
        >
          <td>{{ row.num_ticket }}</td>
          <td>{{ row.mvt }}</td>
          <td>{{ row.montant }}</td>
        </tr>

      </tbody>

    </table>

  </div>

</template>
```
