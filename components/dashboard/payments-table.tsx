'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { MoreHorizontal, Trash2, Pencil, Search } from 'lucide-react'
import { deletePayment } from '@/app/dashboard/payments/actions'
import { PaymentDialog, type PaymentRecord } from '@/components/dashboard/payment-dialog'

interface PaymentsTableProps {
  payments: PaymentRecord[]
  projects?: { id: string; title: string }[]
  clients?: { id: string; name: string }[]
  employees?: { id: string; fullName: string; username: string }[]
  isManager?: boolean
}

const methodLabels: Record<string, string> = {
  bank_transfer: 'Bank Transfer', cash: 'Cash', paypal: 'PayPal',
  stripe: 'Stripe', upi: 'UPI', other: 'Other',
}

export function PaymentsTable({ payments, projects = [], clients = [], employees = [], isManager = false }: PaymentsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editRecord, setEditRecord] = useState<PaymentRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    await deletePayment(deleteId)
    setIsDeleting(false)
    setDeleteId(null)
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = (payment.projects?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (payment.clients?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (payment.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter
    return matchesSearch && matchesMethod
  })

  return (
    <>
      {editRecord && (
        <PaymentDialog
          editRecord={editRecord}
          projects={projects}
          clients={clients}
          employees={employees}
          isManager={isManager}
          onClose={() => setEditRecord(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, clients or notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="stripe">Stripe</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden sm:table-cell">Project</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead className="hidden lg:table-cell">Method</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map(payment => (
              <TableRow key={payment.id}>
                <TableCell className="text-muted-foreground">{fmt(payment.payment_date)}</TableCell>
                <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹{Number(payment.amount).toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {payment.projects?.title || '-'}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {payment.clients?.name || '-'}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {payment.payment_method ? methodLabels[payment.payment_method] || payment.payment_method : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditRecord(payment)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(payment.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
