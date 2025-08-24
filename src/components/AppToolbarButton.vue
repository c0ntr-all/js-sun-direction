<template>
  <button @click="$emit('click')">
    <span>{{ icon }}</span>
    <div v-if="tooltip">
      {{ tooltip }}
    </div>
  </button>
</template>

<script setup>
defineProps({
  icon: String,
  tooltip: String
})
defineEmits(["click"])
</script>