<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import teamMarkerImage from '@/assets/images/team-marker.png'

const props = defineProps({
  tabData: {
    type: Object,
    required: true,
  },
  liveCoords: {
    type: Array,
    default: () => [],
  },
  liveVisible: {
    type: Boolean,
    default: true,
  },
  mapStyle: {
    type: String,
    default: 'roads',
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

function getStyleUrl() {
  if (props.mapStyle === 'satellite') {
    return 'https://tiles.stadiamaps.com/styles/alidade_satellite.json'
  }

  return 'https://tiles.stadiamaps.com/styles/alidade_smooth.json'
}

function createPin(label, type = 'default') {
  const el = document.createElement('div')
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
  const wrapper = document.createElement('div')
  wrapper.style.width = '64px'
  wrapper.style.height = '64px'
  wrapper.style.display = 'flex'
  wrapper.style.alignItems = 'center'
  wrapper.style.justifyContent = 'center'

  const img = document.createElement('img')
  img.src = teamMarkerImage
  img.alt = 'Team location'
  img.style.width = '64px'
  img.style.height = '64px'
  img.style.objectFit = 'cover'
  img.style.borderRadius = '999px'
  img.style.border = '3px solid white'
  img.style.boxShadow = '0 10px 24px rgba(0,0,0,0.25)'
  img.style.background = 'white'
  img.draggable = false

  wrapper.appendChild(img)
  return wrapper
}

function fitMapToPath(path) {
  if (!map || !path?.length) return

  const bounds = new maplibregl.LngLatBounds(path[0], path[0])
  path.forEach((coord) => bounds.extend(coord))

  map.fitBounds(bounds, {
    padding: { top: 180, right: 40, bottom: 180, left: 40 },
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
    liveMarker = new maplibregl.Marker({
      element: createLiveFaceMarker(),
      anchor: 'center',
    })
      .setLngLat(props.liveCoords)
      .setPopup(new maplibregl.Popup({ offset: 18 }).setText('Team location'))
      .addTo(map)
  } else {
    liveMarker.setLngLat(props.liveCoords)
  }
}

function destroyMap() {
  if (map) {
    map.remove()
    map = null
  }

  startMarker = null
  midpointMarker = null
  endMarker = null
  liveMarker = null
}

function initialiseMap() {
  destroyMap()

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: getStyleUrl(),
    center: props.tabData.start.coords,
    zoom: 11,
  })

  map.addControl(new maplibregl.NavigationControl(), 'top-right')

  map.on('load', () => {
    updateRoute()
    updateLiveMarker()
  })
}

onMounted(() => {
  initialiseMap()
})

watch(
  () => props.tabData,
  () => {
    if (!map || !map.isStyleLoaded()) return
    updateRoute()
    updateLiveMarker()
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

watch(
  () => props.mapStyle,
  () => {
    initialiseMap()
  }
)

onBeforeUnmount(() => {
  destroyMap()
})
</script>

<template>
  <div class="relative h-full w-full">
    <div ref="mapContainer" class="h-full w-full"></div>
  </div>
</template>