'use server'

import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { revalidatePath } from 'next/cache'

export async function createClient_(formData: FormData) {
  const user = await getCurrentUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const whatsapp = formData.get('whatsapp') as string
  const company = formData.get('company') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string

  const client = await clientPromise
  const db = client.db()
  const clientsCol = db.collection('clients')

  const newId = `client-${Math.random().toString(36).substring(2, 9)}`
  const newClient = {
    id: newId,
    user_id: user.id,
    name,
    email: email || null,
    phone: phone || null,
    whatsapp: whatsapp || null,
    company: company || null,
    address: address || null,
    notes: notes || null,
    created_at: new Date().toISOString()
  }

  await clientsCol.insertOne(newClient)

  revalidatePath('/dashboard/clients')
  return { data: newClient }
}

export async function updateClient(id: string, formData: FormData) {
  const user = await getCurrentUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const whatsapp = formData.get('whatsapp') as string
  const company = formData.get('company') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string

  const client = await clientPromise
  const db = client.db()
  const clientsCol = db.collection('clients')

  await clientsCol.updateOne(
    { id, user_id: user.id },
    {
      $set: {
        name,
        email: email || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        company: company || null,
        address: address || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      }
    }
  )

  revalidatePath('/dashboard/clients')
  revalidatePath(`/dashboard/clients/${id}`)
  return { success: true }
}

export async function deleteClient(id: string) {
  const user = await getCurrentUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const client = await clientPromise
  const db = client.db()
  
  const query = user.role === 'manager' ? { id } : { id, user_id: user.id }
  
  // Nullify client_id on associated projects and payments
  await db.collection('projects').updateMany(
    { client_id: id },
    { $set: { client_id: null } }
  )
  await db.collection('payments').updateMany(
    { client_id: id },
    { $set: { client_id: null } }
  )

  await db.collection('clients').deleteOne(query)

  revalidatePath('/dashboard/clients')
  return { success: true }
}
