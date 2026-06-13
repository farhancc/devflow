import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, Edit, DollarSign, Calendar, User, 
  Tag, AlertCircle, CheckCircle2, Clock, Star
} from 'lucide-react'
import { deleteProject } from '@/app/dashboard/projects/actions'
import { redirect } from 'next/navigation'

const statusColors: Record<string, string> = {
  inquiry: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  revision: 'bg-orange-100 text-orange-800',
  waiting_payment: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  inquiry: 'Inquiry',
  in_progress: 'In Progress',
  revision: 'Revision',
  waiting_payment: 'Awaiting Payment',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const priorityColors: Record<string, string> = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-600',
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) return null

  const categoriesList = await getProjectCategories()
  const categoryLabels: Record<string, string> = {}
  categoriesList.forEach(cat => {
    categoryLabels[cat.value] = cat.label
  })

  const clientDb = await clientPromise
  const db = clientDb.db()

  const query = user.role === 'manager' 
    ? { id } 
    : { id, $or: [{ user_id: user.id }, { assigned_to: user.id }] }

  const project = await db.collection('projects').findOne(query)

  if (!project) notFound()

  // Fetch client details if client_id exists
  let client = null
  if (project.client_id) {
    client = await db.collection('clients').findOne(
      user.role === 'manager' 
        ? { id: project.client_id } 
        : { id: project.client_id, user_id: user.id }
    )
  }

  const payments = await db.collection('payments')
    .find(
      user.role === 'manager'
        ? { project_id: id }
        : { project_id: id, $or: [{ user_id: user.id }, { employee_id: user.id }] }
    )
    .sort({ payment_date: -1 })
    .toArray()

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const remaining = Number(project.amount) - totalPaid

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
  }

  const isOverdue = project.deadline && 
    !['completed', 'cancelled'].includes(project.status) && 
    new Date(project.deadline) < new Date()

  async function handleDeleteAction() {
    'use server'
    await deleteProject(id)
    redirect('/dashboard/projects')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{project.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusColors[project.status] || ''}>
                {statusLabels[project.status] || project.status}
              </Badge>
              {project.is_featured && (
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  Featured
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Overdue
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/projects/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{project.description}</p>
                </div>
              )}
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{categoryLabels[project.category] || project.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className={`h-4 w-4 ${priorityColors[project.priority] || ''}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <p className={`text-sm font-medium capitalize ${priorityColors[project.priority] || ''}`}>
                      {project.priority}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-sm font-medium">{formatDate(project.completed_date)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments Card */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{payment.notes || 'Payment'}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(payment.payment_date)}</p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        +₹{Number(payment.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Project Value</span>
                <span className="text-sm font-semibold">₹{Number(project.amount).toLocaleString('en-IN')}</span>
              </div>
              {Number(project.advance_payment) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Advance</span>
                  <span className="text-sm font-medium">₹{Number(project.advance_payment).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Paid</span>
                <span className="text-sm font-medium text-green-600">₹{totalPaid.toLocaleString('en-IN')}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm font-medium">Remaining</span>
                <span className={`text-sm font-bold ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  ₹{remaining.toLocaleString('en-IN')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          {client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link 
                  href={`/dashboard/clients/${client.id}`}
                  className="font-medium hover:underline block"
                >
                  {client.name}
                </Link>
                {client.company && (
                  <p className="text-sm text-muted-foreground">{client.company}</p>
                )}
                {client.email && (
                  <p className="text-sm">
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                      {client.email}
                    </a>
                  </p>
                )}
                {client.phone && (
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">{formatDate(project.created_at)}</p>
              </div>
              {project.updated_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{formatDate(project.updated_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
