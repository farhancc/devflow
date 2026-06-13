import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { InteractiveCalendar } from '@/components/dashboard/interactive-calendar'

export default async function CalendarPage() {
  const user = await getCurrentUser()

  if (!user) return null

  const clientDb = await clientPromise
  const db = clientDb.db()

  // Fetch all projects for the user with a deadline
  const projects = await db.collection('projects')
    .find({
      user_id: user.id,
      deadline: { $ne: null, $exists: true }
    })
    .toArray()

  // Fetch all clients to display names
  const clients = await db.collection('clients').find({ user_id: user.id }).toArray()
  const clientsMap: Record<string, string> = {}
  clients.forEach(c => {
    clientsMap[c.id] = c.name
  })

  // Format projects for InteractiveCalendar
  const formattedProjects = projects.map(p => ({
    id: p.id,
    title: p.title,
    deadline: p.deadline || '',
    status: p.status,
    clientName: p.client_id ? clientsMap[p.client_id] || 'Unknown Client' : 'No Client'
  }))

  // Fetch all custom events for this user
  const events = await db.collection('events')
    .find({ user_id: user.id })
    .toArray()

  const formattedEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    date: e.date,
    type: e.type,
    time: e.time || '',
    notes: e.notes || ''
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
        <p className="text-muted-foreground">Interactive grid containing project deadlines and scheduled meetings</p>
      </div>

      <InteractiveCalendar 
        projects={formattedProjects} 
        events={formattedEvents} 
      />
    </div>
  )
}
