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
import { Star, Plus, Trash2, Loader2, MessageSquare } from 'lucide-react'
import { createTestimonial, deleteTestimonial } from '@/app/dashboard/cms/testimonial-actions'
import { useToast } from '@/components/ui/use-toast'

interface Testimonial {
  id: string
  name: string
  rating: number
  comment: string
  service: string
  date: string
}

interface TestimonialsCmsProps {
  testimonials: Testimonial[]
}

export function TestimonialsCms({ testimonials }: TestimonialsCmsProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const [rating, setRating] = useState('5')
  const [service, setService] = useState('Logo & Brand Identity')

  async function handleAddTestimonial(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.set('rating', rating)
    formData.set('service', service)

    const result = await createTestimonial(formData)
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
        description: 'Testimonial added successfully!',
      })
      setIsOpen(false)
      // Reset form
      setRating('5')
      setService('Logo & Brand Identity')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this testimonial?')) return
    
    setDeletingId(id)
    const result = await deleteTestimonial(id)
    setDeletingId(null)

    if (result.success) {
      toast({
        title: 'Deleted',
        description: 'Testimonial has been removed.',
      })
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Client Testimonials ({testimonials.length})
          </CardTitle>
          <CardDescription>Manage the reviews displayed in your public portfolio testimonials section.</CardDescription>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full">
              <Plus className="h-4 w-4 mr-1" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Testimonial</DialogTitle>
              <DialogDescription>Create a new testimonial to showcase on your landing page.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTestimonial} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name *</Label>
                <Input id="name" name="name" placeholder="e.g. Faisal K." required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5 Stars)</Label>
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger id="rating">
                      <SelectValue placeholder="5 Stars" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date Context</Label>
                  <Input id="date" name="date" placeholder="e.g. 2 weeks ago" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service Category</Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Logo & Brand Identity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Logo & Brand Identity">Logo & Brand Identity</SelectItem>
                    <SelectItem value="Product Packaging">Product Packaging</SelectItem>
                    <SelectItem value="Social Media Graphics">Social Media Graphics</SelectItem>
                    <SelectItem value="Marketing Materials">Marketing Materials</SelectItem>
                    <SelectItem value="Corporate Stationery">Corporate Stationery</SelectItem>
                    <SelectItem value="Custom Vector Graphics">Custom Vector Graphics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Client Review/Comment *</Label>
                <Textarea 
                  id="comment" 
                  name="comment" 
                  placeholder="Paste the client's review text here..." 
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
                  Save Testimonial
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <div key={t.id} className="flex flex-col justify-between border rounded-xl p-4 bg-muted/20 relative group hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm">{t.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{t.date}</p>
                    </div>
                    <div className="flex text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < t.rating ? 'fill-current' : 'text-neutral-200 dark:text-neutral-800'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="inline-block text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {t.service}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "{t.comment}"
                  </p>
                </div>
                
                <div className="flex justify-end mt-4 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 h-7 px-2"
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                  >
                    {deletingId === t.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">No testimonials loaded in the database yet. Default page testimonials will be used.</p>
        )}
      </CardContent>
    </Card>
  )
}
