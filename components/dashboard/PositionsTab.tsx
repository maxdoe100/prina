"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertTriangle, Calendar } from "lucide-react"
import { Position, Trade } from "@/types/dashboard"
import { formatCurrency, getPLColor, formatTradeNomenclature, getRemainingDays, getContractDisplay, isExpiringWithin5Days, calculateTotalPL } from "@/lib/trading-utils"

interface PositionsTabProps {
  positions: Position[]
  includePremiums: boolean
  setIncludePremiums: (include: boolean) => void
  onEditTrade: (trade: Trade) => void
  animatingTrade: string | null
}

export const PositionsTab = ({
  positions,
  includePremiums,
  setIncludePremiums,
  onEditTrade,
  animatingTrade,
}: PositionsTabProps) => {
  return (
    <div className="space-y-6">
      {/* Cost Basis Toggle */}
      <Card className="bg-white/90 dark:bg-gray-900/90 border-gray-200/50 dark:border-gray-800/50 shadow-sm backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-gray-900 dark:text-white">Positions Overview</CardTitle>
            <div className="flex items-center space-x-3">
              <Label htmlFor="includePremiums" className="text-sm text-gray-700 dark:text-gray-300">
                Include Premiums
              </Label>
              <Switch 
                className="data-[state=checked]:bg-gray-900 dark:data-[state=checked]:bg-gray-100" 
                id="includePremiums" 
                checked={includePremiums} 
                onCheckedChange={setIncludePremiums} 
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Positions */}
      <div className="grid gap-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {positions.map((position) => (
          <Card
            key={position.symbol}
            className={`bg-white/90 dark:bg-gray-900/90 border-gray-200/50 dark:border-gray-800/50 shadow-sm backdrop-blur-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 ${animatingTrade ? "animate-pulse" : ""}`}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-3 text-gray-900 dark:text-white">
                  {position.symbol}
                  {position.shares > 0 && <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">{position.shares} shares</Badge>}
                </CardTitle>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(position.currentPrice)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Original Cost Basis</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(position.originalCostBasis)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Premiums Received</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">+{formatCurrency(position.premiumsReceived)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {includePremiums ? "Adjusted" : "Current"} Cost Basis
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(
                      includePremiums
                        ? position.avgCostBasis - position.premiumsReceived / Math.max(position.shares, 1)
                        : position.avgCostBasis,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total P/L</p>
                  <p className={`font-semibold ${getPLColor(calculateTotalPL(position))}`}>
                    {calculateTotalPL(position) >= 0 ? "+" : ""}
                    {formatCurrency(calculateTotalPL(position))}
                  </p>
                </div>
                {position.shares > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unrealized P&L</p>
                    <p className={`font-semibold ${getPLColor((position.currentPrice - position.avgCostBasis) * position.shares)}`}>
                      {formatCurrency((position.currentPrice - position.avgCostBasis) * position.shares)}
                    </p>
                  </div>
                )}
              </div>

              {position.openOptions.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Open Options</h4>
                    {position.openOptions.some((opt) => isExpiringWithin5Days(opt.expirationDate)) && (
                      <Badge variant="destructive" className="text-xs bg-red-500 text-white">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    {position.openOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">
                            {getContractDisplay(option)}
                          </Badge>
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatTradeNomenclature(option)}
                            </span>
                            {option.notes && <p className="text-xs text-gray-500 dark:text-gray-400">{option.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${getPLColor(option.premium)}`}>
                              {option.premium >= 0 ? "+" : ""}
                              {formatCurrency(option.premium)}
                            </p>
                            {option.expirationDate && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {getRemainingDays(option.expirationDate)} days
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditTrade(option)}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                          >
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 