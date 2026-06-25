'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, Edit, DollarSign, Calendar, User, Users,
  Tag, AlertCircle, CheckCircle2, Clock, Star, Trash2,
  Landmark
} from 'lucide-react'
import { deleteProject, updateProjectStatus, recordProjectPayment } from '@/app/dashboard/projects/actions'

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

interface ProjectDetailClientProps {
  id: string
  project: any
  client: any
  payments: any[]
  assignedUser: any
  categoriesList: any[]
}

export function ProjectDetailClient({ id, project, client, payments, assignedUser, categoriesList }: ProjectDetailClientProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const remaining = Number(project.amount) - totalPaid
  const isOverdue = project.deadline && 
    !['completed', 'cancelled'].includes(project.status) && 
    new Date(project.deadline) < new Date()

  const categoryLabels: Record<string, string> = {}
  categoriesList.forEach(cat => {
    categoryLabels[cat.value] = cat.label
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this project?')) return
    setIsDeleting(true)
    try {
      await deleteProject(id)
      router.push('/dashboard/projects')
      router.refresh()
    } catch (e) {
      console.error(e)
      alert('Failed to delete project')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    setIsUpdatingStatus(true)
    try {
      await updateProjectStatus(id, newStatus)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function handleRecordPaymentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsRecording(true)
    const formData = new FormData(e.currentTarget)
    const amountVal = parseFloat(formData.get('amount') as string)
    const notesVal = formData.get('notes') as string

    if (isNaN(amountVal) || amountVal <= 0) {
      setIsRecording(false)
      return
    }

    try {
      await recordProjectPayment(id, amountVal, notesVal)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to record payment')
    } finally {
      setIsRecording(false)
    }
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
                <div className="flex items-center gap-1.5">
                  <select 
                    name="status" 
                    value={project.status}
                    onChange={handleStatusChange}
                    disabled={isUpdatingStatus}
                    className="h-7 text-xs rounded-md border border-input bg-card px-2 py-0.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  >
                    <option value="inquiry">Inquiry</option>
                    <option value="in_progress">In Progress</option>
                    <option value="revision">Revision</option>
                    <option value="waiting_payment">Awaiting Payment</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
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
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
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
                  <form onSubmit={handleRecordPaymentSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      <Button type="submit" size="sm" className="w-full h-9" disabled={isRecording}>
                        {isRecording ? 'Recording...' : 'Record Payment'}
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
                {client.whatsapp && (
                  <a
                    href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    +{client.whatsapp.replace(/\D/g, '')}
                  </a>
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
