'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, Bar, LineChart, Line, Cell, AreaChart, Area,
  PieChart, Pie, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  TrendingUp, Users, FolderKanban, ArrowUpRight, 
  ArrowDownRight, IndianRupee, BarChart3, LineChart as LineIcon,
  Calendar, Briefcase, UserCheck, CheckCircle2, Clock
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface MonthlyData {
  name: string
  fullName: string
  income: number
  expense: number
}

interface WeeklyData {
  name: string
  label: string
  income: number
  expense: number
  profit: number
}

interface YtdMonth {
  name: string
  month: number
  income: number
  expense: number
  cumulativeIncome: number
  cumulativeExpense: number
  profit: number
  cumulativeProfit: number
}

interface ClientData {
  name: string
  count: number
  revenue: number
}

interface ClientIntelligence {
  id: string
  name: string
  company: string
  totalProjects: number
  totalRevenue: number
  activeProjects: number
  lastPaymentDate: string
  avgProjectValue: number
}

interface EmployeeIntelligence {
  id: string
  fullName: string
  username: string
  activeProjects: number
  completedProjects: number
  revenueGenerated: number
  totalAssigned: number
}

interface ProjectStats {
  avgProjectValue: number
  maxProjectValue: number
  onTimeRate: number
  avgCycleTime: number
  statusData: { name: string; value: number }[]
  categoryData: { name: string; value: number }[]
  list: {
    id: string
    title: string
    clientName: string
    category: string
    status: string
    amount: number
    cycleTimeText: string
    onTimeStatus: string
  }[]
}

interface AnalyticsClientProps {
  monthlyData: MonthlyData[]
  weeklyData: WeeklyData[]
  ytdMonths: YtdMonth[]
  clientData: ClientData[]
  clientIntelligenceList: ClientIntelligence[]
  employeeIntelligenceList: EmployeeIntelligence[]
  projectStats: ProjectStats
  totalRevenue: number
  totalExpense: number
  totalProjects: number
  role: 'manager' | 'designer'
}

