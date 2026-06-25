import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, Edit, DollarSign, Calendar, User, Users,
  Tag, AlertCircle, CheckCircle2, Clock, Star, Trash2,
  TrendingUp, Landmark, FileText
} from 'lucide-react'
import { deleteProject, updateProjectStatus, getProjectCategories } from '@/app/dashboard/projects/actions'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const statusColors: Record<string, string> = {
  inquiry: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  revision: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  waiting_payment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
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
  low: 'text-green-600 dark:text-green-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  high: 'text-red-600 dark:text-red-400',
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) return null

  const clientDb = await clientPromise
  const db = clientDb.db()

  const query = user.role === 'manager' 
    ? { id } 
    : { id, $or: [{ user_id: user.id }, { assigned_to: user.id }] }

  // Fetch categories and project concurrently
  const [categoriesList, project] = await Promise.all([
    getProjectCategories(),
    db.collection('projects').findOne(query)
  ])

  if (!project) notFound()

  const categoryLabels: Record<string, string> = {}
  categoriesList.forEach(cat => {
    categoryLabels[cat.value] = cat.label
  })

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

  async function handleStatusChange(formData: FormData) {
    'use server'
    const newStatus = formData.get('status') as string
    await updateProjectStatus(id, newStatus)
  }

  async function handleRecordPayment(formData: FormData) {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Unauthorized')

    const clientDb = await clientPromise
    const db = clientDb.db()

    const currentProject = await db.collection('projects').findOne(
      currentUser.role === 'manager' 
        ? { id } 
        : { id, $or: [{ user_id: currentUser.id }, { assigned_to: currentUser.id }] }
    )
    if (!currentProject) throw new Error('Project not found')

    const amountVal = parseFloat(formData.get('amount') as string)
    const notesVal = formData.get('notes') as string
    
    if (isNaN(amountVal) || amountVal <= 0) return

    const payId = `pay-${Math.random().toString(36).substring(2, 9)}`
    await db.collection('payments').insertOne({
      id: payId,
      user_id: currentUser.id,
      employee_id: currentProject.assigned_to || null,
      project_id: id,
      client_id: currentProject.client_id || null,
      amount: amountVal,
      payment_date: new Date().toISOString().split('T')[0],
      status: 'paid',
      notes: notesVal || `Payment for ${currentProject.title}`,
      created_at: new Date().toISOString()
    })

    revalidatePath(`/dashboard/projects/${id}`)
    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard')
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
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <div className="flex items-center gap-2">
                <form action={handleStatusChange} className="flex items-center gap-1.5">
                  <select 
                    name="status" 
                    defaultValue={project.status}
                    className="h-7 text-xs rounded-md border border-input bg-card px-2 py-0.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  >
                    <option value="inquiry">Inquiry</option>
                    <option value="in_progress">In Progress</option>
                    <option value="revision">Revision</option>
                    <option value="waiting_payment">Awaiting Payment</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button type="submit" size="sm" variant="secondary" className="h-7 px-2 text-[10px] font-semibold">
                    Update Status
                  </Button>
                </form>
              </div>
              {project.is_featured && (
                <Badge variant="outline" className="gap-1 bg-yellow-50/50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  Featured
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="destructive" className="gap-1 animate-pulse">
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
          <form action={handleDeleteAction} onSubmit={(e) => { if (!confirm('Are you sure you want to delete this project?')) e.preventDefault() }}>
            <Button variant="destructive" type="submit">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      {/* Project Banner Image if Available */}
      {project.preview_images && project.preview_images[0] && (
        <div className="relative w-full h-80 rounded-xl overflow-hidden border shadow-md bg-card">
          <img 
            src={project.preview_images[0]} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Details Card */}
          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{project.description}</p>
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
          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
                </CardDescription>
              </div>
              <Landmark className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-6">
              {payments.length > 0 ? (
                <div className="space-y-1">
                  {payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between py-2.5 border-b last:border-0 border-muted/50">
                      <div>
                        <p className="text-sm font-medium">{payment.notes || 'Payment Received'}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(payment.payment_date)}</p>
                      </div>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        +₹{Number(payment.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
              )}

              {/* Record Inline Payment */}
              {remaining > 0 && (
                <div className="pt-4 border-t border-dashed border-muted/60">
                  <h4 className="text-sm font-semibold mb-3">Record a Payment</h4>
                  <form action={handleRecordPayment} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Amount (₹)</label>
                      <Input 
                        type="number" 
                        name="amount" 
                        max={remaining} 
                        step="0.01" 
                        min="1"
                        defaultValue={remaining.toFixed(2)}
                        placeholder="0.00" 
                        className="h-9" 
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Notes / Description</label>
                      <Input 
                        type="text" 
                        name="notes" 
                        placeholder="e.g., Final payment" 
                        className="h-9"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" size="sm" className="w-full h-9">
                        Record Payment
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
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
                <span className="text-sm font-medium text-green-600 dark:text-green-400">₹{totalPaid.toLocaleString('en-IN')}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm font-medium">Remaining</span>
                <span className={`text-sm font-bold ${remaining > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                  ₹{remaining.toLocaleString('en-IN')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          {client && (
            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Client Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link 
                  href={`/dashboard/clients/${client.id}`}
                  className="font-semibold hover:underline block text-foreground"
                >
                  {client.name}
                </Link>
                {client.company && (
                  <p className="text-sm text-muted-foreground">{client.company}</p>
                )}
                {client.email && (
                  <p className="text-sm">
                    <a href={`mailto:${client.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
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

          {/* Assigned Designer */}
          {project.assigned_to && (
            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Assigned Designer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {assignedUser ? (
                  <>
                    <p className="font-semibold text-foreground">{assignedUser.fullName}</p>
                    <p className="text-sm text-muted-foreground">@{assignedUser.username}</p>
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {assignedUser.role}
                    </Badge>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Designer details not loaded.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
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

