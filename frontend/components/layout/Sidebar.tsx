'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getUser, logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'DASHBOARD', icon: '▣' },
  { href: '/dashboard/ips', label: 'IPs', icon: '◈' },
  { href: '/dashboard/hashes', label: 'HASHES', icon: '◆' },
  { href: '/dashboard/domains', label: 'DOMÍNIOS', icon: '◉' },
  { href: '/dashboard/feeds', label: 'FEEDS EXT.', icon: '⇄' },
  { href: '/dashboard/users', label: 'USUÁRIOS', icon: '◎' },
  { href: '/dashboard/audit', label: 'AUDITORIA', icon: '◷' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setUser(getUser())
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside className={`
      relative flex flex-col bg-[#030a0e] border-r border-[rgba(0,255,100,0.1)] 
      transition-all duration-300 min-h-screen
      ${collapsed ? 'w-16' : 'w-56'}
    `}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,255,100,0.4)] to-transparent" />

      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-[rgba(0,255,100,0.08)] ${collapsed ? 'justify-center' : ''}`}>
        <span className="font-[family-name:var(--font-rajdhani)] text-xl font-bold text-white tracking-[6px]">
          B<span className="text-[#00ff64]">I</span>P
        </span>
        {!collapsed && (
          <span className="font-[family-name:var(--font-mono)] text-[8px] text-[rgba(0,255,100,0.4)] tracking-[2px] uppercase">v1.0.0</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 transition-all relative group
                ${active
                  ? 'text-[#00ff64] bg-[rgba(0,255,100,0.08)] border border-[rgba(0,255,100,0.2)]'
                  : 'text-[rgba(255,255,255,0.4)] hover:text-[rgba(0,255,100,0.8)] hover:bg-[rgba(0,255,100,0.04)] border border-transparent'
                }`}
            >
              {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#00ff64]" />}
              <span className="text-sm">{item.icon}</span>
              {!collapsed && (
                <span className="font-[family-name:var(--font-mono)] text-[11px] tracking-[2px]">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-[rgba(0,255,100,0.08)] space-y-2">
        {!collapsed && user && (
          <div className="px-2 py-2 bg-[rgba(0,255,100,0.04)] border border-[rgba(0,255,100,0.1)]">
            <p className="font-[family-name:var(--font-mono)] text-[10px] text-white tracking-wider truncate">{user.username}</p>
            <p className="font-[family-name:var(--font-mono)] text-[9px] text-[rgba(0,255,100,0.5)] tracking-wider uppercase">{user.role}</p>
          </div>
        )}
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 text-[rgba(255,100,100,0.5)] 
            hover:text-red-400 hover:bg-[rgba(255,50,50,0.05)] border border-transparent 
            hover:border-[rgba(255,50,50,0.2)] transition-all
            ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="text-sm">⏻</span>
          {!collapsed && (
            <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[2px]">SAIR</span>
          )}
        </button>
      </div>

      {/* Collapse button */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#030a0e] border border-[rgba(0,255,100,0.2)] text-[rgba(0,255,100,0.6)] flex items-center justify-center text-xs hover:border-[rgba(0,255,100,0.5)] hover:text-[#00ff64] transition-all">
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  )
}