import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { BDesignHomeClient } from '@/components/portfolio/bdesign-home-client'
import clientPromise from '@/lib/mongodb'

export const metadata: Metadata = {
  title: 'BDESIGN | Graphic Designer in Chemmad, Kerala',
  description: 'Premium graphic design studio in Chemmad, Kerala. Specialized in corporate branding, logo design, product packaging, and marketing collaterals. Located at BOOK PLUS, Hidaya Nagar, Chemmad.',
  keywords: [
    'BDESIGN',
    'BDESIGN Chemmad',
    'Graphic Designer Chemmad',
    'Graphic Designer Kerala',
    'Logo Design Chemmad',
    'Branding Studio Kerala',
    'Packaging Designer Malappuram',
    'Book Plus Chemmad'
  ],
  openGraph: {
    title: 'BDESIGN | Graphic Designer in Chemmad, Kerala',
    description: 'Premium branding and graphic design studio. Specialized in logos, identity packages, and packaging design in Chemmad, Kerala.',
    images: [
      {
        url: '/branding_mockup.png',
        width: 1200,
        height: 1200,
        alt: 'BDESIGN Portfolio Branding Mockup'
      }
    ]
  }
}

export default async function HomePage() {
  const user = await getCurrentUser()
  
  let projects: any[] = []
  let testimonials: any[] = []
  let services: any[] = []

  try {
    const client = await clientPromise
    const db = client.db()
    
    // Fetch featured completed projects, clients, testimonials, and services concurrently
    const [dbProjects, dbClients, dbTestimonials, dbServices] = await Promise.all([
      db.collection('projects')
        .find({ is_featured: true, status: 'completed' })
        .sort({ created_at: -1 })
        .toArray(),
      db.collection('clients').find({}).toArray(),
      db.collection('testimonials')
        .find({})
        .sort({ created_at: -1 })
        .toArray(),
      db.collection('services')
        .find({})
        .sort({ created_at: 1 })
        .toArray()
    ])

    const clientMap = new Map(dbClients.map(c => [c.id, c.company || c.name]))

    projects = dbProjects.map(proj => {
      // Map DB category to landing page tabs ('Branding', 'Packaging', 'Logos')
      let displayCategory = 'Branding'
      const cat = (proj.category || '').toLowerCase()
      if (cat.includes('logo') || cat.includes('identity')) {
        displayCategory = 'Logos'
      } else if (cat.includes('packaging')) {
        displayCategory = 'Packaging'
      }

      return {
        id: proj.id,
        title: proj.title,
        category: displayCategory,
        image: proj.preview_images?.[0] || '/branding_mockup.png',
        description: proj.description || '',
        client: clientMap.get(proj.client_id) || 'BDesign Project',
        year: proj.created_at ? new Date(proj.created_at).getFullYear().toString() : new Date().getFullYear().toString()
      }
    })

    testimonials = dbTestimonials.map(t => ({
      id: t.id,
      name: t.name,
      rating: Number(t.rating) || 5,
      comment: t.comment,
      service: t.service || 'Design Service',
      date: t.date || 'Recently'
    }))

    services = dbServices.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      icon: s.icon || 'palette'
    }))
  } catch (err) {
    console.error('Error fetching CMS data for homepage:', err)
  }

  return (
    <BDesignHomeClient 
      isLoggedIn={!!user} 
      initialProjects={projects}
      initialTestimonials={testimonials}
      initialServices={services}
    />
  )
}
