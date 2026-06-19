'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  Briefcase, IndianRupee, Layers, Search, 
  TrendingUp, Award, RefreshCw 
} from 'lucide-react'

interface Project {
  id: string
  title: string
  status: string
  category: string
  amount: number
  deadline: string | null
  created_at: string
  clients: { id: string; name: string } | null
}

interface ProjectsRevenueDashboardProps {
  projects: Project[]
}

const statusLabels: Record<string, string> = {
  inquiry: 'Inquiry',
  in_progress: 'In Progress',
  revision: 'Revision',
  waiting_payment: 'Awaiting Payment',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4']

export function ProjectsRevenueDashboard({ projects }: ProjectsRevenueDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Group projects by trimmed name (case-insensitive)
  const groupedData = useMemo(() => {
    if (!projects || projects.length === 0) return []

    const groups: Record<string, {
      name: string
      count: number
      revenue: number
      statuses: Record<string, number>
      projectIds: string[]
    }> = {}

    projects.forEach(p => {
      const trimmedName = p.title?.trim() || 'Untitled Project'
      const key = trimmedName.toLowerCase()

      if (!groups[key]) {
        groups[key] = {
          name: trimmedName,
          count: 0,
          revenue: 0,
          statuses: {},
          projectIds: []
        }
      }

      groups[key].count += 1
      groups[key].revenue += Number(p.amount) || 0
      groups[key].projectIds.push(p.id)
      
      const statusKey = p.status || 'unknown'
      groups[key].statuses[statusKey] = (groups[key].statuses[statusKey] || 0) + 1
    })

    return Object.values(groups).sort((a, b) => b.revenue - a.revenue)
  }, [projects])

  // 2. Summary stats
  const stats = useMemo(() => {
    const totalUniqueNames = groupedData.length
    const totalRevenue = groupedData.reduce((sum, g) => sum + g.revenue, 0)
    
    let topRevenueName = '-'
    let topRevenueAmount = 0
    let mostRecurringName = '-'
    let mostRecurringCount = 0

    groupedData.forEach(g => {
      if (g.revenue > topRevenueAmount) {
        topRevenueAmount = g.revenue
        topRevenueName = g.name
      }
      if (g.count > mostRecurringCount) {
        mostRecurringCount = g.count
        mostRecurringName = g.name
      }
    })

    const averageRevenue = totalUniqueNames > 0 ? totalRevenue / totalUniqueNames : 0

    return {
      totalUniqueNames,
      totalRevenue,
      topRevenueName,
      topRevenueAmount,
      mostRecurringName,
      mostRecurringCount,
      averageRevenue
    }
  }, [groupedData])

  // 3. Filtering data for search
  const filteredData = useMemo(() => {
    return groupedData.filter(g => 
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [groupedData, searchQuery])

  // 4. Data for the chart (top 8 by revenue)
  const chartData = useMemo(() => {
    return groupedData.slice(0, 8).map(g => ({
      name: g.name.length > 25 ? `${g.name.substring(0, 22)}...` : g.name,
      fullName: g.name,
      revenue: g.revenue,
      count: g.count
    }))
  }, [groupedData])

  return (
    <div className="space-y-6">
      {/* Cards stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Name Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined value of all projects
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Project Names</CardTitle>
            <Layers className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.totalUniqueNames}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {projects.length} total projects
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Revenue Source</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate text-yellow-600 dark:text-yellow-400" title={stats.topRevenueName}>
              {stats.topRevenueName}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue: ₹{stats.topRevenueAmount.toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Most Recurring Name</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate text-blue-600 dark:text-blue-400" title={stats.mostRecurringName}>
              {stats.mostRecurringName}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Occurrences: {stats.mostRecurringCount} times
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="border-0 shadow-md bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            Revenue by Project Name (Top 8)
          </CardTitle>
          <CardDescription>
            Comparison of total revenue generated by project titles
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] pt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.4}/>
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
                  formatter={(value: any, name: any, props: any) => [
                    `₹${Number(value).toLocaleString('en-IN')}`, 
                    'Combined Revenue'
                  ]}
                  labelFormatter={(label, items) => {
                    return items[0]?.payload?.fullName || label
                  }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--border))', 
                    borderRadius: '8px' 
                  }}
                />
                <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No project name data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aggregated List Table */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by project name..."
            className="pl-8 bg-background/50 border-muted"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead className="text-center">Occurrences</TableHead>
                <TableHead className="hidden md:table-cell">Status Breakdown</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-semibold text-muted-foreground">
                      #{index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {item.count}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 justify-start">
                        {Object.entries(item.statuses).map(([status, count]) => (
                          <Badge 
                            key={status} 
                            variant="outline" 
                            className="text-[10px] py-0 px-1.5 capitalize font-normal"
                          >
                            {statusLabels[status] || status}: {count}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                    No matching project names found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
