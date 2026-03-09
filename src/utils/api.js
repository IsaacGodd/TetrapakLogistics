/**
 * Cliente HTTP para la API REST del backend.
 * BASE_URL se configura en .env del frontend: VITE_API_URL=http://localhost:3001
 * En producción: VITE_API_URL=https://tu-backend.railway.app
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getToken() {
  return sessionStorage.getItem('tl_token')
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export const api = {
  get:    (path)         => request('GET',    path),
  post:   (path, body)   => request('POST',   path, body),
  put:    (path, body)   => request('PUT',    path, body),
  patch:  (path, body)   => request('PATCH',  path, body),
  delete: (path)         => request('DELETE', path),
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (email, password) => api.post('/api/auth/login', { email, password }),
  me:       ()                => api.get('/api/auth/me'),
  register: (data)            => api.post('/api/auth/register', data),
}

// ── Centros ───────────────────────────────────────────────────────────────────
export const centrosApi = {
  getAll:  ()         => api.get('/api/centros'),
  getById: (id)       => api.get(`/api/centros/${id}`),
  create:  (data)     => api.post('/api/centros', data),
  update:  (id, data) => api.put(`/api/centros/${id}`, data),
  remove:  (id)       => api.delete(`/api/centros/${id}`),
}

// ── Transportistas ────────────────────────────────────────────────────────────
export const transportistasApi = {
  getAll:  ()         => api.get('/api/transportistas'),
  getById: (id)       => api.get(`/api/transportistas/${id}`),
  create:  (data)     => api.post('/api/transportistas', data),
  update:  (id, data) => api.put(`/api/transportistas/${id}`, data),
  remove:  (id)       => api.delete(`/api/transportistas/${id}`),
}

// ── Viajes ────────────────────────────────────────────────────────────────────
export const viajesApi = {
  getAll:      (params = {})      => api.get('/api/viajes?' + new URLSearchParams(params)),
  getById:     (id)               => api.get(`/api/viajes/${id}`),
  create:      (data)             => api.post('/api/viajes', data),
  updateEstado:(id, estado)       => api.patch(`/api/viajes/${id}/estado`, { estado }),
  resumen:     ()                 => api.get('/api/viajes/stats/resumen'),
  llegada:     (viajeId, visitaId) => api.post(`/api/viajes/${viajeId}/visitas/${visitaId}/llegada`),
  salida:      (viajeId, visitaId) => api.post(`/api/viajes/${viajeId}/visitas/${visitaId}/salida`),
}
