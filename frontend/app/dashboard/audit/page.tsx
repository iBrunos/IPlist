'use client'

import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string | null
  details: string | null
  createdAt: string
  user?: { username: string; equipe: string; role: string }
}

interface PaginatedResponse {
  data: AuditLog[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'text-[#00ff64] border-[rgba(0,255,100,0.3)] bg-[rgba(0,255,100,0.05)]',
  APPROVE: 'text-[#00d4ff] border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.05)]',
  UPDATE: 'text-yellow-400 border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.05)]',
  DELETE: 'text-red-400 border-[rgba(255,50,50,0.3)] bg-[rgba(255,50,50,0.05)]',
}

const ENTITY_ICON: Record<string, string> = {
  IP: '◈',
  HASH: '◆',
  DOMAIN: '◉',
  USER: '◎',
}

export default function AuditPage() {
  const [result, setResult] = useState<PaginatedResponse>({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchAudit = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/audit', { params: { page, limit: perPage, search } })
      setResult(res.data)
    } catch (err: any) {
      setPageError(err.response?.data?.message || 'Erro ao carregar auditoria')
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search])

  useEffect(() => { fetchAudit() }, [fetchAudit])

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data: logs, total, totalPages } = result

const renderPagination = () => {
  if (totalPages <= 1) return null
  const pages: (number | 'ellipsis')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 4) pages.push('ellipsis')
    for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.push(i)
    if (page < totalPages - 3) pages.push('ellipsis')
    pages.push(totalPages)
  }
  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      <button onClick={() => setPage(1)} disabled={page === 1}
        className="font-[family-name:var(--font-mono)] text-[10px] px-2 py-1.5 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] disabled:opacity-20 transition-all">«</button>
      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
        className="font-[family-name:var(--font-mono)] text-[10px] px-3 py-1.5 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] disabled:opacity-20 transition-all">‹ ANT</button>
      {pages.map((n, i) => n === 'ellipsis'
        ? <span key={`e${i}`} className="font-[family-name:var(--font-mono)] text-[10px] text-white/20 px-1">…</span>
        : <button key={n} onClick={() => setPage(n)}
            className={`font-[family-name:var(--font-mono)] text-[10px] w-8 h-8 border transition-all
              ${page === n ? 'border-[rgba(0,255,100,0.5)] text-[#00ff64] bg-[rgba(0,255,100,0.08)]' : 'border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] hover:border-[rgba(0,255,100,0.3)]'}`}
          >{n}</button>
      )}
      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
        className="font-[family-name:var(--font-mono)] text-[10px] px-3 py-1.5 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] disabled:opacity-20 transition-all">PRÓ ›</button>
      <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
        className="font-[family-name:var(--font-mono)] text-[10px] px-2 py-1.5 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] disabled:opacity-20 transition-all">»</button>
    </div>
  )
}

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="w-20 h-px bg-gradient-to-r from-[rgba(0,255,100,0.3)] to-transparent" />
          <h1 className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.6)] tracking-[4px] uppercase">Log de Auditoria</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ff64] animate-pulse" />
          <span className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[2px]">TEMPO REAL</span>
        </div>
      </div>

      {pageError && (
        <div className="bg-red-950/30 border border-red-500/20 px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-red-400 tracking-wider flex justify-between">
          <span>⚠ {pageError}</span>
          <button onClick={() => setPageError('')} className="opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Search + Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(0,255,100,0.4)] text-xs">⌕</span>
          <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Buscar por ação, entidade, detalhes ou usuário..."
            className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] pl-8 pr-4 py-2 text-white font-[family-name:var(--font-mono)] text-[11px] outline-none focus:border-[rgba(0,255,100,0.4)] transition-all placeholder:text-white/20" />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.3)] hover:text-white text-xs">✕</button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase hidden sm:block">Por página:</span>
          {[20, 50, 100].map(n => (
            <button key={n} onClick={() => { setPerPage(n); setPage(1) }}
              className={`font-[family-name:var(--font-mono)] text-[10px] px-2.5 py-1 border transition-all
                ${perPage === n ? 'border-[rgba(0,255,100,0.5)] text-[#00ff64] bg-[rgba(0,255,100,0.08)]' : 'border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] hover:border-[rgba(0,255,100,0.3)]'}`}
            >{n}</button>
          ))}
        </div>
        <span className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.3)] tracking-wider whitespace-nowrap">
          {total} evento{total !== 1 ? 's' : ''} · pág. {page}/{totalPages || 1}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16">
          <span className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.4)] tracking-[4px] animate-pulse">CARREGANDO...</span>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block relative bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,100,0.1)]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.3)] to-transparent" />
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(0,255,100,0.08)]">
                  {['Data/Hora', 'Usuário', 'Ação', 'Entidade', 'Detalhes'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.2)] tracking-wider">
                    {search ? `Nenhum resultado para "${search}"` : 'Nenhum evento registrado'}
                  </td></tr>
                )}
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-[rgba(0,255,100,0.04)] hover:bg-[rgba(0,255,100,0.02)] transition-all">
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.3)] whitespace-nowrap">
                      <span className="text-[rgba(255,255,255,0.5)]">{new Date(log.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span className="text-[rgba(0,255,100,0.4)] ml-2">{new Date(log.createdAt).toLocaleTimeString('pt-BR')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.7)]">{log.user?.username || '—'}</p>
                        <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.3)]">{log.user?.equipe || ''}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${ACTION_COLOR[log.action] || 'text-white/40 border-white/10'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.5)] flex items-center gap-1.5">
                        <span className="text-[rgba(0,255,100,0.5)]">{ENTITY_ICON[log.entity] || '○'}</span>
                        {log.entity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.4)] max-w-[300px] truncate">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {logs.length === 0 && (
              <div className="text-center py-12 font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.2)] tracking-wider">
                {search ? `Nenhum resultado para "${search}"` : 'Nenhum evento registrado'}
              </div>
            )}
            {logs.map(log => (
              <div key={log.id} className="relative bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,100,0.1)] p-4">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.2)] to-transparent" />
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.7)]">{log.user?.username || '—'}</p>
                    <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.3)]">{log.user?.equipe || ''}</p>
                  </div>
                  <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${ACTION_COLOR[log.action] || 'text-white/40 border-white/10'}`}>
                    {log.action}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">Entidade</p>
                    <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.5)] flex items-center gap-1">
                      <span className="text-[rgba(0,255,100,0.5)]">{ENTITY_ICON[log.entity] || '○'}</span>
                      {log.entity}
                    </p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">Data</p>
                    <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.3)]">
                      {new Date(log.createdAt).toLocaleDateString('pt-BR')} {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </div>
                {log.details && (
                  <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.3)] border-t border-[rgba(0,255,100,0.06)] pt-2 mt-2 truncate">
                    {log.details}
                  </p>
                )}
              </div>
            ))}
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  )
}