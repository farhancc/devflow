'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { createProject, updateProject, addProjectCategory } from '@/app/dashboard/projects/actions'
import { useToast } from '@/components/ui/use-toast'

interface Employee { id: string; fullName: string; username: string }
interface ProjectFormProps {
  clients: { id: string; name: string }[]
  employees?: Employee[]
  isManager?: boolean
  categories?: { value: string; label: string }[]
  project?: {
    id: string; title: string; description: string | null; category: string
    client_id: string | null; assigned_to?: string | null; amount: number
    advance_payment: number; deadline: string | null; priority: string
    status: string; is_featured: boolean
    preview_images?: string[]
  }
}

const categories = [
  { value: 'logo', label: 'Logo Design' },
  { value: 'poster', label: 'Poster' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'branding', label: 'Branding' },
  { value: 'ui_ux', label: 'UI/UX Design' },
  { value: 'video_editing', label: 'Video Editing' },
  { value: 'print_design', label: 'Print Design' },
  { value: 'motion_graphics', label: 'Motion Graphics' },
  { value: 'custom', label: 'Custom' },
]

const statuses = [
  { value: 'inquiry', label: 'Inquiry' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'revision', label: 'Revision' },
  { value: 'waiting_payment', label: 'Awaiting Payment' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function ProjectForm({ clients, employees = [], isManager = false, project, categories: categoriesProp }: ProjectFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFeatured, setIsFeatured] = useState(project?.is_featured || false)

  const defaultCategories = [
    { value: 'logo', label: 'Logo Design' },
    { value: 'poster', label: 'Poster' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'branding', label: 'Branding' },
    { value: 'ui_ux', label: 'UI/UX Design' },
    { value: 'video_editing', label: 'Video Editing' },
    { value: 'print_design', label: 'Print Design' },
    { value: 'motion_graphics', label: 'Motion Graphics' },
    { value: 'custom', label: 'Custom' },
  ]

  const [localCategories, setLocalCategories] = useState<{ value: string; label: string }[]>(
    categoriesProp || defaultCategories
  )
  const [selectedCategory, setSelectedCategory] = useState(project?.category || 'ui_ux')
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  const isEditing = !!project

  async function handleAddNewCategory() {
    const trimmed = newCategoryName.trim()
    if (!trimmed) {
      toast({
        title: 'Validation Error',
        description: 'Category name cannot be empty.',
        variant: 'destructive',
      })
      return
    }

    setIsAddingCategory(true)
    const result = await addProjectCategory(trimmed)
    setIsAddingCategory(false)

    if (result.error) {
      toast({
        title: 'Error adding category',
        description: result.error,
        variant: 'destructive',
      })
    } else if (result.data) {
      const newCat = result.data
      setLocalCategories(prev => [...prev, newCat])
      setSelectedCategory(newCat.value)
      setShowNewCategoryInput(false)
      setNewCategoryName('')
      toast({
        title: 'Category added',
        description: `"${newCat.label}" has been added and selected.`,
      })
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    formData.set('is_featured', isFeatured.toString())
    const result = isEditing ? await updateProject(project.id, formData) : await createProject(formData)
    if (result.error) { setError(result.error); setIsLoading(false); return }
    router.push('/dashboard/projects')
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input id="title" name="title" defaultValue={project?.title} placeholder="e.g., Logo Design for ABC Corp" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={project?.description || ''} placeholder="Describe the project requirements..." rows={4} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input 
              id="image_url" 
              name="image_url" 
              type="url" 
              defaultValue={project?.preview_images?.[0] || ''} 
              placeholder="e.g., https://images.unsplash.com/photo-..." 
            />
            <p className="text-xs text-muted-foreground">Provide a direct link to the image for this project to showcase in the public portfolio. Only image URLs are supported; no file uploads.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category">Category *</Label>
                {isManager && !showNewCategoryInput && (
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryInput(true)}
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    + Add New Category
                  </button>
                )}
              </div>
              
              {!showNewCategoryInput ? (
                <Select name="category" value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {localCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="New category name (e.g. Mobile App)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewCategory}
                    disabled={isAddingCategory}
                  >
                    {isAddingCategory ? 'Adding...' : 'Save'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowNewCategoryInput(false)
                      setNewCategoryName('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Client</Label>
              <Select name="client_id" defaultValue={project?.client_id || 'none'}>
                <SelectTrigger><SelectValue placeholder="Select client (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assign to Employee — Manager only */}
          {isManager && employees.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assign to Employee</Label>
              <Select name="assigned_to" defaultValue={project?.assigned_to || 'none'}>
                <SelectTrigger><SelectValue placeholder="Unassigned (manager's project)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.fullName} (@{e.username})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Total Amount (₹)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0" defaultValue={project?.amount || ''} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advance_payment">Advance Payment (₹)</Label>
              <Input id="advance_payment" name="advance_payment" type="number" step="0.01" min="0" defaultValue={project?.advance_payment || ''} placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={project?.status || 'inquiry'}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue={project?.priority || 'medium'}>
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  {priorities.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" name="deadline" type="date" defaultValue={project?.deadline || ''} />
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_featured">Feature in Portfolio</Label>
                <p className="text-sm text-muted-foreground">Show this project on your public portfolio</p>
              </div>
              <Switch id="is_featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
          )}

          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEditing ? 'Saving...' : 'Creating...'}</>
              ) : (
                isEditing ? 'Save Changes' : 'Create Project'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
