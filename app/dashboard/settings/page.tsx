import { getCurrentUser } from '@/lib/auth'
import { findUserById } from '@/lib/db'
import { getAllEmployees } from '@/app/dashboard/settings/actions'
import { SettingsTabs } from '@/components/dashboard/settings-tabs'

export default async function SettingsPage() {
  const sessionUser = await getCurrentUser()

  if (!sessionUser) return null

  const dbUser = await findUserById(sessionUser.id)
  if (!dbUser) return null

  // Fetch employees list
  const employeesResult = await getAllEmployees()
  const initialEmployees = 'employees' in employeesResult && employeesResult.employees 
    ? employeesResult.employees 
    : []

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your credentials and employee accounts</p>
      </div>

      <SettingsTabs 
        currentUsername={dbUser.username}
        currentFullName={dbUser.fullName || 'Creative Manager'}
        currentPhone={dbUser.phone || ''}
        currentEmail={dbUser.email || ''}
        currentAddress={dbUser.address || ''}
        initialEmployees={initialEmployees as any[]}
        role={dbUser.role}
      />
    </div>
  )
}
