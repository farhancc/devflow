import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Mail, ArrowLeft } from 'lucide-react'

export default function SignUpSuccessPage() {
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
        
        <Card className="border-0 shadow-xl text-center">
          <CardHeader>
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-base">
              We&apos;ve sent you a confirmation link to verify your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in the email to activate your account and start managing your design business.
            </p>
            <div className="pt-4">
              <Button variant="outline" asChild>
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
