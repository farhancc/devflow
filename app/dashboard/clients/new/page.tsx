import { ClientForm } from '@/components/dashboard/client-form'

export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Add Client</h2>
        <p className="text-muted-foreground">
          Add a new client to your network
        </p>
      </div>

      <ClientForm />
    </div>
  )
}
