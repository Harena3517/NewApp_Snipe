<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import NavbarFront from "./frontOffice/components/NavbarFront.vue"
import NavbarBack from "./backOffice/components/NavbarBack.vue"

const route = useRoute()

const isBackoffice = computed(() =>
  ["/dash", "/import", "/reset", "/tickets" , "/setting"].includes(route.path) ||
  route.path.startsWith("/tickets/")
)

const isLogin = computed(() => route.path === "/login")
</script>

<template>
  <NavbarBack v-if="isBackoffice" />
  <NavbarFront v-else-if="!isLogin" />
  <RouterView />
</template>