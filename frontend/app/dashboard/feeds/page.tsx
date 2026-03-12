'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import api from '@/lib/api'

interface ExternalFeed {
  id: string
  name: string
  url: string
  type: string
  interval: number
  active: boolean
  lastSyncAt: string | null
  lastCount: number
  createdAt: string
  createdBy?: { username: string }
}

interface Preview {
  counts: { ip: number; hash: number; domain: number; unknown: number; total: number }
  samples: { ip: string[]; hash: string[]; domain: string[] }
}

const TYPE_COLOR: Record<string, string> = {
  ip: 'text-[#00ff64] border-[rgba(0,255,100,0.3)] bg-[rgba(0,255,100,0.05)]',
  hash: 'text-[#00d4ff] border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.05)]',
  domain: 'text-[#a78bfa] border-[rgba(167,139,250,0.3)] bg-[rgba(167,139,250,0.05)]',
  mixed: 'text-[#fbbf24] border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.05)]',
}

const INTERVAL_OPTIONS = [
  { label: '1 hora', value: 60 },
  { label: '6 horas', value: 360 },
  { label: '12 horas', value: 720 },
  { label: '24 horas', value: 1440 },
]

function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-[#030a0e] border border-[rgba(255,50,50,0.3)] w-full max-w-sm p-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,50,50,0.5)] to-transparent" />
        <div className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(255,50,50,0.5)]" />
        <div className="absolute top-[-1px] right-[-1px] w-3 h-3 border-t-2 border-r-2 border-[rgba(255,50,50,0.5)]" />
        <div className="absolute bottom-[-1px] left-[-1px] w-3 h-3 border-b-2 border-l-2 border-[rgba(255,50,50,0.5)]" />
        <div className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(255,50,50,0.5)]" />
        <p className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,100,100,0.8)] tracking-[2px] mb-2">⚠ CONFIRMAR AÇÃO</p>
        <p className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.5)] tracking-wider mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 border border-[rgba(255,50,50,0.4)] py-2.5 text-red-400 font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase hover:bg-[rgba(255,50,50,0.08)] transition-all">CONFIRMAR</button>
          <button onClick={onCancel} className="flex-1 border border-[rgba(255,255,255,0.1)] py-2.5 text-[rgba(255,255,255,0.4)] font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] transition-all">CANCELAR</button>
        </div>
      </div>
    </div>
  )
}

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<ExternalFeed[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingFeed, setEditingFeed] = useState<ExternalFeed | null>(null)
  const [form, setForm] = useState({ name: '', url: '', type: 'mixed', interval: 60, active: true })
  const [formError, setFormError] = useState('')
  const [pageError, setPageError] = useState('')
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [syncResult, setSyncResult] = useState<{ id: string; count: number } | null>(null)
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null)
  const [origin, setOrigin] = useState('')

  // Import state
  const [importName, setImportName] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importContent, setImportContent] = useState('')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setOrigin(window.location.origin) }, [])

  const fetchFeeds = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/external-feeds')
      setFeeds(res.data)
    } catch (err: any) {
      setPageError(err.response?.data?.message || 'Erro ao carregar feeds')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFeeds() }, [fetchFeeds])

  const openCreate = () => {
    setEditingFeed(null)
    setForm({ name: '', url: '', type: 'mixed', interval: 60, active: true })
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (feed: ExternalFeed) => {
    setEditingFeed(feed)
    setForm({ name: feed.name, url: feed.url, type: feed.type, interval: feed.interval, active: feed.active })
    setFormError('')
    setShowModal(true)
  }

  const openImport = () => {
    setImportName('')
    setImportFile(null)
    setImportContent('')
    setPreview(null)
    setImportResult(null)
    setShowImportModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Nome é obrigatório'); return }
    if (!form.url.trim()) { setFormError('URL é obrigatória'); return }
    try { new URL(form.url) } catch { setFormError('URL inválida'); return }

    setSaving(true)
    setFormError('')
    try {
      if (editingFeed) {
        await api.put(`/external-feeds/${editingFeed.id}`, form)
      } else {
        await api.post('/external-feeds', form)
      }
      setShowModal(false)
      fetchFeeds()
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = async (file: File | null) => {
    setImportFile(file)
    setPreview(null)
    setImportResult(null)
    if (!file) return

    setPreviewing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/external-feeds/preview', formData)
      setPreview(res.data)
    } catch (err: any) {
      setPageError(err.response?.data?.message || 'Erro ao analisar arquivo')
    } finally {
      setPreviewing(false)
    }
  }

  const handleContentChange = async (text: string) => {
    setImportContent(text)
    setPreview(null)
    setImportResult(null)
    if (text.trim().length < 5) return

    setPreviewing(true)
    try {
      const formData = new FormData()
      formData.append('content', text)
      const res = await api.post('/external-feeds/preview', formData)
      setPreview(res.data)
    } catch {
    } finally {
      setPreviewing(false)
    }
  }

  const handleImport = async () => {
    if (!importName.trim()) { setPageError('Informe um nome para a importação'); return }
    if (!importFile && !importContent.trim()) { setPageError('Selecione um arquivo ou cole o conteúdo'); return }

    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('name', importName)
      if (importFile) {
        formData.append('file', importFile)
      } else {
        formData.append('content', importContent)
      }
      const res = await api.post('/external-feeds/import', formData)
      setImportResult(res.data)
      fetchFeeds()
    } catch (err: any) {
      setPageError(err.response?.data?.message || 'Erro ao importar')
    } finally {
      setImporting(false)
    }
  }

  const handleSync = async (feed: ExternalFeed) => {
    setSyncing(feed.id)
    setSyncResult(null)
    try {
      const res = await api.post(`/external-feeds/${feed.id}/sync`)
      setSyncResult({ id: feed.id, count: res.data.synced })
      fetchFeeds()
    } catch (err: any) {
      setPageError(err.response?.data?.message || 'Erro ao sincronizar')
    } finally {
      setSyncing(null)
    }
  }

  const handleDelete = (feed: ExternalFeed) => {
    setConfirm({
      message: `Deseja remover o feed "${feed.name}"?`,
      onConfirm: async () => {
        setConfirm(null)
        try { await api.delete(`/external-feeds/${feed.id}`); fetchFeeds() }
        catch (err: any) { setPageError(err.response?.data?.message || 'Erro ao apagar') }
      }
    })
  }

  const formatInterval = (minutes: number) =>
    INTERVAL_OPTIONS.find(o => o.value === minutes)?.label || `${minutes}min`

  const formatLastSync = (date: string | null) => {
    if (!date) return 'Nunca'
    const d = new Date(date)
    return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR')}`
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">

      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="w-20 h-px bg-gradient-to-r from-[rgba(0,255,100,0.3)] to-transparent" />
          <h1 className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.6)] tracking-[4px] uppercase">Feeds Externos</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={openImport} className="font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase px-4 py-2 border border-[rgba(0,212,255,0.4)] text-[rgba(0,212,255,0.8)] hover:bg-[rgba(0,212,255,0.06)] transition-all">
            ↑ IMPORTAR .TXT
          </button>
          <button onClick={openCreate} className="font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase px-4 py-2 border border-[rgba(0,255,100,0.4)] text-[#00ff64] hover:bg-[rgba(0,255,100,0.08)] transition-all">
            + ADICIONAR FEED
          </button>
        </div>
      </div>

      {/* URLs públicas */}
      <div className="relative bg-[rgba(0,255,100,0.03)] border border-[rgba(0,255,100,0.1)] p-4">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.2)] to-transparent" />
        <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase mb-3">URLs públicas para o firewall</p>
        <div className="space-y-2">
          {[
            { label: 'IPs', path: '/feed/ips' },
            { label: 'Hashes', path: '/feed/hashes' },
            { label: 'Domínios', path: '/feed/domains' },
          ].map(({ label, path }) => (
            <div key={path} className="flex items-center justify-between gap-3 flex-wrap">
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.3)] tracking-wider w-16">{label}</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <code className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.7)] bg-black/40 px-3 py-1 border border-[rgba(0,255,100,0.1)] flex-1 truncate">
                  {origin ? `${origin}${path}` : path}
                </code>
                <button onClick={() => navigator.clipboard.writeText(`${origin}${path}`)}
                  className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(0,255,100,0.2)] text-[rgba(0,255,100,0.5)] hover:border-[rgba(0,255,100,0.5)] hover:text-[#00ff64] transition-all whitespace-nowrap">
                  COPIAR
                </button>
                <a href={path} target="_blank" rel="noreferrer"
                  className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] transition-all whitespace-nowrap">
                  ABRIR
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {pageError && (
        <div className="bg-red-950/30 border border-red-500/20 px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-red-400 tracking-wider flex justify-between">
          <span>⚠ {pageError}</span>
          <button onClick={() => setPageError('')} className="opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16">
          <span className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.4)] tracking-[4px] animate-pulse">CARREGANDO...</span>
        </div>
      ) : (
        <>
          <div className="hidden md:block relative bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,100,0.1)]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.3)] to-transparent" />
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(0,255,100,0.08)]">
                  {['Nome / URL', 'Tipo', 'Intervalo', 'Último Sync', 'Itens', 'Status', 'Ações'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feeds.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.2)] tracking-wider">
                    Nenhum feed externo cadastrado
                  </td></tr>
                )}
                {feeds.map(feed => (
                  <tr key={feed.id} className="border-b border-[rgba(0,255,100,0.04)] hover:bg-[rgba(0,255,100,0.02)] transition-all">
                    <td className="px-4 py-3">
                      <p className="font-[family-name:var(--font-mono)] text-[11px] text-white">{feed.name}</p>
                      <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.2)] truncate max-w-[220px]">{feed.url || '— arquivo importado —'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${TYPE_COLOR[feed.type] || 'text-white/40 border-white/10'}`}>
                        {feed.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.4)]">{formatInterval(feed.interval)}</td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.3)]">
                      <span>{formatLastSync(feed.lastSyncAt)}</span>
                      {syncResult?.id === feed.id && (
                        <span className="ml-2 text-[rgba(0,255,100,0.7)] text-[10px]">+{syncResult.count}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.5)]">{feed.lastCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${feed.active ? 'text-[#00ff64] border-[rgba(0,255,100,0.3)] bg-[rgba(0,255,100,0.05)]' : 'text-[rgba(255,255,255,0.3)] border-[rgba(255,255,255,0.1)]'}`}>
                        {feed.active ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {feed.url && (
                          <button onClick={() => handleSync(feed)} disabled={syncing === feed.id}
                            className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(0,212,255,0.3)] text-[rgba(0,212,255,0.7)] hover:bg-[rgba(0,212,255,0.08)] disabled:opacity-40 transition-all">
                            {syncing === feed.id ? '...' : '⟳ SYNC'}
                          </button>
                        )}
                        <button onClick={() => openEdit(feed)} className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] transition-all">EDITAR</button>
                        <button onClick={() => handleDelete(feed)} className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(255,50,50,0.2)] text-[rgba(255,100,100,0.5)] hover:bg-[rgba(255,50,50,0.05)] hover:border-[rgba(255,50,50,0.4)] transition-all">APAGAR</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {feeds.length === 0 && (
              <div className="text-center py-12 font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.2)] tracking-wider">
                Nenhum feed externo cadastrado
              </div>
            )}
            {feeds.map(feed => (
              <div key={feed.id} className="relative bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,100,0.1)] p-4">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.2)] to-transparent" />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-[family-name:var(--font-mono)] text-[11px] text-white">{feed.name}</p>
                    <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.2)] truncate">{feed.url || '— arquivo importado —'}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${TYPE_COLOR[feed.type] || 'text-white/40 border-white/10'}`}>{feed.type}</span>
                    <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${feed.active ? 'text-[#00ff64] border-[rgba(0,255,100,0.3)]' : 'text-white/30 border-white/10'}`}>{feed.active ? 'ON' : 'OFF'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">Itens</p>
                    <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.5)]">{feed.lastCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">Último Sync</p>
                    <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.3)]">{formatLastSync(feed.lastSyncAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-[rgba(0,255,100,0.06)]">
                  {feed.url && (
                    <button onClick={() => handleSync(feed)} disabled={syncing === feed.id}
                      className="flex-1 font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] py-1.5 border border-[rgba(0,212,255,0.3)] text-[rgba(0,212,255,0.7)] hover:bg-[rgba(0,212,255,0.08)] disabled:opacity-40 transition-all">
                      {syncing === feed.id ? 'SINCRONIZANDO...' : '⟳ SYNC'}
                    </button>
                  )}
                  <button onClick={() => openEdit(feed)} className="flex-1 font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] py-1.5 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] transition-all">EDITAR</button>
                  <button onClick={() => handleDelete(feed)} className="flex-1 font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] py-1.5 border border-[rgba(255,50,50,0.2)] text-[rgba(255,100,100,0.5)] hover:bg-[rgba(255,50,50,0.05)] transition-all">APAGAR</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal Feed URL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="relative bg-[#030a0e] border border-[rgba(0,255,100,0.2)] w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.6)] to-transparent" />
            <div className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(0,255,100,0.6)]" />
            <div className="absolute top-[-1px] right-[-1px] w-3 h-3 border-t-2 border-r-2 border-[rgba(0,255,100,0.6)]" />
            <div className="absolute bottom-[-1px] left-[-1px] w-3 h-3 border-b-2 border-l-2 border-[rgba(0,255,100,0.6)]" />
            <div className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(0,255,100,0.6)]" />

            <h2 className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.7)] tracking-[4px] uppercase mb-6">
              {editingFeed ? 'Editar Feed' : 'Adicionar Feed via URL'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">Nome</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="ex: Abuse.ch IPs"
                  className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[rgba(0,255,100,0.5)] transition-all placeholder:text-white/10" />
              </div>

              <div>
                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">URL do Feed</label>
                <input type="text" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="https://exemplo.com/feed.txt"
                  className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[rgba(0,255,100,0.5)] transition-all placeholder:text-white/10" />
              </div>

              <div>
                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">Tipo</label>
                <div className="flex gap-2">
                  {['mixed', 'ip', 'hash', 'domain'].map(t => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2 font-[family-name:var(--font-mono)] text-[10px] tracking-[2px] uppercase border transition-all
                        ${form.type === t ? 'border-[rgba(0,255,100,0.5)] text-[#00ff64] bg-[rgba(0,255,100,0.08)]' : 'border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] hover:border-[rgba(0,255,100,0.3)]'}`}
                    >{t}</button>
                  ))}
                </div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.2)] mt-1">Mixed = auto-classifica cada linha</p>
              </div>

              <div>
                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">Intervalo de Sync</label>
                <select value={form.interval} onChange={e => setForm({ ...form, interval: parseInt(e.target.value) })}
                  className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[rgba(0,255,100,0.5)] transition-all [color-scheme:dark]">
                  {INTERVAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between py-2 px-3 border border-[rgba(0,255,100,0.1)] bg-[rgba(0,255,100,0.02)]">
                <span className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.5)] tracking-wider">Feed ativo</span>
                <button type="button" onClick={() => setForm({ ...form, active: !form.active })}
                  className={`w-10 h-5 border transition-all relative ${form.active ? 'border-[rgba(0,255,100,0.5)] bg-[rgba(0,255,100,0.15)]' : 'border-[rgba(255,255,255,0.1)] bg-transparent'}`}>
                  <span className={`absolute top-0.5 w-3.5 h-3.5 transition-all ${form.active ? 'right-0.5 bg-[#00ff64]' : 'left-0.5 bg-[rgba(255,255,255,0.2)]'}`} />
                </button>
              </div>

              {formError && (
                <div className="bg-red-950/30 border border-red-500/30 px-4 py-2.5 font-[family-name:var(--font-mono)] text-[11px] text-red-400 tracking-wider">{formError}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 border border-[rgba(0,255,100,0.4)] py-2.5 text-[#00ff64] font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase hover:bg-[rgba(0,255,100,0.08)] transition-all disabled:opacity-40">
                  {saving ? 'SALVANDO...' : 'SALVAR'}
                </button>
                <button onClick={() => setShowModal(false)}
                  className="flex-1 border border-[rgba(255,255,255,0.1)] py-2.5 text-[rgba(255,255,255,0.4)] font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase hover:border-[rgba(255,50,50,0.3)] hover:text-red-400 transition-all">
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Importar .TXT */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => !importing && setShowImportModal(false)}>
          <div className="relative bg-[#030a0e] border border-[rgba(0,212,255,0.2)] w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.5)] to-transparent" />
            <div className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(0,212,255,0.5)]" />
            <div className="absolute top-[-1px] right-[-1px] w-3 h-3 border-t-2 border-r-2 border-[rgba(0,212,255,0.5)]" />
            <div className="absolute bottom-[-1px] left-[-1px] w-3 h-3 border-b-2 border-l-2 border-[rgba(0,212,255,0.5)]" />
            <div className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(0,212,255,0.5)]" />

            <h2 className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,212,255,0.7)] tracking-[4px] uppercase mb-6">
              Importar arquivo .TXT
            </h2>

            {importResult ? (
              <div className="space-y-4">
                <div className="bg-[rgba(0,255,100,0.05)] border border-[rgba(0,255,100,0.2)] p-4">
                  <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.7)] tracking-[3px] uppercase mb-3">✓ Importação concluída</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'IPs', value: importResult.imported.ip, color: '#00ff64' },
                      { label: 'Hashes', value: importResult.imported.hash, color: '#00d4ff' },
                      { label: 'Domínios', value: importResult.imported.domain, color: '#a78bfa' },
                      { label: 'Ignorados', value: importResult.imported.skipped, color: 'rgba(255,255,255,0.3)' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between border border-[rgba(255,255,255,0.05)] px-3 py-2">
                        <span className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.4)] tracking-[2px] uppercase">{item.label}</span>
                        <span className="font-[family-name:var(--font-rajdhani)] text-xl font-bold" style={{ color: item.color }}>{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.3)] tracking-wider mt-3">
                    Total processado: {importResult.total.toLocaleString()} linhas
                  </p>
                </div>
                <button onClick={() => setShowImportModal(false)}
                  className="w-full border border-[rgba(0,255,100,0.4)] py-2.5 text-[#00ff64] font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase hover:bg-[rgba(0,255,100,0.08)] transition-all">
                  FECHAR
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,212,255,0.5)] tracking-[3px] uppercase block mb-2">Nome da importação</label>
                  <input type="text" value={importName} onChange={e => setImportName(e.target.value)}
                    placeholder="ex: Blocklist Janeiro 2026"
                    className="w-full bg-black/40 border border-[rgba(0,212,255,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[rgba(0,212,255,0.5)] transition-all placeholder:text-white/10" />
                </div>

                {/* Upload area */}
                <div>
                  <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,212,255,0.5)] tracking-[3px] uppercase block mb-2">Arquivo .TXT</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f) }}
                    className="border border-dashed border-[rgba(0,212,255,0.3)] p-6 text-center cursor-pointer hover:border-[rgba(0,212,255,0.6)] hover:bg-[rgba(0,212,255,0.03)] transition-all">
                    <input ref={fileInputRef} type="file" accept=".txt" className="hidden"
                      onChange={e => handleFileChange(e.target.files?.[0] || null)} />
                    {importFile ? (
                      <div>
                        <p className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,212,255,0.8)]">📄 {importFile.name}</p>
                        <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.3)] mt-1">{(importFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,212,255,0.5)] tracking-[2px]">CLIQUE OU ARRASTE O ARQUIVO</p>
                        <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.2)] mt-1">Apenas .txt · máx 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
                  <span className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.2)] tracking-[2px]">OU COLE O CONTEÚDO</span>
                  <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
                </div>

                <textarea
                  value={importContent}
                  onChange={e => { setImportFile(null); handleContentChange(e.target.value) }}
                  placeholder={'192.168.1.1\nmalware.com\nd41d8cd98f00b204e9800998ecf8427e'}
                  rows={4}
                  className="w-full bg-black/40 border border-[rgba(0,212,255,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-[11px] outline-none focus:border-[rgba(0,212,255,0.4)] transition-all placeholder:text-white/10 resize-none"
                />

                {/* Preview */}
                {previewing && (
                  <div className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,212,255,0.5)] tracking-[3px] animate-pulse">ANALISANDO...</div>
                )}

                {preview && !previewing && (
                  <div className="bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.15)] p-4 space-y-3">
                    <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,212,255,0.6)] tracking-[3px] uppercase">Preview — {preview.counts.total.toLocaleString()} linhas detectadas</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'IPs', value: preview.counts.ip, color: '#00ff64', samples: preview.samples.ip },
                        { label: 'Hashes', value: preview.counts.hash, color: '#00d4ff', samples: preview.samples.hash },
                        { label: 'Domínios', value: preview.counts.domain, color: '#a78bfa', samples: preview.samples.domain },
                        { label: 'Não reconhecido', value: preview.counts.unknown, color: 'rgba(255,255,255,0.3)', samples: [] },
                      ].map(item => (
                        <div key={item.label} className="border border-[rgba(255,255,255,0.05)] px-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.4)] tracking-[2px] uppercase">{item.label}</span>
                            <span className="font-[family-name:var(--font-rajdhani)] text-lg font-bold" style={{ color: item.color }}>{item.value.toLocaleString()}</span>
                          </div>
                          {item.samples.length > 0 && (
                            <div className="space-y-0.5">
                              {item.samples.map((s, i) => (
                                <p key={i} className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(255,255,255,0.2)] truncate">{s}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={handleImport} disabled={importing || (!importFile && !importContent.trim()) || !importName.trim()}
                    className="flex-1 border border-[rgba(0,212,255,0.4)] py-2.5 text-[rgba(0,212,255,0.9)] font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase hover:bg-[rgba(0,212,255,0.08)] transition-all disabled:opacity-40">
                    {importing ? 'IMPORTANDO...' : 'IMPORTAR'}
                  </button>
                  <button onClick={() => setShowImportModal(false)} disabled={importing}
                    className="flex-1 border border-[rgba(255,255,255,0.1)] py-2.5 text-[rgba(255,255,255,0.4)] font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase hover:border-[rgba(255,50,50,0.3)] hover:text-red-400 transition-all disabled:opacity-40">
                    CANCELAR
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}