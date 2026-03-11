'use client'

import { useEffect, useState } from 'react'
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

const HASH_TYPES = ['MD5', 'SHA1', 'SHA256', 'SHA512']

function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string
  onConfirm: () => void
  onCancel: () => void
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

const hashLengths: Record<string, number> = {
  MD5: 32,
  SHA1: 40,
  SHA256: 64,
  SHA512: 128,
}

export default function HashesPage() {
  const [hashes, setHashes] = useState<Hash[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingHash, setEditingHash] = useState<Hash | null>(null)
  const [form, setForm] = useState({ value: '', type: 'SHA256', description: '', expiresAt: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null)
  const user = getUser()

  const fetchHashes = async () => {
    try {
      const res = await api.get('/hashes')
      setHashes(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHashes() }, [])

  const openCreate = () => {
    setEditingHash(null)
    setForm({ value: '', type: 'SHA256', description: '', expiresAt: '' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (hash: Hash) => {
    setEditingHash(hash)
    setForm({
      value: hash.value,
      type: hash.type,
      description: hash.description || '',
      expiresAt: hash.expiresAt ? hash.expiresAt.split('T')[0] : '',
    })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    // Validar tamanho do hash
    const expectedLen = hashLengths[form.type]
    if (form.value.length !== expectedLen) {
      setError(`Hash ${form.type} deve ter ${expectedLen} caracteres. Atual: ${form.value.length}`)
      return
    }

    setSaving(true)
    setError('')
    try {
      const expiresAt = form.expiresAt || (() => {
        const d = new Date()
        d.setDate(d.getDate() + 30)
        return d.toISOString().split('T')[0]
      })()

      if (editingHash) {
        await api.put(`/hashes/${editingHash.id}`, { ...form, expiresAt })
      } else {
        await api.post('/hashes', { ...form, expiresAt })
      }
      setShowModal(false)
      fetchHashes()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = (id: string) => {
    setConfirm({
      message: 'Deseja aprovar esta hash para o feed?',
      onConfirm: async () => {
        setConfirm(null)
        try {
          await api.put(`/hashes/${id}/approve`)
          fetchHashes()
        } catch (err: any) {
          setError(err.response?.data?.message || 'Erro ao aprovar')
        }
      }
    })
  }

  const handleDelete = (id: string, value: string) => {
    setConfirm({
      message: `Deseja remover a hash ${value.slice(0, 16)}...?`,
      onConfirm: async () => {
        setConfirm(null)
        try {
          await api.delete(`/hashes/${id}`)
          fetchHashes()
        } catch (err: any) {
          setError(err.response?.data?.message || 'Erro ao apagar')
        }
      }
    })
  }

  const canApprove = user?.role === 'super_admin' || user?.role === 'lidertecnico'

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

  return (
    <div className="p-6 space-y-6">

      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-px bg-gradient-to-r from-[rgba(0,255,100,0.3)] to-transparent" />
          <h1 className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.6)] tracking-[4px] uppercase">
            Gerenciamento de Hashes
          </h1>
        </div>
        <button
          onClick={openCreate}
          className="font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase px-4 py-2 border border-[rgba(0,255,100,0.4)] text-[#00ff64] hover:bg-[rgba(0,255,100,0.08)] hover:border-[rgba(0,255,100,0.8)] transition-all"
        >
          + ADICIONAR HASH
        </button>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-500/20 px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-red-400 tracking-wider flex justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError('')} className="opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Table */}
      <div className="relative bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,100,0.1)]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.3)] to-transparent" />
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.4)] tracking-[4px] animate-pulse">CARREGANDO...</span>
          </div>
        ) : (
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
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.2)] tracking-wider">
                    Nenhuma hash cadastrada
                  </td>
                </tr>
              )}
              {hashes.map(hash => (
                <tr key={hash.id} className="border-b border-[rgba(0,255,100,0.04)] hover:bg-[rgba(0,255,100,0.02)] transition-all">
                  <td className="px-4 py-3">
                    <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${typeColor[hash.type] || 'text-white/40 border-white/10'}`}>
                      {hash.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-white/70 max-w-[180px]">
                    <span title={hash.value}>{hash.value.slice(0, 16)}...</span>
                  </td>
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.4)] max-w-[160px] truncate">
                    {hash.description || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${statusColor[hash.status] || 'text-white/40 border-white/10'}`}>
                      {hash.status === 'approved' ? 'Aprovado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.4)]">
                    {hash.expiresAt ? new Date(hash.expiresAt).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.5)]">
                    {hash.createdBy?.username || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {canApprove && hash.status === 'pending' && (
                        <button onClick={() => handleApprove(hash.id)} className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(0,255,100,0.3)] text-[rgba(0,255,100,0.7)] hover:bg-[rgba(0,255,100,0.08)] transition-all">APROVAR</button>
                      )}
                      <button onClick={() => openEdit(hash)} className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] transition-all">EDITAR</button>
                      <button onClick={() => handleDelete(hash.id, hash.value)} className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(255,50,50,0.2)] text-[rgba(255,100,100,0.5)] hover:bg-[rgba(255,50,50,0.05)] hover:border-[rgba(255,50,50,0.4)] transition-all">APAGAR</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-[#030a0e] border border-[rgba(0,255,100,0.2)] w-full max-w-md p-6">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.6)] to-transparent" />
            <div className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(0,255,100,0.6)]" />
            <div className="absolute top-[-1px] right-[-1px] w-3 h-3 border-t-2 border-r-2 border-[rgba(0,255,100,0.6)]" />
            <div className="absolute bottom-[-1px] left-[-1px] w-3 h-3 border-b-2 border-l-2 border-[rgba(0,255,100,0.6)]" />
            <div className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(0,255,100,0.6)]" />

            <h2 className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.7)] tracking-[4px] uppercase mb-6">
              {editingHash ? 'Editar Hash' : 'Adicionar Hash'}
            </h2>

            <div className="space-y-4">

              {/* Tipo */}
              <div>
                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">Tipo</label>
                <div className="flex gap-2">
                  {HASH_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      disabled={!!editingHash}
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2 font-[family-name:var(--font-mono)] text-[10px] tracking-[2px] border transition-all disabled:opacity-40
                        ${form.type === t
                          ? 'border-[rgba(0,255,100,0.5)] text-[#00ff64] bg-[rgba(0,255,100,0.08)]'
                          : 'border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] hover:border-[rgba(0,255,100,0.3)]'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.2)] mt-1">
                  Esperado: {hashLengths[form.type]} caracteres
                </p>
              </div>

              {/* Value */}
              <div>
                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">
                  Valor da Hash
                </label>
                <input
                  type="text"
                  value={form.value}
                  onChange={e => setForm({ ...form, value: e.target.value.toLowerCase().replace(/[^a-f0-9]/g, '') })}
                  disabled={!!editingHash}
                  placeholder={`${hashLengths[form.type]} caracteres hex`}
                  maxLength={hashLengths[form.type]}
                  className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-xs outline-none focus:border-[rgba(0,255,100,0.5)] transition-all placeholder:text-white/10 disabled:opacity-40"
                />
                <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(255,255,255,0.2)] mt-1">
                  {form.value.length}/{hashLengths[form.type]} caracteres
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">Descrição</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="motivo do bloqueio"
                  className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[rgba(0,255,100,0.5)] transition-all placeholder:text-white/10"
                />
              </div>

              {/* Expires */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase">Data de Expiração</label>
                  <span title="Se não informada, o padrão será 30 dias a partir de hoje" className="w-4 h-4 rounded-full border border-[rgba(0,255,100,0.3)] text-[rgba(0,255,100,0.5)] flex items-center justify-center text-[9px] cursor-help hover:border-[rgba(0,255,100,0.6)] transition-all">?</span>
                </div>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[rgba(0,255,100,0.5)] transition-all [color-scheme:dark]"
                />
              </div>

              {error && (
                <div className="bg-red-950/30 border border-red-500/20 px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] text-red-400 tracking-wider">
                  ⚠ {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !form.value}
                  className="flex-1 border border-[rgba(0,255,100,0.4)] py-2.5 text-[#00ff64] font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase hover:bg-[rgba(0,255,100,0.08)] transition-all disabled:opacity-40"
                >
                  {saving ? 'SALVANDO...' : 'SALVAR'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-[rgba(255,255,255,0.1)] py-2.5 text-[rgba(255,255,255,0.4)] font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase hover:border-[rgba(255,50,50,0.3)] hover:text-red-400 transition-all"
                >
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