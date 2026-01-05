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
        source: '/api/python',
        destination: '/api/index.py', // ชี้ไปที่ไฟล์ Python ของเรา
      },
    ]
  },
}

export default nextConfig
