'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { saveAuth } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { username, password })
      saveAuth(res.data.access_token, res.data.user)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#030a0e] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,100,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Glow orb */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,255,100,0.06)_0%,transparent_70%)] pointer-events-none animate-pulse" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">

        {/* Top bar */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[rgba(0,255,100,0.4)]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff64] shadow-[0_0_8px_#00ff64] animate-pulse" />
          <span className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.6)] tracking-[3px]">SISTEMA ONLINE</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[rgba(0,255,100,0.4)]" />
        </div>

        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="font-[family-name:var(--font-rajdhani)] text-6xl font-bold text-white tracking-[14px] [text-shadow:0_0_40px_rgba(0,255,100,0.3)]">
            B<span className="text-[#00ff64]">I</span>P
          </h1>
          <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.5)] tracking-[5px] mt-2 uppercase">
            Blocklist Intelligence Platform
          </p>
        </div>

        {/* Form card */}
        <div className="relative bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,100,0.15)] p-8 backdrop-blur-sm">

          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.6)] to-transparent" />

          {/* Corners */}
          <div className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(0,255,100,0.6)]" />
          <div className="absolute top-[-1px] right-[-1px] w-3 h-3 border-t-2 border-r-2 border-[rgba(0,255,100,0.6)]" />
          <div className="absolute bottom-[-1px] left-[-1px] w-3 h-3 border-b-2 border-l-2 border-[rgba(0,255,100,0.6)]" />
          <div className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(0,255,100,0.6)]" />

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="identificação"
                required
                autoComplete="off"
                className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-3 text-white font-[family-name:var(--font-mono)] text-sm tracking-wider outline-none focus:border-[rgba(0,255,100,0.5)] focus:shadow-[0_0_0_1px_rgba(0,255,100,0.1)] transition-all placeholder:text-white/10"
              />
            </div>

            <div>
              <label className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase block mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-black/40 border border-[rgba(0,255,100,0.15)] px-4 py-3 text-white font-[family-name:var(--font-mono)] text-sm tracking-wider outline-none focus:border-[rgba(0,255,100,0.5)] focus:shadow-[0_0_0_1px_rgba(0,255,100,0.1)] transition-all placeholder:text-white/10"
              />
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-500/20 px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] text-red-400 tracking-wider">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-[rgba(0,255,100,0.4)] py-3.5 text-[#00ff64] font-[family-name:var(--font-rajdhani)] font-semibold text-base tracking-[5px] uppercase hover:border-[rgba(0,255,100,0.8)] hover:shadow-[0_0_20px_rgba(0,255,100,0.1)] hover:bg-[rgba(0,255,100,0.05)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'AUTENTICANDO...' : 'ACESSAR SISTEMA'}
            </button>

          </form>

          <div className="flex justify-between mt-6 pt-4 border-t border-[rgba(0,255,100,0.08)]">
            <span className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.25)] tracking-[2px]">BIP v1.0.0</span>
            <span className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.25)] tracking-[2px]">ACESSO RESTRITO</span>
          </div>

        </div>
      </div>
    </div>
  )
}