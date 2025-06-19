"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { 
  TrendingUp, 
  Mail, 
  Lock, 
  User, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Shield, 
  BarChart3, 
  Zap,
  CheckCircle
} from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock authentication - in real app, this would call your auth service
    console.log("Auth attempt:", { isLogin, formData })

    // Simulate successful auth and redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-purple-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <Link href="/" className="flex items-center mb-12 group">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold text-white">prina</span>
          </Link>

          {/* Main Message */}
          <div className="space-y-6 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Join the future of
              <span className="block text-red-500">trading analytics</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Start your journey with professional-grade tools trusted by thousands of successful traders worldwide.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <BarChart3 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Advanced Analytics</h3>
                <p className="text-gray-400 text-sm">Real-time performance tracking with AI insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Bank-Level Security</h3>
                <p className="text-gray-400 text-sm">Enterprise-grade encryption and data protection</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Zap className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Lightning Fast</h3>
                <p className="text-gray-400 text-sm">Sub-second data processing and real-time updates</p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm mb-4">Trusted by professionals at</p>
            <div className="flex items-center space-x-8 text-gray-500">
              <span className="text-lg font-semibold">Goldman Sachs</span>
              <span className="text-lg font-semibold">Morgan Stanley</span>
              <span className="text-lg font-semibold">JP Morgan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link href="/" className="inline-flex items-center group mb-6">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-white">prina</span>
            </Link>
          </div>

          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>

          {/* Form Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold text-white">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-gray-400">
              {isLogin 
                ? "Sign in to access your trading dashboard" 
                : "Join thousands of professional traders"
              }
            </p>
          </div>

          {/* Auth Form */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        id="remember"
                        type="checkbox"
                        className="w-4 h-4 text-red-500 bg-gray-800 border-gray-700 rounded focus:ring-red-500"
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-300">Remember me</Label>
                    </div>
                    <Button variant="link" className="p-0 h-auto text-sm text-red-400 hover:text-red-300">
                      Forgot password?
                    </Button>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-red-500/25 transition-all duration-300"
                >
                  {isLogin ? "Sign In to Dashboard" : "Create Account"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-3 text-gray-400">Or continue with</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-gray-700 bg-gray-800/50 text-white hover:bg-gray-700 py-3"
                type="button"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-400">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </span>{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold text-red-400 hover:text-red-300" 
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Sign up for free" : "Sign in"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="text-center text-xs text-gray-500">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Protected by 256-bit SSL encryption</span>
            </div>
            <p>Your data is secure and will never be shared with third parties.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
