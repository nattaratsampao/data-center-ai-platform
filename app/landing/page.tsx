"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [showContent, setShowContent] = useState(false)
  const [logoPhase, setLogoPhase] = useState<"school" | "competition" | "done">("school")

  useEffect(() => {
    const schoolTimer = setTimeout(() => {
      setLogoPhase("competition")
    }, 2000)

    const competitionTimer = setTimeout(() => {
      setLogoPhase("done")
      setShowContent(true)
    }, 4000)

    return () => {
      clearTimeout(schoolTimer)
      clearTimeout(competitionTimer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-50 to-blue-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {logoPhase !== "done" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          >
            {logoPhase === "school" && (
              <motion.div
                initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center"
              >
                <div className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <span className="text-6xl font-bold text-white">🏫</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900">โรงเรียนของคุณ</h1>
              </motion.div>
            )}

            {logoPhase === "competition" && (
              <motion.div
                initial={{ scale: 0.5, rotate: 180, opacity: 0 }}
                animate={{ scale: 1, rotate: 360, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
                  className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-teal-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl"
                >
                  <span className="text-6xl">🏆</span>
                </motion.div>
                <h1 className="text-4xl font-bold text-gray-900">Young Business IT</h1>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showContent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="absolute -top-32 -left-32 w-96 h-96 bg-teal-200 rounded-full opacity-20 blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, -90, 0],
                  }}
                  transition={{
                    duration: 25,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"
                />
              </div>

              <div className="relative z-10 max-w-6xl mx-auto text-center">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
                    Autonomous Data Center
                  </h1>
                  <p className="text-2xl md:text-3xl text-gray-700 mb-4">Optimization AI Platform</p>
                  <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                    ระบบ AI อัจฉริยะสำหรับบริหารจัดการ Data Center แบบอัตโนมัติ ด้วยเทคโนโลยี Machine Learning และ Unity 3D
                    Simulation
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="flex flex-wrap gap-4 justify-center"
                >
                  <Link href="/dashboard">
                    <Button size="lg" className="text-lg px-8 py-6 bg-teal-600 hover:bg-teal-700">
                      เข้าสู่ Dashboard
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/unity">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-6 border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent"
                    >
                      ดู 3D Simulation
                    </Button>
                  </Link>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {[
                    {
                      icon: Activity,
                      title: "Real-time Monitoring",
                      description: "ตรวจสอบสถานะเซิร์ฟเวอร์แบบเรียลไทม์",
                      color: "from-blue-500 to-blue-600",
                    },
                    {
                      icon: Shield,
                      title: "Anomaly Detection",
                      description: "ตรวจจับความผิดปกติด้วย AI",
                      color: "from-teal-500 to-teal-600",
                    },
                    {
                      icon: TrendingUp,
                      title: "Predictive Maintenance",
                      description: "ทำนายปัญหาก่อนเกิดขึ้น",
                      color: "from-green-500 to-green-600",
                    },
                    {
                      icon: Zap,
                      title: "Auto Optimization",
                      description: "ปรับแต่งระบบอัตโนมัติ",
                      color: "from-orange-500 to-orange-600",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                      whileHover={{ y: -10, transition: { duration: 0.2 } }}
                      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                      >
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-white/50 backdrop-blur">
              <div className="max-w-6xl mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                >
                  {[
                    { value: "99.9%", label: "Uptime" },
                    { value: "40%", label: "Energy Saved" },
                    { value: "85%", label: "Accuracy" },
                    { value: "24/7", label: "Monitoring" },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
                        {stat.value}
                      </div>
                      <div className="text-gray-600 mt-2">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-gray-900 text-white">
              <div className="max-w-6xl mx-auto px-6 text-center">
                <p className="text-lg mb-2">Young Business IT Competition 2025</p>
                <p className="text-gray-400">Autonomous Data Center Optimization AI Platform</p>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
