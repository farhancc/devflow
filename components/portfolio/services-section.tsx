import { Palette, Image as ImageIcon, Film, Megaphone, Layout, Sparkles } from 'lucide-react'

interface Service {
  id: string
  title: string
  description: string | null
  price_range: string | null
  icon: string | null
}

interface ServicesSectionProps {
  services: Service[]
}

const iconMap: Record<string, React.ReactNode> = {
  palette: <Palette className="h-6 w-6" />,
  image: <ImageIcon className="h-6 w-6" />,
  film: <Film className="h-6 w-6" />,
  megaphone: <Megaphone className="h-6 w-6" />,
  layout: <Layout className="h-6 w-6" />,
  sparkles: <Sparkles className="h-6 w-6" />,
}

const defaultServices: Service[] = [
  { id: '1', title: 'Logo Design', description: 'Memorable logos that capture your brand essence', price_range: 'From $299', icon: 'palette' },
  { id: '2', title: 'Brand Identity', description: 'Complete visual identity systems for your business', price_range: 'From $799', icon: 'sparkles' },
  { id: '3', title: 'Social Media', description: 'Eye-catching graphics for all platforms', price_range: 'From $149', icon: 'image' },
  { id: '4', title: 'Print Design', description: 'Brochures, flyers, business cards and more', price_range: 'From $199', icon: 'layout' },
  { id: '5', title: 'Video Editing', description: 'Professional video editing and motion graphics', price_range: 'From $399', icon: 'film' },
  { id: '6', title: 'Marketing Materials', description: 'Compelling visuals for your campaigns', price_range: 'From $249', icon: 'megaphone' },
]

export function ServicesSection({ services }: ServicesSectionProps) {
  const displayServices = services.length > 0 ? services : defaultServices

  return (
    <section id="services" className="py-20 border-t">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-sm text-muted-foreground mb-4">Services</h2>
          <p className="text-2xl md:text-3xl font-medium max-w-2xl">
            I offer a range of design services to help bring your vision to life.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service) => (
            <div key={service.id} className="group">
              <div className="mb-4 p-3 rounded-lg bg-muted inline-block">
                {iconMap[service.icon || 'sparkles'] || <Sparkles className="h-6 w-6" />}
              </div>
              <h3 className="text-lg font-medium mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm mb-3">
                {service.description}
              </p>
              {service.price_range && (
                <p className="text-sm font-medium">{service.price_range}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
