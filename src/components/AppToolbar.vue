<template>
  <div class="flex items-center gap-4 bg-gray-100 p-2 shadow">
    <ToolbarButton
        icon="☀️"
        tooltip="Добавить расположение солнца"
        @click="$emit('addSun')"
    />

    <div class="flex gap-2">
      <label v-for="s in seasons" :key="s.value" class="flex items-center gap-1">
        <input
            type="radio"
            name="season"
            :value="s.value"
            :checked="modelValue === s.value"
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
  modelValue: String,
  season: String,
})

defineEmits(["changeSeason", "addSun"])

const seasons = [
  { label: "Весна", value: "spring" },
  { label: "Лето", value: "summer" },
  { label: "Осень", value: "autumn" },
  { label: "Зима", value: "winter" },
]
</script>