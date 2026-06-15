'use server'

import { getCurrentUser } from '@/lib/auth'
import { readDb, writeDb } from '@/lib/local-db'
import { getUsers, createUser, updateUser, deleteUser, findUserById } from '@/lib/db'
import { signJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import clientPromise from '@/lib/mongodb'
import fs from 'fs/promises'
import path from 'path'

// Update the manager's own Display Name and details
export async function updateProfileDetails(fullName: string, phone?: string, email?: string, address?: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Update in MongoDB
  const mongoUpdate = await updateUser(user.id, { fullName, phone, email, address })
  if ('error' in mongoUpdate) {
    return { error: mongoUpdate.error }
  }

  // Update local-db profiles if matching
  const db = await readDb()
  const pIndex = db.profiles.findIndex((p: any) => p.id === user.id)
  
  if (pIndex !== -1) {
    db.profiles[pIndex].full_name = fullName
    if (phone !== undefined) db.profiles[pIndex].phone = phone
    if (email !== undefined) db.profiles[pIndex].email = email
  } else {
    db.profiles.push({
      id: user.id,
      full_name: fullName,
      tagline: 'Senior Designer',
      bio: '',
      years_experience: 5,
      email: email || `${user.username}@designflow.com`,
      phone: phone || '',
      whatsapp: '',
      social_links: {}
    })
  }
  await writeDb(db)

  // Re-sign JWT so the session is updated immediately
  const updatedUser = await findUserById(user.id)
  if (updatedUser) {
    const token = await signJWT({
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      fullName: updatedUser.fullName,
    })

    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

// Update own login credentials (Username / Password)
export async function updateMyCredentials(username: string, passwordPlain?: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const updates: any = { username }
  if (passwordPlain && passwordPlain.trim() !== '') {
    updates.passwordPlain = passwordPlain
  }

  const result = await updateUser(user.id, updates)
  if ('error' in result) {
    return { error: result.error }
  }

  // Re-sign JWT token so session stays active with updated username
  const token = await signJWT({
    id: result.id,
    username: result.username,
    role: result.role,
    fullName: result.fullName,
  })

  const cookieStore = await cookies()
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

// Team Overview — called from the manager dashboard page
export async function getTeamOverview(preFetchedData?: {
  allProjects?: any[]
  allPayments?: any[]
  allExpenses?: any[]
}) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'manager') {
    return null
  }

  const allUsers = await getUsers()
  const clientDb = await clientPromise
  const db = clientDb.db()

  const allProjects = preFetchedData?.allProjects || await db.collection('projects').find({}).toArray()
  const allPayments = preFetchedData?.allPayments || await db.collection('payments').find({}).toArray()
  const allExpenses = preFetchedData?.allExpenses || await db.collection('expenses').find({}).toArray()

  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const currentYearStr = `${now.getFullYear()}`

  const employees = allUsers.filter(u => u.id !== user.id)

  const teamStats = employees.map(u => {
    // Projects where user owns OR is assigned
    const userProjects  = allProjects.filter(p => p.user_id === u.id || p.assigned_to === u.id)
    // Payments where user_id matches OR employee_id is set to this user
    const userPayments  = allPayments.filter(p => p.employee_id === u.id || (!p.employee_id && p.user_id === u.id))
    // Expenses similarly
    const userExpenses  = allExpenses.filter(e => e.employee_id === u.id || (!e.employee_id && e.user_id === u.id))

    const totalProjects     = userProjects.length
    const completedProjects = userProjects.filter(p => p.status === 'completed').length
    const activeProjects    = userProjects.filter(p => ['in_progress', 'revision', 'inquiry'].includes(p.status)).length
    const totalEarnings     = userPayments.reduce((s, p) => s + Number(p.amount), 0)
    const monthlyEarnings   = userPayments
      .filter(p => p.payment_date && p.payment_date.startsWith(currentMonthStr))
      .reduce((s, p) => s + Number(p.amount), 0)
    const yearlyEarnings    = userPayments
      .filter(p => p.payment_date && p.payment_date.startsWith(currentYearStr))
      .reduce((s, p) => s + Number(p.amount), 0)
    const totalExpenses     = userExpenses.reduce((s, e) => s + Number(e.amount), 0)

    return {
      id: u.id,
      fullName: u.fullName,
      username: u.username,
      role: u.role,
      totalProjects,
      completedProjects,
      activeProjects,
      totalEarnings,
      monthlyEarnings,
      yearlyEarnings,
      totalExpenses,
    }
  })

  // Aggregate totals
  const totalEmployees    = employees.length
  const teamTotalEarnings = teamStats.reduce((s, e) => s + e.totalEarnings, 0)
  const teamMonthEarnings = teamStats.reduce((s, e) => s + e.monthlyEarnings, 0)
  const teamYearEarnings  = teamStats.reduce((s, e) => s + e.yearlyEarnings, 0)
  const teamTotalProjects = teamStats.reduce((s, e) => s + e.totalProjects, 0)
  const teamActiveProjects= teamStats.reduce((s, e) => s + e.activeProjects, 0)
  const teamCompletedProjects = teamStats.reduce((s, e) => s + e.completedProjects, 0)
  const teamTotalExpenses = teamStats.reduce((s, e) => s + e.totalExpenses, 0)

  // Top performer this month
  const topPerformer = teamStats.length > 0
    ? teamStats.reduce((best, e) => e.monthlyEarnings > best.monthlyEarnings ? e : best, teamStats[0])
    : null

  return JSON.parse(JSON.stringify({
    totalEmployees,
    teamTotalEarnings,
    teamMonthEarnings,
    teamYearEarnings,
    teamTotalProjects,
    teamActiveProjects,
    teamCompletedProjects,
    teamTotalExpenses,
    topPerformer,
    employees: teamStats,
  }))
}

// Get all non-manager users (employees)
export async function getAllEmployees() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'manager') {
    return { error: 'Unauthorized' }
  }

  const allUsers = await getUsers()
  
  const clientDb = await clientPromise
  const db = clientDb.db()
  
  const allProjects = await db.collection('projects').find({}).toArray()
  const allPayments = await db.collection('payments').find({}).toArray()
  const allExpenses = await db.collection('expenses').find({}).toArray()

  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const currentYearStr = `${now.getFullYear()}`

  const employees = allUsers
    .filter(u => u.id !== user.id)
    .map(u => {
      const userProjects = allProjects.filter(p => p.user_id === u.id || p.assigned_to === u.id)
      const userPayments = allPayments.filter(p => p.employee_id === u.id || (!p.employee_id && p.user_id === u.id))
      const userExpenses = allExpenses.filter(e => e.employee_id === u.id || (!e.employee_id && e.user_id === u.id))

      const totalProjects = userProjects.length
      const completedProjects = userProjects.filter(p => p.status === 'completed').length
      const activeProjects = userProjects.filter(p => ['in_progress', 'revision', 'inquiry'].includes(p.status)).length
      
      const totalEarnings = userPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      const totalExpenses = userExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

      const monthlyEarnings = userPayments
        .filter(p => p.payment_date && p.payment_date.startsWith(currentMonthStr))
        .reduce((sum, p) => sum + Number(p.amount), 0)

      const yearlyEarnings = userPayments
        .filter(p => p.payment_date && p.payment_date.startsWith(currentYearStr))
        .reduce((sum, p) => sum + Number(p.amount), 0)

      const earningsByMonth: Record<string, number> = {}
      const earningsByYear: Record<string, number> = {}

      userPayments.forEach(p => {
        if (!p.payment_date) return
        const date = new Date(p.payment_date)
        if (isNaN(date.getTime())) return
        
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        const year = date.getFullYear().toString()
        
        earningsByMonth[monthYear] = (earningsByMonth[monthYear] || 0) + Number(p.amount)
        earningsByYear[year] = (earningsByYear[year] || 0) + Number(p.amount)
      })

      const earningsByMonthArr = Object.entries(earningsByMonth).map(([period, amount]) => ({ period, amount }))
      const earningsByYearArr = Object.entries(earningsByYear).map(([period, amount]) => ({ period, amount }))

      return {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        role: u.role,
        createdAt: u.createdAt,
        phone: u.phone || '',
        email: u.email || '',
        address: u.address || '',
        stats: {
          totalProjects,
          completedProjects,
          activeProjects,
          totalEarnings,
          monthlyEarnings,
          yearlyEarnings,
          totalExpenses,
          earningsByMonth: earningsByMonthArr,
          earningsByYear: earningsByYearArr
        }
      }
    })

  return JSON.parse(JSON.stringify({ employees }))
}

