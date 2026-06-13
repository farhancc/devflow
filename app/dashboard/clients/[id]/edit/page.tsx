import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ClientForm } from '@/components/dashboard/client-form'

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) return null

  const clientDb = await clientPromise
  const db = clientDb.db()

  const clientQuery = user.role === 'manager' ? { id } : { id, user_id: user.id }
  const client = await db.collection('clients').findOne(clientQuery)

  if (!client) notFound()

  // Remove _id from document if present to avoid passing it to client components
  const { _id, ...clientData } = client as any

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/clients/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Client</h2>
          <p className="text-muted-foreground">{client.name}</p>
        </div>
      </div>

      <ClientForm client={clientData as any} />
    </div>
  )
}
