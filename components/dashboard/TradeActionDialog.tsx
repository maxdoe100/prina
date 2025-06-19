"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Settings, X, ArrowDown, RotateCcw, Edit, Trash2, Calculator } from "lucide-react"
import { Trade } from "@/types/dashboard"
import { getTradeId } from "@/lib/trading-utils"

interface TradeActionDialogProps {
  trade: Trade | null
  onClose: () => void
  onCloseTrade: (tradeId: string, closingPrice: number) => void
  onAssignTrade: (tradeId: string) => void
  onRollTrade: (tradeId: string, newExpiration: string, newStrike?: number, rollData?: { closingPrice?: number; openingPrice?: number }) => void
  onRemoveTrade: (trade: Trade) => void
  onEditTrade: (trade: Trade) => void
  defaultCommission: number
  cash: number
  setCash: (cash: number | ((prev: number) => number)) => void
  lockedCollateral: number
  setLockedCollateral: (collateral: number | ((prev: number) => number)) => void
}

export const TradeActionDialog = ({
  trade,
  onClose,
  onCloseTrade,
  onAssignTrade,
  onRollTrade,
  onRemoveTrade,
  onEditTrade,
  defaultCommission,
  cash,
  setCash,
  lockedCollateral,
  setLockedCollateral,
}: TradeActionDialogProps) => {
  const [actionType, setActionType] = useState<"close" | "assign" | "roll">("close")
  const [closingPrice, setClosingPrice] = useState("")
  const [newExpiration, setNewExpiration] = useState("")
  const [newStrike, setNewStrike] = useState("")
  const [closingCommission, setClosingCommission] = useState(defaultCommission.toString())
  const [assignCommission, setAssignCommission] = useState(defaultCommission.toString())
  const [rollCommission, setRollCommission] = useState(defaultCommission.toString())
  const [showActionSummary, setShowActionSummary] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [actionSummaryData, setActionSummaryData] = useState<any>(null)
  const [contractsToClose, setContractsToClose] = useState("1")
  const [contractsToRoll, setContractsToRoll] = useState("1")
  const [rollClosingPrice, setRollClosingPrice] = useState("")
  const [rollOpeningPrice, setRollOpeningPrice] = useState("")

  if (!trade) return null

  const tradeId = getTradeId(trade)

  const getActionTitle = () => {
    switch (actionType) {
      case "close":
        return `Close Trade (${tradeId}) - ${trade.symbol}`
      case "assign":
        return `Assign (${tradeId}) - ${trade.symbol}`
      case "roll":
        return `Roll Trade (${tradeId}) - ${trade.symbol}`
      default:
        return "Manage Trade"
    }
  }

  const calculateActionImpact = () => {
    const contractsCount = actionType === "close" ? Number.parseInt(contractsToClose) :
      actionType === "roll" ? Number.parseInt(contractsToRoll) :
        Math.abs(trade.contracts)

    const commission = Number.parseFloat(
      actionType === "close" ? closingCommission :
        actionType === "assign" ? assignCommission : rollCommission
    )

    let cashImpact = -commission
    let collateralReleased = 0

    if (actionType === "close" && closingPrice) {
      const closePrice = Number.parseFloat(closingPrice)
      const contractMultiplier = trade.type === "Stock" ? 1 : 100
      const baseValue = closePrice * contractsCount * contractMultiplier

      if (trade.side === "STO") {
        cashImpact -= baseValue
      } else {
        cashImpact += baseValue
      }

      if (trade.type === "Put" && trade.side === "STO" && trade.secured && trade.strikePrice) {
        collateralReleased = trade.strikePrice * 100 * contractsCount
      }
    } else if (actionType === "assign") {
      if (trade.type === "Put" && trade.side === "STO" && trade.strikePrice) {
        if (trade.secured) {
          cashImpact = -commission
          collateralReleased = trade.strikePrice * 100 * contractsCount
        } else {
          cashImpact -= trade.strikePrice * 100 * contractsCount
        }
      } else if (trade.type === "Call" && trade.side === "STO" && trade.strikePrice) {
        cashImpact += trade.strikePrice * 100 * contractsCount
      }
    } else if (actionType === "roll" && rollClosingPrice && rollOpeningPrice) {
      const closePrice = Number.parseFloat(rollClosingPrice)
      const openPrice = Number.parseFloat(rollOpeningPrice)
      const contractMultiplier = 100

      const closeCost = closePrice * contractsCount * contractMultiplier
      const openCredit = openPrice * contractsCount * contractMultiplier
      
      if (trade.side === "STO") {
        cashImpact = openCredit - closeCost - commission
      } else {
        cashImpact = closeCost - openCredit - commission
      }
    }

    return {
      cashImpact,
      commission,
      collateralReleased,
      netCredit: cashImpact > 0 ? cashImpact : 0,
      netDebit: cashImpact < 0 ? Math.abs(cashImpact) : 0
    }
  }

  const handleActionConfirm = () => {
    const impact = calculateActionImpact()
    setActionSummaryData(impact)
    setShowActionSummary(true)
  }

  const executeAction = () => {
    if (actionType === "close" && closingPrice) {
      onCloseTrade(trade.id, Number.parseFloat(closingPrice))
    } else if (actionType === "assign") {
      onAssignTrade(trade.id)
    } else if (actionType === "roll" && newExpiration) {
      onRollTrade(trade.id, newExpiration, newStrike ? Number.parseFloat(newStrike) : undefined, {
        closingPrice: rollClosingPrice ? Number.parseFloat(rollClosingPrice) : undefined,
        openingPrice: rollOpeningPrice ? Number.parseFloat(rollOpeningPrice) : undefined
      })
    }

    if (actionSummaryData) {
      setCash(prev => prev + actionSummaryData.cashImpact)
      if (actionSummaryData.collateralReleased > 0) {
        setLockedCollateral(prev => prev - actionSummaryData.collateralReleased)
      }
    }

    setShowActionSummary(false)
    onClose()
  }

  if (showRemoveConfirm) {
    return (
      <Dialog open={true} onOpenChange={() => setShowRemoveConfirm(false)}>
        <DialogContent className="max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-gray-200/50 dark:border-gray-800/50">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-gray-900 dark:text-white">Remove Trade ({tradeId}) - {trade.symbol}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This will completely remove the trade and reverse all its impacts on your portfolio.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg space-y-2 border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white">Impact Reversal</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Cash Impact:</span>
                  <span className={trade.premium >= 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                    {trade.premium >= 0 ? "-" : "+"}${Math.abs(trade.premium).toFixed(2)}
                  </span>
                </div>
                {trade.type === "Put" && trade.side === "STO" && trade.secured && trade.strikePrice && (
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Collateral Released:</span>
                    <span className="text-green-600 dark:text-green-400">
                      +${(trade.strikePrice * 100 * Math.abs(trade.contracts)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onRemoveTrade(trade)
                  setShowRemoveConfirm(false)
                  onClose()
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Confirm Removal
              </Button>
              <Button variant="outline" onClick={() => setShowRemoveConfirm(false)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (showActionSummary && actionSummaryData) {
    return (
      <Dialog open={true} onOpenChange={() => setShowActionSummary(false)}>
        <DialogContent className="max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-gray-200/50 dark:border-gray-800/50">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Calculator className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <DialogTitle className="text-gray-900 dark:text-white">{getActionTitle()} - Summary</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg space-y-2 border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white">Financial Impact</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Commission:</span>
                  <span className="text-red-600 dark:text-red-400">-${actionSummaryData.commission.toFixed(2)}</span>
                </div>
                {actionSummaryData.collateralReleased > 0 && (
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Collateral Released:</span>
                    <span className="text-green-600 dark:text-green-400">
                      +${actionSummaryData.collateralReleased.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Net Cash Impact:</span>
                  <span className={actionSummaryData.cashImpact >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {actionSummaryData.cashImpact >= 0 ? "+" : ""}${actionSummaryData.cashImpact.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={executeAction} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 transition-colors">
                Execute {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </Button>
              <Button variant="outline" onClick={() => setShowActionSummary(false)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={!!trade} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-gray-200/50 dark:border-gray-800/50 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <DialogTitle className="text-gray-900 dark:text-white">{getActionTitle()}</DialogTitle>
              {trade.notes && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{trade.notes}</p>
              )}
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={actionType === "close" ? "default" : "outline"}
              size="sm"
              onClick={() => setActionType("close")}
              className={`h-10 ${
                actionType === "close" 
                  ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              variant={actionType === "assign" ? "default" : "outline"}
              size="sm"
              onClick={() => setActionType("assign")}
              className={`h-10 ${
                actionType === "assign" 
                  ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button
              variant={actionType === "roll" ? "default" : "outline"}
              size="sm"
              onClick={() => setActionType("roll")}
              className={`h-10 ${
                actionType === "roll" 
                  ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditTrade(trade)}
              className="h-10 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          {actionType === "close" && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="contractsToClose" className="text-sm font-medium text-gray-700 dark:text-gray-300">Contracts to Close</Label>
                <Input
                  id="contractsToClose"
                  type="number"
                  min="1"
                  max={Math.abs(trade.contracts)}
                  value={contractsToClose}
                  onChange={(e) => setContractsToClose(e.target.value)}
                  placeholder="Number of contracts"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="closingPrice" className="text-sm font-medium text-gray-700 dark:text-gray-300">Closing Price</Label>
                <Input
                  id="closingPrice"
                  type="number"
                  step="0.01"
                  value={closingPrice}
                  onChange={(e) => setClosingPrice(e.target.value)}
                  placeholder="Enter closing price"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="closingCommission" className="text-sm font-medium text-gray-700 dark:text-gray-300">Commission</Label>
                <Input
                  id="closingCommission"
                  type="number"
                  step="0.01"
                  value={closingCommission}
                  onChange={(e) => setClosingCommission(e.target.value)}
                  placeholder="Commission"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
            </div>
          )}

          {actionType === "assign" && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="assignCommission" className="text-sm font-medium text-gray-700 dark:text-gray-300">Commission</Label>
                <Input
                  id="assignCommission"
                  type="number"
                  step="0.01"
                  value={assignCommission}
                  onChange={(e) => setAssignCommission(e.target.value)}
                  placeholder="Commission"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
            </div>
          )}

          {actionType === "roll" && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="contractsToRoll" className="text-sm font-medium text-gray-700 dark:text-gray-300">Contracts to Roll</Label>
                <Input
                  id="contractsToRoll"
                  type="number"
                  min="1"
                  max={Math.abs(trade.contracts)}
                  value={contractsToRoll}
                  onChange={(e) => setContractsToRoll(e.target.value)}
                  placeholder="Number of contracts"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="rollClosingPrice" className="text-sm font-medium text-gray-700 dark:text-gray-300">Closing Price</Label>
                  <Input
                    id="rollClosingPrice"
                    type="number"
                    step="0.01"
                    value={rollClosingPrice}
                    onChange={(e) => setRollClosingPrice(e.target.value)}
                    placeholder="Cost to close"
                    className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-red-400 focus:ring-red-400"
                  />
                </div>
                <div>
                  <Label htmlFor="rollOpeningPrice" className="text-sm font-medium text-gray-700 dark:text-gray-300">Opening Price</Label>
                  <Input
                    id="rollOpeningPrice"
                    type="number"
                    step="0.01"
                    value={rollOpeningPrice}
                    onChange={(e) => setRollOpeningPrice(e.target.value)}
                    placeholder="Credit for new position"
                    className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-green-400 focus:ring-green-400"
                  />
                </div>
              </div>
              {rollClosingPrice && rollOpeningPrice && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Cost to Close:</span>
                      <span className="text-red-600 dark:text-red-400">
                        -${(Number.parseFloat(rollClosingPrice) * Number.parseInt(contractsToRoll) * 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Credit from New Position:</span>
                      <span className="text-green-600 dark:text-green-400">
                        +${(Number.parseFloat(rollOpeningPrice) * Number.parseInt(contractsToRoll) * 100).toFixed(2)}
                      </span>
                    </div>
                    <Separator className="my-1 bg-gray-200 dark:bg-gray-600" />
                    <div className="flex justify-between font-medium text-gray-900 dark:text-white">
                      <span>Net Profit (before commission):</span>
                      <span className={
                        (Number.parseFloat(rollOpeningPrice) - Number.parseFloat(rollClosingPrice)) >= 0 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-red-600 dark:text-red-400"
                      }>
                        {(Number.parseFloat(rollOpeningPrice) - Number.parseFloat(rollClosingPrice)) >= 0 ? "+" : ""}
                        ${((Number.parseFloat(rollOpeningPrice) - Number.parseFloat(rollClosingPrice)) * Number.parseInt(contractsToRoll) * 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="newExpiration" className="text-sm font-medium text-gray-700 dark:text-gray-300">New Expiration</Label>
                <Input
                  id="newExpiration"
                  type="date"
                  value={newExpiration}
                  onChange={(e) => setNewExpiration(e.target.value)}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="newStrike" className="text-sm font-medium text-gray-700 dark:text-gray-300">New Strike (Optional)</Label>
                <Input
                  id="newStrike"
                  type="number"
                  step="0.01"
                  value={newStrike}
                  onChange={(e) => setNewStrike(e.target.value)}
                  placeholder="Leave empty to keep current"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="rollCommission" className="text-sm font-medium text-gray-700 dark:text-gray-300">Commission</Label>
                <Input
                  id="rollCommission"
                  type="number"
                  step="0.01"
                  value={rollCommission}
                  onChange={(e) => setRollCommission(e.target.value)}
                  placeholder="Commission"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
            </div>
          )}

        </div>
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Button onClick={handleActionConfirm} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 transition-colors">
            {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
          </Button>
          <Button variant="outline" onClick={() => setShowRemoveConfirm(true)} className="border-gray-400 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
            Remove
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
