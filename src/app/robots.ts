import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/blog/', '/blog/*'],
                disallow: [
                    '/api/',
                    '/admin/',
                    '/private/',
                    '/settings/',
                    '/settings/*',
                    '/invoices/',
                    '/invoices/*',
                    '/distribution-pools/',
                    '/distribution-pools/*',
                    '/streaming-pools/',
                    '/streaming-pools/*',
                    '/instant-pools/',
                    '/instant-pools/*',
                    '/create-stream/',
                    '/create-stream/*',
                    '/ida/',
                    '/ida/*'
                ],
            },
            {
                userAgent: 'LinkedInBot',
                allow: ['/', '/blog/', '/blog/*'],
                disallow: ['/api/', '/admin/', '/private/', '/dashboard/'],
            },
            {
                userAgent: 'facebookexternalhit',
                allow: ['/', '/blog/', '/blog/*'],
                disallow: ['/api/', '/admin/', '/private/', '/dashboard/'],
            }
        ],
        sitemap: 'https://drip-pay.xyz/sitemap.xml',
    }
} 