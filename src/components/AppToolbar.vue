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
            v-model="season"
            :checked="season === s.value"
        />
        {{ s.label }}
      </label>
    </div>
    <div>
      <input
          type="number"
          name="flatWidth"
          v-model="flatWidth"
      />
      <input
          type="number"
          name="flatHeight"
          v-model="flatHeight"
      />
    </div>
    <div>
      <input
          type="number"
          name="sunCircleOffset"
          v-model="sunCircleOffset"
      />
    </div>
    <div></div>
  </div>
</template>

<script setup>
import ToolbarButton from "./AppToolbarButton.vue"

const season = defineModel('season')
const flatWidth = defineModel('flatWidth')
const flatHeight = defineModel('flatHeight')
const sunCircleOffset = defineModel('sunCircleOffset')

defineEmits(["addSun"])

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