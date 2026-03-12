import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('http://localhost:3000/feed/ips', { cache: 'no-store' })
    const text = await res.text()
    return new NextResponse(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  } catch {
    return new NextResponse('# Erro ao carregar feed', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}