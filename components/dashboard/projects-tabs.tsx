'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectsTable } from './projects-table'
import { ProjectsRevenueDashboard } from './projects-revenue-dashboard'
import { List, BarChart3 } from 'lucide-react'

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

interface ProjectsTabsProps {
  projects: Project[]
  clients: { id: string; name: string }[]
  statusColors: Record<string, string>
}

export function ProjectsTabs({ projects, clients, statusColors }: ProjectsTabsProps) {
  return (
    <Tabs defaultValue="list" className="space-y-6">
      <TabsList className="flex w-full overflow-x-auto flex-nowrap gap-1 bg-muted/50 p-1 rounded-xl max-w-md" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <TabsTrigger value="list" className="flex-1 flex-shrink-0 rounded-lg py-2.5 font-medium transition-all text-center flex items-center justify-center gap-2">
          <List className="h-4 w-4" />
          Projects List
        </TabsTrigger>
        <TabsTrigger value="revenue" className="flex-1 flex-shrink-0 rounded-lg py-2.5 font-medium transition-all text-center flex items-center justify-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Revenue by Name
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="space-y-6">
        <ProjectsTable 
          projects={projects} 
          clients={clients}
          statusColors={statusColors} 
        />
      </TabsContent>

      <TabsContent value="revenue" className="space-y-6">
        <ProjectsRevenueDashboard projects={projects} />
      </TabsContent>
    </Tabs>
  )
}
