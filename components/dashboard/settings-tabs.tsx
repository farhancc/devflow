'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, 
  Lock, 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Loader2, 
  Shield,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  FolderKanban,
  Receipt,
  Eye,
  EyeOff
} from 'lucide-react'
import { 
  updateProfileDetails, 
  updateMyCredentials, 
  addNewEmployee, 
  updateEmployeeCredentials, 
  deleteEmployeeAction,
  getAllEmployees
} from '@/app/dashboard/settings/actions'

interface Employee {
  id: string
  username: string
  fullName: string
  role: string
  createdAt: string
  phone?: string
  email?: string
  address?: string
  stats?: {
    totalProjects: number
    completedProjects: number
    activeProjects: number
    totalEarnings: number
    monthlyEarnings: number
    yearlyEarnings: number
    totalExpenses: number
    earningsByMonth: { period: string; amount: number }[]
    earningsByYear: { period: string; amount: number }[]
  }
}

interface SettingsTabsProps {
  currentUsername: string
  currentFullName: string
  currentPhone: string
  currentEmail: string
  currentAddress: string
  initialEmployees: Employee[]
  role?: 'manager' | 'designer'
}

export function SettingsTabs({ 
  currentUsername, 
  currentFullName, 
  currentPhone, 
  currentEmail, 
  currentAddress, 
  initialEmployees,
  role = 'designer'
}: SettingsTabsProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Tab state
  const [activeTab, setActiveTab] = useState('profile')

  // Own Profile state
  const [myFullName, setMyFullName] = useState(currentFullName)
  const [myPhone, setMyPhone] = useState(currentPhone)
  const [myEmail, setMyEmail] = useState(currentEmail)
  const [myAddress, setMyAddress] = useState(currentAddress)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Own Credentials state
  const [myUsername, setMyUsername] = useState(currentUsername)
  const [myPassword, setMyPassword] = useState('')
  const [confirmMyPassword, setConfirmMyPassword] = useState('')
  const [isSavingCreds, setIsSavingCreds] = useState(false)

  // Employee list state
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)

  // Add Employee Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newFullName, setNewFullName] = useState('')
  const [newRole, setNewRole] = useState<'manager' | 'designer'>('designer')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // Edit Employee Dialog state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [editUsername, setEditUsername] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editFullName, setEditFullName] = useState('')
  const [editRole, setEditRole] = useState<'manager' | 'designer'>('designer')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Delete Confirmation state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Password visibility states
  const [showMyPassword, setShowMyPassword] = useState(false)
  const [showConfirmMyPassword, setShowConfirmMyPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)

  // Report Dialog state
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportEmployee, setReportEmployee] = useState<Employee | null>(null)

  // Refresh Employee list from server
  const refreshEmployees = async () => {
    setIsLoadingEmployees(true)
    const result = await getAllEmployees()
    setIsLoadingEmployees(false)
    if ('employees' in result && result.employees) {
      setEmployees(result.employees as Employee[])
    }
  }

  // Handle Save Own Profile (Name, Phone, Email, Address)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!myFullName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Full name cannot be empty.',
        variant: 'destructive',
      })
      return
    }

    setIsSavingProfile(true)
    const result = await updateProfileDetails(myFullName, myPhone, myEmail, myAddress)
    setIsSavingProfile(false)

    if (result.error) {
      toast({
        title: 'Error updating profile',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Profile updated',
        description: 'Your profile details have been saved.',
      })
      router.refresh()
    }
  }

  // Handle Save Own Credentials
  const handleSaveCreds = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!myUsername.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Username cannot be empty.',
        variant: 'destructive',
      })
      return
    }

    if (myPassword) {
      if (myPassword.length < 6) {
        toast({
          title: 'Validation Error',
          description: 'Password must be at least 6 characters.',
          variant: 'destructive',
        })
        return
      }
      if (myPassword !== confirmMyPassword) {
        toast({
          title: 'Validation Error',
          description: 'Passwords do not match.',
          variant: 'destructive',
        })
        return
      }
    }

    setIsSavingCreds(true)
    const result = await updateMyCredentials(myUsername, myPassword || undefined)
    setIsSavingCreds(false)

    if (result.error) {
      toast({
        title: 'Error updating credentials',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Credentials updated',
        description: 'Your login credentials have been updated successfully.',
      })
      setMyPassword('')
      setConfirmMyPassword('')
      router.refresh()
    }
  }

  // Handle Add Employee
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername.trim() || !newPassword.trim() || !newFullName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Full name, username, and password are required.',
        variant: 'destructive',
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      })
      return
    }

    setIsAdding(true)
    const result = await addNewEmployee(
      newUsername, 
      newPassword, 
      newFullName, 
      newRole,
      newPhone || undefined,
      newEmail || undefined,
      newAddress || undefined
    )
    setIsAdding(false)

    if (result.error) {
      toast({
        title: 'Failed to add employee',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Employee added',
        description: `Successfully created account for ${newFullName}.`,
      })
      setIsAddOpen(false)
      setNewUsername('')
      setNewPassword('')
      setNewFullName('')
      setNewPhone('')
      setNewEmail('')
      setNewAddress('')
      setNewRole('designer')
      refreshEmployees()
    }
  }

  // Open Edit Dialog
  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEditUsername(employee.username)
    setEditFullName(employee.fullName)
    setEditRole((employee.role || 'designer') as 'manager' | 'designer')
    setEditPhone(employee.phone || '')
    setEditEmail(employee.email || '')
    setEditAddress(employee.address || '')
    setEditPassword('')
    setIsEditOpen(true)
  }

  // Handle Edit Employee
  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee) return

    if (!editUsername.trim() || !editFullName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Username and Full Name are required.',
        variant: 'destructive',
      })
      return
    }

    if (editPassword && editPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      })
      return
    }

    setIsEditing(true)
    const result = await updateEmployeeCredentials(
      selectedEmployee.id,
      editUsername,
      editPassword || undefined,
      editFullName,
      editRole,
      editPhone,
      editEmail,
      editAddress
    )
    setIsEditing(false)

    if (result.error) {
      toast({
        title: 'Failed to update employee',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Employee updated',
        description: 'Employee details updated successfully.',
      })
      setIsEditOpen(false)
      setSelectedEmployee(null)
      refreshEmployees()
    }
  }

  // Open Delete Confirmation
  const openDeleteDialog = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setIsDeleteOpen(true)
  }

  // Handle Delete Employee
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return

    setIsDeleting(true)
    const result = await deleteEmployeeAction(employeeToDelete.id)
    setIsDeleting(false)

    if (result.error) {
      toast({
        title: 'Failed to delete employee',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Employee deleted',
        description: `Successfully deleted account for ${employeeToDelete.fullName}.`,
      })
      setIsDeleteOpen(false)
      setEmployeeToDelete(null)
      refreshEmployees()
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      {role === 'manager' && (
        <TabsList className="flex w-full overflow-x-auto flex-nowrap gap-1 bg-muted/50 p-1 rounded-xl max-w-md" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <TabsTrigger value="profile" className="flex-1 flex-shrink-0 rounded-lg py-2.5 font-medium transition-all text-center">
            Profile & Credentials
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex-1 flex-shrink-0 rounded-lg py-2.5 font-medium transition-all text-center">
            Employee Management
          </TabsTrigger>
        </TabsList>
      )}

      <TabsContent value="profile" className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Info
              </CardTitle>
              <CardDescription>Update your display name.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="myFullName">Full Name</Label>
                  <Input
                    id="myFullName"
                    value={myFullName}
                    onChange={(e) => setMyFullName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="myPhone">Phone Number (Optional)</Label>
                  <Input
                    id="myPhone"
                    value={myPhone}
                    onChange={(e) => setMyPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="myEmail">Email Address (Optional)</Label>
                  <Input
                    id="myEmail"
                    type="email"
                    value={myEmail}
                    onChange={(e) => setMyEmail(e.target.value)}
                    placeholder="manager@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="myAddress">Address (Optional)</Label>
                  <Input
                    id="myAddress"
                    value={myAddress}
                    onChange={(e) => setMyAddress(e.target.value)}
                    placeholder="Address"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Credentials Card */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Change Username & Password
              </CardTitle>
              <CardDescription>Change your login username and password.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveCreds}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="myUsername">Username</Label>
                  <Input
                    id="myUsername"
                    value={myUsername}
                    onChange={(e) => setMyUsername(e.target.value)}
                    placeholder="Enter new username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="myPassword">New Password (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="myPassword"
                      type={showMyPassword ? 'text' : 'password'}
                      value={myPassword}
                      onChange={(e) => setMyPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMyPassword(!showMyPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showMyPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {myPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmMyPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmMyPassword"
                        type={showConfirmMyPassword ? 'text' : 'password'}
                        value={confirmMyPassword}
                        onChange={(e) => setConfirmMyPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmMyPassword(!showConfirmMyPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        {showConfirmMyPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSavingCreds}>
                  {isSavingCreds && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Credentials
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </TabsContent>

      {role === 'manager' && (
        <TabsContent value="employees">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Employees
                </CardTitle>
                <CardDescription>Add, update, or remove employee login credentials.</CardDescription>
              </div>
              
              {/* Add Employee Button & Dialog */}
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleAddEmployee}>
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                      <DialogDescription>
                        Create a new account with login credentials. Employee role will default to Designer.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
                      <div className="grid gap-2">
                        <Label htmlFor="newFullName">Full Name</Label>
                        <Input
                          id="newFullName"
                          value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="newUsername">Username</Label>
                        <Input
                          id="newUsername"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="john.doe"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="newPassword">Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="newRole">Role</Label>
                        <Select 
                          value={newRole} 
                          onValueChange={(val) => setNewRole(val as 'manager' | 'designer')}
                        >
                          <SelectTrigger id="newRole">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="designer">Designer (Employee)</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="newPhone">Phone Number (Optional)</Label>
                        <Input
                          id="newPhone"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="+1 234 567 890"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="newEmail">Email (Optional)</Label>
                        <Input
                          id="newEmail"
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="employee@example.com"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="newAddress">Address (Optional)</Label>
                        <Input
                          id="newAddress"
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="Address"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isAdding}>
                        {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl">
                  <Users className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="font-semibold text-lg">No employees yet</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Add new employees using the button above to give them access to the Portfolio & CMS dashboard.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.fullName}</TableCell>
                          <TableCell className="text-muted-foreground">{employee.username}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground capitalize">
                              {employee.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(employee.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setReportEmployee(employee)
                                  setIsReportOpen(true)
                                }}
                                title="View Report & Stats"
                              >
                                <FileText className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openEditDialog(employee)}
                                title="Edit Credentials"
                              >
                                <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openDeleteDialog(employee)}
                                title="Delete Account"
                              >
                                <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {/* Edit Employee Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEditEmployee}>
            <DialogHeader>
              <DialogTitle>Edit Employee Credentials</DialogTitle>
              <DialogDescription>
                Update username, full name, or reset the password for this employee.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid gap-2">
                <Label htmlFor="editFullName">Full Name</Label>
                <Input
                  id="editFullName"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Full Name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editUsername">Username</Label>
                <Input
                  id="editUsername"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Username"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editPassword">New Password (Optional)</Label>
                <div className="relative">
                  <Input
                    id="editPassword"
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showEditPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editRole">Role</Label>
                <Select 
                  value={editRole} 
                  onValueChange={(val) => setEditRole(val as 'manager' | 'designer')}
                >
                  <SelectTrigger id="editRole">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="designer">Designer (Employee)</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editPhone">Phone Number (Optional)</Label>
                <Input
                  id="editPhone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+1 234 567 890"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editEmail">Email (Optional)</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="employee@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editAddress">Address (Optional)</Label>
                <Input
                  id="editAddress"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isEditing}>
                {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Employee Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the employee account for{' '}
              <strong className="text-foreground">{employeeToDelete?.fullName}</strong> ({employeeToDelete?.username})?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteEmployee} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {reportEmployee && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <User className="h-6 w-6 text-primary" />
                  Employee Report: {reportEmployee.fullName}
                </DialogTitle>
                <DialogDescription>
                  Detailed performance, earnings, and projects summary for @{reportEmployee.username}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 my-4">
                {/* Financial Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-xs text-muted-foreground font-medium">Total Earnings</p>
                    <p className="text-xl font-bold text-primary mt-1">
                      ₹{(reportEmployee.stats?.totalEarnings || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                    <p className="text-xs text-muted-foreground font-medium">This Month</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                      ₹{(reportEmployee.stats?.monthlyEarnings || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <p className="text-xs text-muted-foreground font-medium">This Year</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      ₹{(reportEmployee.stats?.yearlyEarnings || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                    <p className="text-xs text-muted-foreground font-medium">Total Expenses</p>
                    <p className="text-xl font-bold text-destructive mt-1">
                      ₹{(reportEmployee.stats?.totalExpenses || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Projects Stats */}
                <div className="p-4 rounded-xl bg-muted/40 border">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold">Project Delivery Progress</p>
                    <p className="text-sm font-medium">
                      {reportEmployee.stats?.completedProjects || 0} / {reportEmployee.stats?.totalProjects || 0} Completed
                    </p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${reportEmployee.stats?.totalProjects 
                          ? Math.min(((reportEmployee.stats.completedProjects) / reportEmployee.stats.totalProjects) * 100, 100) 
                          : 0}%` 
                      }} 
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Active: {reportEmployee.stats?.activeProjects || 0}</span>
                    <span>Completion Rate: {reportEmployee.stats?.totalProjects 
                      ? Math.round((reportEmployee.stats.completedProjects / reportEmployee.stats.totalProjects) * 100) 
                      : 0}%</span>
                  </div>
                </div>

                {/* Earnings Breakdown Tabs */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Earnings Breakdown</h4>
                  <Tabs defaultValue="monthly" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[240px] bg-muted/50 p-1 rounded-lg">
                      <TabsTrigger value="monthly" className="py-1 text-xs">Monthly</TabsTrigger>
                      <TabsTrigger value="yearly" className="py-1 text-xs">Yearly</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="monthly" className="mt-4">
                      {reportEmployee.stats?.earningsByMonth && reportEmployee.stats.earningsByMonth.length > 0 ? (
                        <div className="rounded-lg border max-h-[200px] overflow-y-auto">
                          <Table>
                            <TableHeader className="bg-muted/30">
                              <TableRow>
                                <TableHead className="py-2 text-xs">Month / Period</TableHead>
                                <TableHead className="py-2 text-xs text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {reportEmployee.stats.earningsByMonth.map((m, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="py-2 text-sm">{m.period}</TableCell>
                                  <TableCell className="py-2 text-sm text-right font-medium text-green-600">
                                    +₹{m.amount.toLocaleString('en-IN')}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-6 border rounded-lg border-dashed">
                          No monthly earnings recorded.
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="yearly" className="mt-4">
                      {reportEmployee.stats?.earningsByYear && reportEmployee.stats.earningsByYear.length > 0 ? (
                        <div className="rounded-lg border">
                          <Table>
                            <TableHeader className="bg-muted/30">
                              <TableRow>
                                <TableHead className="py-2 text-xs">Year</TableHead>
                                <TableHead className="py-2 text-xs text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {reportEmployee.stats.earningsByYear.map((y, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="py-2 text-sm font-medium">{y.period}</TableCell>
                                  <TableCell className="py-2 text-sm text-right font-semibold text-green-600">
                                    +₹{y.amount.toLocaleString('en-IN')}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-6 border rounded-lg border-dashed">
                          No yearly earnings recorded.
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" onClick={() => setIsReportOpen(false)}>
                  Close Report
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}
