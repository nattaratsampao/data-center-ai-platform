/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. การตั้งค่าเดิมของคุณ
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // 2. เพิ่มส่วนนี้: อนุญาตให้ Unity (หรือเว็บอื่น) ยิง API เข้ามาได้
  async headers() {
    return [
      {
        // บังคับใช้เฉพาะ Route ที่ขึ้นต้นด้วย /api/unity/
        source: "/api/unity/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // "*" คือยอมรับหมด (สำคัญมากสำหรับ Unity)
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
}

export default nextConfig