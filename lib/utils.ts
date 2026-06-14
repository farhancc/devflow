import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatGoogleDriveUrl(url: string): string {
  if (!url) return ''
  
  // Match standard Google Drive file/open/uc URLs to extract file ID
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                      url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
                      
  if (fileIdMatch && (url.includes('drive.google.com') || url.includes('docs.google.com') || url.includes('google.com'))) {
    const fileId = fileIdMatch[1]
    return `https://lh3.googleusercontent.com/d/${fileId}`
  }
  
  return url
}
