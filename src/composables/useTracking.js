import { computed, onBeforeUnmount, ref } from 'vue'
import { API_BASE_URL } from '@/config'

const liveCoords = ref([-2.548, 53.496])
const trackingActive = ref(false)
const trackingError = ref('')
const lastUpdated = ref(null)
const pointerVisible = ref(true)

let watchId = null

async function postLocation(latitude, longitude, accuracy) {
  const response = await fetch(`${API_BASE_URL}/api/location`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latitude,
      longitude,
      accuracy,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to post location')
  }

  return response.json()
}

async function fetchServerLocationState() {
  const response = await fetch(`${API_BASE_URL}/api/location/latest`)
  const data = await response.json()

  if (data?.location) {
    pointerVisible.value = Boolean(data.location.is_visible)

    if (
      typeof data.location.latitude === 'number' &&
      typeof data.location.longitude === 'number'
    ) {
      liveCoords.value = [data.location.longitude, data.location.latitude]
    }

    if (data.location.updated_at) {
      lastUpdated.value = new Date(data.location.updated_at)
    }
  }

  return data
}

async function setPointerVisibility(visible) {
  const response = await fetch(`${API_BASE_URL}/api/location/visibility`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      visible,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to update pointer visibility')
  }

  const data = await response.json()
  pointerVisible.value = Boolean(data.isVisible)

  if (data.updatedAt) {
    lastUpdated.value = new Date(data.updatedAt)
  }

  return data
}

export function useTracking() {
  const hasLocation = computed(
    () => Array.isArray(liveCoords.value) && liveCoords.value.length === 2
  )

  function startTracking() {
    if (!('geolocation' in navigator)) {
      trackingError.value = 'Geolocation is not supported on this device.'
      return
    }

    trackingError.value = ''

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }

    watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        const accuracy = position.coords.accuracy

        liveCoords.value = [longitude, latitude]

        try {
          await postLocation(latitude, longitude, accuracy)
          trackingActive.value = true
          lastUpdated.value = new Date()
          trackingError.value = ''
        } catch (error) {
          trackingActive.value = false
          trackingError.value = 'Location found, but failed to sync to server.'
        }
      },
      (error) => {
        trackingActive.value = false

        if (error.code === error.PERMISSION_DENIED) {
          trackingError.value = 'Location permission was denied.'
          return
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          trackingError.value = 'Location information is unavailable.'
          return
        }

        if (error.code === error.TIMEOUT) {
          trackingError.value = 'Location request timed out.'
          return
        }

        trackingError.value = 'Unable to get your location.'
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    )
  }

  function stopTracking() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }

    trackingActive.value = false
  }

  onBeforeUnmount(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
  })

  return {
    liveCoords,
    trackingActive,
    trackingError,
    lastUpdated,
    hasLocation,
    pointerVisible,
    startTracking,
    stopTracking,
    fetchServerLocationState,
    setPointerVisibility,
  }
}