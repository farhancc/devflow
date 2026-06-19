import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FolderKanban } from 'lucide-react'
import { ProjectsTabs } from '@/components/dashboard/projects-tabs'
import { getLocalProjects, getLocalClients } from '@/lib/local-db'

const statusColors: Record<string, string> = {
  inquiry: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  revision: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  waiting_payment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

export default async function ProjectsPage() {
  const user = await getCurrentUser()

  if (!user) return null

  // Fetch local data concurrently and pass user.role to avoid redundant DB lookups
  const [rawProjects, rawClients] = await Promise.all([
    getLocalProjects(user.id, user.role),
    getLocalClients(user.id, user.role)
  ])

  // Format projects to include clients info to match what the component expects
  const projects = rawProjects.map(p => {
    const client = rawClients.find(c => c.id === p.client_id)
    return {
      ...p,
      clients: client ? { id: client.id, name: client.name } : null
    }
  })

  const clients = rawClients.map(c => ({ id: c.id, name: c.name }))

  // Calculate stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => ['in_progress', 'revision'].includes(p.status)).length,
    inquiry: projects.filter(p => p.status === 'inquiry').length,
    completed: projects.filter(p => p.status === 'completed').length,
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Manage your design projects and track progress
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription>Total Projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription>Inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inquiry}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      {projects.length > 0 ? (
        <ProjectsTabs 
          projects={projects} 
          clients={clients}
          statusColors={statusColors} 
        />
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Create your first project to start tracking your work
            </p>
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
