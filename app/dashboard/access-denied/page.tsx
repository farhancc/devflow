import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive/20 shadow-lg bg-card/50 backdrop-blur-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-destructive">
            Access Denied
          </CardTitle>
          <CardDescription>
            You do not have the required permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground pt-4">
          <p>
            This section is restricted. Your current role does not have permission to view this page. Please contact your manager or switch to an authorized account.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pt-6">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
