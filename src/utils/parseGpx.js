import { gpx } from '@tmcw/togeojson'

export async function loadRouteFromGpx() {
  const response = await fetch('/route.gpx')
  const text = await response.text()

  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'application/xml')

  const geojson = gpx(xml)

  const coordinates =
    geojson.features[0].geometry.coordinates.map(([lng, lat]) => [lng, lat])

  return coordinates
}