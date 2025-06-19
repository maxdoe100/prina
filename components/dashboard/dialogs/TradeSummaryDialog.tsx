"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Calculator, CheckCircle, AlertCircle } from "lucide-react"
import { TradeSummaryData } from "@/types/dashboard"
import { formatCurrency, getContractDisplay } from "@/lib/trading-utils"

interface TradeSummaryDialogProps {
  showTradeSummary: boolean
  setShowTradeSummary: (show: boolean) => void
  tradeSummaryData: TradeSummaryData | null
  onConfirmTrade: (tradeSummaryData: TradeSummaryData) => void
}

export const TradeSummaryDialog = ({
  showTradeSummary,
  setShowTradeSummary,
  tradeSummaryData,
  onConfirmTrade,
}: TradeSummaryDialogProps) => {
  if (!tradeSummaryData) return null

  const { trade, cashImpact, collateralImpact, netCredit, netDebit, commission, stockPurchase } = tradeSummaryData

  const handleConfirm = () => {
    onConfirmTrade(tradeSummaryData)
    setShowTradeSummary(false)
  }

  return (
    <Dialog open={showTradeSummary} onOpenChange={setShowTradeSummary}>
      <DialogContent className="max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-gray-200/50 dark:border-gray-800/50 max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Calculator className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <DialogTitle className="text-gray-900 dark:text-white">
              Trade Confirmation - {trade.symbol}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          {/* Trade Details */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Trade Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Symbol:</span>
                <span className="font-medium text-gray-900 dark:text-white">{trade.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="font-medium text-gray-900 dark:text-white">{trade.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Side:</span>
                <span className="font-medium text-gray-900 dark:text-white">{trade.side}</span>
              </div>
              {trade.strikePrice && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Strike:</span>
                  <span className="font-medium text-gray-900 dark:text-white">${trade.strikePrice}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Price:</span>
                <span className="font-medium text-gray-900 dark:text-white">${trade.price}</span>
              </div>
                             <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {trade.type === "Stock" ? `${Math.abs(trade.contracts)} shares` : `${Math.abs(trade.contracts)} contracts`}
                </span>
              </div>
              {trade.expirationDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Expiration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{trade.expirationDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Impact */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Financial Impact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Commission:</span>
                <span className="text-red-600 dark:text-red-400">-{formatCurrency(commission)}</span>
              </div>
              
              {netCredit > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Premium Credit:</span>
                  <span className="text-green-600 dark:text-green-400">+{formatCurrency(netCredit)}</span>
                </div>
              )}
              
              {netDebit > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Premium Debit:</span>
                  <span className="text-red-600 dark:text-red-400">-{formatCurrency(netDebit)}</span>
                </div>
              )}

              {collateralImpact > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Collateral Required:</span>
                  <span className="text-orange-600 dark:text-orange-400">-{formatCurrency(collateralImpact)}</span>
                </div>
              )}

              {stockPurchase && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Stock Purchase:</span>
                    <span className="text-red-600 dark:text-red-400">
                      -{formatCurrency(stockPurchase.shares * stockPurchase.price)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 pl-2">
                    {stockPurchase.shares} shares @ ${stockPurchase.price}
                  </div>
                </div>
              )}

              <Separator className="my-2 bg-gray-200 dark:bg-gray-600" />
              
              <div className="flex justify-between font-medium">
                <span className="text-gray-900 dark:text-white">Net Cash Impact:</span>
                <span className={cashImpact >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  {cashImpact >= 0 ? "+" : ""}{formatCurrency(cashImpact)}
                </span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {(trade.type === "Put" && trade.side === "STO" && !trade.secured) ||
           (trade.type === "Call" && trade.side === "STO" && !trade.covered) ? (
            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Naked {trade.type} Warning
                </p>
                <p className="text-orange-700 dark:text-orange-300 mt-1">
                  This is a naked {trade.type.toLowerCase()} position with unlimited risk potential.
                </p>
              </div>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Trade
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowTradeSummary(false)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 