// Add a new employee
export async function addNewEmployee(
  username: string,
  passwordPlain: string,
  fullName: string,
  role?: 'manager' | 'designer',
  phone?: string,
  email?: string,
  address?: string
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'manager') {
    return { error: 'Unauthorized' }
  }

  const result = await createUser(username, passwordPlain, role || 'designer', fullName, phone, email, address)
  if ('error' in result) {
    return { error: result.error }
  }

  revalidatePath('/dashboard/settings')
  return { success: true, employee: { id: result.id, username: result.username, fullName: result.fullName } }
}

// Update an employee's credentials
export async function updateEmployeeCredentials(
  employeeId: string,
  username: string,
  passwordPlain?: string,
  fullName?: string,
  role?: 'manager' | 'designer',
  phone?: string,
  email?: string,
  address?: string
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'manager') {
    return { error: 'Unauthorized' }
  }

  const updates: any = { username }
  if (passwordPlain && passwordPlain.trim() !== '') {
    updates.passwordPlain = passwordPlain
  }
  if (fullName !== undefined) {
    updates.fullName = fullName
  }
  if (role !== undefined) {
    updates.role = role
  }
  if (phone !== undefined) {
    updates.phone = phone
  }
  if (email !== undefined) {
    updates.email = email
  }
  if (address !== undefined) {
    updates.address = address
  }

  const result = await updateUser(employeeId, updates)
  if ('error' in result) {
    return { error: result.error }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

// Delete an employee
export async function deleteEmployeeAction(employeeId: string) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'manager') {
    return { error: 'Unauthorized' }
  }

  const result = await deleteUser(employeeId)
  if ('error' in result) {
    return { error: result.error }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
