'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { findUserByUsername, createUser, hashPassword } from '@/lib/db'
import { signJWT } from '@/lib/jwt'
import { getCurrentUser } from '@/lib/auth'

export async function signIn(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Please provide both username and password.' }
  }

  const user = await findUserByUsername(username)
  if (!user) {
    return { error: 'Invalid username or password.' }
  }

  const inputHash = await hashPassword(password)
  if (user.passwordHash !== inputHash) {
    return { error: 'Invalid username or password.' }
  }

  // Sign JWT
  const token = await signJWT({
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
  })

  // Set Cookie
  const cookieStore = await cookies()
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  return { error: 'Signup is disabled. Only the Manager can create accounts.' }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
  redirect('/')
}

export async function getUser() {
  return await getCurrentUser()
}
