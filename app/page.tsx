import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { Navbar } from '@/components/portfolio/navbar'
import { HeroSection } from '@/components/portfolio/hero-section'
import { ProjectsGallery } from '@/components/portfolio/projects-gallery'
import { ServicesSection } from '@/components/portfolio/services-section'
import { TestimonialsSection } from '@/components/portfolio/testimonials-section'
import { ContactSection } from '@/components/portfolio/contact-section'
import { Footer } from '@/components/portfolio/footer'

export default async function HomePage() {
  const user = await getCurrentUser()
  const client = await clientPromise
  const db = client.db()
  
  // Fetch first profile data (if exists)
  const rawProfile = await db.collection('profiles').findOne({})
  const profile = rawProfile ? JSON.parse(JSON.stringify(rawProfile)) : null
  
  // Fetch featured projects
  const rawProjects = await db.collection('projects')
    .find({ is_featured: true })
    .sort({ created_at: -1 })
    .limit(8)
    .toArray()
  const projects = JSON.parse(JSON.stringify(rawProjects))
  
  // Fetch services
  const rawServices = await db.collection('services')
    .find({ is_active: true })
    .sort({ display_order: 1 })
    .toArray()
  const services = JSON.parse(JSON.stringify(rawServices))
  
  // Fetch testimonials
  const rawTestimonials = await db.collection('testimonials')
    .find({ is_published: true, is_featured: true })
    .limit(6)
    .toArray()
  const testimonials = JSON.parse(JSON.stringify(rawTestimonials))
  
  const socialLinks = profile?.social_links as {
    instagram?: string
    linkedin?: string
    twitter?: string
    behance?: string
    dribbble?: string
  } | undefined

  return (
    <div className="min-h-screen">
      <Navbar isLoggedIn={!!user} />
      
      <main>
        <HeroSection
          name={profile?.full_name || 'Designer'}
          tagline={profile?.tagline || ''}
          bio={profile?.bio || ''}
          yearsExperience={profile?.years_experience || 5}
        />
        
        <ProjectsGallery projects={projects as any || []} />
        
        <ServicesSection services={services as any || []} />
        
        <TestimonialsSection testimonials={testimonials as any || []} />
        
        <ContactSection
          email={profile?.email}
          phone={profile?.phone}
          whatsapp={profile?.whatsapp}
        />
      </main>
      
      <Footer socialLinks={socialLinks} />
    </div>
  )
}
