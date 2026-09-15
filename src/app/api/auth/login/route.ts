import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, setAdminCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  const admin = await prisma.adminUser.findUnique({ where: { username } })
  if (!admin) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, admin.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  const token = await signToken({ id: admin.id, username: admin.username })
  await setAdminCookie(token)

  return NextResponse.json({ ok: true })
}
