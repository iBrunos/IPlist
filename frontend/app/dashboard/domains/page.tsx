'use client'

import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'

interface Domain {
  id: string
  domain: string
  description: string | null
  expiresAt: string | null
  status: string
  createdAt: string
  createdBy?: { username: string; equipe: string }
}

interface PaginatedResponse {
  data: Domain[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Domínios protegidos que não podem ser bloqueados
const PROTECTED_DOMAINS = new Set([
  'google.com', 'googleapis.com', 'google.com.br',
  'microsoft.com', 'windows.com', 'live.com', 'outlook.com', 'office.com', 'office365.com',
  'cloudflare.com', 'cloudflare.net',
  'amazon.com', 'amazonaws.com', 'aws.amazon.com',
  'apple.com', 'icloud.com',
  'github.com', 'githubusercontent.com',
  'facebook.com', 'instagram.com', 'whatsapp.com',
  'youtube.com', 'ytimg.com',
  'akamai.com', 'akamaiedge.net',
  'digicert.com', 'letsencrypt.org',
  'ocsp.microsoft.com', 'ctldl.windowsupdate.com',
])

const PROTECTED_TLDS = ['.gov', '.gov.br', '.mil', '.edu', '.edu.br']

function isProtectedDomain(domain: string): string | null {
  if (!domain) return null
  const lower = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  for (const d of PROTECTED_DOMAINS) {
    if (lower === d || lower.endsWith('.' + d)) return `${d} é um domínio protegido`
  }
  for (const tld of PROTECTED_TLDS) {
    if (lower.endsWith(tld)) return `Domínios ${tld} são protegidos`
  }
  return null
}

function isValidDomain(domain: string): boolean {
  const clean = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  return /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(clean)
}

function normalizeDomain(domain: string): string {
  return domain.toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .trim()
}

const statusColor: Record<string, string> = {
  approved: 'text-[#00ff64] border-[rgba(0,255,100,0.3)] bg-[rgba(0,255,100,0.05)]',
  pending: 'text-yellow-400 border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.05)]',
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

export default function DomainsPage() {
  const [result, setResult] = useState<PaginatedResponse>({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [form, setForm] = useState({ domain: '', description: '', expiresAt: '' })
  const [formError, setFormError] = useState('')
  const [pageError, setPageError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const user = getUser()

  const fetchDomains = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/domains', { params: { page, limit: perPage, search } })
      setResult(res.data)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search])

  useEffect(() => { fetchDomains() }, [fetchDomains])

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const openCreate = () => {
    setEditingDomain(null)
    setForm({ domain: '', description: '', expiresAt: '' })
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (d: Domain) => {
    setEditingDomain(d)
    setForm({ domain: d.domain, description: d.description || '', expiresAt: d.expiresAt ? d.expiresAt.split('T')[0] : '' })
    setFormError('')
    setShowModal(true)
  }

  const handleDomainChange = (value: string) => {
    const normalized = normalizeDomain(value)
    setForm(f => ({ ...f, domain: normalized }))
    const protection = isProtectedDomain(normalized)
    if (protection) { setFormError(`⛔ ${protection}`); return }
    if (normalized && !isValidDomain(normalized)) {
      setFormError('Formato inválido. Ex: malware.com ou sub.dominio.com.br')
    } else {
      setFormError('')
    }
  }

  const handleSave = async () => {
    const protection = isProtectedDomain(form.domain)
    if (protection) { setFormError(`⛔ ${protection}`); return }
    if (!isValidDomain(form.domain)) { setFormError('Domínio inválido'); return }

    setSaving(true)
    setFormError('')
    try {
      const expiresAt = form.expiresAt || (() => {
        const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]
      })()
      if (editingDomain) {
        await api.put(`/domains/${editingDomain.id}`, { ...form, expiresAt })
      } else {
        await api.post('/domains', { ...form, expiresAt })
      }
      setShowModal(false)
      fetchDomains()
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = (id: string) => {
    setConfirm({
      message: 'Deseja aprovar este domínio para o feed?',
      onConfirm: async () => {
        setConfirm(null)
        try { await api.put(`/domains/${id}/approve`); fetchDomains() }
        catch (err: any) { setPageError(err.response?.data?.message || 'Erro ao aprovar') }
      }
    })
  }

  const handleDelete = (id: string, domain: string) => {
    setConfirm({
      message: `Deseja remover o domínio ${domain}?`,
      onConfirm: async () => {
        setConfirm(null)
        try { await api.delete(`/domains/${id}`); fetchDomains() }
        catch (err: any) { setPageError(err.response?.data?.message || 'Erro ao apagar') }
      }
    })
  }

  const canApprove = user?.role === 'super_admin' || user?.role === 'lidertecnico'
  const isFormBlocked = !!isProtectedDomain(form.domain) && !editingDomain
  const { data: domains, total, totalPages } = result

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

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="w-20 h-px bg-gradient-to-r from-[rgba(0,255,100,0.3)] to-transparent" />
          <h1 className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.6)] tracking-[4px] uppercase">Gerenciamento de Domínios</h1>
        </div>
        <button onClick={openCreate} className="font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase px-4 py-2 border border-[rgba(0,255,100,0.4)] text-[#00ff64] hover:bg-[rgba(0,255,100,0.08)] transition-all">
          + ADICIONAR DOMÍNIO
        </button>
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
            placeholder="Buscar por domínio, descrição ou usuário..."
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
          {/* Desktop table */}
          <div className="hidden md:block relative bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,100,0.1)]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.3)] to-transparent" />
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(0,255,100,0.08)]">
                  {['Domínio', 'Descrição', 'Status', 'Expira em', 'Criado por', 'Criado em', 'Ações'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {domains.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.2)] tracking-wider">
                    {search ? `Nenhum resultado para "${search}"` : 'Nenhum domínio cadastrado'}
                  </td></tr>
                )}
                {domains.map(d => (
                  <tr key={d.id} className="border-b border-[rgba(0,255,100,0.04)] hover:bg-[rgba(0,255,100,0.02)] transition-all">
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-sm text-white tracking-wider">{d.domain}</td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.4)] max-w-[200px] truncate">{d.description || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${statusColor[d.status] || 'text-white/40 border-white/10'}`}>
                        {d.status === 'approved' ? 'Aprovado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.4)]">{d.expiresAt ? new Date(d.expiresAt).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.5)]">{d.createdBy?.username || '—'}</td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.3)]">{new Date(d.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {canApprove && d.status === 'pending' && (
                          <button onClick={() => handleApprove(d.id)} className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(0,255,100,0.3)] text-[rgba(0,255,100,0.7)] hover:bg-[rgba(0,255,100,0.08)] transition-all">APROVAR</button>
                        )}
                        <button onClick={() => openEdit(d)} className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] transition-all">EDITAR</button>
                        <button onClick={() => handleDelete(d.id, d.domain)} className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(255,50,50,0.2)] text-[rgba(255,100,100,0.5)] hover:bg-[rgba(255,50,50,0.05)] hover:border-[rgba(255,50,50,0.4)] transition-all">APAGAR</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {domains.length === 0 && (
              <div className="text-center py-12 font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.2)] tracking-wider">
                {search ? `Nenhum resultado para "${search}"` : 'Nenhum domínio cadastrado'}
              </div>
            )}
            {domains.map(d => (
              <div key={d.id} className="relative bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,100,0.1)] p-4">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.2)] to-transparent" />
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-sm text-white tracking-wider">{d.domain}</p>
                    <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.3)] mt-0.5">{d.description || '—'}</p>
                  </div>
                  <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${statusColor[d.status] || 'text-white/40 border-white/10'}`}>
                    {d.status === 'approved' ? 'Aprovado' : 'Pendente'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">Expira</p>
                    <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.4)]">{d.expiresAt ? new Date(d.expiresAt).toLocaleDateString('pt-BR') : '—'}</p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">Criado por</p>
                    <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.6)]">{d.createdBy?.username || '—'}</p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">Data</p>
                    <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.3)]">{new Date(d.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-[rgba(0,255,100,0.06)]">
                  {canApprove && d.status === 'pending' && (
                    <button onClick={() => handleApprove(d.id)} className="flex-1 font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] py-1.5 border border-[rgba(0,255,100,0.3)] text-[rgba(0,255,100,0.7)] hover:bg-[rgba(0,255,100,0.08)] transition-all">APROVAR</button>
                  )}
                  <button onClick={() => openEdit(d)} className="flex-1 font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] py-1.5 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] transition-all">EDITAR</button>
                  <button onClick={() => handleDelete(d.id, d.domain)} className="flex-1 font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] py-1.5 border border-[rgba(255,50,50,0.2)] text-[rgba(255,100,100,0.5)] hover:bg-[rgba(255,50,50,0.05)] transition-all">APAGAR</button>
                </div>
              </div>
            ))}
          </div>

          {renderPagination()}
        </>
      )}

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="relative bg-[#030a0e] border border-[rgba(0,255,100,0.2)] w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.6)] to-transparent" />
            <div className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(0,255,100,0.6)]" />
            <div className="absolute top-[-1px] right-[-1px] w-3 h-3 border-t-2 border-r-2 border-[rgba(0,255,100,0.6)]" />
            <div className="absolute bottom-[-1px] left-[-1px] w-3 h-3 border-b-2 border-l-2 border-[rgba(0,255,100,0.6)]" />
            <div className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(0,255,100,0.6)]" />

            <h2 className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.7)] tracking-[4px] uppercase mb-6">
              {editingDomain ? 'Editar Domínio' : 'Adicionar Domínio'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">Domínio</label>
                <input type="text" value={form.domain}
                  onChange={e => handleDomainChange(e.target.value)}
                  disabled={!!editingDomain}
                  placeholder="ex: malware.com ou sub.dominio.com.br"
                  className={`w-full bg-black/40 border px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-sm outline-none transition-all placeholder:text-white/10 disabled:opacity-40
                    ${isFormBlocked ? 'border-red-500/50 focus:border-red-500' : 'border-[rgba(0,255,100,0.15)] focus:border-[rgba(0,255,100,0.5)]'}`}
                />
                <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.2)] mt-1">
                  Sem http:// — apenas o domínio. Ex: malware.com
                </p>
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
                <button onClick={handleSave} disabled={saving || !form.domain || isFormBlocked}
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