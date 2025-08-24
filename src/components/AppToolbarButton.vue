<template>
  <button
      class="p-2 rounded-xl bg-white shadow hover:bg-yellow-50 relative"
      @click="$emit('click')"
  >
    <span>{{ icon }}</span>
    <div
        v-if="tooltip"
        class="absolute top-full mt-1 left-1/2 -translate-x-1/2
             bg-gray-800 text-white text-xs rounded p-1"
    >
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