<template>
  <div class="app">
    <AppToolbar
        :season="season"
        @changeSeason="season = $event"
        @addSun="showSun = true"
    />
    <AppWorkspace
        :show-sun="showSun"
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

<style>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}
</style>