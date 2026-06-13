import Image from 'next/image'
import { Star } from 'lucide-react'

interface Testimonial {
  id: string
  client_name: string
  client_company: string | null
  client_image: string | null
  content: string
  rating: number
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    client_name: 'Sarah Johnson',
    client_company: 'TechStart Inc.',
    client_image: null,
    content: 'Working with this designer was an absolute pleasure. They understood our vision perfectly and delivered beyond our expectations.',
    rating: 5,
  },
  {
    id: '2',
    client_name: 'Michael Chen',
    client_company: 'Bloom Marketing',
    client_image: null,
    content: 'The attention to detail and creativity in every design is remarkable. Our brand identity has never looked better.',
    rating: 5,
  },
  {
    id: '3',
    client_name: 'Emily Rodriguez',
    client_company: 'Artisan Coffee Co.',
    client_image: null,
    content: 'Quick turnaround, excellent communication, and stunning results. I will definitely be a returning client.',
    rating: 5,
  },
]

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials

  return (
    <section className="py-20 border-t bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-sm text-muted-foreground mb-4">Testimonials</h2>
          <p className="text-2xl md:text-3xl font-medium max-w-2xl">
            What clients say about working with me
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-background rounded-xl p-6 shadow-sm">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {testimonial.client_image ? (
                    <Image
                      src={testimonial.client_image}
                      alt={testimonial.client_name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {testimonial.client_name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{testimonial.client_name}</p>
                  {testimonial.client_company && (
                    <p className="text-xs text-muted-foreground">{testimonial.client_company}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
