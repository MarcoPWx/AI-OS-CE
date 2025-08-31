import React from 'react'

type Epic = {
  id: string
  title: string
  status: 'proposed' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  owner?: string
  eta?: string
  risk?: 'low' | 'medium' | 'high'
}

const seed: Epic[] = [
  { id: 'e-1', title: 'Auth Revamp', status: 'in-progress', priority: 'high', owner: 'alice', eta: '2025-09-15', risk: 'medium' },
  { id: 'e-2', title: 'Docs Overhaul', status: 'proposed', priority: 'medium', owner: 'bob', risk: 'low' },
  { id: 'e-3', title: 'Playwright Smoke', status: 'done', priority: 'low', owner: 'ci' },
]

export default function EpicManager() {
  const [epics, setEpics] = React.useState<Epic[]>(seed)
  const [filterStatus, setFilterStatus] = React.useState<'all' | Epic['status']>('all')
  const [filterPriority, setFilterPriority] = React.useState<'all' | Epic['priority']>('all')
  const [q, setQ] = React.useState('')

  const [form, setForm] = React.useState<Partial<Epic>>({ title: '', status: 'proposed', priority: 'medium' })
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const list = epics.filter((e) => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false
    if (filterPriority !== 'all' && e.priority !== filterPriority) return false
    if (q && !(`${e.title} ${e.owner || ''}`.toLowerCase().includes(q.toLowerCase()))) return false
    return true
  })

  function resetForm() {
    setForm({ title: '', status: 'proposed', priority: 'medium', owner: '', eta: '', risk: 'low' })
    setEditingId(null)
  }

  function onSubmit() {
    if (!form.title) return alert('Title is required')
    if (editingId) {
      setEpics((prev) => prev.map((e) => (e.id === editingId ? { ...e, ...(form as Epic) } : e)))
    } else {
      const id = `e-${Math.random().toString(36).slice(2, 7)}`
      const { id: _ignored, ...rest } = (form as Epic)
      setEpics((prev) => [...prev, { id, ...rest }])
    }
    resetForm()
  }

  function onEdit(e: Epic) {
    setEditingId(e.id)
    setForm(e)
  }

  function onDelete(id: string) {
    setEpics((prev) => prev.filter((e) => e.id !== id))
    if (editingId === id) resetForm()
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2>Epic Manager</h2>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input data-testid="search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <label>Status: {" "}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
            <option value="all">All</option>
            <option value="proposed">Proposed</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </label>
        <label>Priority: {" "}
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as any)}>
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      <div style={{ border: '1px solid #eaeaea', padding: 12, borderRadius: 8 }}>
        <h3>{editingId ? 'Edit Epic' : 'Create Epic'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <label>Title <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>Owner <input value={form.owner || ''} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></label>
          <label>Status {" "}
            <select value={form.status as any} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="proposed">Proposed</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label>Priority {" "}
            <select value={form.priority as any} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>ETA <input type="date" value={form.eta || ''} onChange={(e) => setForm({ ...form, eta: e.target.value })} /></label>
          <label>Risk {" "}
            <select value={form.risk as any} onChange={(e) => setForm({ ...form, risk: e.target.value as any })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={onSubmit}>{editingId ? 'Save' : 'Create'}</button>
          {editingId && <button onClick={resetForm}>Cancel</button>}
        </div>
      </div>

      <div>
        <h3>Epics ({list.length})</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {list.map((e) => (
            <div key={e.id} style={{ border: '1px solid #eaeaea', borderRadius: 8, padding: 8, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{e.title}</div>
                <div style={{ fontSize: 12, color: '#555' }}>#{e.id} • {e.status} • {e.priority} • {e.owner || 'unowned'} {e.eta ? `• eta ${e.eta}` : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => onEdit(e)}>Edit</button>
                <button onClick={() => onDelete(e.id)}>Delete</button>
              </div>
            </div>
          ))}
          {list.length === 0 && <div style={{ color: '#666' }}>No epics match your filters.</div>}
        </div>
      </div>
    </div>
  )
}

