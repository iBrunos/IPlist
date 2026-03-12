'use client'

import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'

interface Hash {
  id: string
  value: string
  type: string
  description: string | null
  expiresAt: string | null
  status: string
  createdAt: string
  createdBy?: { username: string; equipe: string }
}

interface PaginatedResponse {
  data: Hash[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const HASH_TYPES = ['MD5', 'SHA1', 'SHA256', 'SHA512']

const hashLengths: Record<string, number> = {
  MD5: 32, SHA1: 40, SHA256: 64, SHA512: 128,
}

const PROTECTED_HASHES = new Set([
  'd41d8cd98f00b204e9800998ecf8427e',
  'da39a3ee5e6b4b0d3255bfef95601890',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
])

const PROTECTED_HASH_PREFIXES = ['000000000000000000000000']

function isProtectedHash(value: string, type: string): string | null {
  if (!value) return null
  const lower = value.toLowerCase()
  if (PROTECTED_HASHES.has(lower)) return `Hash de arquivo vazio/sistema — não pode ser bloqueada`
  for (const prefix of PROTECTED_HASH_PREFIXES) {
    if (lower.startsWith(prefix)) return `Hash inválida — sequência zerada não permitida`
  }
  if (value.length === hashLengths[type] && new Set(value.split('')).size === 1) {
    return `Hash inválida — caracteres repetidos não são permitidos`
  }
  return null
}

const statusColor: Record<string, string> = {
  approved: 'text-[#00ff64] border-[rgba(0,255,100,0.3)] bg-[rgba(0,255,100,0.05)]',
  pending: 'text-yellow-400 border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.05)]',
}

const typeColor: Record<string, string> = {
  MD5: 'text-[#f87171] border-[rgba(248,113,113,0.3)]',
  SHA1: 'text-[#fb923c] border-[rgba(251,146,60,0.3)]',
  SHA256: 'text-[#00d4ff] border-[rgba(0,212,255,0.3)]',
  SHA512: 'text-[#a78bfa] border-[rgba(167,139,250,0.3)]',
}

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

export default function HashesPage() {
  const [result, setResult] = useState<PaginatedResponse>({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingHash, setEditingHash] = useState<Hash | null>(null)
  const [form, setForm] = useState({ value: '', type: 'SHA256', description: '', expiresAt: '' })
  const [formError, setFormError] = useState('')
  const [pageError, setPageError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const user = getUser()

  const fetchHashes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/hashes', { params: { page, limit: perPage, search } })
      setResult(res.data)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search])

  useEffect(() => { fetchHashes() }, [fetchHashes])

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const openCreate = () => {
    setEditingHash(null)
    setForm({ value: '', type: 'SHA256', description: '', expiresAt: '' })
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (hash: Hash) => {
    setEditingHash(hash)
    setForm({ value: hash.value, type: hash.type, description: hash.description || '', expiresAt: hash.expiresAt ? hash.expiresAt.split('T')[0] : '' })
    setFormError('')
    setShowModal(true)
  }

  const handleValueChange = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-f0-9]/g, '')
    setForm(f => ({ ...f, value: clean }))
    const protection = isProtectedHash(clean, form.type)
    setFormError(protection ? `⛔ ${protection}` : '')
  }

