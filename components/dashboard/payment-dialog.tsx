'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { createPayment, updatePayment } from '@/app/dashboard/payments/actions'

export interface PaymentRecord {
  id: string
  amount: number
  payment_date: string
  payment_method: string | null
  notes: string | null
  employee_id?: string | null
  project_id?: string | null
  client_id?: string | null
  projects?: { id: string; title: string } | null
  clients?: { id: string; name: string } | null
}

interface PaymentDialogProps {
  projects: { id: string; title: string }[]
  clients: { id: string; name: string }[]
  employees?: { id: string; fullName: string; username: string }[]
  isManager?: boolean
  editRecord?: PaymentRecord | null
  onClose?: () => void
  triggerLabel?: string
}

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'other', label: 'Other' },
]

export function PaymentDialog({
  projects, clients, employees = [], isManager = false,
  editRecord = null, onClose, triggerLabel
}: PaymentDialogProps) {
  const isEdit = !!editRecord
  const [open, setOpen] = useState(isEdit)   // inline edit opens immediately
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setOpen(false)
    onClose?.()
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = isEdit
      ? await updatePayment(editRecord!.id, formData)
      : await createPayment(formData)
    if ('error' in result && result.error) { setError(result.error); setIsLoading(false); return }
    setIsLoading(false)
    handleClose()
  }

  const content = (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Payment' : 'Record Payment'}</DialogTitle>
        <DialogDescription>{isEdit ? 'Update payment details' : 'Add a new payment to your records'}</DialogDescription>
      </DialogHeader>

      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="0"
              defaultValue={editRecord?.amount || ''} placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_date">Date *</Label>
            <Input id="payment_date" name="payment_date" type="date"
              defaultValue={editRecord?.payment_date || new Date().toISOString().split('T')[0]} required />
          </div>
        </div>

        {isManager && employees.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="employee_id">Credit to Employee</Label>
            <Select name="employee_id" defaultValue={editRecord?.employee_id || 'none'}>
              <SelectTrigger><SelectValue placeholder="No specific employee" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific employee</SelectItem>
                {employees.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.fullName} (@{e.username})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="project_id">Project</Label>
          <Select name="project_id" defaultValue={editRecord?.project_id || 'none'}>
            <SelectTrigger><SelectValue placeholder="Select project (optional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No project</SelectItem>
              {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_id">Client</Label>
          <Select name="client_id" defaultValue={editRecord?.client_id || 'none'}>
            <SelectTrigger><SelectValue placeholder="Select client (optional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No client</SelectItem>
              {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <Select name="payment_method" defaultValue={editRecord?.payment_method || ''}>
            <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
            <SelectContent>
              {paymentMethods.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" defaultValue={editRecord?.notes || ''} placeholder="Any additional notes..." rows={2} />
        </div>

        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : (isEdit ? 'Update Payment' : 'Save Payment')}
          </Button>
        </div>
      </form>
    </DialogContent>
  )

  if (isEdit) {
    return <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>{content}</Dialog>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />{triggerLabel || 'Record Payment'}</Button>
      </DialogTrigger>
      {content}
    </Dialog>
  )
}
