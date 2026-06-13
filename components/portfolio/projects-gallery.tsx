import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Project {
  id: string
  title: string
  description: string | null
  category: string
  preview_images: string[]
  slug: string | null
}

interface ProjectsGalleryProps {
  projects: Project[]
}

const categoryLabels: Record<string, string> = {
  logo: 'Logo Design',
  poster: 'Poster',
  social_media: 'Social Media',
  branding: 'Branding',
  ui_ux: 'UI/UX',
  video_editing: 'Video Editing',
  print_design: 'Print Design',
  motion_graphics: 'Motion Graphics',
  custom: 'Design',
}

export function ProjectsGallery({ projects }: ProjectsGalleryProps) {
  if (projects.length === 0) {
    return (
      <section id="work" className="py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-sm text-muted-foreground">Selected work</h2>
          </div>
          <div className="text-center py-16">
            <p className="text-muted-foreground">No projects yet. Check back soon!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="work" className="py-20 border-t">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-sm text-muted-foreground">Selected work</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.slug || project.id}`}
              className="group block"
            >
              <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-muted mb-4">
                {project.preview_images?.[0] ? (
                  <Image
                    src={project.preview_images[0]}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-muted-foreground/20">
                      {project.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-medium mb-1">{project.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {project.description || 'A creative design project'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {categoryLabels[project.category] || 'Design'}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
