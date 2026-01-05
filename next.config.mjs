/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  rewrites: async () => {
    return [
      {
        source: '/api/python/:path*',
        destination: '/api/:path*', // ส่งต่อ request ไปที่โฟลเดอร์ api/ ของ Python
      },
    ]
  },
}

export default nextConfig
