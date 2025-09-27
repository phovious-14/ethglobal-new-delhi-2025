/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: false,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    // Remove experimental features that might cause deployment issues
    // experimental: {
    //     optimizeCss: true,
    //     optimizePackageImports: ['lucide-react'],
    // },
    // Temporarily disable compiler optimizations
    // compiler: {
    //     removeConsole: process.env.NODE_ENV === 'production',
    // },
    webpack: (config, { isServer }) => {
        // Handle HeartbeatWorker.js files by treating them as scripts
        config.module.rules.push({
            test: /HeartbeatWorker\.js$/,
            type: 'javascript/auto',
        });

        return config;
    },
};

export default nextConfig;


