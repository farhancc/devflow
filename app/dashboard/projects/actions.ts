'use server'

import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { revalidatePath } from 'next/cache'

async function syncProjectPayments(
  db: any,
  projectId: string,
  title: string,
  clientId: string | null,
  userId: string,
  assignedTo: string | null | undefined,
  amount: number,
  advancePayment: number,
  status: string
) {
  const client_id = (clientId && clientId !== 'none') ? clientId : null
  const employee_id = (assignedTo && assignedTo !== 'none') ? assignedTo : null

  // 1. Sync Advance Payment
  const advancePaymentDoc = await db.collection('payments').findOne({
    project_id: projectId,
    notes: { $regex: /Advance payment/i }
  })

  if (advancePayment > 0) {
    if (advancePaymentDoc) {
      await db.collection('payments').updateOne(
        { id: advancePaymentDoc.id },
        { 
          $set: { 
            amount: advancePayment,
            client_id: client_id,
            employee_id: employee_id,
            notes: `Advance payment for ${title}`,
            updated_at: new Date().toISOString()
          } 
        }
      )
    } else {
      const paymentId = `pay-${Math.random().toString(36).substring(2, 9)}`
      await db.collection('payments').insertOne({
        id: paymentId,
        user_id: userId,
        employee_id: employee_id,
        amount: advancePayment,
        payment_date: new Date().toISOString().split('T')[0],
        project_id: projectId,
        client_id: client_id,
        status: 'paid',
        notes: `Advance payment for ${title}`,
        created_at: new Date().toISOString()
      })
    }
  } else if (advancePaymentDoc) {
    await db.collection('payments').deleteOne({ id: advancePaymentDoc.id })
  }

  // 2. Sync Final Payment when completed
  const finalPaymentDoc = await db.collection('payments').findOne({
    project_id: projectId,
    notes: { $regex: /Final payment/i }
  })

  if (status === 'completed') {
    // Calculate how much has been paid so far (excluding the final payment doc itself)
    const otherPayments = await db.collection('payments').find({
      project_id: projectId,
      id: { $ne: finalPaymentDoc?.id || '' }
    }).toArray()
    const totalPaidOther = otherPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)
    const remaining = amount - totalPaidOther

    if (remaining > 0) {
      if (finalPaymentDoc) {
        await db.collection('payments').updateOne(
          { id: finalPaymentDoc.id },
          { 
            $set: { 
              amount: remaining,
              client_id: client_id,
              employee_id: employee_id,
              notes: `Final payment for ${title}`,
              updated_at: new Date().toISOString()
            } 
          }
        )
      } else {
        const paymentId = `pay-${Math.random().toString(36).substring(2, 9)}`
        await db.collection('payments').insertOne({
          id: paymentId,
          user_id: userId,
          employee_id: employee_id,
          amount: remaining,
          payment_date: new Date().toISOString().split('T')[0],
          project_id: projectId,
          client_id: client_id,
          status: 'paid',
          notes: `Final payment for ${title}`,
          created_at: new Date().toISOString()
        })
      }
    } else if (finalPaymentDoc) {
      await db.collection('payments').deleteOne({ id: finalPaymentDoc.id })
    }
  } else if (finalPaymentDoc) {
    await db.collection('payments').deleteOne({ id: finalPaymentDoc.id })
  }
}

export async function createProject(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const title        = formData.get('title') as string
  const description  = formData.get('description') as string
  const category     = formData.get('category') as string
  const clientId     = formData.get('client_id') as string
  const assignedTo   = formData.get('assigned_to') as string
  const amount       = parseFloat(formData.get('amount') as string) || 0
  const advancePayment = parseFloat(formData.get('advance_payment') as string) || 0
  const deadline     = formData.get('deadline') as string
  const priority     = formData.get('priority') as string || 'medium'
  const status       = formData.get('status') as string || 'inquiry'
  const imageUrl     = formData.get('image_url') as string

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const client = await clientPromise
  const db = client.db()

  const newId = `proj-${Math.random().toString(36).substring(2, 9)}`
  const newProject = {
    id: newId,
    user_id: user.id,
    assigned_to: (assignedTo && assignedTo !== 'none') ? assignedTo : null,
    title, description, category,
    client_id: (clientId && clientId !== 'none') ? clientId : null,
    amount, advance_payment: advancePayment,
    deadline: deadline || null,
    priority, status, slug,
    is_featured: false,
    preview_images: imageUrl ? [imageUrl] : [],
    created_at: new Date().toISOString()
  }

  await db.collection('projects').insertOne(newProject)
  
  await syncProjectPayments(
    db,
    newId,
    title,
    newProject.client_id,
    user.id,
    newProject.assigned_to,
    amount,
    advancePayment,
    status
  )

  revalidatePath('/dashboard/projects')
  revalidatePath('/')
  
  // Extract _id so it does not cause serialization issues
  const { _id, ...plainProject } = newProject as any
  return { data: plainProject }
}

