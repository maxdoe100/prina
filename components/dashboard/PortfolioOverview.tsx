import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowDownLeft, DollarSign, TrendingUp, Lock, PiggyBank } from "lucide-react"
import { formatCurrency } from "@/lib/trading-utils"

interface PortfolioOverviewProps {
  portfolioValue: number
  cash: number
  lockedCollateral: number
  premiumCollected: number
  timeframe: string
  setTimeframe: (timeframe: string) => void
  setShowCashModal: (show: boolean) => void
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  portfolioValue,
  cash,
  lockedCollateral,
  premiumCollected,
  timeframe,
  setTimeframe,
  setShowCashModal,
}) => {
  const availableCash = cash - lockedCollateral

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Portfolio Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Portfolio Value */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Total Value</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(portfolioValue)}
              </div>
            </div>
          </div>
        </div>

        {/* Cash Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Cash</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(availableCash)}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Locked Collateral</span>
            </div>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(lockedCollateral)}</span>
          </div>
        </div>

        {/* Premium Collected */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Premiums</span>
            </div>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1W">1W</SelectItem>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="6M">6M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
                <SelectItem value="ALL">ALL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {formatCurrency(premiumCollected)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              {timeframe} Period
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-2">
          <Button
            onClick={() => setShowCashModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <ArrowDownLeft className="w-4 h-4 mr-2" />
            Manage Cash
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 