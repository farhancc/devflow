import { getCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import {
  DollarSign,
  FolderKanban,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  AlertCircle,
  FileText,
  ShieldCheck,
  Trophy,
  Activity,
  Briefcase,
  BarChart3
} from 'lucide-react'
import {
  getLocalProjects,
  getLocalClients,
  getLocalPayments,
  getLocalExpenses,
  getLocalGoals
} from '@/lib/local-db'
import { getTeamOverview } from '@/app/dashboard/settings/actions'

const statusColors: Record<string, string> = {
  inquiry: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  revision: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  waiting_payment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) return null

  // Per-user data
  const projects = await getLocalProjects(user.id)
  const clients = await getLocalClients(user.id)
  const payments = await getLocalPayments(user.id)
  const expenses = await getLocalExpenses(user.id)
  const goals = await getLocalGoals(user.id)

  const activeProjectsList = projects.filter(p =>
    ['in_progress', 'revision', 'inquiry'].includes(p.status)
  )

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0]

  const monthlyIncome = payments.filter(p => p.payment_date >= startOfMonthStr).reduce((s, p) => s + p.amount, 0)
  const monthlyExpenseTotal = expenses.filter(e => e.expense_date >= startOfMonthStr).reduce((s, e) => s + e.amount, 0)

  const currentGoal = goals.find(g => g.month === startOfMonth.getMonth() + 1 && g.year === startOfMonth.getFullYear())
  const goalProgress = currentGoal ? Math.min((monthlyIncome / currentGoal.target_value) * 100, 100) : 0

  const sevenDaysStr = new Date(Date.now() + 7 * 864e5).toISOString().split('T')[0]
  const todayStr = new Date().toISOString().split('T')[0]
  const urgentProjects = projects
    .filter(p => ['in_progress', 'revision'].includes(p.status) && p.deadline <= sevenDaysStr && p.deadline >= todayStr)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 3)

  const isManager = user.role === 'manager'
  const teamOverview = isManager ? await getTeamOverview() : null

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.fullName}!</h2>
          <p className="text-muted-foreground mt-1">
            Role: <span className="capitalize font-semibold text-primary">{user.role}</span> &bull; Here's what's happening with your workspace.
          </p>
        </div>

      </div>

      {/* ── Personal KPI Cards ── */}
      {isManager ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{monthlyIncome.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground mt-1">Net Profit: ₹{(monthlyIncome - monthlyExpenseTotal).toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjectsList.length}</div>
              <p className="text-xs text-muted-foreground mt-1">{projects.length} total projects</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active client accounts</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goalProgress.toFixed(0)}%</div>
              {currentGoal
                ? <Progress value={goalProgress} className="mt-2 h-2" />
                : <p className="text-xs text-muted-foreground mt-1">No goal set</p>}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjectsList.length}</div>
              <p className="text-xs text-muted-foreground mt-1">{projects.length} total projects</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Your Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{monthlyIncome.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground mt-1">Net profit: ₹{(monthlyIncome - monthlyExpenseTotal).toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goalProgress.toFixed(0)}%</div>
              {currentGoal
                ? <Progress value={goalProgress} className="mt-2 h-2" />
                : <p className="text-xs text-muted-foreground mt-1">No goal set</p>}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Urgent Deadlines</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{urgentProjects.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Due in the next 7 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════
          MANAGER — TEAM AT A GLANCE SECTION
          ════════════════════════════════════════ */}
      {isManager && teamOverview && (
        <div className="space-y-6">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold tracking-tight">Team at a Glance</h3>
              {teamOverview.totalEmployees > 0 && (
                <Badge variant="secondary" className="text-xs">{teamOverview.totalEmployees} members</Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/settings">
                Manage Team <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {teamOverview.totalEmployees === 0 ? (
            /* Empty state */
            <Card className="border-0 shadow-md border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
                <Users className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold text-lg">No team members yet</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Add employees in Settings to start tracking team performance here.
                </p>
                <Button asChild size="sm">
                  <Link href="/dashboard/settings">Go to Settings → Employee Management</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Team KPI Cards */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500/10 to-purple-500/5">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
                    <Users className="h-4 w-4 text-violet-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{teamOverview.totalEmployees}</p>
                    <p className="text-xs text-muted-foreground mt-1">Active employees</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500/10 to-green-500/5">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Team This Month</CardTitle>
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">₹{teamOverview.teamMonthEarnings.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground mt-1">Combined earnings</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500/10 to-sky-500/5">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Team This Year</CardTitle>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">₹{teamOverview.teamYearEarnings.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground mt-1">Year-to-date</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500/10 to-orange-500/5">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active / Total</CardTitle>
                    <Briefcase className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{teamOverview.teamActiveProjects}</p>
                    <p className="text-xs text-muted-foreground mt-1">of {teamOverview.teamTotalProjects} total projects</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performer + Employee Rows */}
              <div className="grid gap-6 md:grid-cols-2">

                {/* Top Performer */}
                {teamOverview.topPerformer && (
                  <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-400/10 via-amber-300/5 to-transparent">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Top Performer — This Month
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                          {teamOverview.topPerformer.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{teamOverview.topPerformer.fullName}</p>
                          <p className="text-sm text-muted-foreground">@{teamOverview.topPerformer.username}</p>
                        </div>
                        <div className="ml-auto text-right shrink-0">
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{teamOverview.topPerformer.monthlyEarnings.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-muted-foreground">this month</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-2 border-t text-center">
                        <div>
                          <p className="text-lg font-bold">{teamOverview.topPerformer.totalProjects}</p>
                          <p className="text-xs text-muted-foreground">Projects</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">{teamOverview.topPerformer.completedProjects}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-yellow-600">{teamOverview.topPerformer.activeProjects}</p>
                          <p className="text-xs text-muted-foreground">Active</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Per-Employee Progress Bars */}
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Activity className="h-5 w-5 text-primary" />
                      Employee Performance
                    </CardTitle>
                    <CardDescription>This month's earnings by team member</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {teamOverview.employees.map((emp: any) => {
                      const maxMonthly = Math.max(...teamOverview.employees.map((e: any) => e.monthlyEarnings), 1)
                      const pct = maxMonthly > 0 ? Math.round((emp.monthlyEarnings / maxMonthly) * 100) : 0
                      return (
                        <div key={emp.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                                {emp.fullName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium truncate">{emp.fullName}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize hidden sm:inline-flex shrink-0">
                                {emp.role}
                              </Badge>
                            </div>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap ml-2">
                              ₹{emp.monthlyEarnings.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                          <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>{emp.activeProjects} active · {emp.completedProjects} done</span>
                            <span>₹{emp.totalEarnings.toLocaleString('en-IN')} all-time</span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Team Delivery Progress */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Team Project Delivery</CardTitle>
                    <CardDescription>
                      {teamOverview.teamCompletedProjects} of {teamOverview.teamTotalProjects} projects completed across all members
                    </CardDescription>
                  </div>
                  <span className="text-2xl font-bold text-primary shrink-0">
                    {teamOverview.teamTotalProjects > 0
                      ? Math.round((teamOverview.teamCompletedProjects / teamOverview.teamTotalProjects) * 100)
                      : 0}%
                  </span>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={teamOverview.teamTotalProjects > 0
                      ? (teamOverview.teamCompletedProjects / teamOverview.teamTotalProjects) * 100
                      : 0}
                    className="h-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span className="text-yellow-600 font-medium">🔄 {teamOverview.teamActiveProjects} in progress</span>
                    <span className="text-green-600 font-medium">✅ {teamOverview.teamCompletedProjects} completed</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ── Personal Projects + Deadlines ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Your current work in progress</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/projects">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activeProjectsList.length > 0 ? (
              <div className="space-y-4">
                {activeProjectsList.map(project => {
                  const projectClient = clients.find(c => c.id === project.client_id)
                  return (
                    <div key={project.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors">
                      <div className="space-y-1 min-w-0">
                        <Link href={`/dashboard/projects/${project.id}`} className="font-medium hover:underline text-foreground truncate block">
                          {project.title}
                        </Link>
                        <p className="text-sm text-muted-foreground truncate">
                          {projectClient?.name || 'No client'} &bull; {project.category}
                        </p>
                      </div>
                      <Badge className={`${statusColors[project.status] || ''} ml-2 shrink-0`}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">No active projects</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Projects due within 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {urgentProjects.length > 0 ? (
              <div className="space-y-4">
                {urgentProjects.map(project => {
                  const daysUntil = Math.ceil(
                    (new Date(project.deadline).getTime() - Date.now()) / 864e5
                  )
                  return (
                    <div key={project.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <AlertCircle className={`h-4 w-4 shrink-0 ${daysUntil <= 2 ? 'text-destructive' : 'text-yellow-500'}`} />
                        <Link href={`/dashboard/projects/${project.id}`} className="font-medium hover:underline truncate">
                          {project.title}
                        </Link>
                      </div>
                      <span className={`text-sm ml-2 shrink-0 ${daysUntil <= 2 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">No urgent deadlines</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
