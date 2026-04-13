const EARTH_RADIUS_KM = 6371

function toRadians(value) {
  return (value * Math.PI) / 180
}

export function distanceKm(pointA, pointB) {
  const [lng1, lat1] = pointA
  const [lng2, lat2] = pointB

  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

export function totalDistanceKm(path) {
  if (!Array.isArray(path) || path.length < 2) return 0

  let total = 0

  for (let i = 1; i < path.length; i += 1) {
    total += distanceKm(path[i - 1], path[i])
  }

  return total
}

export function getCumulativeDistances(path) {
  if (!Array.isArray(path) || path.length === 0) return [0]

  const cumulative = [0]

  for (let i = 1; i < path.length; i += 1) {
    cumulative.push(cumulative[i - 1] + distanceKm(path[i - 1], path[i]))
  }

  return cumulative
}

export function findNearestPointIndex(path, target) {
  if (!Array.isArray(path) || path.length === 0 || !Array.isArray(target)) {
    return 0
  }

  let nearestIndex = 0
  let nearestDistance = Infinity

  for (let i = 0; i < path.length; i += 1) {
    const dist = distanceKm(path[i], target)

    if (dist < nearestDistance) {
      nearestDistance = dist
      nearestIndex = i
    }
  }

  return nearestIndex
}

export function getNearestPointInfo(path, target) {
  if (!Array.isArray(path) || path.length === 0 || !Array.isArray(target)) {
    return {
      index: 0,
      distanceKm: Infinity,
    }
  }

  let nearestIndex = 0
  let nearestDistance = Infinity

  for (let i = 0; i < path.length; i += 1) {
    const dist = distanceKm(path[i], target)

    if (dist < nearestDistance) {
      nearestDistance = dist
      nearestIndex = i
    }
  }

  return {
    index: nearestIndex,
    distanceKm: nearestDistance,
  }
}

export function clampPercent(value) {
  return Math.max(0, Math.min(100, value))
}