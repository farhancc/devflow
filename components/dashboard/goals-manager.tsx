'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, Plus, Trash2, Target, DollarSign, FolderKanban, TrendingDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { saveGoal, deleteGoal } from '@/app/dashboard/goals/actions'

interface Goal {
  id: string
  month: number
  year: number
  target_type: 'income' | 'projects' | 'expenses'
  target_value: number
}

interface GoalsManagerProps {
  goals: Goal[]
  currentMonthIncome: number
  currentMonthProjectsCount: number
  currentMonthExpenses: number
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function GoalsManager({ 
  goals, 
  currentMonthIncome, 
  currentMonthProjectsCount, 
  currentMonthExpenses 
}: GoalsManagerProps) {
  const router = useRouter()
  const now = new Date()
  
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [targetValue, setTargetValue] = useState('')
  const [targetType, setTargetType] = useState<'income' | 'projects' | 'expenses'>('income')
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))

  const handleAdd = async () => {
    setLoading(true)
    const result = await saveGoal(Number(month), Number(year), Number(targetValue), targetType)
    setLoading(false)
    if (!result.error) {
      setIsAdding(false)
      setTargetValue('')
      router.refresh()
    }
  }

  const handleDelete = async (id: string) => {
    await deleteGoal(id)
    router.refresh()
  }

  const getTargetTypeIcon = (type: string) => {
    switch(type) {
      case 'income':
        return <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹</span>
      case 'projects':
        return <FolderKanban className="h-4 w-4 text-blue-500" />
      case 'expenses':
        return <TrendingDown className="h-4 w-4 text-rose-500" />
      default:
        return <Target className="h-4 w-4 text-primary" />
    }
  }

  const getTargetTypeLabel = (type: string) => {
    switch(type) {
      case 'income': return 'Income Target'
      case 'projects': return 'Project Completion Target'
      case 'expenses': return 'Expense Budget Cap'
      default: return type
    }
  }

  const formatTargetValue = (type: string, val: number) => {
    if (type === 'income' || type === 'expenses') {
      return `₹${val.toLocaleString('en-IN')}`
    }
    return `${val} Projects`
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Goals Manager
          </CardTitle>
          <CardDescription>Configure target metrics for income, project delivery, and expenses</CardDescription>
        </div>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Set Goal
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="p-4 border rounded-lg space-y-4 bg-muted/40">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Goal Type</Label>
                <select 
                  value={targetType} 
                  onChange={e => setTargetType(e.target.value as any)}
                  className="w-full h-9 rounded-md border px-2 text-sm bg-background"
                >
                  <option value="income">Income Target (₹)</option>
                  <option value="projects">Projects Count</option>
                  <option value="expenses">Expense Limit (₹)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Month</Label>
                <select 
                  value={month} 
                  onChange={e => setMonth(e.target.value)}
                  className="w-full h-9 rounded-md border px-2 text-sm bg-background"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Year</Label>
                <Input 
                  type="number" 
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Target Value</Label>
                <Input 
                  type="number" 
                  value={targetValue}
                  onChange={e => setTargetValue(e.target.value)}
                  placeholder={targetType === 'projects' ? '5' : '50000'}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading || !targetValue}>
                {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Save Goal
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map(goal => {
              const isCurrentMonth = goal.month === now.getMonth() + 1 && goal.year === now.getFullYear()
              
              // Calculate progress depending on goal target type
              let currentVal = 0
              if (goal.target_type === 'income') currentVal = currentMonthIncome
              else if (goal.target_type === 'projects') currentVal = currentMonthProjectsCount
              else if (goal.target_type === 'expenses') currentVal = currentMonthExpenses

              let progress = 0
              if (goal.target_value > 0) {
                progress = Math.min((currentVal / Number(goal.target_value)) * 100, 100)
              }

              // Expenses is a budget limit, so less is better (limit cap)
              const isExpense = goal.target_type === 'expenses'
              const progressColor = isExpense
                ? (currentVal > goal.target_value ? 'bg-red-500' : 'bg-emerald-500')
                : 'bg-primary'

              return (
                <div key={goal.id} className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/10 transition-colors">
                  <div className="mt-1 shrink-0 p-1.5 rounded-full bg-muted flex items-center justify-center">
                    {getTargetTypeIcon(goal.target_type)}
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex justify-between items-center text-sm">
                      <div className="space-y-0.5">
                        <span className="font-semibold block sm:inline">
                          {MONTHS[goal.month - 1]} {goal.year}
                        </span>
                        <span className="text-xs text-muted-foreground ml-0 sm:ml-2">
                          ({getTargetTypeLabel(goal.target_type)})
                          {isCurrentMonth && <span className="ml-1.5 text-primary font-medium">(current month)</span>}
                        </span>
                      </div>
                      <span className="font-semibold shrink-0 text-right">
                        {isCurrentMonth && (
                          <span className="text-xs text-muted-foreground mr-1">
                            {goal.target_type === 'projects' ? `${currentVal} / ` : `₹${currentVal.toLocaleString('en-IN')} / `}
                          </span>
                        )}
                        {formatTargetValue(goal.target_type, goal.target_value)}
                      </span>
                    </div>
                    {isCurrentMonth && (
                      <div className="space-y-1">
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${progressColor} transition-all duration-300`} 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>{progress.toFixed(0)}% reached</span>
                          {isExpense && currentVal > goal.target_value && (
                            <span className="text-red-500 font-semibold">Budget Exceeded!</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDelete(goal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No goals configured yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
