"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DollarSign, ArrowDownLeft, ArrowUpLeft } from "lucide-react"
import { formatCurrency } from "@/lib/trading-utils"

interface CashModalProps {
  showCashModal: boolean
  setShowCashModal: (show: boolean) => void
  cashAction: "deposit" | "withdraw"
  setCashAction: (action: "deposit" | "withdraw") => void
  cash: number
  onCashTransaction: (action: "deposit" | "withdraw", amount: number) => void
}

export const CashModal = ({
  showCashModal,
  setShowCashModal,
  cashAction,
  setCashAction,
  cash,
  onCashTransaction,
}: CashModalProps) => {
  const [cashAmount, setCashAmount] = useState("")

  const handleCashTransaction = () => {
    const amount = Number.parseFloat(cashAmount)
    if (!amount || amount <= 0) return
    
    onCashTransaction(cashAction, amount)
    setCashAmount("")
    setShowCashModal(false)
  }

  return (
    <Dialog open={showCashModal} onOpenChange={setShowCashModal}>
      <DialogContent className="max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-gray-200/50 dark:border-gray-800/50 max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            {cashAction === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant={cashAction === "deposit" ? "default" : "outline"}
              onClick={() => setCashAction("deposit")}
              className={`flex items-center justify-center h-10 transition-colors ${
                cashAction === "deposit" 
                  ? "bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900" 
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Deposit
            </Button>
            <Button
              variant={cashAction === "withdraw" ? "default" : "outline"}
              onClick={() => setCashAction("withdraw")}
              className={`flex items-center justify-center h-10 transition-colors ${
                cashAction === "withdraw" 
                  ? "bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900" 
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <ArrowUpLeft className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>

          <div>
            <Label htmlFor="cashAmount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount ($)</Label>
            <Input
              id="cashAmount"
              type="number"
              step="0.01"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              placeholder="Enter amount"
              className="h-10 mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(cash)}</p>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleCashTransaction} 
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 transition-colors"
            >
              Confirm {cashAction === "deposit" ? "Deposit" : "Withdrawal"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCashModal(false)} 
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