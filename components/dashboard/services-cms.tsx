'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Loader2, Award, Palette, ShoppingBag, Globe, Monitor, Briefcase, Sparkles } from 'lucide-react'
import { createService, deleteService } from '@/app/dashboard/cms/service-actions'
import { useToast } from '@/components/ui/use-toast'

interface Service {
  id: string
  title: string
  description: string
  icon: string
}

interface ServicesCmsProps {
  services: Service[]
}

const iconComponents: Record<string, any> = {
  palette: Palette,
  'shopping-bag': ShoppingBag,
  globe: Globe,
  monitor: Monitor,
  briefcase: Briefcase,
  sparkles: Sparkles,
}

export function ServicesCms({ services }: ServicesCmsProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [icon, setIcon] = useState('palette')

  async function handleAddService(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.set('icon', icon)

    const result = await createService(formData)
    setIsLoading(false)

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Service added successfully!',
      })
      setIsOpen(false)
      setIcon('palette')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    setDeletingId(id)
    const result = await deleteService(id)
    setDeletingId(null)

    if (result.success) {
      toast({
        title: 'Deleted',
        description: 'Service has been removed.',
      })
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete service.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Services Offered ({services.length})
          </CardTitle>
          <CardDescription>Manage the service cards displayed in the "What BDESIGN Offers" section.</CardDescription>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full">
              <Plus className="h-4 w-4 mr-1" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Service</DialogTitle>
              <DialogDescription>Create a new service offering to showcase on your landing page.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddService} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input id="title" name="title" placeholder="e.g. Premium Logo Design" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Service Icon</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger id="icon">
                    <SelectValue placeholder="Select an Icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="palette">🎨 Logo & Brand Identity (Palette)</SelectItem>
                    <SelectItem value="shopping-bag">🛍️ Product Packaging (Shopping Bag)</SelectItem>
                    <SelectItem value="globe">🌐 Marketing Materials (Globe)</SelectItem>
                    <SelectItem value="monitor">💻 Social Media Graphics (Monitor)</SelectItem>
                    <SelectItem value="briefcase">💼 Corporate Stationery (Briefcase)</SelectItem>
                    <SelectItem value="sparkles">✨ Custom Vector Graphics (Sparkles)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Service Description *</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Describe what this service offers to clients..." 
                  rows={4} 
                  required 
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Service
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s) => {
              const IconComp = iconComponents[s.icon] || Sparkles
              return (
                <div key={s.id} className="flex flex-col justify-between border rounded-xl p-4 bg-muted/20 relative group hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-primary">
                          <IconComp className="h-4 w-4" />
                        </div>
                        <h4 className="font-bold text-sm">{s.title}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                  
                  <div className="flex justify-end mt-4 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 h-7 px-2"
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                    >
                      {deletingId === s.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">No services loaded in the database yet. Default services will be loaded on the landing page.</p>
        )}
      </CardContent>
    </Card>
  )
}
