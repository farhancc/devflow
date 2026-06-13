'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { createClient_, updateClient } from '@/app/dashboard/clients/actions'

interface ClientFormProps {
  client?: {
    id: string
    name: string
    email: string | null
    phone: string | null
    whatsapp: string | null
    company: string | null
    address: string | null
    notes: string | null
  }
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!client

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = isEditing 
      ? await updateClient(client.id, formData)
      : await createClient_(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.push('/dashboard/clients')
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Client Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={client?.name}
              placeholder="e.g., John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              defaultValue={client?.company || ''}
              placeholder="e.g., Acme Inc."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={client?.email || ''}
                placeholder="client@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={client?.phone || ''}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              defaultValue={client?.whatsapp || ''}
              placeholder="+1 234 567 8900"
            />
            <p className="text-xs text-muted-foreground">
              Include country code for WhatsApp messaging
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={client?.address || ''}
              placeholder="Full address..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={client?.notes || ''}
              placeholder="Any additional notes about this client..."
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Adding...'}
                </>
              ) : (
                isEditing ? 'Save Changes' : 'Add Client'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
