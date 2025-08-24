<template>
  <div class="h-screen flex flex-col">
    <AppToolbar
        :season="season"
        @changeSeason="season = $event"
        @addSun="showSun = true"
    />
    <AppWorkspace
        v-if="showSun"
        :season="season"
    />
  </div>
</template>

<script setup>
import { ref } from "vue"
import AppToolbar from "./components/AppToolbar.vue"
import AppWorkspace from "./components/AppWorkspace.vue"

const season = ref("summer") // по умолчанию лето
const showSun = ref(false)
</script>