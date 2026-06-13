'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { updateProfileDetails } from '@/app/dashboard/settings/actions'

interface ProfileFormProps {
  profile: {
    full_name?: string | null
  } | null
  email: string
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')

  const handleSave = async () => {
    setIsLoading(true)
    setSuccess(false)
    
    const result = await updateProfileDetails(fullName)
    
    setIsLoading(false)
    if (result.success) {
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Display Name</Label>
        <Input 
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Your name"
        />
      </div>
      <div className="space-y-2">
        <Label>Email/Username Representation</Label>
        <Input value={email} disabled className="bg-muted" />
      </div>
      {success && (
        <p className="text-sm text-green-600">Profile saved successfully!</p>
      )}
      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </div>
  )
}
