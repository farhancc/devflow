'use server'

import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { revalidatePath } from 'next/cache'

export async function createCustomEvent(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const type = formData.get('type') as string || 'other'
  const time = formData.get('time') as string || ''
  const notes = formData.get('notes') as string || ''

  if (!title || !date) {
    return { error: 'Title and date are required' }
  }

  const client = await clientPromise
  const db = client.db()

  const newEvent = {
    id: `evt-${Math.random().toString(36).substring(2, 9)}`,
    user_id: user.id,
    title,
    date,
    type,
    time,
    notes,
    created_at: new Date().toISOString()
  }

  await db.collection('events').insertOne(newEvent)
  revalidatePath('/dashboard/calendar')
  return { success: true, event: newEvent }
}

export async function deleteCustomEvent(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const client = await clientPromise
  const db = client.db()

  await db.collection('events').deleteOne({ id, user_id: user.id })
  revalidatePath('/dashboard/calendar')
  return { success: true }
}
