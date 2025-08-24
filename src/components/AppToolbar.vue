<template>
  <div class="toolbar">
    <ToolbarButton
        icon="☀️"
        tooltip="Добавить расположение солнца"
        @click="$emit('addSun')"
    />

    <div>
      <label v-for="s in seasons" :key="s.value">
        <input
            type="radio"
            name="season"
            :value="s.value"
            :checked="season === s.value"
            @change="$emit('changeSeason', s.value)"
        />
        {{ s.label }}
      </label>
    </div>
  </div>
</template>

<script setup>
import ToolbarButton from "./AppToolbarButton.vue"

defineProps({
  season: String,
})

defineEmits(["changeSeason", "addSun"])

console.log()

const seasons = [
  { label: "Весна", value: "spring" },
  { label: "Лето", value: "summer" },
  { label: "Осень", value: "autumn" },
  { label: "Зима", value: "winter" },
]
</script>
<style>
.toolbar {
  position: absolute;
  z-index: 999;
}
</style>