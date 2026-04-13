import { gpx } from '@tmcw/togeojson'
import {
  findNearestPointIndex,
  getCumulativeDistances,
  totalDistanceKm,
} from '@/utils/routeMath'

function extractWaypointCoordinates(feature) {
  if (!feature || feature.geometry?.type !== 'Point') return null

  const [lng, lat] = feature.geometry.coordinates
  return [lng, lat]
}

function findNorthwichWaypoint(features) {
  return (
    features.find((feature) => {
      if (feature.geometry?.type !== 'Point') return false

      const name = String(feature.properties?.name || '').toLowerCase()
      return name.includes('northwich')
    }) || null
  )
}

function findTrackCoordinates(features) {
  const trackFeature =
    features.find((feature) => feature.geometry?.type === 'LineString') || null

  if (!trackFeature) {
    throw new Error('No GPX route line found')
  }

  return trackFeature.geometry.coordinates.map(([lng, lat]) => [lng, lat])
}

export async function loadRouteData() {
  const response = await fetch('/route.gpx')

  if (!response.ok) {
    throw new Error('Failed to load route.gpx')
  }

  const gpxText = await response.text()
  const xml = new DOMParser().parseFromString(gpxText, 'application/xml')
  const geojson = gpx(xml)
  const features = geojson.features || []

  const fullRoute = findTrackCoordinates(features)

  if (fullRoute.length < 2) {
    throw new Error('GPX route does not contain enough points')
  }

  const northwichWaypoint = findNorthwichWaypoint(features)

  if (!northwichWaypoint) {
    throw new Error('Could not find Northwich waypoint in GPX')
  }

  const northwichCoords = extractWaypointCoordinates(northwichWaypoint)

  if (!northwichCoords) {
    throw new Error('Northwich waypoint is invalid')
  }

  const splitIndex = findNearestPointIndex(fullRoute, northwichCoords)

  const dayOneRoute = fullRoute.slice(0, splitIndex + 1)
  const dayTwoRoute = fullRoute.slice(splitIndex)

  const overviewDistance = totalDistanceKm(fullRoute)
  const dayOneDistance = totalDistanceKm(dayOneRoute)
  const dayTwoDistance = totalDistanceKm(dayTwoRoute)

  return {
    overview: {
      id: 'overview',
      label: 'Overview',
      start: {
        name: 'Start',
        coords: fullRoute[0],
      },
      midpoint: {
        name: 'Northwich',
        coords: fullRoute[splitIndex],
      },
      end: {
        name: 'Finish',
        coords: fullRoute[fullRoute.length - 1],
      },
      path: fullRoute,
      totalKm: overviewDistance,
      cumulativeDistances: getCumulativeDistances(fullRoute),
    },

    dayOne: {
      id: 'dayOne',
      label: 'Day One',
      start: {
        name: 'Start',
        coords: dayOneRoute[0],
      },
      end: {
        name: 'Northwich',
        coords: dayOneRoute[dayOneRoute.length - 1],
      },
      path: dayOneRoute,
      totalKm: dayOneDistance,
      cumulativeDistances: getCumulativeDistances(dayOneRoute),
    },

    dayTwo: {
      id: 'dayTwo',
      label: 'Day Two',
      start: {
        name: 'Northwich',
        coords: dayTwoRoute[0],
      },
      end: {
        name: 'Finish',
        coords: dayTwoRoute[dayTwoRoute.length - 1],
      },
      path: dayTwoRoute,
      totalKm: dayTwoDistance,
      cumulativeDistances: getCumulativeDistances(dayTwoRoute),
    },
  }
}