import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface HeroSectionProps {
  name: string
  tagline: string
  bio: string
  yearsExperience: number
}

export function HeroSection({ name, tagline, bio, yearsExperience }: HeroSectionProps) {
  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <p className="text-sm text-muted-foreground mb-4">{greeting()}</p>
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-medium leading-tight text-balance mb-8">
            {tagline || `I'm ${name}, a freelance designer crafting visual experiences that connect brands with their audience.`}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl">
            {bio || `With ${yearsExperience}+ years of experience in graphic design, I help businesses tell their stories through thoughtful, impactful design.`}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="#work">
                View my work
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#contact">Get in touch</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
