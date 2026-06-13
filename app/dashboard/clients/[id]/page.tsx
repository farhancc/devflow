import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  ArrowLeft, Edit, Mail, Phone, MessageCircle, 
  Building2, MapPin, FileText, FolderKanban, DollarSign
} from 'lucide-react'

const statusColors: Record<string, string> = {
  inquiry: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  revision: 'bg-orange-100 text-orange-800',
  waiting_payment: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) return null

  const clientDb = await clientPromise
  const db = clientDb.db()

  const clientQuery = user.role === 'manager' ? { id } : { id, user_id: user.id }
  const client = await db.collection('clients').findOne(clientQuery)

  if (!client) notFound()

  const projectsQuery = user.role === 'manager' 
    ? { client_id: id } 
    : { client_id: id, $or: [{ user_id: user.id }, { assigned_to: user.id }] }
  const projects = await db.collection('projects')
    .find(projectsQuery)
    .sort({ created_at: -1 })
    .toArray()

  const paymentsQuery = user.role === 'manager' 
    ? { client_id: id } 
    : { client_id: id, $or: [{ user_id: user.id }, { employee_id: user.id }] }
  const payments = await db.collection('payments')
    .find(paymentsQuery)
    .toArray()

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const activeProjects = projects.filter(p => ['in_progress', 'revision', 'inquiry'].includes(p.status))

  const getInitials = (name: string) =>
    name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{client.name}</h2>
              {client.company && (
                <p className="text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {client.company}
                </p>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/clients/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{projects.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-semibold text-lg">₹</span>
              <div>
                <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{activeProjects.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Projects & Payments */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>{projects.length} projects with this client</CardDescription>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <Link 
                          href={`/dashboard/projects/${project.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {project.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          ₹{Number(project.amount).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <Badge className={statusColors[project.status] || ''}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No projects with this client yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>{payments.length} payment{payments.length !== 1 ? 's' : ''} recorded</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{payment.notes || 'Payment'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.payment_date).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </p>
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

        {/* Contact Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a href={`mailto:${client.email}`} className="text-sm hover:underline text-blue-600 break-all">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a href={`tel:${client.phone}`} className="text-sm hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.whatsapp && (
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a 
                    href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline text-green-600"
                  >
                    WhatsApp
                  </a>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{client.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
