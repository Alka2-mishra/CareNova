const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const apiFetch = async (path, getToken, options = {}) => {
  const token = await getToken({ template: undefined })
  console.log('[API] token preview:', token?.slice(0, 30))

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  const text = await res.text()
  console.log(`[API] ${path} → ${res.status}:`, text.slice(0, 200))

  if (!res.ok) {
    let err = {}
    try { err = JSON.parse(text) } catch {}
    throw new Error(`${res.status}: ${err.error || text || 'Request failed'}`)
  }

  return JSON.parse(text)
}
