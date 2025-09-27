import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'DripPay - Stablecoin Payroll & Invoicing on Scroll',
        short_name: 'DripPay',
        description: 'Stablecoin Payroll & Invoicing on Scroll. Stream or instantly pay Employees ▪︎ Freelancers ▪︎ Contributors.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        icons: [
            {
                src: '/img/drippay.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
        categories: ['finance', 'business', 'productivity'],
        lang: 'en',
        dir: 'ltr',
        orientation: 'portrait',
        scope: '/',
        prefer_related_applications: false,
    }
} 