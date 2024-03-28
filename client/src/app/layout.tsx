import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../style/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IPList',
  description: 'Sistema de concentração de IPS Bloquedos da Prefeitura de Salvador ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br" className='h-full'>
      <link rel="icon" href="/icon?<generated>" type="image/png" sizes="32x32" />
      <body className={`${inter.className} h-full bg-gray-200`}>{children}</body>
    </html>
  )
}
