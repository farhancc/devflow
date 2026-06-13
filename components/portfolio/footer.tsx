import Link from 'next/link'
import { Palette } from 'lucide-react'

interface FooterProps {
  socialLinks?: {
    instagram?: string
    linkedin?: string
    twitter?: string
    behance?: string
    dribbble?: string
  }
}

export function Footer({ socialLinks }: FooterProps) {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
              <div className="p-1.5 rounded-md bg-primary">
                <Palette className="h-4 w-4 text-primary-foreground" />
              </div>
              <span>DesignFlow</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Crafting visual experiences that connect.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            <div>
              <h4 className="font-medium mb-3 text-sm">Navigation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#work" className="hover:text-foreground transition-colors">Work</Link></li>
                <li><Link href="#services" className="hover:text-foreground transition-colors">Services</Link></li>
                <li><Link href="#about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            {socialLinks && Object.values(socialLinks).some(Boolean) && (
              <div>
                <h4 className="font-medium mb-3 text-sm">Social</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {socialLinks.instagram && (
                    <li><a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Instagram</a></li>
                  )}
                  {socialLinks.linkedin && (
                    <li><a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">LinkedIn</a></li>
                  )}
                  {socialLinks.twitter && (
                    <li><a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter</a></li>
                  )}
                  {socialLinks.behance && (
                    <li><a href={socialLinks.behance} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Behance</a></li>
                  )}
                  {socialLinks.dribbble && (
                    <li><a href={socialLinks.dribbble} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Dribbble</a></li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {currentYear}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
