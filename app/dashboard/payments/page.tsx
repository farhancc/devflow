import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { PaymentsTable } from '@/components/dashboard/payments-table'
import { PaymentDialog } from '@/components/dashboard/payment-dialog'
import { getUsers } from '@/lib/db'

export default async function PaymentsPage() {
  const user = await getCurrentUser()

  if (!user) return null

  const clientDb = await clientPromise
  const db = clientDb.db()

  // Get current and previous month dates
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Role based filtering
  const queryFilter = user.role === 'manager' 
    ? {} 
    : { $or: [{ user_id: user.id }, { employee_id: user.id }] }

  // Fetch all payments
  const paymentsRaw = JSON.parse(JSON.stringify(await db.collection('payments')
    .find(queryFilter)
    .sort({ payment_date: -1 })
    .toArray()))

  // Fetch projects and clients
  const projects = JSON.parse(JSON.stringify(await db.collection('projects')
    .find(queryFilter)
    .sort({ title: 1 })
    .toArray()))

  const clients = JSON.parse(JSON.stringify(await db.collection('clients')
    .find(user.role === 'manager' ? {} : { user_id: user.id })
    .sort({ name: 1 })
    .toArray()))

  // Fetch employees list for managers
  let employees: { id: string; fullName: string; username: string }[] = []
  if (user.role === 'manager') {
    const allUsers = await getUsers()
    employees = allUsers
      .filter(u => u.id !== user.id)
      .map(u => ({ id: u.id, fullName: u.fullName, username: u.username }))
  }

  // Populate payments with projects and clients
  const payments = paymentsRaw.map((payment: any) => {
    const projectDoc = projects.find((p: any) => p.id === payment.project_id)
    const clientDoc = clients.find((c: any) => c.id === payment.client_id)
    return {
      ...payment,
      projects: projectDoc ? { id: projectDoc.id, title: projectDoc.title } : null,
      clients: clientDoc ? { id: clientDoc.id, name: clientDoc.name } : null
    }
  })

  // Calculate stats
  const currentMonthTotal = payments
    .filter((p: any) => new Date(p.payment_date) >= startOfMonth)
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0

  const prevMonthTotal = payments
    .filter((p: any) => {
      const date = new Date(p.payment_date)
      return date >= startOfPrevMonth && date <= endOfPrevMonth
    })
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0

  const totalAllTime = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0
  
  const monthOverMonth = prevMonthTotal > 0 
    ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal * 100).toFixed(1)
    : '0'

  // Clean _id references for frontend
  const cleanedProjects = projects.map(({ _id, ...rest }: any) => rest)
  const cleanedClients = clients.map(({ _id, ...rest }: any) => rest)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">
            Track payments received by team members and managers
          </p>
        </div>
        <PaymentDialog 
          projects={cleanedProjects as any || []} 
          clients={cleanedClients as any || []}
          employees={employees}
          isManager={user.role === 'manager'}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <span className="font-semibold text-muted-foreground text-sm">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{currentMonthTotal.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {Number(monthOverMonth) >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={Number(monthOverMonth) >= 0 ? 'text-green-500' : 'text-red-500'}>
                {monthOverMonth}%
              </span>
              <span className="ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
            <span className="font-semibold text-muted-foreground text-sm">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{prevMonthTotal.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {endOfPrevMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">All Time</CardTitle>
            <span className="font-semibold text-muted-foreground text-sm">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAllTime.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {payments.length || 0} payments total
            </p>
          </CardContent>
        </Card>
      </div>

      {payments.length > 0 ? (
        <PaymentsTable 
          payments={payments as any} 
          projects={cleanedProjects as any || []}
          clients={cleanedClients as any || []}
          employees={employees}
          isManager={user.role === 'manager'}
        />
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <span className="text-4xl text-muted-foreground mb-4">₹</span>
            <h3 className="text-lg font-medium mb-2">No payments yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Record your first payment to start tracking income
            </p>
            <PaymentDialog 
              projects={cleanedProjects as any || []} 
              clients={cleanedClients as any || []}
              employees={employees}
              isManager={user.role === 'manager'}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
