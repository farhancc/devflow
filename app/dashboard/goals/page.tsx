import { getCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { GoalsManager } from '@/components/dashboard/goals-manager'
import { Target, FolderKanban, TrendingDown } from 'lucide-react'
import { getLocalGoals, getLocalPayments, getLocalProjects, getLocalExpenses } from '@/lib/local-db'

export default async function GoalsPage() {
  const user = await getCurrentUser()

  if (!user) return null

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0]

  const [goals, payments, projects, expenses] = await Promise.all([
    getLocalGoals(user.id, user.role),
    getLocalPayments(user.id, user.role),
    getLocalProjects(user.id, user.role),
    getLocalExpenses(user.id, user.role)
  ])

  // Monthly values
  const currentMonthPayments = payments.filter(p => p.payment_date >= startOfMonthStr)
  const currentMonthIncome = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0)

  const currentMonthProjects = projects.filter(p => p.status === 'completed' && p.completed_date && p.completed_date >= startOfMonthStr)
  const currentMonthProjectsCount = currentMonthProjects.length

  const currentMonthExpensesList = expenses.filter(e => e.expense_date >= startOfMonthStr)
  const currentMonthExpenses = currentMonthExpensesList.reduce((sum, e) => sum + e.amount, 0)

  const monthGoals = goals.filter(g => g.month === currentMonth && g.year === currentYear)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Goals</h2>
        <p className="text-muted-foreground">Set and track your monthly metrics and caps</p>
      </div>

      {monthGoals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {monthGoals.map(goal => {
            let currentVal = 0
            let isCap = false
            let label = ''
            let icon = <Target className="h-5 w-5 text-primary" />

            if (goal.target_type === 'income') {
              currentVal = currentMonthIncome
              label = 'Income Goal'
            } else if (goal.target_type === 'projects') {
              currentVal = currentMonthProjectsCount
              label = 'Completed Projects'
              icon = <FolderKanban className="h-5 w-5 text-blue-500" />
            } else if (goal.target_type === 'expenses') {
              currentVal = currentMonthExpenses
              isCap = true
              label = 'Expense Cap'
              icon = <TrendingDown className="h-5 w-5 text-rose-500" />
            }

            const progress = goal.target_value > 0
              ? Math.min((currentVal / goal.target_value) * 100, 100)
              : 0

            const isExceeded = isCap && currentVal > goal.target_value

            return (
              <Card key={goal.id} className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {icon}
                    {label}
                  </CardTitle>
                  <CardDescription>
                    {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {goal.target_type === 'projects' 
                        ? `${currentVal} / ${goal.target_value}`
                        : `₹${currentVal.toLocaleString('en-IN')} / ₹${goal.target_value.toLocaleString('en-IN')}`
                      }
                    </span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={`h-3 ${isExceeded ? '[&>div]:bg-red-500' : ''}`} 
                  />
                  <p className="text-xs text-muted-foreground">
                    {isCap 
                      ? (isExceeded 
                          ? '⚠️ Over limit!' 
                          : `₹${(goal.target_value - currentVal).toLocaleString('en-IN')} budget remaining`)
                      : (progress >= 100 
                          ? '🎉 Target reached!' 
                          : `${progress.toFixed(0)}% reached`)
                    }
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No goals set for this month</h3>
            <p className="text-muted-foreground text-sm">Configure goals below to monitor monthly progress.</p>
          </CardContent>
        </Card>
      )}

      <GoalsManager 
        goals={goals} 
        currentMonthIncome={currentMonthIncome} 
        currentMonthProjectsCount={currentMonthProjectsCount}
        currentMonthExpenses={currentMonthExpenses}
      />
    </div>
  )
}