  const handleSave = async () => {
    const expectedLen = hashLengths[form.type]
    if (form.value.length !== expectedLen) {
      setFormError(`Hash ${form.type} deve ter ${expectedLen} caracteres. Atual: ${form.value.length}`)
      return
    }
    const protection = isProtectedHash(form.value, form.type)
    if (protection) { setFormError(`⛔ ${protection}`); return }

    setSaving(true)
    setFormError('')
    try {
      const expiresAt = form.expiresAt || (() => {
        const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]
      })()
      if (editingHash) {
        await api.put(`/hashes/${editingHash.id}`, { ...form, expiresAt })
      } else {
        await api.post('/hashes', { ...form, expiresAt })
      }
      setShowModal(false)
      fetchHashes()
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = (id: string) => {
    setConfirm({
      message: 'Deseja aprovar esta hash para o feed?',
      onConfirm: async () => {
        setConfirm(null)
        try { await api.put(`/hashes/${id}/approve`); fetchHashes() }
        catch (err: any) { setPageError(err.response?.data?.message || 'Erro ao aprovar') }
      }
    })
  }

  const handleDelete = (id: string, value: string) => {
    setConfirm({
      message: `Deseja remover a hash ${value.slice(0, 16)}...?`,
      onConfirm: async () => {
        setConfirm(null)
        try { await api.delete(`/hashes/${id}`); fetchHashes() }
        catch (err: any) { setPageError(err.response?.data?.message || 'Erro ao apagar') }
      }
    })
  }

  const canApprove = user?.role === 'super_admin' || user?.role === 'lidertecnico'
  const isFormBlocked = !!isProtectedHash(form.value, form.type) && !editingHash
  const { data: hashes, total, totalPages } = result

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

      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="w-20 h-px bg-gradient-to-r from-[rgba(0,255,100,0.3)] to-transparent" />
          <h1 className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.6)] tracking-[4px] uppercase">Gerenciamento de Hashes</h1>
        </div>
        <button onClick={openCreate} className="font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase px-4 py-2 border border-[rgba(0,255,100,0.4)] text-[#00ff64] hover:bg-[rgba(0,255,100,0.08)] transition-all">
          + ADICIONAR HASH
        </button>
      </div>

      {pageError && (
        <div className="bg-red-950/30 border border-red-500/20 px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-red-400 tracking-wider flex justify-between">
          <span>⚠ {pageError}</span>
          <button onClick={() => setPageError('')} className="opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(0,255,100,0.4)] text-xs">⌕</span>
          <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Buscar por hash, tipo, descrição ou usuário..."
            className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] pl-8 pr-4 py-2 text-white font-[family-name:var(--font-mono)] text-[11px] outline-none focus:border-[rgba(0,255,100,0.4)] transition-all placeholder:text-white/20" />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.3)] hover:text-white text-xs">✕</button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase hidden sm:block">Por página:</span>
          {[10, 20, 50].map(n => (
            <button key={n} onClick={() => { setPerPage(n); setPage(1) }}
              className={`font-[family-name:var(--font-mono)] text-[10px] px-2.5 py-1 border transition-all
                ${perPage === n ? 'border-[rgba(0,255,100,0.5)] text-[#00ff64] bg-[rgba(0,255,100,0.08)]' : 'border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] hover:border-[rgba(0,255,100,0.3)]'}`}
            >{n}</button>
          ))}
        </div>
        <span className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.3)] tracking-wider whitespace-nowrap">
          {total} resultado{total !== 1 ? 's' : ''} · pág. {page}/{totalPages || 1}
        </span>
      </div>

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
                  {['Tipo', 'Hash', 'Descrição', 'Status', 'Expira em', 'Criado por', 'Ações'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hashes.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.2)] tracking-wider">
                    {search ? `Nenhum resultado para "${search}"` : 'Nenhuma hash cadastrada'}
                  </td></tr>
                )}
                {hashes.map(hash => (
                  <tr key={hash.id} className="border-b border-[rgba(0,255,100,0.04)] hover:bg-[rgba(0,255,100,0.02)] transition-all">
                    <td className="px-4 py-3">
                      <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${typeColor[hash.type] || 'text-white/40 border-white/10'}`}>{hash.type}</span>
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-white/70">
                      <span title={hash.value}>{hash.value.slice(0, 16)}...</span>
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.4)] max-w-[160px] truncate">{hash.description || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${statusColor[hash.status] || 'text-white/40 border-white/10'}`}>
                        {hash.status === 'approved' ? 'Aprovado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.4)]">{hash.expiresAt ? new Date(hash.expiresAt).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.5)]">{hash.createdBy?.username || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {canApprove && hash.status === 'pending' && (
                          <button onClick={() => handleApprove(hash.id)} className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(0,255,100,0.3)] text-[rgba(0,255,100,0.7)] hover:bg-[rgba(0,255,100,0.08)] transition-all">APROVAR</button>
                        )}
                        <button onClick={() => openEdit(hash)} className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] transition-all">EDITAR</button>
                        <button onClick={() => handleDelete(hash.id, hash.value)} className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(255,50,50,0.2)] text-[rgba(255,100,100,0.5)] hover:bg-[rgba(255,50,50,0.05)] transition-all">APAGAR</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {hashes.length === 0 && (
              <div className="text-center py-12 font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.2)] tracking-wider">
                {search ? `Nenhum resultado para "${search}"` : 'Nenhuma hash cadastrada'}
              </div>
            )}
            {hashes.map(hash => (
              <div key={hash.id} className="relative bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,100,0.1)] p-4">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.2)] to-transparent" />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${typeColor[hash.type] || 'text-white/40 border-white/10'}`}>{hash.type}</span>
                    <span className="font-[family-name:var(--font-mono)] text-[11px] text-white/70" title={hash.value}>{hash.value.slice(0, 12)}...</span>
                  </div>
                  <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${statusColor[hash.status] || 'text-white/40 border-white/10'}`}>
                    {hash.status === 'approved' ? 'Aprovado' : 'Pendente'}
                  </span>
                </div>
                <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.3)] mb-3">{hash.description || '—'}</p>
                <div className="flex items-center gap-4 mb-3">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">Expira</p>
                    <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.4)]">{hash.expiresAt ? new Date(hash.expiresAt).toLocaleDateString('pt-BR') : '—'}</p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">Criado por</p>
                    <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.6)]">{hash.createdBy?.username || '—'}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-[rgba(0,255,100,0.06)]">
                  {canApprove && hash.status === 'pending' && (
                    <button onClick={() => handleApprove(hash.id)} className="flex-1 font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] py-1.5 border border-[rgba(0,255,100,0.3)] text-[rgba(0,255,100,0.7)] hover:bg-[rgba(0,255,100,0.08)] transition-all">APROVAR</button>
                  )}
                  <button onClick={() => openEdit(hash)} className="flex-1 font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] py-1.5 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] transition-all">EDITAR</button>
                  <button onClick={() => handleDelete(hash.id, hash.value)} className="flex-1 font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] py-1.5 border border-[rgba(255,50,50,0.2)] text-[rgba(255,100,100,0.5)] hover:bg-[rgba(255,50,50,0.05)] transition-all">APAGAR</button>
                </div>
              </div>
            ))}
          </div>

          {renderPagination()}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="relative bg-[#030a0e] border border-[rgba(0,255,100,0.2)] w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.6)] to-transparent" />
            <div className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(0,255,100,0.6)]" />
            <div className="absolute top-[-1px] right-[-1px] w-3 h-3 border-t-2 border-r-2 border-[rgba(0,255,100,0.6)]" />
            <div className="absolute bottom-[-1px] left-[-1px] w-3 h-3 border-b-2 border-l-2 border-[rgba(0,255,100,0.6)]" />
            <div className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(0,255,100,0.6)]" />

            <h2 className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.7)] tracking-[4px] uppercase mb-6">
              {editingHash ? 'Editar Hash' : 'Adicionar Hash'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">Tipo</label>
                <div className="flex gap-2">
                  {HASH_TYPES.map(t => (
                    <button key={t} type="button" disabled={!!editingHash}
                      onClick={() => setForm({ ...form, type: t, value: '' })}
                      className={`flex-1 py-2 font-[family-name:var(--font-mono)] text-[10px] tracking-[2px] border transition-all disabled:opacity-40
                        ${form.type === t ? 'border-[rgba(0,255,100,0.5)] text-[#00ff64] bg-[rgba(0,255,100,0.08)]' : 'border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] hover:border-[rgba(0,255,100,0.3)]'}`}
                    >{t}</button>
                  ))}
                </div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.2)] mt-1">Esperado: {hashLengths[form.type]} caracteres</p>
              </div>

              <div>
                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">Valor da Hash</label>
                <input type="text" value={form.value} onChange={e => handleValueChange(e.target.value)}
                  disabled={!!editingHash} placeholder={`${hashLengths[form.type]} caracteres hex`}
                  maxLength={hashLengths[form.type]}
                  className={`w-full bg-black/40 border px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-xs outline-none transition-all placeholder:text-white/10 disabled:opacity-40
                    ${isFormBlocked ? 'border-red-500/50 focus:border-red-500' : 'border-[rgba(0,255,100,0.15)] focus:border-[rgba(0,255,100,0.5)]'}`}
                />
                <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.2)] mt-1">{form.value.length}/{hashLengths[form.type]} caracteres</p>
              </div>

              <div>
                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">Descrição</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="motivo do bloqueio"
                  className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[rgba(0,255,100,0.5)] transition-all placeholder:text-white/10" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase">Data de Expiração</label>
                  <span title="Se não informada, o padrão será 30 dias a partir de hoje" className="w-4 h-4 rounded-full border border-[rgba(0,255,100,0.3)] text-[rgba(0,255,100,0.5)] flex items-center justify-center text-[9px] cursor-help hover:border-[rgba(0,255,100,0.6)] transition-all">?</span>
                </div>
                <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[rgba(0,255,100,0.5)] transition-all [color-scheme:dark]" />
              </div>

              {formError && (
                <div className="bg-red-950/30 border border-red-500/30 px-4 py-2.5 font-[family-name:var(--font-mono)] text-[11px] text-red-400 tracking-wider">{formError}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving || !form.value || isFormBlocked}
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
    </div>
  )
}