'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { createExpense, updateExpense } from '@/app/dashboard/expenses/actions'

export interface ExpenseRecord {
  id: string
  title: string
  amount: number
  category: string
  expense_date: string
  notes: string | null
  employee_id?: string | null
}

interface ExpenseDialogProps {
  employees?: { id: string; fullName: string; username: string }[]
  isManager?: boolean
  editRecord?: ExpenseRecord | null
  onClose?: () => void
  triggerLabel?: string
}

const categories = [
  { value: 'software', label: 'Software & Subscriptions' },
  { value: 'printing', label: 'Printing' },
  { value: 'ads', label: 'Advertising' },
  { value: 'travel', label: 'Travel' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
]

export function ExpenseDialog({
  employees = [], isManager = false,
  editRecord = null, onClose, triggerLabel
}: ExpenseDialogProps) {
  const isEdit = !!editRecord
  const [open, setOpen] = useState(isEdit)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => { setOpen(false); onClose?.() }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = isEdit
      ? await updateExpense(editRecord!.id, formData)
      : await createExpense(formData)
    if ('error' in result && result.error) { setError(result.error); setIsLoading(false); return }
    setIsLoading(false)
    handleClose()
  }

  const content = (
    <DialogContent className="sm:max-w-[440px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        <DialogDescription>{isEdit ? 'Update expense details' : 'Record a new business expense'}</DialogDescription>
      </DialogHeader>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Description *</Label>
          <Input id="title" name="title" defaultValue={editRecord?.title || ''} placeholder="e.g., Adobe Creative Cloud" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="0"
              defaultValue={editRecord?.amount || ''} placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense_date">Date *</Label>
            <Input id="expense_date" name="expense_date" type="date"
              defaultValue={editRecord?.expense_date || new Date().toISOString().split('T')[0]} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select name="category" defaultValue={editRecord?.category || ''} required>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isManager && employees.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="employee_id">Assign to Employee</Label>
            <Select name="employee_id" defaultValue={editRecord?.employee_id || 'none'}>
              <SelectTrigger><SelectValue placeholder="Manager's expense" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Manager's expense</SelectItem>
                {employees.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.fullName} (@{e.username})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" defaultValue={editRecord?.notes || ''} placeholder="Any additional notes..." rows={2} />
        </div>

        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : (isEdit ? 'Update Expense' : 'Save Expense')}
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
        <Button><Plus className="h-4 w-4 mr-2" />{triggerLabel || 'Add Expense'}</Button>
      </DialogTrigger>
      {content}
    </Dialog>
  )
}
