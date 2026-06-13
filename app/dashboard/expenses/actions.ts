'use server'

import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { revalidatePath } from 'next/cache'

export async function createExpense(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const title       = formData.get('title') as string
  const amount      = parseFloat(formData.get('amount') as string)
  const category    = formData.get('category') as string
  const expenseDate = formData.get('expense_date') as string
  const employeeId  = formData.get('employee_id') as string
  const notes       = formData.get('notes') as string

  const client = await clientPromise
  const db = client.db()

  const newId = `exp-${Math.random().toString(36).substring(2, 9)}`
  const newExpense = {
    id: newId,
    user_id: user.id,
    employee_id: (employeeId && employeeId !== 'none') ? employeeId : null,
    title, amount, category,
    expense_date: expenseDate,
    notes: notes || null,
    created_at: new Date().toISOString()
  }

  await db.collection('expenses').insertOne(newExpense)
  revalidatePath('/dashboard/expenses')
  revalidatePath('/dashboard')
  return { data: newExpense }
}

export async function updateExpense(id: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const title       = formData.get('title') as string
  const amount      = parseFloat(formData.get('amount') as string)
  const category    = formData.get('category') as string
  const expenseDate = formData.get('expense_date') as string
  const employeeId  = formData.get('employee_id') as string
  const notes       = formData.get('notes') as string

  const client = await clientPromise
  const db = client.db()

  await db.collection('expenses').updateOne(
    { id, user_id: user.id },
    { $set: {
        employee_id: (employeeId && employeeId !== 'none') ? employeeId : null,
        title, amount, category,
        expense_date: expenseDate,
        notes: notes || null,
        updated_at: new Date().toISOString()
      }
    }
  )

  revalidatePath('/dashboard/expenses')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteExpense(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const client = await clientPromise
  const db = client.db()
  await db.collection('expenses').deleteOne({ id, user_id: user.id })

  revalidatePath('/dashboard/expenses')
  revalidatePath('/dashboard')
  return { success: true }
}
