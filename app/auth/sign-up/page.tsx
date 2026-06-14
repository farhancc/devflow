'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, ShieldAlert } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-bold no-underline text-foreground">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src="/bdesign_logo.png"
                alt="BDESIGN Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-[var(--font-display)] font-extrabold text-lg tracking-tight block leading-none">
                BDESIGN
              </span>
              <span className="mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground block mt-0.5 font-normal">
                Creative Studio
              </span>
            </div>
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


