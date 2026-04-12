import { computed, onBeforeUnmount, ref } from 'vue'

const liveCoords = ref([-2.548, 53.496])
const trackingActive = ref(false)
const trackingError = ref('')
const lastUpdated = ref(null)

let watchId = null

export function useTracking() {
  const hasLocation = computed(() => Array.isArray(liveCoords.value) && liveCoords.value.length === 2)

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
      (position) => {
        liveCoords.value = [
          position.coords.longitude,
          position.coords.latitude,
        ]
        trackingActive.value = true
        lastUpdated.value = new Date()
        trackingError.value = ''
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
    startTracking,
    stopTracking,
  }
}