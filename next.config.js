/** @type {import('next').NextConfig} */
// const nextConfig = {
//     experimental: {
//         appDir: true,
//     },
//     images: {
//         domains: ['localhost'],
//     },
// }


// 修改next.config.js
const nextConfig = {
    // experimental: {
    //     appDir: true,
    // },
    images: {
        domains: ['localhost'],
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push({
                '@volcengine/openapi/lib/services/tls': 'commonjs2 @volcengine/openapi/lib/services/tls'
            })
        }
        return config
    }
}

module.exports = nextConfig