export function AnalyticsClient({ 
  monthlyData, 
  weeklyData,
  ytdMonths,
  clientData, 
  clientIntelligenceList,
  employeeIntelligenceList,
  projectStats,
  totalRevenue, 
  totalExpense, 
  totalProjects,
  role
}: AnalyticsClientProps) {

  const netProfit = totalRevenue - totalExpense
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  // Colors for charts
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4']

  const projectNameRevenueData = React.useMemo(() => {
    if (!projectStats?.list) return []
    const groups: Record<string, { name: string; revenue: number; count: number }> = {}
    projectStats.list.forEach(p => {
      const trimmedName = p.title?.trim() || 'Untitled Project'
      const key = trimmedName.toLowerCase()
      if (!groups[key]) {
        groups[key] = {
          name: trimmedName,
          revenue: 0,
          count: 0
        }
      }
      groups[key].revenue += Number(p.amount) || 0
      groups[key].count += 1
    })
    return Object.values(groups).sort((a, b) => b.revenue - a.revenue)
  }, [projectStats?.list])

  const statusLabels: Record<string, string> = {
    inquiry: 'Inquiry',
    in_progress: 'In Progress',
    revision: 'Revision',
    waiting_payment: 'Awaiting Payment',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }

  const categoryLabels: Record<string, string> = {
    logo: 'Logo Design',
    poster: 'Poster',
    social_media: 'Social Media',
    branding: 'Branding',
    ui_ux: 'UI/UX',
    video_editing: 'Video Editing',
    print_design: 'Print Design',
    motion_graphics: 'Motion Graphics',
    custom: 'Custom',
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="ytd" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto flex-nowrap gap-1 bg-muted p-1 rounded-lg sm:w-auto md:w-max" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <TabsTrigger value="ytd" className="flex-shrink-0">YTD Analytics</TabsTrigger>
          <TabsTrigger value="monthly_weekly" className="flex-shrink-0">Monthly & Weekly</TabsTrigger>
          <TabsTrigger value="client" className="flex-shrink-0">Clients</TabsTrigger>
          <TabsTrigger value="projects" className="flex-shrink-0">Projects</TabsTrigger>
          {role === 'manager' && (
            <TabsTrigger value="employee" className="flex-shrink-0">Employees</TabsTrigger>
          )}
        </TabsList>

        {/* 1. YTD ANALYTICS TAB */}
        <TabsContent value="ytd" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">YTD Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  Accumulated this year
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">YTD Expenses</CardTitle>
                <ArrowDownRight className="h-4 w-4 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  ₹{totalExpense.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Operations & asset costs
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">YTD Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  ₹{netProfit.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Margin: {margin.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">YTD Projects</CardTitle>
                <FolderKanban className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalProjects}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active & completed tasks
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Cumulative Financial Growth (YTD)</CardTitle>
              <CardDescription>Visualizing cumulative income vs expenses over the current year</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ytdMonths} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `₹${Number(value).toLocaleString('en-IN')}`, 
                      name === 'cumulativeIncome' ? 'Cumulative Income' : 'Cumulative Expense'
                    ]}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Legend iconType="circle" formatter={(value) => <span className="text-xs text-muted-foreground capitalize">{value === 'cumulativeIncome' ? 'Income Growth' : 'Expense Trend'}</span>} />
                  <Area type="monotone" dataKey="cumulativeIncome" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                  <Area type="monotone" dataKey="cumulativeExpense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Yearly Progress Summary</CardTitle>
              <CardDescription>Absolute monthly metrics vs cumulative growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Monthly Revenue</TableHead>
                      <TableHead className="text-right">Monthly Expenses</TableHead>
                      <TableHead className="text-right">Monthly Profit</TableHead>
                      <TableHead className="text-right">Cumulative Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ytdMonths.map((m) => (
                      <TableRow key={m.name}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-medium">₹{m.income.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-rose-600 dark:text-rose-400">₹{m.expense.toLocaleString('en-IN')}</TableCell>
                        <TableCell className={`text-right font-semibold ${m.profit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          ₹{m.profit.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right font-medium text-muted-foreground">₹{m.cumulativeIncome.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. MONTHLY & WEEKLY BREAKDOWNS */}
        <TabsContent value="monthly_weekly" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Income vs Expenses (6-Month)</CardTitle>
                <CardDescription>Monthly comparison over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip 
                      formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString('en-IN')}`, name === 'income' ? 'Income' : 'Expense']}
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Legend iconType="circle" formatter={(value) => <span className="text-xs text-muted-foreground capitalize">{value}</span>} />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="income" />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="expense" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Net Profit Trend</CardTitle>
                <CardDescription>Monthly net income margin progress</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData.map(m => ({ ...m, profit: m.income - m.expense }))} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip 
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Net Profit']}
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Legend iconType="circle" formatter={() => <span className="text-xs text-muted-foreground">Net Profit</span>} />
                    <Line type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md col-span-2">
              <CardHeader>
                <CardTitle>Weekly Transaction Velocity (Last 8 Weeks)</CardTitle>
                <CardDescription>Monitor short-term revenue flow and operational costs week-by-week</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip 
                      formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString('en-IN')}`, name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Net Profit']}
                      labelFormatter={(label, payload) => {
                        const item = payload[0]?.payload
                        return item ? `${item.name} (${item.label})` : label
                      }}
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. CLIENT INTELLIGENCE */}
        <TabsContent value="client" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Projects per Client</CardTitle>
                <CardDescription>Number of design tasks managed per client</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-4">
                {clientData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clientData.slice(0, 8)} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                      <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} width={80} />
                      <Tooltip 
                        formatter={(value: any) => [value, 'Projects']}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Projects" barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No client data available</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Revenue Contribution</CardTitle>
                <CardDescription>Client contribution to cumulative revenue</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center pt-4">
                {clientData.some(c => c.revenue > 0) ? (
                  <div className="w-full h-full flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 h-full min-h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={clientData.filter(c => c.revenue > 0).slice(0, 5)}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="revenue"
                          >
                            {clientData.filter(c => c.revenue > 0).slice(0, 5).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue Contribution']}
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto pr-4">
                      {clientData.filter(c => c.revenue > 0).slice(0, 5).map((client, index) => (
                        <div key={`${client.name}-${index}`} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs truncate max-w-[120px] font-medium">{client.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            ({((client.revenue / totalRevenue) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No payments recorded from clients yet</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md col-span-2">
              <CardHeader>
                <CardTitle>Client LTV Leaderboard</CardTitle>
                <CardDescription>Deep intelligence on client revenue, volume, and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-center">Total Projects</TableHead>
                        <TableHead className="text-center">Active Projects</TableHead>
                        <TableHead className="text-right">Avg Project Size</TableHead>
                        <TableHead className="text-right">Last Payment</TableHead>
                        <TableHead className="text-right">Total Revenue Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientIntelligenceList.map((client, index) => (
                        <TableRow key={`${client.id}-${index}`}>
                          <TableCell className="font-semibold">{client.name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{client.company}</TableCell>
                          <TableCell className="text-center font-medium">{client.totalProjects}</TableCell>
                          <TableCell className="text-center">
                            {client.activeProjects > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {client.activeProjects} active
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">₹{client.avgProjectValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm">{client.lastPaymentDate}</TableCell>
                          <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-bold">₹{client.totalRevenue.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 5. PROJECT INTELLIGENCE */}
        <TabsContent value="projects" className="space-y-6">
          {/* Project Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Project Value</CardTitle>
                <Briefcase className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  ₹{projectStats.avgProjectValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average project valuation
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Highest Value Project</CardTitle>
                <IndianRupee className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{projectStats.maxProjectValue.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Peak single project budget
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">On-Time Delivery Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {projectStats.onTimeRate.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Completed within deadline
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {projectStats.avgCycleTime > 0 ? `${projectStats.avgCycleTime.toFixed(0)} days` : '-'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average design turn-around
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Project Status Distribution */}
            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Volume of projects across pipeline phases</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center pt-4">
                {projectStats.statusData.length > 0 ? (
                  <div className="w-full h-full flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 h-full min-h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={projectStats.statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {projectStats.statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => [value, 'Projects']}
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto pr-4">
                      {projectStats.statusData.map((status, index) => (
                        <div key={`${status.name}-${index}`} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs truncate max-w-[120px] font-medium capitalize">{statusLabels[status.name] || status.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            ({status.value})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No projects recorded yet</div>
                )}
              </CardContent>
            </Card>

            {/* Project Category Distribution */}
            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Project Category Allocation</CardTitle>
                <CardDescription>Breakdown of design task categories</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-4">
                {projectStats.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectStats.categoryData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip 
                        formatter={(value: any) => [value, 'Projects']}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Projects" barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No category data available</div>
                )}
              </CardContent>
            </Card>

            {/* Project Name Revenue Distribution */}
            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md col-span-2">
              <CardHeader>
                <CardTitle>Revenue by Project Name</CardTitle>
                <CardDescription>Total combined revenue aggregated by unique project titles (Top 8)</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] pt-4">
                {projectNameRevenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectNameRevenueData.slice(0, 8)} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorProjNameRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.85}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.4}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#888888" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(v) => `₹${v / 1000}k`} 
                      />
                      <Tooltip 
                        formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Bar dataKey="revenue" fill="url(#colorProjNameRevenue)" radius={[4, 4, 0, 0]}>
                        {projectNameRevenueData.slice(0, 8).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No project name data available</div>
                )}
              </CardContent>
            </Card>

            {/* Projects Detail Table */}
            <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md col-span-2">
              <CardHeader>
                <CardTitle>Project Intelligence Log</CardTitle>
                <CardDescription>Cycle times, deadline performance, and financial stats for projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Delivery status</TableHead>
                        <TableHead className="text-center">Cycle / Time Left</TableHead>
                        <TableHead className="text-right">Project Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectStats.list.map((proj, index) => (
                        <TableRow key={`${proj.id}-${index}`}>
                          <TableCell className="font-semibold">{proj.title}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{proj.clientName}</TableCell>
                          <TableCell className="text-muted-foreground text-xs capitalize">{categoryLabels[proj.category] || proj.category}</TableCell>
                          <TableCell className="text-center capitalize">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                              {statusLabels[proj.status] || proj.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {proj.onTimeStatus === 'On-time' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                On-time
                              </span>
                            )}
                            {proj.onTimeStatus === 'Delayed' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                Delayed
                              </span>
                            )}
                            {proj.onTimeStatus === 'Overdue' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 animate-pulse">
                                Overdue
                              </span>
                            )}
                            {proj.onTimeStatus === 'In-progress' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                In-progress
                              </span>
                            )}
                            {proj.onTimeStatus === 'N/A' && (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center text-sm font-medium text-muted-foreground">
                            {proj.cycleTimeText}
                          </TableCell>
                          <TableCell className="text-right text-indigo-600 dark:text-indigo-400 font-bold">₹{proj.amount.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 6. EMPLOYEE INTELLIGENCE (MANAGER ONLY) */}
        {role === 'manager' && (
          <TabsContent value="employee" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle>Designer Project Allocation</CardTitle>
                  <CardDescription>Number of active and cumulative projects per employee</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] pt-4">
                  {employeeIntelligenceList.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={employeeIntelligenceList} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="fullName" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip 
                          formatter={(value: any, name: any) => [value, name === 'activeProjects' ? 'Active Projects' : 'Total Assigned']}
                          contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        />
                        <Legend iconType="circle" formatter={(value) => <span className="text-xs text-muted-foreground capitalize">{value === 'activeProjects' ? 'Active Load' : 'Cumulative Assigned'}</span>} />
                        <Bar dataKey="activeProjects" fill="#f59e0b" radius={[4, 4, 0, 0]} name="activeProjects" />
                        <Bar dataKey="totalAssigned" fill="#6366f1" radius={[4, 4, 0, 0]} name="totalAssigned" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No employee assignments yet</div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle>Revenue Generated by Employee</CardTitle>
                  <CardDescription>Cumulative project payments generated by designers</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] pt-4">
                  {employeeIntelligenceList.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={employeeIntelligenceList} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="fullName" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                        <Tooltip 
                          formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue Generated']}
                          contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        />
                        <Bar dataKey="revenueGenerated" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No revenue tracking records available</div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md col-span-2">
                <CardHeader>
                  <CardTitle>Team Output & Revenue Contribution</CardTitle>
                  <CardDescription>Comparative metrics on employee outputs, workload, and revenues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead className="text-center">Active Projects</TableHead>
                          <TableHead className="text-center">Completed Projects</TableHead>
                          <TableHead className="text-center">Total Projects Assigned</TableHead>
                          <TableHead className="text-right">Revenue Contributed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employeeIntelligenceList.map((emp, index) => (
                          <TableRow key={`${emp.id}-${index}`}>
                            <TableCell className="font-semibold">{emp.fullName}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">@{emp.username}</TableCell>
                            <TableCell className="text-center font-medium">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${emp.activeProjects > 2 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                {emp.activeProjects} active
                              </span>
                            </TableCell>
                            <TableCell className="text-center font-medium text-muted-foreground">{emp.completedProjects}</TableCell>
                            <TableCell className="text-center">{emp.totalAssigned}</TableCell>
                            <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-bold">₹{emp.revenueGenerated.toLocaleString('en-IN')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
