import { getCurrentUser } from '@/lib/auth'
import { getLocalClients } from '@/lib/local-db'
import { getUsers } from '@/lib/db'
import { ProjectForm } from '@/components/dashboard/project-form'
import { getProjectCategories } from '@/app/dashboard/projects/actions'

export default async function NewProjectPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const clients = await getLocalClients(user.id)
  const categories = await getProjectCategories()

  let employees: { id: string; fullName: string; username: string }[] = []
  if (user.role === 'manager') {
    const allUsers = await getUsers()
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
      <ProjectForm clients={clients || []} employees={employees} isManager={user.role === 'manager'} categories={categories} />
    </div>
  )
}
