<template>
  <div class="flex-1 flex justify-center items-center bg-gray-50">
    <svg
        ref="svgRef"
        :width="800"
        :height="600"
        class="border"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
    >
      <!-- Планировка квартиры -->
      <rect x="200" y="150" width="400" height="300" fill="#eee" stroke="#aaa" />

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

      <!-- Точки: рассвет, пик, закат -->
      <circle
          v-for="(pt, idx) in sunPoints"
          :key="idx"
          :cx="pt.x"
          :cy="pt.y"
          r="5"
          fill="orange"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { createTimeOfInterest } from "astronomy-bundle/time"
import { createSun } from "astronomy-bundle/sun"
import { createLocation } from "astronomy-bundle/earth"

/**
 * @typedef {'spring' | 'summer' | 'autumn' | 'winter'} Season
 */

/**
 * @props {Object} props
 * @props {Season} props.season - Текущий сезон
 */
const props = defineProps({
  season: {
    type: String,
    required: true,
    validator: /** @param {string} value */ (value) => {
      return ['spring', 'summer', 'autumn', 'winter'].includes(value)
    }
  }
})

/** @type {import('vue').Ref<SVGSVGElement|null>} */
const svgRef = ref(null)

const center = { x: 400, y: 300 }
const radiusStart = 150
/** @type {import('vue').Ref<number>} */
const radius = ref(radiusStart)
/** @type {import('vue').Ref<number>} */
const angle = ref(Math.PI / 2) // север вверх
const circleVisible = true

// Drag handling
/** @type {boolean} */
let dragging = false
/** @type {'radius' | 'angle' | null} */
let dragMode = null

/**
 * Обработчик нажатия мыши
 * @param {MouseEvent} e - Событие мыши
 */
function onMouseDown(e) {
  dragging = true
  const dx = e.offsetX - center.x
  const dy = e.offsetY - center.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (Math.abs(dist - radius.value) < 10) {
    dragMode = "radius"
  } else {
    dragMode = "angle"
  }
}

/**
 * Обработчик движения мыши
 * @param {MouseEvent} e - Событие мыши
 */
function onMouseMove(e) {
  if (!dragging) return
  const dx = e.offsetX - center.x
  const dy = e.offsetY - center.y
  if (dragMode === "radius") {
    radius.value = Math.sqrt(dx * dx + dy * dy)
  } else if (dragMode === "angle") {
    angle.value = Math.atan2(-dy, dx)
  }
}

/** Обработчик отпускания мыши */
function onMouseUp() {
  dragging = false
  dragMode = null
}

// Sun calculation
const latitude = 55.75
const longitude = 37.62
const elevation = 200
const location = createLocation(latitude, longitude, elevation)

/** @type {import('vue').Ref<Array<{x: number, y: number}>>} */
const sunPoints = ref([])
/** @type {import('vue').Ref<string|null>} */
const sunArc = ref(null)

/** Обновление позиций солнца */
async function updateSun() {
  /** @type {Object<string, Date>} */
  const dateBySeason = {
    spring: new Date("2024-03-21T12:00:00Z"),
    summer: new Date("2024-06-21T12:00:00Z"),
    autumn: new Date("2024-09-21T12:00:00Z"),
    winter: new Date("2024-12-21T12:00:00Z"),
  }

  const date = dateBySeason[props.season] || new Date()
  const toi0 = createTimeOfInterest.fromDate(date)
  const sun0 = createSun(toi0)

  // времена
  const toiRise = await sun0.getRise(location)
  const toiTransit = await sun0.getTransit(location)
  const toiSet = await sun0.getSet(location)

  // координаты (азимут, высота)
  /** @type {Array<{x: number, y: number}>} */
  const coords = []
  for (const toi of [toiRise, toiTransit, toiSet]) {
    const sunAtTime = createSun(toi)
    const { azimuth } = await sunAtTime.getApparentTopocentricHorizontalCoordinates(location)

    // переводим в радианы
    const az = (azimuth * Math.PI) / 180
    const r = radius.value
    const x = center.x + r * Math.cos(az - angle.value) // учёт ориентации дома
    const y = center.y - r * Math.sin(az - angle.value)

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