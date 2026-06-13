import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <div className="p-2 rounded-lg bg-primary">
              <Palette className="h-6 w-6 text-primary-foreground" />
            </div>
            <span>DesignFlow</span>
          </Link>
        </div>
        
        <Card className="border-0 shadow-xl text-center">
          <CardHeader>
            <div className="mx-auto mb-4 p-4 rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription className="text-base">
              Something went wrong during authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please try again or contact support if the problem persists.
            </p>
            <div className="flex flex-col gap-2 pt-4">
              <Button asChild>
                <Link href="/auth/login">
                  Try again
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
