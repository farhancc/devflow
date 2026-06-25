import { getCurrentUser } from '@/lib/auth'
import { getLocalProjects, getLocalClients, getLocalPayments, getLocalExpenses } from '@/lib/local-db'
import { getUsers } from '@/lib/db'
import { AnalyticsClient } from '@/components/dashboard/analytics-client'

export default async function AnalyticsPage() {
  const user = await getCurrentUser()

  if (!user) return null

  // Fetch local data (automatically scoped to user role by getLocal* functions, passing user.role to avoid redundant user role lookups in MongoDB)
  const [projects, clients, payments, expenses] = await Promise.all([
    getLocalProjects(user.id, user.role),
    getLocalClients(user.id, user.role),
    getLocalPayments(user.id, user.role),
    getLocalExpenses(user.id, user.role)
  ])

  // Fetch employees list for managers
  let employees: { id: string; fullName: string; username: string }[] = []
  if (user.role === 'manager') {
    const allUsers = await getUsers()
    employees = allUsers
      .filter(u => u.id !== user.id)
      .map(u => ({ id: u.id, fullName: u.fullName, username: u.username }))
  }

  const now = new Date()
  const currentYear = now.getFullYear()

  // 1. Last 6 Months (Monthly Analytics)
  const monthlyData: any[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const name = d.toLocaleString('en-US', { month: 'short' })
    const fullName = d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    
    monthlyData.push({
      year,
      month,
      name,
      fullName,
      income: 0,
      expense: 0
    })
  }

  payments.forEach((p: any) => {
    if (!p.payment_date) return
    const pDate = new Date(p.payment_date)
    const year = pDate.getFullYear()
    const month = pDate.getMonth() + 1
    
    const match = monthlyData.find(m => m.year === year && m.month === month)
    if (match) {
      match.income += Number(p.amount)
    }
  })

  expenses.forEach((e: any) => {
    if (!e.expense_date) return
    const eDate = new Date(e.expense_date)
    const year = eDate.getFullYear()
    const month = eDate.getMonth() + 1
    
    const match = monthlyData.find(m => m.year === year && m.month === month)
    if (match) {
      match.expense += Number(e.amount)
    }
  })

  // 2. Year-to-Date (YTD) Analytics
  const ytdMonths = []
  let cumulativeRevenue = 0
  let cumulativeExpense = 0
  
  for (let m = 0; m <= now.getMonth(); m++) {
    const d = new Date(currentYear, m, 1)
    const name = d.toLocaleString('en-US', { month: 'short' })
    const monthNum = m + 1
    
    const monthlyIncome = payments
      .filter((p: any) => {
        if (!p.payment_date) return false
        const pd = new Date(p.payment_date)
        return pd.getFullYear() === currentYear && (pd.getMonth() + 1) === monthNum
      })
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const monthlyExpense = expenses
      .filter((e: any) => {
        if (!e.expense_date) return false
        const ed = new Date(e.expense_date)
        return ed.getFullYear() === currentYear && (ed.getMonth() + 1) === monthNum
      })
      .reduce((sum, e) => sum + Number(e.amount), 0)

    cumulativeRevenue += monthlyIncome
    cumulativeExpense += monthlyExpense

    ytdMonths.push({
      name,
      month: monthNum,
      income: monthlyIncome,
      expense: monthlyExpense,
      cumulativeIncome: cumulativeRevenue,
      cumulativeExpense: cumulativeExpense,
      profit: monthlyIncome - monthlyExpense,
      cumulativeProfit: cumulativeRevenue - cumulativeExpense
    })
  }

  // 3. Weekly Analytics (Last 8 Weeks)
  const weeklyData = []
  for (let i = 7; i >= 0; i--) {
    const startOfWeek = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
    const endOfWeek = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
    
    const weekLabel = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    
    const weekIncome = payments
      .filter((p: any) => {
        if (!p.payment_date) return false
        const pd = new Date(p.payment_date)
        return pd >= startOfWeek && pd <= endOfWeek
      })
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const weekExpense = expenses
      .filter((e: any) => {
        if (!e.expense_date) return false
        const ed = new Date(e.expense_date)
        return ed >= startOfWeek && ed <= endOfWeek
      })
      .reduce((sum, e) => sum + Number(e.amount), 0)

    weeklyData.push({
      name: `W${8 - i}`,
      label: weekLabel,
      income: weekIncome,
      expense: weekExpense,
      profit: weekIncome - weekExpense
    })
  }

  // 4. Client Intelligence
  const clientMap: Record<string, { name: string; count: number; revenue: number }> = {}
  clients.forEach((c: any) => {
    clientMap[c.id] = {
      name: c.name,
      count: 0,
      revenue: 0
    }
  })

  projects.forEach((proj: any) => {
    const clientId = proj.client_id
    if (clientId && clientMap[clientId]) {
      clientMap[clientId].count += 1
    }
  })

  payments.forEach((pay: any) => {
    const clientId = pay.client_id
    if (clientId && clientMap[clientId]) {
      clientMap[clientId].revenue += Number(pay.amount)
    }
  })

  const clientData = Object.values(clientMap).sort((a, b) => b.revenue - a.revenue)

  const clientIntelligenceList = clients.map((c: any) => {
    const clientProjects = projects.filter((p: any) => p.client_id === c.id)
    const clientPayments = payments.filter((p: any) => p.client_id === c.id)
    const totalRevenue = clientPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    const activeProjects = clientProjects.filter((p: any) => ['in_progress', 'revision'].includes(p.status)).length
    
    let lastPaymentDate = '-'
    if (clientPayments.length > 0) {
      const dates = clientPayments.map(p => new Date(p.payment_date).getTime())
      const maxDate = new Date(Math.max(...dates))
      lastPaymentDate = maxDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const avgProjectValue = clientProjects.length > 0 
      ? (clientProjects.reduce((sum, p) => sum + Number(p.amount), 0) / clientProjects.length)
      : 0

    return {
      id: c.id,
      name: c.name,
      company: c.company || 'Individual',
      totalProjects: clientProjects.length,
      totalRevenue,
      activeProjects,
      lastPaymentDate,
      avgProjectValue
    }
  }).sort((a, b) => b.totalRevenue - a.totalRevenue)

  // 5. Employee Intelligence (Only aggregated for managers)
  const employeeIntelligenceList = employees.map((emp: any) => {
    const empProjects = projects.filter((p: any) => p.assigned_to === emp.id)
    const activeProjectsCount = empProjects.filter((p: any) => ['in_progress', 'revision'].includes(p.status)).length
    const completedProjectsCount = empProjects.filter((p: any) => p.status === 'completed').length
    
    const empProjectIds = empProjects.map((p: any) => p.id)
    const empPayments = payments.filter((p: any) => empProjectIds.includes(p.project_id))
    const totalRevenueGenerated = empPayments.reduce((sum, p) => sum + Number(p.amount), 0)

    return {
      id: emp.id,
      fullName: emp.fullName,
      username: emp.username,
      activeProjects: activeProjectsCount,
      completedProjects: completedProjectsCount,
      revenueGenerated: totalRevenueGenerated,
      totalAssigned: empProjects.length
    }
  }).sort((a, b) => b.revenueGenerated - a.revenueGenerated)

  // 6. Project Intelligence
  const projectStatusCounts = {
    inquiry: 0,
    in_progress: 0,
    revision: 0,
    waiting_payment: 0,
    completed: 0,
    cancelled: 0
  }
  const projectCategoryCounts: Record<string, number> = {}

  let totalProjectValue = 0
  let maxProjectValue = 0
  let completedCount = 0
  let completedOnTime = 0
  let totalCycleTimeDays = 0

  const projectIntelligenceList = projects.map((proj: any) => {
    const value = Number(proj.amount) || 0
    totalProjectValue += value
    if (value > maxProjectValue) maxProjectValue = value

    const cat = proj.category || 'Uncategorized'
    projectCategoryCounts[cat] = (projectCategoryCounts[cat] || 0) + 1

    if (proj.status in projectStatusCounts) {
      projectStatusCounts[proj.status as keyof typeof projectStatusCounts] += 1
    }

    let cycleTimeText = '-'
    let onTimeStatus = 'N/A'
    
    const createdAt = new Date(proj.created_at)
    const deadline = proj.deadline ? new Date(proj.deadline) : null

    if (proj.status === 'completed' && proj.completed_date) {
      completedCount++
      const completedAt = new Date(proj.completed_date)
      const diffTime = Math.abs(completedAt.getTime() - createdAt.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      totalCycleTimeDays += diffDays
      cycleTimeText = `${diffDays} days`

      if (deadline) {
        if (completedAt <= deadline) {
          completedOnTime++
          onTimeStatus = 'On-time'
        } else {
          onTimeStatus = 'Delayed'
        }
      }
    } else if (proj.status !== 'cancelled' && deadline) {
      const today = new Date()
      const diffTime = deadline.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays < 0) {
        onTimeStatus = 'Overdue'
        cycleTimeText = `${Math.abs(diffDays)} days overdue`
      } else {
        onTimeStatus = 'In-progress'
        cycleTimeText = `${diffDays} days left`
      }
    }

    const client = clients.find((c: any) => c.id === proj.client_id)

    return {
      id: proj.id,
      title: proj.title,
      clientName: client ? client.name : 'Unknown Client',
      category: proj.category,
      status: proj.status,
      amount: value,
      cycleTimeText,
      onTimeStatus
    }
  })

  const avgProjectValue = projects.length > 0 ? totalProjectValue / projects.length : 0
  const onTimeRate = completedCount > 0 ? (completedOnTime / completedCount) * 100 : 0
  const avgCycleTime = completedCount > 0 ? totalCycleTimeDays / completedCount : 0

  const projectStatusData = Object.entries(projectStatusCounts)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value > 0)

  const projectCategoryData = Object.entries(projectCategoryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const projectStats = {
    avgProjectValue,
    maxProjectValue,
    onTimeRate,
    avgCycleTime,
    statusData: projectStatusData,
    categoryData: projectCategoryData,
    list: projectIntelligenceList
  }

  // Totals in the YTD period
  const totalRevenue = ytdMonths.reduce((sum, m) => sum + m.income, 0)
  const totalExpense = ytdMonths.reduce((sum, m) => sum + m.expense, 0)

  // Total projects in YTD period
  const totalProjects = projects.filter((proj: any) => {
    if (!proj.created_at) return false
    const projDate = new Date(proj.created_at)
    return projDate.getFullYear() === currentYear
  }).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Business Analytics</h2>
        <p className="text-muted-foreground">
          {user.role === 'manager' 
            ? 'Detailed team financial performance, project metrics, client LTV, and employee performance.' 
            : 'Track your personal income performance, client history, and project metrics.'}
        </p>
      </div>

      <AnalyticsClient 
        monthlyData={monthlyData}
        weeklyData={weeklyData}
        ytdMonths={ytdMonths}
        clientData={clientData}
        clientIntelligenceList={clientIntelligenceList}
        employeeIntelligenceList={employeeIntelligenceList}
        projectStats={projectStats}
        totalRevenue={totalRevenue}
        totalExpense={totalExpense}
        totalProjects={totalProjects}
        role={user.role || 'designer'}
      />
    </div>
  )
}
