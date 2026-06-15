import { getCurrentUser } from '@/lib/auth'
import { getLocalExpenses } from '@/lib/local-db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Receipt, TrendingUp, TrendingDown } from 'lucide-react'
import { ExpensesTable } from '@/components/dashboard/expenses-table'
import { ExpenseDialog } from '@/components/dashboard/expense-dialog'
import { getUsers } from '@/lib/db'

export default async function ExpensesPage() {
  const user = await getCurrentUser()

  if (!user) return null

  // Get current and previous month dates
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Fetch all expenses (role-based logic handled in getLocalExpenses, passing user.role to avoid redundant user role lookups in MongoDB)
  const expenses = await getLocalExpenses(user.id, user.role)

  // Fetch employees list for managers
  let employees: { id: string; fullName: string; username: string }[] = []
  if (user.role === 'manager') {
    const allUsers = await getUsers()
    employees = allUsers
      .filter(u => u.id !== user.id)
      .map(u => ({ id: u.id, fullName: u.fullName, username: u.username }))
  }

  // Calculate stats
  const currentMonthTotal = expenses
    .filter(e => new Date(e.expense_date) >= startOfMonth)
    .reduce((sum, e) => sum + Number(e.amount), 0) || 0

  const prevMonthTotal = expenses
    .filter(e => {
      const date = new Date(e.expense_date)
      return date >= startOfPrevMonth && date <= endOfPrevMonth
    })
    .reduce((sum, e) => sum + Number(e.amount), 0) || 0

  const totalAllTime = expenses.reduce((sum, e) => sum + Number(e.amount), 0) || 0
  
  const monthOverMonth = prevMonthTotal > 0 
    ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">
            Track business expenses across the team
          </p>
        </div>
        <ExpenseDialog 
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
              {Number(monthOverMonth) <= 0 ? (
                <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={Number(monthOverMonth) <= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(Number(monthOverMonth))}%
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
              {expenses.length || 0} expenses total
            </p>
          </CardContent>
        </Card>
      </div>

      {expenses.length > 0 ? (
        <ExpensesTable 
          expenses={expenses as any} 
          employees={employees}
          isManager={user.role === 'manager'}
        />
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Record your first expense to start tracking costs
            </p>
            <ExpenseDialog 
              employees={employees}
              isManager={user.role === 'manager'}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
