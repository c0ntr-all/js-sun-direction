<template>
  <div class="workspace">
    <div class="flat" ref="flatRef" :style="`width:${flatWidth}px; height:${flatHeight}px`">
      <img alt="Vue logo" src="../assets/flat.webp">
    </div>
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
          left: sunCircleLeft,
          top: sunCircleTop,
        }"
    >
      <!-- Base Circle -->
      <circle
          v-if="circleVisible"
          :cx="center.x"
          :cy="center.y"
          :r="radius"
          stroke="blue"
          fill="none"
      />

      <!-- Serif (north) -->
      <line
          v-if="circleVisible"
          :x1="center.x"
          :y1="center.y"
          :x2="center.x + radius * Math.cos(angle)"
          :y2="center.y - radius * Math.sin(angle)"
          stroke="red"
          stroke-width="2"
      />

      <!-- Sun Arc -->
      <path
          v-if="circleVisible && sunArc"
          :d="sunArc"
          stroke="orange"
          fill="none"
          stroke-width="2"
      />

      <!-- Points -->
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
        {{ ['Sunset', 'Zenith', 'Sunrise'][idx] }}
      </text>
    </svg>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue"
import { createTimeOfInterest } from "astronomy-bundle/time"
import { createSun } from "astronomy-bundle/sun"
import { createLocation } from "astronomy-bundle/earth"

defineProps({
  showSun: { type: Boolean, required: true }
})
const season = defineModel('season', {
  type: String,
  required: true,
  default: 'autumn',
  validator: (v) => ["spring", "summer", "autumn", "winter"].includes(v),
})
const flatWidth = defineModel('flatWidth')
const flatHeight = defineModel('flatHeight')
const sunCircleOffset = defineModel('sunCircleOffset', {
  type: Number,
  required: true,
  default: 0
})

const sunCircleLeft = computed(() => `${(flatBox.left + flatBox.width / 2 - svgSize.value / 2) + sunCircleOffset.value}px`)
const sunCircleTop = computed(() =>`${(flatBox.top + flatBox.height / 2 - svgSize.value / 2) + sunCircleOffset.value}px`)

const flatRef = ref(null)
const flatBox = reactive({ left: 0, top: 0, width: 0, height: 0 })

// Receive data on the block position .flat
onMounted(() => {
  const rect = flatRef.value.getBoundingClientRect()
  flatBox.left = rect.left + window.scrollX - 10
  flatBox.top = rect.top + window.scrollY
  flatBox.width = rect.width
  flatBox.height = rect.height
})

const radius = ref(300)
const svgSize = computed(() => radius.value * 2 + 50) // Запас
const center = computed(() => ({ x: svgSize.value / 2, y: svgSize.value / 2 }))
const angle = ref(Math.PI / 2) // север вверх
const circleVisible = true

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

const location = createLocation(55.75, 37.62, 200)
const sunPoints = ref([])
const sunArc = ref(null)

async function updateSun() {
  const dateBySeason = {
    spring: new Date("2025-03-21T12:00:00Z"),
    summer: new Date("2025-06-21T12:00:00Z"),
    autumn: new Date("2025-09-21T12:00:00Z"),
    winter: new Date("2025-12-21T12:00:00Z"),
  }

  const date = dateBySeason[season.value] || new Date()
  const toi0 = createTimeOfInterest.fromDate(date)
  const sun0 = createSun(toi0)

  const toiRise = await sun0.getRise(location)
  const toiSet = await sun0.getSet(location)

  const start = toiRise.getDate()
  const end = toiSet.getDate()
  const stepMinutes = 10

  const coords = []
  for (
      let t = new Date(start);
      t <= end;
      t.setMinutes(t.getMinutes() + stepMinutes)
  ) {
    const toi = createTimeOfInterest.fromDate(new Date(t))
    const sunAtTime = createSun(toi)
    const { azimuth, altitude } =
        await sunAtTime.getApparentTopocentricHorizontalCoordinates(location)

    // Conversion to radians
    const az = (azimuth * Math.PI) / 180
    const alt = (altitude * Math.PI) / 180

    // The higher the sun, the closer to the center
    const r = radius.value * (1 - alt / (Math.PI / 2))

    const x = center.value.x + r * Math.cos(az + angle.value)
    const y = center.value.y - r * Math.sin(az + angle.value)

    coords.push({ x, y })
  }

  sunPoints.value = [coords[0], coords[Math.floor(coords.length / 2)], coords.at(-1)]

  // Arc path
  if (coords.length > 1) {
    sunArc.value =
        "M " +
        coords.map((pt) => `${pt.x} ${pt.y}`).join(" L ")
  }
}

watch(season, updateSun, { immediate: true })
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
  position: relative;
  background: #ccc;
}
.flat img {
  width: 100%;
}
.sun {
  position: absolute;
}
</style>