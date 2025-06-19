"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { NewTradeForm as NewTradeFormType } from "@/types/dashboard"

interface NewTradeFormProps {
  newTrade: NewTradeFormType
  setNewTrade: (trade: NewTradeFormType) => void
  onAddTrade: (newTrade: NewTradeFormType) => void
  onClearForm: () => void
}

export const NewTradeForm = ({
  newTrade,
  setNewTrade,
  onAddTrade,
  onClearForm,
}: NewTradeFormProps) => {
  return (
    <Card className="bg-white/90 dark:bg-gray-900/90 border-gray-200/50 dark:border-gray-800/50 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          New Trade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="symbol" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Symbol
            </Label>
            <Input
              id="symbol"
              placeholder="AAPL"
              value={newTrade.symbol}
              onChange={(e) => setNewTrade({ ...newTrade, symbol: e.target.value.toUpperCase() })}
              className="h-9 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
            />
          </div>
          <div>
            <Label htmlFor="type" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Type
            </Label>
            <Select
              value={newTrade.type}
              onValueChange={(value: "Call" | "Put" | "Stock") => {
                setNewTrade({ ...newTrade, type: value, side: value === "Stock" ? "BTO" : "STO" });
              }}
            >
              <SelectTrigger className="h-9 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Stock">Stock</SelectItem>
                <SelectItem value="Call">Call</SelectItem>
                <SelectItem value="Put">Put</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {newTrade.type === "Stock" && (
          <div>
            <Label htmlFor="stockAction" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Action
            </Label>
            <Select
              value={newTrade.stockAction}
              onValueChange={(value: "Buy" | "Sell") => setNewTrade({ ...newTrade, stockAction: value, side: value === "Buy" ? "BTO" : "STO" })}
            >
              <SelectTrigger className="h-9 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Buy">Buy</SelectItem>
                <SelectItem value="Sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {newTrade.type !== "Stock" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="side" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Side
              </Label>
              <Select
                value={newTrade.side}
                onValueChange={(value: "STO" | "BTO") => setNewTrade({ ...newTrade, side: value })}
              >
                <SelectTrigger className="h-9 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STO">STO (Sell)</SelectItem>
                  <SelectItem value="BTO">BTO (Buy)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="strike" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Strike
              </Label>
              <Input
                id="strike"
                placeholder="185"
                value={newTrade.strikePrice}
                onChange={(e) => setNewTrade({ ...newTrade, strikePrice: e.target.value })}
                className="h-9 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="startDate" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={newTrade.startDate}
              onChange={(e) => setNewTrade({ ...newTrade, startDate: e.target.value })}
              className="h-9 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
            />
          </div>
          <div>
            <Label htmlFor="price" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {newTrade.type === "Stock" ? "Price per share" : "Price"}
            </Label>
            <Input
              id="price"
              placeholder={newTrade.type === "Stock" ? "178.45" : "2.50"}
              value={newTrade.price}
              onChange={(e) => setNewTrade({ ...newTrade, price: e.target.value })}
              className="h-9 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="contracts" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {newTrade.type === "Stock" ? "Shares" : "Contracts"}
            </Label>
            <Input
              id="contracts"
              placeholder="1"
              value={newTrade.contracts}
              onChange={(e) => setNewTrade({ ...newTrade, contracts: e.target.value })}
              className="h-9 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
            />
          </div>
          <div>
            <Label htmlFor="commission" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Commission
            </Label>
            <Input
              id="commission"
              placeholder="1.00"
              value={newTrade.commission}
              onChange={(e) => setNewTrade({ ...newTrade, commission: e.target.value })}
              className="h-9 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
            />
          </div>
        </div>

        {newTrade.type !== "Stock" && (
          <div>
            <Label htmlFor="expiration" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Expiration
            </Label>
            <Input
              id="expiration"
              type="date"
              value={newTrade.expirationDate}
              onChange={(e) => setNewTrade({ ...newTrade, expirationDate: e.target.value })}
              className="h-9 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
            />
          </div>
        )}

        {newTrade.type !== "Stock" && newTrade.side === "STO" && (
          <div className="space-y-3">
            {newTrade.type === "Call" && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="covered"
                  checked={newTrade.covered}
                  onCheckedChange={(checked) => setNewTrade({ ...newTrade, covered: checked })}
                  className="data-[state=checked]:bg-red-500"
                />
                <Label htmlFor="covered" className="text-xs text-gray-700 dark:text-gray-300">
                  Covered Call
                </Label>
              </div>
            )}
            {newTrade.type === "Put" && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="secured"
                  checked={newTrade.secured}
                  onCheckedChange={(checked) => setNewTrade({ ...newTrade, secured: checked })}
                  className="data-[state=checked]:bg-red-500"
                />
                <Label htmlFor="secured" className="text-xs text-gray-700 dark:text-gray-300">
                  Cash Secured
                </Label>
              </div>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="notes" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Optional notes..."
            value={newTrade.notes}
            onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })}
            className="h-16 text-sm resize-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onAddTrade(newTrade)}
            className="flex-1 h-9 text-sm bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            Add Trade
          </Button>
          <Button
            onClick={onClearForm}
            variant="outline"
            className="h-9 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 