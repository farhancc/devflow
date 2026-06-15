import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AlertCircle, Clock, DollarSign, CheckCircle2 } from 'lucide-react'

export default async function NotificationsPage() {
  const user = await getCurrentUser()

  if (!user) return null

  const clientDb = await clientPromise
  const db = clientDb.db()

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const sevenDaysFromNow = new Date(now)
  sevenDaysFromNow.setDate(now.getDate() + 7)
  const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0]

  const isManager = user.role === 'manager'

  // Fetch projects and clients concurrently
  const [overdueProjectsRaw, urgentProjectsRaw, awaitingPaymentRaw, dbClients] = await Promise.all([
    db.collection('projects')
      .find(isManager ? {
        status: { $nin: ['completed', 'cancelled'] },
        deadline: { $lt: todayStr, $ne: null, $exists: true }
      } : {
        $or: [{ user_id: user.id }, { assigned_to: user.id }],
        status: { $nin: ['completed', 'cancelled'] },
        deadline: { $lt: todayStr, $ne: null, $exists: true }
      })
      .sort({ deadline: 1 })
      .toArray(),
    db.collection('projects')
      .find(isManager ? {
        status: { $in: ['in_progress', 'revision'] },
        deadline: { $gte: todayStr, $lte: sevenDaysStr }
      } : {
        $or: [{ user_id: user.id }, { assigned_to: user.id }],
        status: { $in: ['in_progress', 'revision'] },
        deadline: { $gte: todayStr, $lte: sevenDaysStr }
      })
      .sort({ deadline: 1 })
      .toArray(),
    db.collection('projects')
      .find(isManager ? {
        status: 'waiting_payment'
      } : {
        $or: [{ user_id: user.id }, { assigned_to: user.id }],
        status: 'waiting_payment'
      })
      .toArray(),
    db.collection('clients').find({}).toArray()
  ])

  // Build client map for O(1) in-memory lookup
  const clientMap = new Map(dbClients.map(c => [c.id, c]))

  // Helper function to populate client name in-memory
  const populateClient = (projectsArray: any[]) => {
    return projectsArray.map((project) => ({
      ...project,
      clients: project.client_id ? clientMap.get(project.client_id) || null : null
    }))
  }

  const overdueProjects = populateClient(overdueProjectsRaw)
  const urgentProjects = populateClient(urgentProjectsRaw)
  const awaitingPayment = populateClient(awaitingPaymentRaw)

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })

  const daysOverdue = (d: string) => {
    const diff = Math.floor((now.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const daysUntil = (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    return `${diff} days`
  }

  const totalNotifications = overdueProjects.length + urgentProjects.length + awaitingPayment.length

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        {totalNotifications > 0 && (
          <Badge variant="destructive">{totalNotifications}</Badge>
        )}
      </div>

      {totalNotifications === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
            <p className="text-muted-foreground text-sm">No pending alerts at this time.</p>
          </CardContent>
        </Card>
      )}

      {overdueProjects.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Overdue Projects ({overdueProjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueProjects.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <Link href={`/dashboard/projects/${p.id}`} className="text-sm font-medium hover:underline">
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {(p.clients as { name: string } | null)?.name} · Due {formatDate(p.deadline!)}
                  </p>
                </div>
                <span className="text-sm text-destructive font-medium">
                  {daysOverdue(p.deadline!)}d overdue
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {urgentProjects.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Clock className="h-5 w-5" />
              Due Soon ({urgentProjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentProjects.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <Link href={`/dashboard/projects/${p.id}`} className="text-sm font-medium hover:underline">
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {(p.clients as { name: string } | null)?.name} · {formatDate(p.deadline!)}
                  </p>
                </div>
                <span className="text-sm text-yellow-700 font-medium">{daysUntil(p.deadline!)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {awaitingPayment.length > 0 && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <DollarSign className="h-5 w-5" />
              Awaiting Payment ({awaitingPayment.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {awaitingPayment.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <Link href={`/dashboard/projects/${p.id}`} className="text-sm font-medium hover:underline">
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {(p.clients as { name: string } | null)?.name}
                  </p>
                </div>
                <span className="text-sm text-purple-700 font-semibold">
                  ₹{Number(p.amount).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
