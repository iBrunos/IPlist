'use client'

import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'

interface User {
    id: string
    username: string
    email: string
    equipe: string
    role: string
    createdAt: string
}

const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    lidertecnico: 'Líder Técnico',
    tecnico: 'Técnico',
}

const ROLE_COLOR: Record<string, string> = {
    super_admin: 'text-[#a78bfa] border-[rgba(167,139,250,0.3)] bg-[rgba(167,139,250,0.05)]',
    lidertecnico: 'text-[#00d4ff] border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.05)]',
    tecnico: 'text-[#00ff64] border-[rgba(0,255,100,0.3)] bg-[rgba(0,255,100,0.05)]',
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

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [form, setForm] = useState({ username: '', email: '', password: '', equipe: '', role: 'tecnico' })
    const [formError, setFormError] = useState('')
    const [pageError, setPageError] = useState('')
    const [saving, setSaving] = useState(false)
    const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null)
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const currentUser = getUser()
    const isSuperAdmin = currentUser?.role === 'super_admin'
    const isLider = currentUser?.role === 'lidertecnico'

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get('/users')
            setUsers(res.data)
        } catch (err: any) {
            setPageError(err.response?.data?.message || 'Erro ao carregar usuários')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchUsers() }, [fetchUsers])

    // Debounce
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
        return () => clearTimeout(t)
    }, [searchInput])

    const filtered = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.equipe.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    )
    const totalPages = Math.ceil(filtered.length / perPage)
    const paginated = filtered.slice((page - 1) * perPage, page * perPage)

    const openCreate = () => {
        setEditingUser(null)
        setForm({
            username: '',
            email: '',
            password: '',
            equipe: isLider ? currentUser.equipe : '',
            role: isLider ? 'tecnico' : 'tecnico',
        })
        setFormError('')
        setShowModal(true)
    }

    const openEdit = (user: User) => {
        setEditingUser(user)
        setForm({ username: user.username, email: user.email, password: '', equipe: user.equipe, role: user.role })
        setFormError('')
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!form.username.trim()) { setFormError('Username é obrigatório'); return }
        if (!editingUser && !form.password.trim()) { setFormError('Senha é obrigatória'); return }
        if (!form.equipe.trim()) { setFormError('Equipe é obrigatória'); return }

        setSaving(true)
        setFormError('')
        try {
            const payload: any = { username: form.username, email: form.email, equipe: form.equipe, role: form.role }
            if (form.password) payload.password = form.password

            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, payload)
            } else {
                await api.post('/users', payload)
            }
            setShowModal(false)
            fetchUsers()
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Erro ao salvar')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = (user: User) => {
        if (user.id === currentUser?.id) {
            setPageError('Você não pode apagar sua própria conta')
            return
        }
        setConfirm({
            message: `Deseja remover o usuário ${user.username}?`,
            onConfirm: async () => {
                setConfirm(null)
                try { await api.delete(`/users/${user.id}`); fetchUsers() }
                catch (err: any) { setPageError(err.response?.data?.message || 'Erro ao apagar') }
            }
        })
    }

    const renderPagination = () => {
        if (totalPages <= 1) return null
        const pages: number[] = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            if (page > 3) pages.push(-1)
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
            if (page < totalPages - 2) pages.push(-2)
            pages.push(totalPages)
        }
        return (
            <div className="flex items-center justify-center gap-2 flex-wrap">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="font-[family-name:var(--font-mono)] text-[10px] px-3 py-1.5 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] disabled:opacity-20 transition-all">
                    ‹ ANTERIOR
                </button>
                {pages.map((n, i) => n < 0
                    ? <span key={n + '_' + i} className="font-[family-name:var(--font-mono)] text-[10px] text-white/20 px-1">…</span>
                    : <button key={n} onClick={() => setPage(n)}
                        className={`font-[family-name:var(--font-mono)] text-[10px] w-8 h-8 border transition-all
                ${page === n ? 'border-[rgba(0,255,100,0.5)] text-[#00ff64] bg-[rgba(0,255,100,0.08)]' : 'border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] hover:border-[rgba(0,255,100,0.3)]'}`}
                    >{n}</button>
                )}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="font-[family-name:var(--font-mono)] text-[10px] px-3 py-1.5 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] disabled:opacity-20 transition-all">
                    PRÓXIMA ›
                </button>
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
                    <h1 className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.6)] tracking-[4px] uppercase">Gerenciamento de Usuários</h1>
                </div>
                <button onClick={openCreate} className="font-[family-name:var(--font-mono)] text-[10px] tracking-[3px] uppercase px-4 py-2 border border-[rgba(0,255,100,0.4)] text-[#00ff64] hover:bg-[rgba(0,255,100,0.08)] transition-all">
                    + ADICIONAR USUÁRIO
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
                        placeholder="Buscar por usuário, email, equipe ou role..."
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
                    {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} · pág. {page}/{totalPages || 1}
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
                                    {['Usuário', 'Email', 'Equipe', 'Role', 'Criado em', 'Ações'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.2)] tracking-wider">
                                        {search ? `Nenhum resultado para "${search}"` : 'Nenhum usuário cadastrado'}
                                    </td></tr>
                                )}
                                {paginated.map(u => (
                                    <tr key={u.id} className={`border-b border-[rgba(0,255,100,0.04)] hover:bg-[rgba(0,255,100,0.02)] transition-all ${u.id === currentUser?.id ? 'bg-[rgba(0,255,100,0.02)]' : ''}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-[rgba(0,255,100,0.08)] border border-[rgba(0,255,100,0.2)] flex items-center justify-center font-[family-name:var(--font-mono)] text-[10px] text-[#00ff64]">
                                                    {u.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-[family-name:var(--font-mono)] text-[11px] text-white tracking-wider">{u.username}</p>
                                                    {u.id === currentUser?.id && (
                                                        <p className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.5)] tracking-wider">você</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.4)]">{u.email || '—'}</td>
                                        <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.5)] tracking-wider">{u.equipe}</td>
                                        <td className="px-4 py-3">
                                            <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${ROLE_COLOR[u.role] || 'text-white/40 border-white/10'}`}>
                                                {ROLE_LABELS[u.role] || u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-[rgba(255,255,255,0.3)]">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEdit(u)}
                                                    className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] transition-all">EDITAR</button>
                                                {u.id !== currentUser?.id && (
                                                    <button onClick={() => handleDelete(u)}
                                                        className="font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] px-2 py-1 border border-[rgba(255,50,50,0.2)] text-[rgba(255,100,100,0.5)] hover:bg-[rgba(255,50,50,0.05)] hover:border-[rgba(255,50,50,0.4)] transition-all">APAGAR</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                        {paginated.length === 0 && (
                            <div className="text-center py-12 font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.2)] tracking-wider">
                                {search ? `Nenhum resultado para "${search}"` : 'Nenhum usuário cadastrado'}
                            </div>
                        )}
                        {paginated.map(u => (
                            <div key={u.id} className={`relative bg-[rgba(255,255,255,0.02)] border p-4 ${u.id === currentUser?.id ? 'border-[rgba(0,255,100,0.2)]' : 'border-[rgba(0,255,100,0.1)]'}`}>
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.2)] to-transparent" />
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-[rgba(0,255,100,0.08)] border border-[rgba(0,255,100,0.2)] flex items-center justify-center font-[family-name:var(--font-mono)] text-sm text-[#00ff64]">
                                            {u.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-[family-name:var(--font-mono)] text-[11px] text-white tracking-wider">{u.username}</p>
                                            <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.3)]">{u.email || '—'}</p>
                                        </div>
                                    </div>
                                    <span className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] uppercase px-2 py-1 border ${ROLE_COLOR[u.role] || 'text-white/40 border-white/10'}`}>
                                        {ROLE_LABELS[u.role] || u.role}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mb-3">
                                    <div>
                                        <p className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">Equipe</p>
                                        <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.5)]">{u.equipe}</p>
                                    </div>
                                    <div>
                                        <p className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">Criado em</p>
                                        <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.3)]">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-[rgba(0,255,100,0.06)]">
                                    <button onClick={() => openEdit(u)} className="flex-1 font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] py-1.5 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] hover:border-[rgba(0,255,100,0.3)] hover:text-[rgba(0,255,100,0.7)] transition-all">EDITAR</button>
                                    {u.id !== currentUser?.id && (
                                        <button onClick={() => handleDelete(u)} className="flex-1 font-[family-name:var(--font-mono)] text-[9px] tracking-[2px] py-1.5 border border-[rgba(255,50,50,0.2)] text-[rgba(255,100,100,0.5)] hover:bg-[rgba(255,50,50,0.05)] transition-all">APAGAR</button>
                                    )}
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
                            {editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">Username</label>
                                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                                    disabled={!!editingUser} placeholder="nome do usuário"
                                    className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[rgba(0,255,100,0.5)] transition-all placeholder:text-white/10 disabled:opacity-40" />
                            </div>

                            <div>
                                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="email@dominio.com"
                                    className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[rgba(0,255,100,0.5)] transition-all placeholder:text-white/10" />
                            </div>

                            <div>
                                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">
                                    {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                                </label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder={editingUser ? 'deixe em branco para não alterar' : 'senha'}
                                    className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[rgba(0,255,100,0.5)] transition-all placeholder:text-white/10" />
                            </div>

                            <div>
                                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">Equipe</label>
                                <select
                                    value={form.equipe}
                                    onChange={e => setForm({ ...form, equipe: e.target.value })}
                                    disabled={isLider}
                                    className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-2.5 text-white font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[rgba(0,255,100,0.5)] transition-all disabled:opacity-40 [color-scheme:dark]"
                                >
                                    <option value="" disabled>selecione a equipe</option>
                                    <option value="GESEG">GESEG</option>
                                    <option value="GECON">GECON</option>
                                    <option value="GEDAT">GEDAT</option>
                                </select>
                            </div>

                            {/* Role — líder só pode criar técnico */}
                            <div>
                                <label className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">Role</label>
                                <div className="flex gap-2">
                                    {(isSuperAdmin
                                        ? ['tecnico', 'lidertecnico', 'super_admin']
                                        : ['tecnico']
                                    ).map(r => (
                                        <button key={r} type="button"
                                            onClick={() => setForm({ ...form, role: r })}
                                            disabled={isLider}
                                            className={`flex-1 py-2 font-[family-name:var(--font-mono)] text-[10px] tracking-[2px] border transition-all disabled:opacity-60
                        ${form.role === r ? 'border-[rgba(0,255,100,0.5)] text-[#00ff64] bg-[rgba(0,255,100,0.08)]' : 'border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] hover:border-[rgba(0,255,100,0.3)]'}`}
                                        >{ROLE_LABELS[r]}</button>
                                    ))}
                                </div>
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
        </div>
    )
}