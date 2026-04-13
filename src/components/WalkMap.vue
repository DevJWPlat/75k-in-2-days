<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'

const props = defineProps({
  tabData: {
    type: Object,
    required: true,
  },
  liveCoords: {
    type: Array,
    default: () => [],
  },
})

const mapContainer = ref(null)

let map = null
let startMarker = null
let midpointMarker = null
let endMarker = null
let liveMarker = null

const sourceId = 'route-source'
const lineId = 'route-line'

function createPin(label, type = 'default') {
  const el = document.createElement('div')
  el.className = 'custom-marker'
  el.style.width = '18px'
  el.style.height = '18px'
  el.style.borderRadius = '999px'
  el.style.border = '3px solid white'
  el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'

  if (type === 'start') el.style.background = '#16a34a'
  else if (type === 'mid') el.style.background = '#f59e0b'
  else if (type === 'end') el.style.background = '#dc2626'
  else el.style.background = '#7c3aed'

  el.setAttribute('aria-label', label)
  return el
}

function createLiveFaceMarker() {
  const el = document.createElement('div')
  el.style.width = '52px'
  el.style.height = '52px'
  el.style.borderRadius = '999px'
  el.style.background = '#7c3aed'
  el.style.border = '3px solid white'
  el.style.boxShadow = '0 10px 24px rgba(0,0,0,0.25)'
  el.style.display = 'flex'
  el.style.alignItems = 'center'
  el.style.justifyContent = 'center'
  el.style.color = 'white'
  el.style.fontSize = '24px'
  el.style.fontWeight = '700'
  el.innerHTML = `<img src="/src/assets/images/team-marker.png" style="width:100%;height:100%;border-radius:999px;object-fit:cover;" />`
  return el
}

function fitMapToPath(path) {
  if (!map || !path?.length) return

  const bounds = new maplibregl.LngLatBounds(path[0], path[0])
  path.forEach((coord) => bounds.extend(coord))

  map.fitBounds(bounds, {
    padding: { top: 60, right: 30, bottom: 100, left: 30 },
    duration: 800,
  })
}

function updateRoute() {
  if (!map || !props.tabData?.path?.length) return

  const geojson = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: props.tabData.path,
    },
    properties: {},
  }

  const existingSource = map.getSource(sourceId)

  if (existingSource) {
    existingSource.setData(geojson)
  } else {
    map.addSource(sourceId, {
      type: 'geojson',
      data: geojson,
    })

    map.addLayer({
      id: lineId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#7c3aed',
        'line-width': 5,
      },
    })
  }

  if (startMarker) startMarker.remove()
  if (midpointMarker) midpointMarker.remove()
  if (endMarker) endMarker.remove()

  startMarker = new maplibregl.Marker({ element: createPin('Start', 'start') })
    .setLngLat(props.tabData.start.coords)
    .setPopup(new maplibregl.Popup({ offset: 16 }).setText(props.tabData.start.name))
    .addTo(map)

  if (props.tabData.midpoint) {
    midpointMarker = new maplibregl.Marker({ element: createPin('Midpoint', 'mid') })
      .setLngLat(props.tabData.midpoint.coords)
      .setPopup(new maplibregl.Popup({ offset: 16 }).setText(props.tabData.midpoint.name))
      .addTo(map)
  }

  endMarker = new maplibregl.Marker({ element: createPin('End', 'end') })
    .setLngLat(props.tabData.end.coords)
    .setPopup(new maplibregl.Popup({ offset: 16 }).setText(props.tabData.end.name))
    .addTo(map)

  fitMapToPath(props.tabData.path)
}

function updateLiveMarker() {
  if (!map || !props.liveCoords?.length) return

  if (!liveMarker) {
    liveMarker = new maplibregl.Marker({ element: createLiveFaceMarker() })
      .setLngLat(props.liveCoords)
      .setPopup(new maplibregl.Popup({ offset: 18 }).setText('Team location'))
      .addTo(map)
  } else {
    liveMarker.setLngLat(props.liveCoords)
  }
}

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json',
    center: props.tabData.start.coords,
    zoom: 11,
  })

  map.addControl(new maplibregl.NavigationControl(), 'top-right')

  map.on('load', () => {
    updateRoute()
    updateLiveMarker()
  })
})

watch(
  () => props.tabData,
  () => {
    if (!map || !map.isStyleLoaded()) return
    updateRoute()
  },
  { deep: true }
)

watch(
  () => props.liveCoords,
  () => {
    if (!map || !map.isStyleLoaded()) return
    updateLiveMarker()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="relative h-full w-full">
    <div ref="mapContainer" class="h-full w-full"></div>
  </div>
</template>
