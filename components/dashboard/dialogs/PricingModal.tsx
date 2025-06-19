"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreditCard, TrendingUp, Crown } from "lucide-react"

interface PricingModalProps {
  showPricingModal: boolean
  setShowPricingModal: (show: boolean) => void
}

export const PricingModal = ({ showPricingModal, setShowPricingModal }: PricingModalProps) => {
  return (
    <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
      <DialogContent className="max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-gray-200/50 dark:border-gray-800/50 max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <CreditCard className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            Choose Your Plan
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto pr-2">
          <Card className="relative bg-white/90 dark:bg-gray-900/90 border-gray-200/50 dark:border-gray-800/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                Free Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                $0<span className="text-lg font-normal text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">✓ Up to 10 trades per month</li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">✓ Basic cost basis tracking</li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">✓ Portfolio overview</li>
                <li className="flex items-center gap-2 text-gray-400 dark:text-gray-600">✗ Advanced analytics</li>
                <li className="flex items-center gap-2 text-gray-400 dark:text-gray-600">✗ Real-time data</li>
              </ul>
              <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="relative bg-white/90 dark:bg-gray-900/90 border-2 border-gray-900 dark:border-gray-100 shadow-md">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white dark:text-gray-900" />
                </div>
                Pro Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                $29<span className="text-lg font-normal text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">✓ Unlimited trades</li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">✓ Advanced cost basis tracking</li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">✓ Real-time market data</li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">✓ Risk management alerts</li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">✓ Advanced analytics</li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">✓ Export capabilities</li>
              </ul>
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 transition-colors">
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 