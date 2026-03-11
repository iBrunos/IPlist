import type { Metadata } from 'next'
import { Share_Tech_Mono, Rajdhani } from 'next/font/google'
import './globals.css'

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
})

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'BIP - Blocklist Intelligence Platform',
  description: 'Blocklist Intelligence Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${rajdhani.variable} ${shareTechMono.variable} bg-[#030a0e]`}>
        {children}
      </body>
    </html>
  )
}