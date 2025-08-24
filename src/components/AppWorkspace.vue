<template>
  <div class="workspace">
    <div class="flat" ref="flatRef"></div>
    <svg
        v-if="showSun"
        ref="svgRef"
        class="sun"
        :width="svgSize"
        :height="svgSize"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        :style="{
        left: `${flatBox.left + flatBox.width / 2 - svgSize / 2}px`,
        top: `${flatBox.top + flatBox.height / 2 - svgSize / 2}px`,
      }"
    >
      <!-- Круг -->
      <circle
          v-if="circleVisible"
          :cx="center.x"
          :cy="center.y"
          :r="radius"
          stroke="blue"
          fill="none"
      />

      <!-- Засечка (север) -->
      <line
          v-if="circleVisible"
          :x1="center.x"
          :y1="center.y"
          :x2="center.x + radius * Math.cos(angle)"
          :y2="center.y - radius * Math.sin(angle)"
          stroke="red"
          stroke-width="2"
      />

      <!-- Дуга солнца -->
      <path
          v-if="circleVisible && sunArc"
          :d="sunArc"
          stroke="orange"
          fill="none"
          stroke-width="2"
      />

      <!-- Точки -->
      <circle
          v-for="(pt, idx) in sunPoints"
          :key="idx"
          :cx="pt.x"
          :cy="pt.y"
          r="5"
          fill="orange"
      />
      <text
          v-for="(pt, idx) in sunPoints"
          :key="'text-' + idx"
          :x="pt.x + 10"
          :y="pt.y - 10"
          font-size="12"
          fill="black"
      >
        {{ ['Закат', 'Зенит', 'Рассвет'][idx] }}
      </text>
    </svg>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue"
import { createTimeOfInterest } from "astronomy-bundle/time"
import { createSun } from "astronomy-bundle/sun"
import { createLocation } from "astronomy-bundle/earth"

const props = defineProps({
  season: {
    type: String,
    required: true,
    validator: (v) => ["spring", "summer", "autumn", "winter"].includes(v),
  },
  showSun: { type: Boolean, required: true },
})

const flatRef = ref(null)
const flatBox = reactive({ left: 0, top: 0, width: 0, height: 0 })

// после монтирования вычисляем позицию блока .flat
onMounted(() => {
  const rect = flatRef.value.getBoundingClientRect()
  flatBox.left = rect.left + window.scrollX - 10
  flatBox.top = rect.top + window.scrollY
  flatBox.width = rect.width
  flatBox.height = rect.height
})

const radius = ref(300)
const svgSize = computed(() => radius.value * 2 + 50) // +50 запас
const center = computed(() => ({ x: svgSize.value / 2, y: svgSize.value / 2 }))
const angle = ref(Math.PI / 2) // север вверх
const circleVisible = true

// Drag
let dragging = false
let dragMode = null
function onMouseDown(e) {
  dragging = true
  const dx = e.offsetX - center.value.x
  const dy = e.offsetY - center.value.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  dragMode = Math.abs(dist - radius.value) < 10 ? "radius" : "angle"
}
function onMouseMove(e) {
  if (!dragging) return
  const dx = e.offsetX - center.value.x
  const dy = e.offsetY - center.value.y
  if (dragMode === "radius") {
    radius.value = Math.sqrt(dx * dx + dy * dy)
  } else if (dragMode === "angle") {
    angle.value = Math.atan2(-dy, dx)
  }
}
function onMouseUp() {
  dragging = false
  dragMode = null
}

// Sun
const location = createLocation(55.75, 37.62, 200)
const sunPoints = ref([])
const sunArc = ref(null)

async function updateSun() {
  const dateBySeason = {
    spring: new Date("2024-03-21T12:00:00Z"),
    summer: new Date("2024-06-21T12:00:00Z"),
    autumn: new Date("2024-09-21T12:00:00Z"),
    winter: new Date("2024-12-21T12:00:00Z"),
  }
  const date = dateBySeason[props.season] || new Date()
  const toi0 = createTimeOfInterest.fromDate(date)
  const sun0 = createSun(toi0)

  const toiRise = await sun0.getRise(location)
  const toiTransit = await sun0.getTransit(location)
  const toiSet = await sun0.getSet(location)

  const coords = []
  for (const toi of [toiRise, toiTransit, toiSet]) {
    const sunAtTime = createSun(toi)
    const { azimuth } = await sunAtTime.getApparentTopocentricHorizontalCoordinates(location)
    const az = (azimuth * Math.PI) / 180
    const r = radius.value
    const x = center.value.x + r * Math.cos(az + angle.value)
    const y = center.value.y - r * Math.sin(az + angle.value)
    coords.push({ x, y })
  }

  sunPoints.value = coords
  if (coords.length === 3) {
    const [a, b, c] = coords
    sunArc.value = `M ${a.x} ${a.y} Q ${b.x} ${b.y} ${c.x} ${c.y}`
  }
}

watch(() => props.season, updateSun, { immediate: true })
watch(radius, updateSun)
watch(angle, updateSun)
</script>

<style scoped>
.workspace {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
}
.flat {
  background: #ccc;
  width: 400px;
  height: 300px;
}
.sun {
  position: absolute;
}
</style>