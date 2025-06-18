import { useState, useCallback } from "react"
import type { Trade, NewTradeForm, TradeSummaryData, EditTradeForm, EditSummaryData, Position } from "../types/trade"
import { getRandomPrice } from "../lib/calculations"

interface UseTradeManagementProps {
  trades: Trade[]
  setTrades: React.Dispatch<React.SetStateAction<Trade[]>>
  positions: Position[]
  cash: number
  setCash: React.Dispatch<React.SetStateAction<number>>
  lockedCollateral: number
  setLockedCollateral: React.Dispatch<React.SetStateAction<number>>
  premiumCollected: number
  setPremiumCollected: React.Dispatch<React.SetStateAction<number>>
}

export const useTradeManagement = ({
  trades,
  setTrades,
  positions,
  cash,
  setCash,
  lockedCollateral,
  setLockedCollateral,
  premiumCollected,
  setPremiumCollected,
}: UseTradeManagementProps) => {
  const [animatingTrade, setAnimatingTrade] = useState<string | null>(null)

  const validateStockSale = useCallback((symbol: string, shares: number): boolean => {
    const currentPosition = positions.find(p => p.symbol === symbol.toUpperCase())
    if (!currentPosition || currentPosition.shares < shares) {
      alert(`Error: Not enough shares of ${symbol} to sell. You have ${currentPosition?.shares || 0} shares.`)
      return false
    }
    return true
  }, [positions])

  const calculateTradeFinancials = useCallback((newTrade: NewTradeForm) => {
    const isStock = newTrade.type === "Stock"
    const contractMultiplier = isStock ? 1 : 100
    const parsedContracts = Number.parseInt(newTrade.contracts)
    const parsedPrice = Number.parseFloat(newTrade.price)
    const commission = Number.parseFloat(newTrade.commission)

    let effectiveContracts = parsedContracts
    let premium: number

    if (isStock) {
      if (newTrade.stockAction === "Sell") {
        if (!validateStockSale(newTrade.symbol, parsedContracts)) {
          return null
        }
        effectiveContracts = -parsedContracts
        premium = (parsedPrice * parsedContracts) - commission
      } else {
        premium = -(parsedPrice * parsedContracts + commission)
      }
    } else {
      const baseValue = parsedPrice * Math.abs(parsedContracts) * contractMultiplier
      premium = newTrade.side === "STO" ? baseValue - commission : -(baseValue + commission)
      
      if (newTrade.side === "STO") {
        effectiveContracts = -Math.abs(parsedContracts)
      }
    }

    // Calculate collateral impact
    let collateralImpact = 0
    if (newTrade.type === "Put" && newTrade.side === "STO" && newTrade.secured && newTrade.strikePrice) {
      collateralImpact = Number.parseFloat(newTrade.strikePrice) * 100 * Math.abs(parsedContracts)
    }

    // Check for covered call stock requirement
    let stockPurchase = null
    if (newTrade.type === "Call" && newTrade.side === "STO" && newTrade.covered) {
      const requiredShares = Math.abs(parsedContracts) * 100
      const currentPosition = positions.find(p => p.symbol === newTrade.symbol.toUpperCase())
      const availableShares = currentPosition?.shares || 0

      if (availableShares < requiredShares) {
        const sharesToBuy = requiredShares - availableShares
        stockPurchase = {
          shares: sharesToBuy,
          price: currentPosition?.currentPrice || getRandomPrice(newTrade.symbol.toUpperCase()),
        }
      }
    }

    const trade: Trade = {
      id: Date.now().toString(),
      symbol: newTrade.symbol.toUpperCase(),
      side: newTrade.side,
      type: newTrade.type,
      startDate: newTrade.startDate,
      strikePrice: isStock ? undefined : Number.parseFloat(newTrade.strikePrice),
      price: parsedPrice,
      contracts: effectiveContracts,
      expirationDate: isStock ? undefined : newTrade.expirationDate,
      status: "open",
      premium,
      commission,
      notes: newTrade.notes,
      covered: newTrade.covered,
      secured: newTrade.secured,
    }

    return {
      trade,
      cashImpact: premium,
      collateralImpact,
      netCredit: premium > 0 ? premium : 0,
      netDebit: premium < 0 ? Math.abs(premium) : 0,
      commission,
      stockPurchase,
    }
  }, [positions, validateStockSale])

  const confirmTrade = useCallback((tradeSummaryData: TradeSummaryData) => {
    const { trade, cashImpact, collateralImpact, stockPurchase } = tradeSummaryData

    setAnimatingTrade(trade.id)
    setTimeout(() => setAnimatingTrade(null), 2000)

    const tradesToAdd = [trade]

    if (stockPurchase) {
      const stockTrade: Trade = {
        id: (Date.now() + 1).toString(),
        symbol: trade.symbol,
        side: "BTO",
        type: "Stock",
        startDate: trade.startDate,
        price: stockPurchase.price,
        contracts: stockPurchase.shares,
        status: "open",
        premium: -(stockPurchase.price * stockPurchase.shares + 1),
        commission: 1,
        notes: `Auto-purchase for covered call`,
      }
      tradesToAdd.push(stockTrade)
    }

    setTrades(prev => [...prev, ...tradesToAdd])

    let totalCashImpact = cashImpact
    if (stockPurchase) {
      totalCashImpact -= (stockPurchase.price * stockPurchase.shares + 1)
    }
    setCash(prev => prev + totalCashImpact)

    if (collateralImpact > 0) {
      setLockedCollateral(prev => prev + collateralImpact)
    }

    if (cashImpact > 0) {
      setPremiumCollected(prev => prev + cashImpact)
    }
  }, [setTrades, setCash, setLockedCollateral, setPremiumCollected])

  const handleCloseTrade = useCallback((tradeId: string, closingPrice: number) => {
    setTrades(prev =>
      prev.map(trade => trade.id === tradeId ? { ...trade, status: "closed", closingPrice } : trade)
    )
  }, [setTrades])

  const handleAssignTrade = useCallback((tradeId: string) => {
    setTrades(prev => prev.map(trade => trade.id === tradeId ? { ...trade, status: "assigned" } : trade))
  }, [setTrades])

  const handleRollTrade = useCallback((tradeId: string, newExpiration: string, newStrike?: number) => {
    console.log("Rolling trade", tradeId, newExpiration, newStrike)
  }, [])

  const removeTrade = useCallback((tradeToRemove: Trade) => {
    setCash(prev => prev - tradeToRemove.premium)

    if (tradeToRemove.type === "Put" && tradeToRemove.side === "STO" && tradeToRemove.secured && tradeToRemove.strikePrice) {
      const collateralImpact = tradeToRemove.strikePrice * 100 * Math.abs(tradeToRemove.contracts)
      setLockedCollateral(prev => prev - collateralImpact)
    }

    if (tradeToRemove.premium > 0) {
      setPremiumCollected(prev => prev - tradeToRemove.premium)
    }

    setTrades(prev => prev.filter(t => t.id !== tradeToRemove.id))
  }, [setCash, setLockedCollateral, setPremiumCollected, setTrades])

  const calculateEditTradeFinancials = useCallback((originalTrade: Trade, editForm: EditTradeForm): EditSummaryData => {
    const newPrice = Number.parseFloat(editForm.price)
    const newCommission = Number.parseFloat(editForm.commission)
    const newStrike = editForm.strikePrice ? Number.parseFloat(editForm.strikePrice) : undefined

    const contractMultiplier = originalTrade.type === "Stock" ? 1 : 100
    let newPremium: number

    if (originalTrade.type === "Stock") {
      newPremium = originalTrade.contracts > 0 
        ? -(newPrice * Math.abs(originalTrade.contracts) + newCommission)
        : (newPrice * Math.abs(originalTrade.contracts)) - newCommission
    } else {
      const baseValue = newPrice * Math.abs(originalTrade.contracts) * contractMultiplier
      newPremium = originalTrade.side === "STO" ? baseValue - newCommission : -(baseValue + newCommission)
    }

    const premiumDifference = newPremium - originalTrade.premium

    return {
      originalTrade,
      editedTrade: {
        ...originalTrade,
        type: editForm.type,
        side: editForm.side,
        strikePrice: newStrike,
        startDate: editForm.startDate,
        expirationDate: editForm.expirationDate,
        price: newPrice,
        commission: newCommission,
        premium: newPremium,
      },
      premiumDifference,
      cashImpact: premiumDifference,
    }
  }, [])

  const confirmEditTrade = useCallback((editSummaryData: EditSummaryData) => {
    const { editedTrade, premiumDifference } = editSummaryData

    setTrades(prev => prev.map(trade => 
      trade.id === editedTrade.id ? editedTrade : trade
    ))

    setCash(prev => prev + premiumDifference)

    if (premiumDifference > 0) {
      setPremiumCollected(prev => prev + premiumDifference)
    }
  }, [setTrades, setCash, setPremiumCollected])

  return {
    animatingTrade,
    calculateTradeFinancials,
    confirmTrade,
    handleCloseTrade,
    handleAssignTrade,
    handleRollTrade,
    removeTrade,
    calculateEditTradeFinancials,
    confirmEditTrade,
  }
} 