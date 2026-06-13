'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  DollarSign, 
  Receipt,
  Target,
  FileText,
  Settings,
  Palette,
  Calendar,
  Bell,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Menu } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/payments', label: 'Payments', icon: DollarSign },
  { href: '/dashboard/expenses', label: 'Expenses', icon: Receipt },
  { href: '/dashboard/goals', label: 'Goals', icon: Target },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/cms', label: 'CMS', icon: FileText },
]

const bottomNavItems = [
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

interface DashboardSidebarProps {
  role?: 'manager' | 'designer'
  notificationCount?: number
}

function NavContent({ role, notificationCount }: DashboardSidebarProps) {
  const pathname = usePathname()

  const isAllowed = (href: string) => {
    if (!role) return true
    
    if (role === 'designer') {
      const restricted = [
        '/dashboard/clients',
        '/dashboard/payments',
        '/dashboard/expenses'
      ]
      return !restricted.includes(href)
    }
    
    if (role === 'manager') {
      const restricted: string[] = []
      return !restricted.includes(href)
    }
    
    return true
  }

  const filteredNavItems = navItems.filter(item => isAllowed(item.href))
  const filteredBottomNavItems = bottomNavItems.filter(item => isAllowed(item.href))

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <div className="p-1.5 rounded-md bg-primary">
            <Palette className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>DesignFlow</span>
        </Link>
      </div>
      
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="px-3 pb-6 mt-auto">
        <ul className="space-y-1 border-t pt-4">
          {filteredBottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.href === '/dashboard/notifications' && notificationCount !== undefined && notificationCount > 0 && (
                    <Badge variant="destructive" className="ml-auto rounded-full px-1.5 py-0.5 text-[10px] h-5 min-w-5 flex items-center justify-center font-bold">
                      {notificationCount}
                    </Badge>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export function DashboardSidebar({ role, notificationCount }: DashboardSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r bg-background">
        <NavContent role={role} notificationCount={notificationCount} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" className="rounded-full shadow-lg lg:hidden fixed bottom-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <NavContent role={role} notificationCount={notificationCount} />
        </SheetContent>
      </Sheet>
    </>
  )
}
