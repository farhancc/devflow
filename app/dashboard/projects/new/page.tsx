import { getCurrentUser } from '@/lib/auth'
import { getLocalClients, getLocalProjects } from '@/lib/local-db'
import { getUsers } from '@/lib/db'
import { ProjectForm } from '@/components/dashboard/project-form'
import { getProjectCategories } from '@/app/dashboard/projects/actions'

export default async function NewProjectPage() {
  const user = await getCurrentUser()
  if (!user) return null

  // Fetch clients, categories, users list, and projects concurrently
  const [clients, categories, allUsers, projects] = await Promise.all([
    getLocalClients(user.id, user.role),
    getProjectCategories(),
    user.role === 'manager' ? getUsers() : Promise.resolve([]),
    getLocalProjects(user.id, user.role)
  ])

  const existingTitles = Array.from(new Set(projects.map(p => p.title).filter(Boolean)))

  let employees: { id: string; fullName: string; username: string }[] = []
  if (user.role === 'manager') {
    employees = allUsers
      .filter(u => u.id !== user.id)
      .map(u => ({ id: u.id, fullName: u.fullName, username: u.username }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">New Project</h2>
        <p className="text-muted-foreground">Create a new design project</p>
      </div>
      <ProjectForm 
        clients={clients || []} 
        employees={employees} 
        isManager={user.role === 'manager'} 
        categories={categories} 
        existingTitles={existingTitles}
      />
    </div>
  )
}