export async function updateProject(id: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const title        = formData.get('title') as string
  const description  = formData.get('description') as string
  const category     = formData.get('category') as string
  const clientId     = formData.get('client_id') as string
  const assignedTo   = formData.get('assigned_to') as string
  const amount       = parseFloat(formData.get('amount') as string) || 0
  const advancePayment = parseFloat(formData.get('advance_payment') as string) || 0
  const deadline     = formData.get('deadline') as string
  const priority     = formData.get('priority') as string
  const status       = formData.get('status') as string
  const isFeatured   = formData.get('is_featured') === 'true'
  const imageUrl     = formData.get('image_url') as string

  const client = await clientPromise
  const db = client.db()

  const query = user.role === 'manager' ? { id } : { id, user_id: user.id }

  await db.collection('projects').updateOne(
    query,
    { $set: {
        title, description, category,
        client_id: (clientId && clientId !== 'none') ? clientId : null,
        assigned_to: (assignedTo && assignedTo !== 'none') ? assignedTo : null,
        amount, advance_payment: advancePayment,
        deadline: deadline || null,
        priority, status,
        is_featured: isFeatured,
        preview_images: imageUrl ? [imageUrl] : [],
        updated_at: new Date().toISOString(),
      }
    }
  )

  const project = await db.collection('projects').findOne(query)
  if (project) {
    await syncProjectPayments(
      db,
      id,
      project.title,
      project.client_id,
      project.user_id,
      project.assigned_to,
      project.amount,
      project.advance_payment || 0,
      project.status
    )
  }

  revalidatePath('/dashboard/projects')
  revalidatePath(`/dashboard/projects/${id}`)
  revalidatePath('/')
  return { success: true }
}

export async function deleteProject(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const client = await clientPromise
  const db = client.db()
  
  const query = user.role === 'manager' ? { id } : { id, user_id: user.id }
  
  // Cascade delete payments
  await db.collection('payments').deleteMany({ project_id: id })
  await db.collection('projects').deleteOne(query)

  revalidatePath('/dashboard/projects')
  return { success: true }
}

export async function updateProjectStatus(id: string, status: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (status === 'completed') {
    updateData.completed_date = new Date().toISOString().split('T')[0]
  }

  const client = await clientPromise
  const db = client.db()
  const query = user.role === 'manager' ? { id } : { id, user_id: user.id }
  
  await db.collection('projects').updateOne(
    query,
    { $set: updateData }
  )

  const project = await db.collection('projects').findOne(query)
  if (project) {
    await syncProjectPayments(
      db,
      id,
      project.title,
      project.client_id,
      project.user_id,
      project.assigned_to,
      project.amount,
      project.advance_payment || 0,
      status
    )
  }

  revalidatePath('/dashboard/projects')
  revalidatePath(`/dashboard/projects/${id}`)
  return { success: true }
}

export async function getProjectCategories() {
  const client = await clientPromise
  const db = client.db()
  const col = db.collection('project_categories')
  
  // Seed if empty
  const count = await col.countDocuments()
  if (count === 0) {
    const defaultCategories = [
      { value: 'logo', label: 'Logo Design' },
      { value: 'poster', label: 'Poster' },
      { value: 'social_media', label: 'Social Media' },
      { value: 'branding', label: 'Branding' },
      { value: 'ui_ux', label: 'UI/UX Design' },
      { value: 'video_editing', label: 'Video Editing' },
      { value: 'print_design', label: 'Print Design' },
      { value: 'motion_graphics', label: 'Motion Graphics' },
      { value: 'custom', label: 'Custom' },
    ]
    await col.insertMany(defaultCategories)
  }

  const res = await col.find({}).toArray()
  return res.map(cat => ({ value: cat.value, label: cat.label }))
}

export async function addProjectCategory(label: string) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'manager') {
    return { error: 'Unauthorized: Only managers can add categories' }
  }

  const trimmedLabel = label.trim()
  if (!trimmedLabel) {
    return { error: 'Category label cannot be empty' }
  }

  const value = trimmedLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^-|-$)/g, '')
  if (!value) {
    return { error: 'Invalid category label' }
  }

  const client = await clientPromise
  const db = client.db()
  const col = db.collection('project_categories')

  // Check if value already exists
  const existing = await col.findOne({ value })
  if (existing) {
    return { error: 'Category already exists' }
  }

  const newCategory = { value, label: trimmedLabel }
  await col.insertOne(newCategory)
  
  const { _id, ...plainCategory } = newCategory as any
  return { data: plainCategory }
}
