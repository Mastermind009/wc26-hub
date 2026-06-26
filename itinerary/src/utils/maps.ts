export function mapsEmbedUrl(query: string, zoom = 11): string {
  const q = encodeURIComponent(query.replace(/\+/g, ' '))
  return `https://maps.google.com/maps?q=${q}&hl=en&z=${zoom}&output=embed`
}

export function mapsDirectionsUrl(query: string): string {
  return `https://www.google.com/maps/dir/?api=1&${query}`
}
