"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { Trade } from "@/types/dashboard"
import { formatCurrency, formatDate, getStatusColor, getPLColor, getContractDisplay } from "@/lib/trading-utils"

interface TradesTabProps {
  trades: Trade[]
  onEditTrade: (trade: Trade) => void
  animatingTrade: string | null
}

export const TradesTab = ({ trades, onEditTrade, animatingTrade }: TradesTabProps) => {
  return (
    <div className="space-y-6">
      <Card className="bg-white/90 dark:bg-gray-900/90 border-gray-200/50 dark:border-gray-800/50 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">All Trades</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-3 pr-2">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className={`flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer ${
                  animatingTrade === trade.id ? "animate-pulse bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700" : ""
                }`}
                onClick={() => trade.type !== "Stock" && onEditTrade(trade)}
              >
                <div className="flex items-center gap-4">
                  <Badge
                    variant={trade.side === "STO" ? "default" : "secondary"}
                    className="min-w-[60px] justify-center text-white bg-gray-700 dark:bg-gray-600 border-gray-700 dark:border-gray-600"
                  >
                    {trade.symbol === "CASH" ? "CASH" : (trade.type === "Stock" ? "STOCK" : trade.side)}
                  </Badge>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trade.symbol === "CASH" ? (trade.side === "BTO" ? "DEPOSIT" : "WITHDRAWAL") : trade.symbol}
                      {trade.type !== "Stock" && (
                        <span className="ml-1">
                          {trade.strikePrice}
                          {trade.type === "Call" ? "C" : "P"}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getContractDisplay(trade)}{" "}
                      {trade.symbol === "CASH" ? "dollars" : (trade.type === "Stock" ? "shares" : "contracts")}{" "}
                      {trade.symbol !== "CASH" && (
                        <>
                          • {trade.type === "Stock" ? "Price: " : "Premium: "}
                          {formatCurrency(trade.price)}
                        </>
                      )}
                      {trade.notes && ` • ${trade.notes}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getPLColor(trade.premium)}`}>
                    {trade.premium >= 0 ? "+" : ""}
                    {formatCurrency(trade.premium)}
                  </p>
                  <div className="flex items-center gap-2">
                  {trade.symbol !== "CASH" && (
                    <Badge variant="outline" className={`text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 ${getStatusColor(trade.status)}`}>
                      {trade.status}
                    </Badge>
                  )}
                    {trade.expirationDate && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(trade.expirationDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 