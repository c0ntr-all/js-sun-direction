<template>
  <div class="app">
    <AppToolbar
        @addSun="showSun = true"
        v-model:season="season"
        v-model:flat-width="flatWidth"
        v-model:flat-height="flatHeight"
        v-model:sun-circle-offset="sunCircleOffset"
    />
    <AppWorkspace
        :show-sun="showSun"
        v-model:season="season"
        v-model:flat-width="flatWidth"
        v-model:flat-height="flatHeight"
        v-model:sun-circle-offset="sunCircleOffset"
    />
  </div>
</template>

<script setup>
import { ref } from "vue"
import AppToolbar from "./components/AppToolbar.vue"
import AppWorkspace from "./components/AppWorkspace.vue"

const showSun = ref(false)
const season = defineModel('season', {
  type: String,
  required: true,
  default: 'autumn',
  validator: (v) => ["spring", "summer", "autumn", "winter"].includes(v),
})
const flatWidth = defineModel('flatWidth', {
  type: Number,
  required: true,
  default: 400
})
const flatHeight = defineModel('flatHeight', {
  type: Number,
  required: true,
  default: 300
})
const sunCircleOffset = defineModel('sunCircleOffset', {
  type: Number,
  required: true,
  default: 1
})
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}
</style>