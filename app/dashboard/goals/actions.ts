'use server'

import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { revalidatePath } from 'next/cache'

export async function saveGoal(
  month: number,
  year: number,
  targetValue: number,
  targetType: 'income' | 'projects' | 'expenses' = 'income'
) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const client = await clientPromise
  const db = client.db()
  const goalsCol = db.collection('goals')

  // One goal per (user, month, year, type) combination
  const existing = await goalsCol.findOne({ user_id: user.id, month, year, target_type: targetType })

  if (existing) {
    await goalsCol.updateOne(
      { id: existing.id },
      { $set: { target_value: targetValue } }
    )
  } else {
    await goalsCol.insertOne({
      id: `goal-${Math.random().toString(36).substring(2, 9)}`,
      user_id: user.id,
      month, year,
      target_type: targetType,
      target_value: targetValue,
      created_at: new Date().toISOString()
    })
  }

  revalidatePath('/dashboard/goals')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteGoal(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const client = await clientPromise
  const db = client.db()
  await db.collection('goals').deleteOne({ id, user_id: user.id })

  revalidatePath('/dashboard/goals')
  revalidatePath('/dashboard')
  return { success: true }
}
