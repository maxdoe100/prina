"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, HelpCircle, BarChart3, TrendingUp, Shield, Zap, Target, Users, Award } from "lucide-react"
import CardSwap, { Card as AnimatedCard } from "@/components/CardSwap"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar */}
      <div className="bg-black text-white px-4 py-2">
        <div className="container mx-auto flex justify-end items-center gap-4 text-sm">
          <button className="flex items-center gap-1 hover:text-gray-300">
            <Search className="h-4 w-4" />
          </button>
          <Link href="#" className="hover:text-gray-300">
            Sign In
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="#" className="flex items-center gap-1 hover:text-gray-300">
            <HelpCircle className="h-4 w-4" />
            Help Center
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center justify-between">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="ml-2 text-xl font-bold text-black">prina</span>
        </Link>
        <nav className="hidden md:flex gap-8">
          <Link href="#" className="text-sm font-medium text-gray-700 hover:text-black" prefetch={false}>
            Trading
          </Link>
          <Link href="#" className="text-sm font-medium text-gray-700 hover:text-black" prefetch={false}>
            Pricing
          </Link>
          <Link href="#" className="text-sm font-medium text-gray-700 hover:text-black" prefetch={false}>
            Resources
          </Link>
        </nav>
        <Link href="/auth">
          <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium">
            Open an Account
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden min-h-screen">
          <div className="container mx-auto px-4 md:px-6 relative z-10 min-h-screen flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
              {/* Left Column - Content */}
              <div className="text-left space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
                    <span className="text-red-400 text-sm font-medium">Professional Trading Analytics</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    THIS IS YOUR
                    <span className="block text-red-500">MOMENT</span>
                  </h1>
                  <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                    Unlock advanced performance analytics and take control of your trading success with 
                    <span className="text-white font-semibold"> enterprise-grade tools</span> used by professionals.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Link href="/auth">
                    <Button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-red-500/25 transition-all duration-300">
                      Start Free Trial
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>No credit card required • 14-day free trial</span>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="pt-8 border-t border-gray-800">
                  <p className="text-gray-400 text-sm mb-4">Trusted by 10,000+ traders worldwide</p>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">99.9%</div>
                      <div className="text-xs text-gray-400">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">$2.1B+</div>
                      <div className="text-xs text-gray-400">Tracked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">35%</div>
                      <div className="text-xs text-gray-400">Avg Improvement</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Animated Cards */}
              <div className="relative h-[600px] flex items-center justify-center">
                <CardSwap
                  cardDistance={50}
                  verticalDistance={60}
                  delay={4000}
                  pauseOnHover={true}
                  width={320}
                  height={280}
                  easing="elastic"
                >
                  <AnimatedCard className="p-6 text-white bg-gradient-to-br from-gray-900 to-black border-gray-700 shadow-2xl">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 rounded-full bg-red-500/20">
                        <Target className="h-8 w-8 text-red-400" />
                      </div>
                      <h3 className="text-xl font-bold">Precision Analytics</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        AI-powered algorithms analyze your trading patterns and provide actionable insights for optimal performance and risk management.
                      </p>
                    </div>
                  </AnimatedCard>
                  <AnimatedCard className="p-6 text-white bg-gradient-to-br from-gray-900 to-black border-gray-700 shadow-2xl">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 rounded-full bg-blue-500/20">
                        <Users className="h-8 w-8 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold">Elite Community</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Connect with successful traders sharing strategies and insights in our exclusive, verified community of professionals.
                      </p>
                    </div>
                  </AnimatedCard>
                  <AnimatedCard className="p-6 text-white bg-gradient-to-br from-gray-900 to-black border-gray-700 shadow-2xl">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 rounded-full bg-yellow-500/20">
                        <Award className="h-8 w-8 text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-bold">Proven Results</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Track record of helping traders improve performance by 35% average within 90 days using our advanced analytics platform.
                      </p>
                    </div>
                  </AnimatedCard>
                </CardSwap>
              </div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-purple-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-6">
                <span className="text-gray-600 text-sm font-medium">Complete Trading Solution</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Everything you need to
                <span className="block text-red-500">optimize your trading</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Professional-grade tools and insights designed for serious traders who demand excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              <div className="group">
                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="p-8">
                    <div className="p-3 rounded-lg bg-red-50 w-fit mb-6 group-hover:bg-red-100 transition-colors">
                      <BarChart3 className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Advanced Analytics</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      AI-powered performance analysis with predictive insights and risk assessment tools.
                    </p>
                    <div className="text-sm text-red-500 font-medium">Real-time processing</div>
                  </CardContent>
                </Card>
              </div>

              <div className="group">
                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="p-8">
                    <div className="p-3 rounded-lg bg-blue-50 w-fit mb-6 group-hover:bg-blue-100 transition-colors">
                      <TrendingUp className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Portfolio Tracking</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Comprehensive portfolio management with automated trade tracking and P&L calculations.
                    </p>
                    <div className="text-sm text-blue-500 font-medium">Auto-sync enabled</div>
                  </CardContent>
                </Card>
              </div>

              <div className="group">
                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="p-8">
                    <div className="p-3 rounded-lg bg-green-50 w-fit mb-6 group-hover:bg-green-100 transition-colors">
                      <Shield className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Bank-Level Security</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Enterprise-grade encryption and security protocols protecting your sensitive trading data.
                    </p>
                    <div className="text-sm text-green-500 font-medium">256-bit encryption</div>
                  </CardContent>
                </Card>
              </div>

              <div className="group">
                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="p-8">
                    <div className="p-3 rounded-lg bg-purple-50 w-fit mb-6 group-hover:bg-purple-100 transition-colors">
                      <Zap className="h-8 w-8 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Real-Time Data</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Live market data integration with instant notifications and alerts for optimal timing.
                    </p>
                    <div className="text-sm text-purple-500 font-medium">Sub-second latency</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 bg-gradient-to-r from-gray-900 to-black">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                    Ready to take your trading to the
                    <span className="block text-red-500">next level?</span>
                  </h2>
                  <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    Join over 10,000 professional traders who've transformed their performance with Prina's 
                    advanced analytics platform.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/auth">
                    <Button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-red-500/25 transition-all duration-300 min-w-[200px]">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-full text-lg font-semibold min-w-[200px]">
                      View Demo
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-gray-800">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">14 Days</div>
                    <div className="text-gray-400">Free Trial</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">No Risk</div>
                    <div className="text-gray-400">Cancel Anytime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">24/7</div>
                    <div className="text-gray-400">Expert Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-white">prina</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                Professional trading analytics platform trusted by thousands of traders worldwide.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <nav className="space-y-2">
                <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm block transition-colors">
                  Dashboard
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm block transition-colors">
                  Analytics
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm block transition-colors">
                  Portfolio
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm block transition-colors">
                  API
                </Link>
              </nav>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <nav className="space-y-2">
                <Link href="#" className="text-gray-400 hover:text-white text-sm block transition-colors">
                  About
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm block transition-colors">
                  Careers
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm block transition-colors">
                  Press
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm block transition-colors">
                  Contact
                </Link>
              </nav>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <nav className="space-y-2">
                <Link href="#" className="text-gray-400 hover:text-white text-sm block transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm block transition-colors">
                  Terms of Service
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm block transition-colors">
                  Security
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm block transition-colors">
                  GDPR
                </Link>
              </nav>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">&copy; 2025 Prina. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="text-sm text-gray-400">SOC 2 Compliant</span>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <span className="text-sm text-gray-400">GDPR Ready</span>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <span className="text-sm text-gray-400">ISO 27001</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
