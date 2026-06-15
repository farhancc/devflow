import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Toaster } from '@/components/ui/toaster'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch notifications count
  const clientDb = await clientPromise
  const db = clientDb.db()

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const sevenDaysFromNow = new Date(now)
  sevenDaysFromNow.setDate(now.getDate() + 7)
  const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0]

  const isManager = user.role === 'manager'

  const [overdueCount, urgentCount, awaitingCount] = await Promise.all([
    db.collection('projects').countDocuments(
      isManager ? {
        status: { $nin: ['completed', 'cancelled'] },
        deadline: { $lt: todayStr, $ne: null, $exists: true }
      } : {
        $or: [{ user_id: user.id }, { assigned_to: user.id }],
        status: { $nin: ['completed', 'cancelled'] },
        deadline: { $lt: todayStr, $ne: null, $exists: true }
      }
    ),
    db.collection('projects').countDocuments(
      isManager ? {
        status: { $in: ['in_progress', 'revision'] },
        deadline: { $gte: todayStr, $lte: sevenDaysStr }
      } : {
        $or: [{ user_id: user.id }, { assigned_to: user.id }],
        status: { $in: ['in_progress', 'revision'] },
        deadline: { $gte: todayStr, $lte: sevenDaysStr }
      }
    ),
    db.collection('projects').countDocuments(
      isManager ? {
        status: 'waiting_payment'
      } : {
        $or: [{ user_id: user.id }, { assigned_to: user.id }],
        status: 'waiting_payment'
      }
    )
  ])

  const notificationCount = overdueCount + urgentCount + awaitingCount

  return (
    <div className="flex min-h-screen bg-muted/30">
      <DashboardSidebar role={user.role} notificationCount={notificationCount} />
      <div className="flex-1 flex flex-col lg:pl-64">
        <DashboardHeader 
          user={{
            name: user.fullName || user.username || 'User',
            email: `${user.username}@designflow.com`,
            avatar: undefined,
          }}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
