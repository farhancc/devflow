'use server'

import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { revalidatePath } from 'next/cache'

export async function createPayment(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const projectId    = formData.get('project_id') as string
  const clientId     = formData.get('client_id') as string
  const employeeId   = formData.get('employee_id') as string
  const amount       = parseFloat(formData.get('amount') as string)
  const paymentDate  = formData.get('payment_date') as string
  const paymentMethod = formData.get('payment_method') as string
  const notes        = formData.get('notes') as string

  const client = await clientPromise
  const db = client.db()

  const newId = `pay-${Math.random().toString(36).substring(2, 9)}`
  const newPayment = {
    id: newId,
    user_id: user.id,
    employee_id: (employeeId && employeeId !== 'none') ? employeeId : null,
    project_id:  (projectId  && projectId  !== 'none') ? projectId  : null,
    client_id:   (clientId   && clientId   !== 'none') ? clientId   : null,
    amount,
    payment_date: paymentDate,
    payment_method: paymentMethod || null,
    notes: notes || null,
    created_at: new Date().toISOString()
  }

  await db.collection('payments').insertOne(newPayment)
  revalidatePath('/dashboard/payments')
  revalidatePath('/dashboard')
  return { data: newPayment }
}

export async function updatePayment(id: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const projectId    = formData.get('project_id') as string
  const clientId     = formData.get('client_id') as string
  const employeeId   = formData.get('employee_id') as string
  const amount       = parseFloat(formData.get('amount') as string)
  const paymentDate  = formData.get('payment_date') as string
  const paymentMethod = formData.get('payment_method') as string
  const notes        = formData.get('notes') as string

  const client = await clientPromise
  const db = client.db()

  await db.collection('payments').updateOne(
    { id, user_id: user.id },
    { $set: {
        employee_id: (employeeId && employeeId !== 'none') ? employeeId : null,
        project_id:  (projectId  && projectId  !== 'none') ? projectId  : null,
        client_id:   (clientId   && clientId   !== 'none') ? clientId   : null,
        amount, payment_date: paymentDate,
        payment_method: paymentMethod || null,
        notes: notes || null,
        updated_at: new Date().toISOString()
      }
    }
  )

  revalidatePath('/dashboard/payments')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deletePayment(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const client = await clientPromise
  const db = client.db()
  await db.collection('payments').deleteOne({ id, user_id: user.id })

  revalidatePath('/dashboard/payments')
  revalidatePath('/dashboard')
  return { success: true }
}
