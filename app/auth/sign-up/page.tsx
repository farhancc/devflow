'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, ShieldAlert } from 'lucide-react'

export default function SignUpPage() {
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
        
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-destructive" />
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                <ShieldAlert className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl">Signup Disabled</CardTitle>
            <CardDescription>Public registration is not available</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              This system is restricted to authorized personnel. New employee accounts can only be added by the Manager from the administration dashboard.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center bg-muted/30 border-t py-4">
            <p className="text-sm text-muted-foreground">
              Return to{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


