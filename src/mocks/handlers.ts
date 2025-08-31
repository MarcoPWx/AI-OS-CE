import { http, HttpResponse, delay, passthrough } from 'msw'

// Utilities to read mock control headers
function readDelay(req: Request) {
  const h = (req.headers as any) as Headers
  const ms = Number(h.get('x-mock-delay') || '0')
  return Number.isFinite(ms) ? ms : 0
}
function readErrorRate(req: Request) {
  const h = (req.headers as any) as Headers
  const rate = Number(h.get('x-mock-error-rate') || '0')
  return rate >= 0 && rate <= 1 ? rate : 0
}
function maybeFail(rate: number) {
  return Math.random() < rate
}

// In-memory stores for template endpoints
let tmplTodos = [
  { id: 't-1', title: 'Read docs', done: false },
  { id: 't-2', title: 'Build feature', done: true },
]
let tmplUsers = [
  { id: 'u-1', name: 'Alice', role: 'admin' },
  { id: 'u-2', name: 'Bob', role: 'editor' },
  { id: 'u-3', name: 'Carol', role: 'viewer' },
]

// Generate a larger pool for pagination demo
const roles = ['admin', 'editor', 'viewer']
const tmplAllUsers = Array.from({ length: 103 }).map((_, i) => ({
  id: `U-${i + 1}`,
  name: `User ${String(i + 1).padStart(3, '0')}`,
  role: roles[i % roles.length],
}))

// Posts for optimistic updates
let tmplPosts = [
  { id: 'p-1', title: 'Hello World', likes: 1, liked: false },
  { id: 'p-2', title: 'AIBook Rocks', likes: 5, liked: true },
  { id: 'p-3', title: 'Mock-first FTW', likes: 2, liked: false },
]

export const MOCK_ROUTES = [
  { method: 'GET', path: '/api/ping', note: 'Ping health' },
  { method: 'POST', path: '/api/echo', note: 'Echo back body' },
  { method: 'PUT', path: '/api/echo', note: 'Echo back body (PUT)' },
  { method: 'GET', path: '/api/items', note: 'Items list' },
  { method: 'GET', path: '/api/items/:id', note: 'Item detail' },
  { method: 'GET', path: '/api/templates/todos', note: 'Todos list' },
  { method: 'POST', path: '/api/templates/todos', note: 'Create todo' },
  { method: 'PUT', path: '/api/templates/todos/:id', note: 'Update todo' },
  { method: 'DELETE', path: '/api/templates/todos/:id', note: 'Delete todo' },
  { method: 'GET', path: '/api/templates/random', note: 'Random value' },
  { method: 'GET', path: '/api/templates/users', note: 'Users list' },
  { method: 'GET', path: '/api/templates/search', note: 'Search users' },
  { method: 'GET', path: '/api/templates/users-paged', note: 'Paged users' },
  { method: 'GET', path: '/api/templates/posts', note: 'Posts list' },
  { method: 'POST', path: '/api/templates/posts/:id/like', note: 'Like/unlike post' },
  { method: 'GET', path: '/api/notifications', note: 'Notifications' },
]

