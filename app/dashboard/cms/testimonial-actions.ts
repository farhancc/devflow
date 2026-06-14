'use server'

import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { revalidatePath } from 'next/cache'

export async function createTestimonial(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'manager') {
    return { error: 'Unauthorized: Only managers can add testimonials' }
  }

  const name = formData.get('name') as string
  const comment = formData.get('comment') as string
  const rating = parseInt(formData.get('rating') as string) || 5
  const service = formData.get('service') as string || 'Design Service'
  const date = formData.get('date') as string || 'Recently'

  if (!name.trim() || !comment.trim()) {
    return { error: 'Name and comment are required' }
  }

  const client = await clientPromise
  const db = client.db()

  const newTestimonial = {
    id: `testi-${Math.random().toString(36).substring(2, 9)}`,
    user_id: user.id,
    name,
    comment,
    rating,
    service,
    date,
    created_at: new Date().toISOString()
  }

  await db.collection('testimonials').insertOne(newTestimonial)
  revalidatePath('/dashboard/cms')
  revalidatePath('/')

  return { success: true }
}

export async function deleteTestimonial(id: string) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'manager') {
    return { error: 'Unauthorized' }
  }

  const client = await clientPromise
  const db = client.db()

  await db.collection('testimonials').deleteOne({ id })
  revalidatePath('/dashboard/cms')
  revalidatePath('/')

  return { success: true }
}
