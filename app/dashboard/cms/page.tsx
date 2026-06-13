import { getCurrentUser } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Star, ExternalLink, Eye, EyeOff } from 'lucide-react'

import { getProjectCategories } from '@/app/dashboard/projects/actions'

export default async function CmsPage() {
  const user = await getCurrentUser()

  if (!user) return null

  const categoriesList = await getProjectCategories()
  const categoryLabels: Record<string, string> = {}
  categoriesList.forEach(cat => {
    categoryLabels[cat.value] = cat.label
  })

  const client = await clientPromise
  const db = client.db()
  
  const projects = await db.collection('projects')
    .find({ user_id: user.id, status: 'completed' })
    .sort({ created_at: -1 })
    .toArray()

  const featured = projects.filter(p => p.is_featured)
  const notFeatured = projects.filter(p => !p.is_featured)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Portfolio CMS</h2>
          <p className="text-muted-foreground">Manage which completed projects appear on your public portfolio</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/" target="_blank">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Portfolio
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{projects.length || 0}</p>
            <p className="text-xs text-muted-foreground">Completed Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-yellow-600">{featured.length}</p>
            <p className="text-xs text-muted-foreground">Featured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-muted-foreground">{notFeatured.length}</p>
            <p className="text-xs text-muted-foreground">Hidden</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Projects ({featured.length})
          </CardTitle>
          <CardDescription>These projects are visible on your public portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {featured.length > 0 ? (
            <div className="space-y-2">
              {featured.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <Link href={`/dashboard/projects/${p.id}/edit`} className="font-medium hover:underline text-sm">
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{categoryLabels[p.category] || p.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-green-500" />
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/projects/${p.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No featured projects yet. Edit a completed project to feature it.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-muted-foreground" />
            Hidden Projects ({notFeatured.length})
          </CardTitle>
          <CardDescription>Edit these projects to feature them in your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {notFeatured.length > 0 ? (
            <div className="space-y-2">
              {notFeatured.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">{p.title}</span>
                    <p className="text-xs text-muted-foreground">{categoryLabels[p.category] || p.category}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/projects/${p.id}/edit`}>Feature</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">All completed projects are featured.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