export const handlers = [
  // Allow bypass when the x-mock-disable header is present (MSW off)
  http.all('*', async ({ request }) => {
    const disabled = ((request.headers as any) as Headers).get('x-mock-disable') === '1'
    if (disabled) return passthrough()
    return undefined as any
  }),
  // Simple ping endpoint
  http.get('/api/ping', async ({ request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) {
      return HttpResponse.json({ error: 'Injected error (ping)' }, { status: 429 })
    }
    return HttpResponse.json({ ok: true, time: new Date().toISOString() })
  }),

  // Echo endpoint (POST/PUT supported)
  http.post('/api/echo', async ({ request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) {
      return HttpResponse.json({ error: 'Injected error (echo)' }, { status: 503 })
    }
    const body = await request.json().catch(() => null)
    return HttpResponse.json({ received: body, headers: Object.fromEntries((request.headers as any).entries?.() || []) })
  }),
  http.put('/api/echo', async ({ request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) {
      return HttpResponse.json({ error: 'Injected error (echo)' }, { status: 500 })
    }
    const body = await request.json().catch(() => null)
    return HttpResponse.json({ received: body, method: 'PUT' })
  }),

  // Items endpoint for list/detail demo
  http.get('/api/items', async ({ request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) {
      return HttpResponse.json({ error: 'Injected error (items)' }, { status: 500 })
    }
    return HttpResponse.json({
      items: [
        { id: 'a1', name: 'Alpha', updatedAt: new Date(Date.now() - 1000 * 60).toISOString() },
        { id: 'b2', name: 'Beta', updatedAt: new Date(Date.now() - 1000 * 120).toISOString() },
        { id: 'c3', name: 'Gamma', updatedAt: new Date().toISOString() },
      ],
    })
  }),
  http.get('/api/items/:id', async ({ params, request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) {
      return HttpResponse.json({ error: 'Injected error (item)' }, { status: 404 })
    }
    const { id } = params as { id: string }
    return HttpResponse.json({ id, name: `Item ${id.toUpperCase()}`, updatedAt: new Date().toISOString() })
  }),

  // Templates: CRUD (todos)
  http.get('/api/templates/todos', async ({ request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) return HttpResponse.json({ error: 'Injected error (todos)' }, { status: 500 })
    return HttpResponse.json({ todos: tmplTodos })
  }),
  http.post('/api/templates/todos', async ({ request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) return HttpResponse.json({ error: 'Injected error (todos create)' }, { status: 500 })
    const body = (await request.json().catch(() => ({}))) as any
    const id = `t-${Math.random().toString(36).slice(2, 7)}`
    const todo = { id, title: String(body?.title || 'Untitled'), done: false }
    tmplTodos = [...tmplTodos, todo]
    return HttpResponse.json(todo, { status: 201 })
  }),
  http.put('/api/templates/todos/:id', async ({ params, request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) return HttpResponse.json({ error: 'Injected error (todos update)' }, { status: 500 })
    const { id } = params as { id: string }
    const body = (await request.json().catch(() => ({}))) as any
    tmplTodos = tmplTodos.map(t => (t.id === id ? { ...t, ...body } : t))
    const updated = tmplTodos.find(t => t.id === id)
    return HttpResponse.json(updated || { error: 'Not found' }, { status: updated ? 200 : 404 })
  }),
  http.delete('/api/templates/todos/:id', async ({ params, request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) return HttpResponse.json({ error: 'Injected error (todos delete)' }, { status: 500 })
    const { id } = params as { id: string }
    tmplTodos = tmplTodos.filter(t => t.id !== id)
    return HttpResponse.json({ ok: true })
  }),

  // Templates: Fetch (random value)
  http.get('/api/templates/random', async ({ request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) return HttpResponse.json({ error: 'Injected error (random)' }, { status: 503 })
    const value = Math.random().toString(36).slice(2, 8)
    return HttpResponse.json({ value, time: new Date().toISOString() })
  }),

  // Templates: Table (users)
  http.get('/api/templates/users', async ({ request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) return HttpResponse.json({ error: 'Injected error (users)' }, { status: 500 })
    return HttpResponse.json({ users: tmplUsers })
  }),

  // Templates: Debounced search (users)
  http.get('/api/templates/search', async ({ request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) return HttpResponse.json({ error: 'Injected error (search)' }, { status: 500 })
    const q = new URL(request.url).searchParams.get('q')?.toLowerCase() || ''
    const users = tmplAllUsers.filter(u => u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)).slice(0, 20)
    return HttpResponse.json({ users })
  }),

  // Templates: Paged users
  http.get('/api/templates/users-paged', async ({ request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) return HttpResponse.json({ error: 'Injected error (users-paged)' }, { status: 500 })
    const u = new URL(request.url)
    const page = Math.max(1, Number(u.searchParams.get('page') || '1'))
    const pageSize = Math.max(1, Math.min(50, Number(u.searchParams.get('pageSize') || '10')))
    const sort = (u.searchParams.get('sort') || 'asc').toLowerCase()
    const start = (page - 1) * pageSize
    const sorted = [...tmplAllUsers].sort((a, b) => sort === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
    const users = sorted.slice(start, start + pageSize)
    return HttpResponse.json({ total: tmplAllUsers.length, page, pageSize, users })
  }),

  // Templates: Posts (optimistic like)
  http.get('/api/templates/posts', async ({ request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) return HttpResponse.json({ error: 'Injected error (posts)' }, { status: 500 })
    return HttpResponse.json({ posts: tmplPosts })
  }),
  http.post('/api/templates/posts/:id/like', async ({ params, request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) return HttpResponse.json({ error: 'Injected error (like)' }, { status: 500 })
    const { id } = params as { id: string }
    tmplPosts = tmplPosts.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)
    const updated = tmplPosts.find(p => p.id === id)
    return HttpResponse.json(updated || { error: 'Not found' }, { status: updated ? 200 : 404 })
  }),

  // Notifications for Lab 01
  http.get('/api/notifications', async ({ request }) => {
    const d = readDelay(request)
    const er = readErrorRate(request)
    if (d) await delay(d)
    if (maybeFail(er)) return HttpResponse.json({ error: 'Injected error (notifications)' }, { status: 500 })
    return HttpResponse.json({
      notifications: [
        { id: 'n-1', title: 'Build complete', read: false },
        { id: 'n-2', title: 'New comment on PR', read: false },
        { id: 'n-3', title: 'Deployment failed (staging)', read: true },
      ],
    })
  }),
]

