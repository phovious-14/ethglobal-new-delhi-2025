import { MetadataRoute } from 'next'
import { blogPosts } from './(home)/blog/data'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://drip-pay.xyz'
    const now = new Date()

    return [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'daily' as const,
            priority: 1.0,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/payroll`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/create-payroll`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/transfer`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/get-paid`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        },
        ...blogPosts.map((p) => ({
            url: `${baseUrl}/blog/${p.slug}`,
            lastModified: new Date(p.date),
            changeFrequency: 'monthly' as const,
            priority: 0.8, // Blog posts are important for SEO
        })),
        // Public pages that should be indexed
        {
            url: `${baseUrl}/about`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        // Note: Private/dashboard pages are intentionally excluded from sitemap
        // as they require authentication and should not be indexed by search engines
    ]
} 