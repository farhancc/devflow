import { getCurrentUser } from '@/lib/auth'
import { getLocalClients, getLocalProjects } from '@/lib/local-db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Users } from 'lucide-react'
import { ClientsGrid } from '@/components/dashboard/clients-grid'

export default async function ClientsPage() {
  const user = await getCurrentUser()

  if (!user) return null

  const clients = await getLocalClients(user.id)
  const projects = await getLocalProjects(user.id)

  const projectCountMap = projects.reduce((acc, p) => {
    if (p.client_id) {
      acc[p.client_id] = (acc[p.client_id] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const clientsWithCounts = clients.map(c => ({
    ...c,
    projectCount: projectCountMap[c.id] || 0,
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your client relationships
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Link>
        </Button>
      </div>

      {clientsWithCounts.length > 0 ? (
        <ClientsGrid clients={clientsWithCounts as any} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No clients yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Add your first client to start building relationships
            </p>
            <Button asChild>
              <Link href="/dashboard/clients/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
