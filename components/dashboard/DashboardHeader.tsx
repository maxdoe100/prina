"use client"

import { Button } from "@/components/ui/button"
import { TrendingUp, Sun, Moon, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  onSettingsOpen: () => void
}

export const DashboardHeader = ({ onSettingsOpen }: DashboardHeaderProps) => {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">prina</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Trading Analytics Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onSettingsOpen}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => router.push("/auth")}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              Open Account
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 