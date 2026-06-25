import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import { getProjectCategories } from '@/app/dashboard/projects/actions'
import { ProjectDetailClient } from '@/components/dashboard/project-detail-client'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) return null

  const clientDb = await clientPromise
  const db = clientDb.db()

  // Match access query based on role
  const query = user.role === 'manager' 
    ? { id } 
    : { id, $or: [{ user_id: user.id }, { assigned_to: user.id }] }

  // Fetch categories and project concurrently
  const [categoriesList, project] = await Promise.all([
    getProjectCategories(),
    db.collection('projects').findOne(query)
  ])

  if (!project) notFound()

  // Fetch client details, payments, and assigned user concurrently
  const [client, payments, assignedUser] = await Promise.all([
    project.client_id
      ? db.collection('clients').findOne(
          user.role === 'manager' 
            ? { id: project.client_id } 
            : { id: project.client_id, user_id: user.id }
        )
      : Promise.resolve(null),
    db.collection('payments')
      .find(
        user.role === 'manager'
          ? { project_id: id }
          : { project_id: id, $or: [{ user_id: user.id }, { employee_id: user.id }] }
      )
      .sort({ payment_date: -1 })
      .toArray(),
    project.assigned_to
      ? db.collection('users').findOne({ id: project.assigned_to })
      : Promise.resolve(null)
  ])

  // Helper to serialize MongoDB documents securely
  const serializeDoc = (doc: any) => {
    if (!doc) return null
    const { _id, ...rest } = doc
    return JSON.parse(JSON.stringify(rest))
  }

  const serializedProject = serializeDoc(project)
  const serializedClient = serializeDoc(client)
  const serializedAssignedUser = serializeDoc(assignedUser)
  const serializedPayments = (payments || []).map(p => serializeDoc(p))

  return (
    <ProjectDetailClient 
      id={id}
      project={serializedProject}
      client={serializedClient}
      payments={serializedPayments}
      assignedUser={serializedAssignedUser}
      categoriesList={categoriesList}
    />
  )
}
