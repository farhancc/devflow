'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Trash2, Pencil, Search } from 'lucide-react'
import { deleteExpense } from '@/app/dashboard/expenses/actions'
import { ExpenseDialog, type ExpenseRecord } from '@/components/dashboard/expense-dialog'

interface ExpensesTableProps {
  expenses: ExpenseRecord[]
  employees?: { id: string; fullName: string; username: string }[]
  isManager?: boolean
}

const categoryLabels: Record<string, string> = {
  software: 'Software',
  printing: 'Printing',
  ads: 'Advertising',
  travel: 'Travel',
  equipment: 'Equipment',
  miscellaneous: 'Misc',
}

const categoryColors: Record<string, string> = {
  software: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  printing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  ads: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  travel: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  equipment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  miscellaneous: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
}

export function ExpensesTable({ expenses, employees = [], isManager = false }: ExpensesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editRecord, setEditRecord] = useState<ExpenseRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    await deleteExpense(deleteId)
    setIsDeleting(false)
    setDeleteId(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = (expense.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <>
      {editRecord && (
        <ExpenseDialog
          editRecord={editRecord}
          employees={employees}
          isManager={isManager}
          onClose={() => setEditRecord(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search description..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="software">Software</SelectItem>
            <SelectItem value="printing">Printing</SelectItem>
            <SelectItem value="ads">Advertising</SelectItem>
            <SelectItem value="travel">Travel</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="miscellaneous">Misc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="text-muted-foreground">
                  {formatDate(expense.expense_date)}
                </TableCell>
                <TableCell className="font-medium">{expense.title}</TableCell>
                <TableCell>
                  <Badge className={categoryColors[expense.category] || ''}>
                    {categoryLabels[expense.category] || expense.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-rose-600 dark:text-rose-400">
                  ₹{Number(expense.amount).toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditRecord(expense)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteId(expense.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
