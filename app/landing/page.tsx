"use client"

import React, { useEffect, useState } from 'react';
import { ArrowRight, Zap, Shield, TrendingUp, Activity } from 'lucide-react';

export default function LandingPage() {
  const [showContent, setShowContent] = useState(false);
  const [logoPhase, setLogoPhase] = useState("school");

  useEffect(() => {
    const schoolTimer = setTimeout(() => {
      setLogoPhase("competition");
    }, 3000);

    const competitionTimer = setTimeout(() => {
      setLogoPhase("done");
      setShowContent(true);
    }, 6000);

    return () => {
      clearTimeout(schoolTimer);
      clearTimeout(competitionTimer);
    };
  }, []);

  // Create floating particles
  useEffect(() => {
    if (showContent) {
      const particles = document.querySelector('.floating-particles');
      if (particles) {
        for (let i = 0; i < 15; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          particle.style.left = Math.random() * 100 + '%';
          particle.style.animationDelay = Math.random() * 12 + 's';
          particle.style.animationDuration = (Math.random() * 8 + 8) + 's';
          particles.appendChild(particle);
        }
      }
    }
  }, [showContent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden relative font-sans antialiased">
      <style>{`
        @keyframes epicLogoEnter {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(-180deg);
            opacity: 0;
          }
          60% {
            transform: translate(-50%, -50%) scale(1.1) rotate(10deg);
          }
          100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes scanLine {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes logoShine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }

        @keyframes flashEffect {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes floatUp {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
          }
        }

        @keyframes gentleFloat {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, 20px) rotate(5deg);
          }
          50% {
            transform: translate(0, 40px) rotate(0deg);
          }
          75% {
            transform: translate(-20px, 20px) rotate(-5deg);
          }
        }

        @keyframes titleFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes contentFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        @keyframes screenShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }

        .loader-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: ${logoPhase === "done" ? "fadeOut 1.5s ease-in-out forwards" : "none"};
        }

        @keyframes fadeOut {
          to {
            opacity: 0;
            visibility: hidden;
          }
        }

        .logo-animation {
          position: relative;
          width: 400px;
          height: 400px;
        }

        .logo-animation::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
          border: 2px solid rgba(168, 218, 220, 0.3);
          border-radius: 50%;
          animation: scanLine 3s linear infinite;
        }

        .school-logo, .competition-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          width: 220px;
          height: 220px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          font-weight: bold;
          border: 4px solid rgba(255, 255, 255, 0.8);
          overflow: hidden;
        }

        .school-logo {
          background: linear-gradient(135deg, #c77dcd 0%, #9370db 50%, #7b68ee 100%);
          box-shadow: 
            0 0 60px rgba(147, 112, 219, 0.9), 
            0 0 120px rgba(147, 112, 219, 0.6),
            inset 0 0 60px rgba(255, 255, 255, 0.15);
          animation: epicLogoEnter 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .school-logo::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          animation: logoShine 2s ease-in-out 1s infinite;
          transform: rotate(45deg);
        }

        .competition-logo {
          background: linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #06b6d4 100%);
          box-shadow: 
            0 0 60px rgba(20, 184, 166, 0.9), 
            0 0 120px rgba(20, 184, 166, 0.6),
            inset 0 0 60px rgba(255, 255, 255, 0.15);
          animation: epicLogoEnter 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
        }

        .competition-logo::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          animation: logoShine 2s ease-in-out 1s infinite;
          transform: rotate(45deg);
        }

        .logo-visible {
          animation: epicLogoEnter 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
          opacity: 1 !important;
        }

        .logo-exit {
          animation: epicLogoEnter 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) reverse forwards !important;
        }

        .floating-particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: linear-gradient(45deg, #a8dada, #dda0dd);
          border-radius: 50%;
          animation: floatUp 12s infinite linear;
          opacity: 0.6;
        }

        .flash-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%);
          z-index: 999;
          animation: flashEffect 0.5s ease-out;
          pointer-events: none;
        }

        .content-wrapper {
          animation: contentFadeIn 2s ease-out both;
        }

        .hero-title {
          animation: titleFloat 3s ease-in-out infinite;
        }

        .cta-button {
          position: relative;
          overflow: hidden;
        }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .cta-button:hover::before {
          left: 100%;
        }

        .feature-card {
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #a8dada, #dda0dd, #ffd1dc);
        }

        .feature-card:hover {
          transform: translateY(-10px) scale(1.02);
        }

        .shape {
          position: absolute;
          opacity: 0.1;
          animation: gentleFloat 20s infinite ease-in-out;
        }

        .shape-1 {
          top: 10%;
          left: 10%;
          width: 120px;
          height: 120px;
          background: linear-gradient(45deg, #a8dada, #b0e0e6);
          border-radius: 50%;
        }

        .shape-2 {
          top: 60%;
          right: 15%;
          width: 100px;
          height: 100px;
          background: linear-gradient(45deg, #dda0dd, #e6e6fa);
          border-radius: 20px;
          animation-delay: -7s;
        }

        .shape-3 {
          bottom: 20%;
          left: 20%;
          width: 80px;
          height: 80px;
          background: linear-gradient(45deg, #ffd1dc, #ffe4e1);
          transform: rotate(45deg);
          animation-delay: -14s;
        }
      `}</style>

      {/* Loading Animation */}
      {logoPhase !== "done" && (
        <div className="loader-container">
          <div className="logo-animation">
            {logoPhase === "school" && (
              <div className="school-logo">
                <img
                  src="/school-logo.png"
                  alt="School Logo"
                  className="w-full h-full object-contain p-4"
                  style={{ opacity: 1 }}
                />
              </div>
            )}
            
            {logoPhase === "competition" && (
              <div className="competition-logo logo-visible">
                <img
                  src="/competition-logo.png"
                  alt="Competition Logo"
                  className="w-full h-full object-contain p-4"
                  style={{ opacity: 1 }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Particles & Shapes */}
      {showContent && (
        <>
          <div className="floating-particles"></div>
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </>
      )}

      {/* Main Content */}
      {showContent && (
        <div className="content-wrapper relative z-10">
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 pb-32">
            <div className="max-w-6xl mx-auto text-center">
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-100 to-blue-100 text-teal-700 font-semibold text-sm border border-teal-200">
                ⚡ Next Gen Infrastructure
              </div>
              
              <h1 className="hero-title text-5xl md:text-8xl font-extrabold mb-6 tracking-tight leading-tight bg-gradient-to-r from-teal-600 via-purple-500 to-pink-400 bg-clip-text text-transparent">
                Autonomous Data Center
              </h1>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-600 mb-6">
                Optimization AI Platform
              </h2>
              
              <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-3xl mx-auto leading-relaxed">
                ระบบ AI อัจฉริยะสำหรับบริหารจัดการ Data Center แบบอัตโนมัติ<br/>
                ด้วยเทคโนโลยี Machine Learning และ Unity 3D Simulation
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
                <a 
                  href="/dashboard"
                  className="cta-button px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center"
                >
                  เข้าสู่ Dashboard
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </a>
                <a 
                  href="/unity"
                  className="cta-button px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center"
                >
                  <Zap className="inline-block mr-2 w-5 h-5" />
                  ดู 3D Simulation
                </a>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: Activity,
                    title: "Real-time Monitoring",
                    description: "ตรวจสอบสถานะเซิร์ฟเวอร์แบบเรียลไทม์",
                    gradient: "from-blue-500 to-blue-600",
                  },
                  {
                    icon: Shield,
                    title: "Anomaly Detection",
                    description: "ตรวจจับความผิดปกติด้วย AI",
                    gradient: "from-teal-500 to-teal-600",
                  },
                  {
                    icon: TrendingUp,
                    title: "Predictive Maintenance",
                    description: "ทำนายปัญหาก่อนเกิดขึ้นจริง",
                    gradient: "from-green-500 to-green-600",
                  },
                  {
                    icon: Zap,
                    title: "Auto Optimization",
                    description: "ปรับแต่งการใช้พลังงานอัตโนมัติ",
                    gradient: "from-orange-500 to-orange-600",
                  },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="feature-card bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl"
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-md`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 bg-white/60 backdrop-blur-md border-t border-gray-100">
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: "99.9%", label: "Uptime" },
                  { value: "40%", label: "Energy Saved" },
                  { value: "85%", label: "AI Accuracy" },
                  { value: "24/7", label: "Monitoring" },
                ].map((stat, index) => (
                  <div key={index} className="p-4">
                    <div className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent font-mono">
                      {stat.value}
                    </div>
                    <div className="text-gray-500 mt-2 font-medium uppercase tracking-wider text-sm">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 bg-gray-900 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-purple-500 to-pink-400"></div>
            <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
              <p className="text-xl font-bold mb-2">Young Business IT Competition 2025</p>
              <p className="text-gray-400">Autonomous Data Center Optimization AI Platform</p>
              <p className="text-gray-600 text-sm mt-4">© 2025 PCSHS Lopburi. All rights reserved.</p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}