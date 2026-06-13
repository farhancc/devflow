'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageCircle, Mail, Phone, Loader2, CheckCircle } from 'lucide-react'

interface ContactSectionProps {
  email?: string
  phone?: string
  whatsapp?: string
}

export function ContactSection({ email, phone, whatsapp }: ContactSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const whatsappUrl = whatsapp 
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=Hi! I'd like to discuss a project.`
    : null

  return (
    <section id="contact" className="py-20 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-sm text-muted-foreground mb-4">Contact</h2>
            <p className="text-2xl md:text-3xl font-medium mb-6">
              If you would like to discuss a project or just say hi, I&apos;m always down to chat.
            </p>
            
            <div className="space-y-4 mt-8">
              {email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a href={`mailto:${email}`} className="hover:underline">
                    {email}
                  </a>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${phone}`} className="hover:underline">
                    {phone}
                  </a>
                </div>
              )}
              {whatsappUrl && (
                <Button variant="outline" className="mt-4" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat on WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>
          
          <div>
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/30 rounded-xl">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Message sent!</h3>
                <p className="text-muted-foreground">
                  Thanks for reaching out. I&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="Project inquiry" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell me about your project..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send message'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
