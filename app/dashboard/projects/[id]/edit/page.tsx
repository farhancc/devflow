import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { getLocalClients } from '@/lib/local-db'
import { getUsers } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ProjectForm } from '@/components/dashboard/project-form'
import { getProjectCategories } from '@/app/dashboard/projects/actions'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return null

  const clientDb = await clientPromise
  const db = clientDb.db()

  const projectQuery = user.role === 'manager' 
    ? { id } 
    : { id, $or: [{ user_id: user.id }, { assigned_to: user.id }] }

  // Fetch project, clients, categories, and users list concurrently
  const [project, clients, categories, allUsers] = await Promise.all([
    db.collection('projects').findOne(projectQuery),
    getLocalClients(user.id, user.role),
    getProjectCategories(),
    user.role === 'manager' ? getUsers() : Promise.resolve([])
  ])

  if (!project) notFound()

  let employees: { id: string; fullName: string; username: string }[] = []
  if (user.role === 'manager') {
    employees = allUsers
      .filter(u => u.id !== user.id)
      .map(u => ({ id: u.id, fullName: u.fullName, username: u.username }))
  }

  const { _id, ...projectData } = project as any

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/projects/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Project</h2>
          <p className="text-muted-foreground">{project.title}</p>
        </div>
      </div>
      <ProjectForm clients={clients || []} employees={employees} isManager={user.role === 'manager'} project={projectData as any} categories={categories} />
    </div>
  )
}

