'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar, Clock, Video, Bell, Bookmark } from 'lucide-react'
import { createCustomEvent, deleteCustomEvent } from '@/app/dashboard/calendar/actions'

interface CalendarProject {
  id: string
  title: string
  deadline: string
  status: string
  clientName: string
}

interface CustomEvent {
  id: string
  title: string
  date: string
  type: string
  time: string
  notes: string
}

interface InteractiveCalendarProps {
  projects: CalendarProject[]
  events: CustomEvent[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const eventTypeColors: Record<string, string> = {
  meeting: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
  reminder: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  call: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300',
  other: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
}

const eventTypeIcons: Record<string, any> = {
  meeting: Video,
  reminder: Bell,
  call: Clock,
  other: Bookmark,
}

export function InteractiveCalendar({ projects, events }: InteractiveCalendarProps) {
  const now = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<Date | null>(now)
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Helper: total days in current month
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate()
  // Helper: starting weekday of month (0 = Sun, 1 = Mon...)
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Get items for a specific day string (YYYY-MM-DD)
  const getItemsForDay = (year: number, month: number, day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    const dayProjects = projects.filter(p => p.deadline === dayStr)
    const dayEvents = events.filter(e => e.date === dayStr)

    return { dayProjects, dayEvents }
  }

  const handleDayClick = (dayNum: number) => {
    setSelectedDay(new Date(currentYear, currentMonth, dayNum))
  }

  const handleCreateEvent = async (formData: FormData) => {
    setIsSaving(true)
    const result = await createCustomEvent(formData)
    setIsSaving(false)
    if (!result.error) {
      setIsAddingEvent(false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    await deleteCustomEvent(id)
  }

  // Generate calendar days grid
  const daysGrid = []
  
  // Pad previous month's ending days
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    daysGrid.push({
      day: prevMonthTotalDays - i,
      isCurrentMonth: false,
      monthOffset: -1
    })
  }

  // Current month's days
  for (let d = 1; d <= totalDays; d++) {
    daysGrid.push({
      day: d,
      isCurrentMonth: true,
      monthOffset: 0
    })
  }

  // Pad next month's starting days to fill 42 cells (6 rows * 7 days)
  const totalCells = 42
  const nextMonthPadding = totalCells - daysGrid.length
  for (let i = 1; i <= nextMonthPadding; i++) {
    daysGrid.push({
      day: i,
      isCurrentMonth: false,
      monthOffset: 1
    })
  }

  // Filter items for the selected day details
  const selectedDayStr = selectedDay 
    ? `${selectedDay.getFullYear()}-${String(selectedDay.getMonth() + 1).padStart(2, '0')}-${String(selectedDay.getDate()).padStart(2, '0')}`
    : ''
  const selectedDayProjects = projects.filter(p => p.deadline === selectedDayStr)
  const selectedDayEvents = events.filter(e => e.date === selectedDayStr)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Calendar Grid Section */}
      <Card className="lg:col-span-2 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-bold">
              {MONTHS[currentMonth]} {currentYear}
            </CardTitle>
            <CardDescription>Click a date to schedule meetings or view deadlines</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1))
              setSelectedDay(now)
            }}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground border-b pb-2">
            {WEEKDAYS.map(w => <div key={w} className="py-2">{w}</div>)}
          </div>

          {/* Grid cells */}
          <div className="grid grid-cols-7 gap-px bg-muted/20 dark:bg-muted/10 border-b">
            {daysGrid.map((cell, idx) => {
              const isToday = cell.isCurrentMonth && 
                cell.day === now.getDate() && 
                currentMonth === now.getMonth() && 
                currentYear === now.getFullYear()

              const isSelected = selectedDay && cell.isCurrentMonth &&
                cell.day === selectedDay.getDate() &&
                currentMonth === selectedDay.getMonth() &&
                currentYear === selectedDay.getFullYear()

              const { dayProjects, dayEvents } = cell.isCurrentMonth 
                ? getItemsForDay(currentYear, currentMonth, cell.day)
                : { dayProjects: [], dayEvents: [] }

              const totalItems = dayProjects.length + dayEvents.length

              return (
                <button
                  key={idx}
                  onClick={() => cell.isCurrentMonth && handleDayClick(cell.day)}
                  disabled={!cell.isCurrentMonth}
                  className={`
                    min-h-[72px] sm:min-h-[96px] p-1.5 flex flex-col items-start gap-1 text-left relative focus:outline-none transition-colors
                    ${cell.isCurrentMonth ? 'bg-background hover:bg-muted/40 cursor-pointer' : 'bg-muted/10 text-muted-foreground/40 cursor-default'}
                    ${isSelected ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''}
                  `}
                >
                  <span className={`
                    text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center shrink-0
                    ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                    ${cell.isCurrentMonth && !isToday ? 'text-foreground' : ''}
                  `}>
                    {cell.day}
                  </span>

                  {/* Indicators for mobile / tiny display */}
                  <div className="flex flex-wrap gap-1 mt-auto w-full">
                    {/* Desktop rendering (small text blocks) */}
                    <div className="hidden sm:flex flex-col gap-0.5 w-full overflow-hidden text-[10px]">
                      {dayProjects.map(p => (
                        <div key={p.id} className="truncate px-1 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                          ⚠️ {p.title}
                        </div>
                      ))}
                      {dayEvents.map(e => (
                        <div 
                          key={e.id} 
                          className={`truncate px-1 py-0.5 rounded font-medium border border-transparent ${eventTypeColors[e.type] || ''}`}
                        >
                          {e.type === 'meeting' ? '🎥 ' : e.type === 'call' ? '📞 ' : '🔔 '}
                          {e.title}
                        </div>
                      ))}
                    </div>

                    {/* Mobile dots */}
                    <div className="flex sm:hidden gap-1 justify-center w-full mt-1">
                      {dayProjects.map(p => <span key={p.id} className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />)}
                      {dayEvents.map(e => {
                        const dotColor = e.type === 'meeting' ? 'bg-indigo-500' : e.type === 'call' ? 'bg-rose-500' : 'bg-emerald-500'
                        return <span key={e.id} className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
                      })}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Details Side Panel */}
      <Card className="border-0 shadow-md h-fit">
        <CardHeader className="pb-3 border-b flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Schedule Details
            </CardTitle>
            <CardDescription>
              {selectedDay 
                ? selectedDay.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                : 'Select a day'
              }
            </CardDescription>
          </div>
          {selectedDay && (
            <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
              <DialogTrigger asChild>
                <Button size="icon" className="h-8 w-8 rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Add Custom Event</DialogTitle>
                  <DialogDescription>Schedule a meeting, reminder, or general task call</DialogDescription>
                </DialogHeader>
                <form action={handleCreateEvent} className="space-y-4">
                  <input type="hidden" name="date" value={selectedDayStr} />
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input id="title" name="title" placeholder="e.g., Design Review Meeting" required />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="type">Type</Label>
                      <select 
                        id="type" 
                        name="type" 
                        className="w-full h-9 rounded-md border px-2 text-sm bg-background"
                      >
                        <option value="meeting">Video Meeting</option>
                        <option value="call">Phone Call</option>
                        <option value="reminder">Reminder</option>
                        <option value="other">General Task</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="time">Time</Label>
                      <Input id="time" name="time" type="time" defaultValue="10:00" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Notes</Label>
                    <Input id="notes" name="notes" placeholder="Brief summary/link..." />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddingEvent(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Add Event'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Deadlines list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deadlines</h4>
            {selectedDayProjects.length === 0 ? (
              <p className="text-xs text-muted-foreground py-1">No project deadlines on this day.</p>
            ) : (
              selectedDayProjects.map(proj => (
                <div key={proj.id} className="p-2 border rounded-lg flex flex-col gap-0.5 bg-amber-500/5 border-amber-200 dark:border-amber-900/30">
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">⚠️ {proj.title}</span>
                  <span className="text-[10px] text-muted-foreground">Client: {proj.clientName} · Status: {proj.status}</span>
                </div>
              ))
            )}
          </div>

          {/* Events list */}
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Events &amp; Tasks</h4>
            {selectedDayEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground py-1">No custom events scheduled.</p>
            ) : (
              selectedDayEvents.map(evt => {
                const Icon = eventTypeIcons[evt.type] || Bookmark
                return (
                  <div 
                    key={evt.id} 
                    className={`p-2 border rounded-lg flex items-start justify-between gap-3 ${eventTypeColors[evt.type] || ''}`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs font-bold truncate">{evt.title}</span>
                      </div>
                      {evt.time && <p className="text-[10px] opacity-80 font-medium">🕒 {evt.time}</p>}
                      {evt.notes && <p className="text-[10px] opacity-70 truncate">{evt.notes}</p>}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0 opacity-80 hover:opacity-100"
                      onClick={() => handleDeleteEvent(evt.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
