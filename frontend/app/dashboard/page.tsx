'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface Stats {
  totalIps: number
  totalHashes: number
  totalDomains: number
  pendingTotal: number
  pendingIps: number
  pendingHashes: number
  pendingDomains: number
  recentLogs: any[]
  chartData: any[]
  range: string
}

type Range = '12h' | '7d' | '30d'

const RANGES: { value: Range; label: string }[] = [
  { value: '12h', label: 'Últimas 12h' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
]

const actionLabels: Record<string, string> = {
  CREATE: 'Criou', UPDATE: 'Editou', DELETE: 'Apagou',
  APPROVE: 'Aprovou', LOGIN: 'Login', FEED_GENERATED: 'Feed gerado',
}

const entityLabels: Record<string, string> = {
  IP: 'IP', HASH: 'Hash', DOMAIN: 'Domínio', USER: 'Usuário', FEED: 'Feed',
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<Range>('7d')
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    api.get('/dashboard/stats', { params: { range } })
      .then(res => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  const handleRangeChange = async (r: Range) => {
    setRange(r)
    setChartLoading(true)
    try {
      const res = await api.get('/dashboard/stats', { params: { range: r } })
      setStats(res.data)
    } finally {
      setChartLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="font-[family-name:var(--font-mono)] text-[rgba(0,255,100,0.5)] text-sm tracking-[4px] animate-pulse">
          CARREGANDO...
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-[rgba(0,255,100,0.3)] to-transparent" />
        <h1 className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(0,255,100,0.6)] tracking-[4px] uppercase">
          Painel de Controle
        </h1>
        <div className="flex-1 h-px bg-gradient-to-l from-[rgba(0,255,100,0.3)] to-transparent" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'IPs Bloqueados', value: stats.totalIps, icon: '◈', color: '#00ff64', href: '/dashboard/ips' },
          { label: 'Hashes', value: stats.totalHashes, icon: '◆', color: '#00d4ff', href: '/dashboard/hashes' },
          { label: 'Domínios', value: stats.totalDomains, icon: '◉', color: '#a78bfa', href: '/dashboard/domains' },
          { label: 'Pendentes', value: stats.pendingTotal, icon: '⚠', color: '#fbbf24', href: null },
        ].map(card => (
          <div
            key={card.label}
            onClick={() => card.href && router.push(card.href)}
            className={`relative bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,100,0.1)] p-5 transition-all
              ${card.href ? 'cursor-pointer hover:border-[rgba(0,255,100,0.3)] hover:bg-[rgba(0,255,100,0.04)]' : ''}`}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.3)] to-transparent" />
            <div className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t border-l border-[rgba(0,255,100,0.5)]" />
            <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b border-r border-[rgba(0,255,100,0.5)]" />
            <div className="flex items-start justify-between">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[3px] uppercase mb-2 text-[rgba(255,255,255,0.4)]">
                  {card.label}
                </p>
                <p className="font-[family-name:var(--font-rajdhani)] text-4xl font-bold" style={{ color: card.color }}>
                  {card.value.toLocaleString()}
                </p>
              </div>
              <span className="text-2xl opacity-30">{card.icon}</span>
            </div>
            {card.href && (
              <p className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.3)] tracking-[2px] mt-2 uppercase">
                Ver todos →
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Pending breakdown */}
      {stats.pendingTotal > 0 && (
        <div className="bg-[rgba(251,191,36,0.04)] border border-[rgba(251,191,36,0.15)] p-4">
          <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(251,191,36,0.7)] tracking-[3px] uppercase mb-3">
            ⚠ Itens aguardando aprovação
          </p>
          <div className="flex gap-6">
            {[
              { label: 'IPs', value: stats.pendingIps, href: '/dashboard/ips' },
              { label: 'Hashes', value: stats.pendingHashes, href: '/dashboard/hashes' },
              { label: 'Domínios', value: stats.pendingDomains, href: '/dashboard/domains' },
            ].map(item => (
              <div key={item.label}
                onClick={() => router.push(item.href)}
                className="cursor-pointer hover:opacity-80 transition-all">
                <span className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold text-yellow-400">{item.value}</span>
                <span className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.4)] tracking-wider ml-2">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart + Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Chart */}
        <div className="relative bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,100,0.1)] p-5">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.3)] to-transparent" />

          <div className="flex items-center justify-between mb-4">
            <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase">
              Cadastros
            </p>
            <div className="flex gap-1">
              {RANGES.map(r => (
                <button key={r.value} onClick={() => handleRangeChange(r.value)}
                  className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[1px] px-2.5 py-1 border transition-all
                    ${range === r.value
                      ? 'border-[rgba(0,255,100,0.5)] text-[#00ff64] bg-[rgba(0,255,100,0.08)]'
                      : 'border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] hover:border-[rgba(0,255,100,0.3)]'}`}
                >{r.label}</button>
              ))}
            </div>
          </div>

          {chartLoading ? (
            <div className="flex items-center justify-center h-[220px]">
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.4)] tracking-[4px] animate-pulse">CARREGANDO...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorIps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff64" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00ff64" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHashes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDomains" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,100,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#030a0e', border: '1px solid rgba(0,255,100,0.2)', borderRadius: 0, fontFamily: 'var(--font-mono)', fontSize: 11 }}
                  labelStyle={{ color: 'rgba(0,255,100,0.7)' }}
                  itemStyle={{ color: 'rgba(255,255,255,0.7)' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 10 }} />
                <Area type="monotone" dataKey="ips" stroke="#00ff64" fill="url(#colorIps)" strokeWidth={1.5} name="IPs" />
                <Area type="monotone" dataKey="hashes" stroke="#00d4ff" fill="url(#colorHashes)" strokeWidth={1.5} name="Hashes" />
                <Area type="monotone" dataKey="domains" stroke="#a78bfa" fill="url(#colorDomains)" strokeWidth={1.5} name="Domínios" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent logs */}
        <div className="relative bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,100,0.1)] p-5">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.3)] to-transparent" />
          <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.5)] tracking-[3px] uppercase mb-4">
            Atividade recente
          </p>
          <div className="space-y-2 overflow-auto max-h-[260px]">
            {stats.recentLogs.length === 0 && (
              <p className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.2)] tracking-wider">
                Nenhuma atividade registrada
              </p>
            )}
            {stats.recentLogs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-[rgba(0,255,100,0.05)]">
                <span className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.4)] tracking-wider whitespace-nowrap mt-0.5">
                  {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div>
                  <span className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(0,255,100,0.7)] tracking-wider">
                    {log.user?.username || 'sistema'}
                  </span>
                  <span className="font-[family-name:var(--font-mono)] text-[10px] text-[rgba(255,255,255,0.3)] tracking-wider">
                    {' '}{actionLabels[log.action] || log.action}{' '}{entityLabels[log.entity] || log.entity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}