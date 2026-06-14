'use server'

import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { revalidatePath } from 'next/cache'

export async function createService(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'manager') {
    return { error: 'Unauthorized: Only managers can manage services' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const icon = formData.get('icon') as string || 'palette'

  if (!title.trim() || !description.trim()) {
    return { error: 'Title and description are required' }
  }

  const client = await clientPromise
  const db = client.db()

  const newService = {
    id: `serv-${Math.random().toString(36).substring(2, 9)}`,
    user_id: user.id,
    title,
    description,
    icon,
    created_at: new Date().toISOString()
  }

  await db.collection('services').insertOne(newService)
  revalidatePath('/dashboard/cms')
  revalidatePath('/')

  return { success: true }
}

export async function deleteService(id: string) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'manager') {
    return { error: 'Unauthorized' }
  }

  const client = await clientPromise
  const db = client.db()

  await db.collection('services').deleteOne({ id })
  revalidatePath('/dashboard/cms')
  revalidatePath('/')

  return { success: true }
}
