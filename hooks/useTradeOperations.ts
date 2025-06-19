import { Trade, Position, NewTradeForm, EditTradeForm, TradeSummaryData, EditSummaryData } from "@/types/dashboard"

interface UseTradeOperationsProps {
  trades: Trade[]
  setTrades: (trades: Trade[] | ((prev: Trade[]) => Trade[])) => void
  positions: Position[]
  cash: number
  setCash: (cash: number | ((prev: number) => number)) => void
  lockedCollateral: number
  setLockedCollateral: (collateral: number | ((prev: number) => number)) => void
  premiumCollected: number
  setPremiumCollected: (premium: number | ((prev: number) => number)) => void
  setAnimatingTrade: (id: string | null) => void
  setTradeSummaryData: (data: TradeSummaryData | null) => void
  setShowTradeSummary: (show: boolean) => void
  setEditSummaryData: (data: EditSummaryData | null) => void
  setShowEditSummary: (show: boolean) => void
  setShowEditTrade: (show: boolean) => void
  setEditingTrade: (trade: Trade | null) => void
  defaultCommission: number
}

export const useTradeOperations = ({
  trades,
  setTrades,
  positions,
  cash,
  setCash,
  lockedCollateral,
  setLockedCollateral,
  premiumCollected,
  setPremiumCollected,
  setAnimatingTrade,
  setTradeSummaryData,
  setShowTradeSummary,
  setEditSummaryData,
  setShowEditSummary,
  setShowEditTrade,
  setEditingTrade,
  defaultCommission,
}: UseTradeOperationsProps) => {

  const handleAddTrade = (newTrade: NewTradeForm) => {
    if (!newTrade.symbol || !newTrade.price) return

    const isStock = newTrade.type === "Stock"
    const contractMultiplier = isStock ? 1 : 100
    const parsedContracts = Number.parseInt(newTrade.contracts)
    const parsedPrice = Number.parseFloat(newTrade.price)
    const commission = Number.parseFloat(newTrade.commission)

    let effectiveContracts = parsedContracts
    let premium: number

    if (isStock) {
      if (newTrade.stockAction === "Sell") {
        const currentPosition = positions.find(p => p.symbol === newTrade.symbol.toUpperCase())
        if (!currentPosition || currentPosition.shares < parsedContracts) {
          alert(`Error: Not enough shares of ${newTrade.symbol} to sell. You have ${currentPosition?.shares || 0} shares.`)
          return
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

    let collateralImpact = 0
    if (newTrade.type === "Put" && newTrade.side === "STO" && newTrade.secured && newTrade.strikePrice) {
      collateralImpact = Number.parseFloat(newTrade.strikePrice) * 100 * Math.abs(parsedContracts)
      
      if (cash < collateralImpact) {
        alert(`Error: Insufficient cash for collateral requirement. Need $${collateralImpact.toFixed(2)} but only have $${cash.toFixed(2)} available.`)
        return
      }
    }

    let stockPurchase: { shares: number; price: number } | undefined = undefined
    if (newTrade.type === "Call" && newTrade.side === "STO" && newTrade.covered) {
      const requiredShares = Math.abs(parsedContracts) * 100
      const currentPosition = positions.find(p => p.symbol === newTrade.symbol.toUpperCase())
      const availableShares = currentPosition?.shares || 0

      if (availableShares < requiredShares) {
        const sharesToBuy = requiredShares - availableShares
        stockPurchase = {
          shares: sharesToBuy,
          price: currentPosition?.currentPrice || 100,
        }
      }
    }

    const summaryData: TradeSummaryData = {
      trade,
      cashImpact: premium,
      collateralImpact,
      netCredit: premium > 0 ? premium : 0,
      netDebit: premium < 0 ? Math.abs(premium) : 0,
      commission,
      stockPurchase,
    }

    setTradeSummaryData(summaryData)
    setShowTradeSummary(true)
  }

  const confirmTrade = (tradeSummaryData: TradeSummaryData) => {
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
    
    if (trade.type === "Put" && trade.side === "STO" && trade.secured && collateralImpact > 0) {
      setCash(prev => prev + cashImpact - collateralImpact)
    } else {
      setCash(prev => prev + totalCashImpact)
    }

    if (collateralImpact > 0) {
      setLockedCollateral(prev => prev + collateralImpact)
    }

    if (cashImpact > 0) {
      setPremiumCollected(prev => prev + cashImpact)
    }

    setShowTradeSummary(false)
    setTradeSummaryData(null)
  }

  const handleEditTradeSubmit = (editingTrade: Trade, editTradeForm: EditTradeForm) => {
    const originalTrade = editingTrade
    const newPrice = Number.parseFloat(editTradeForm.price)
    const newCommission = Number.parseFloat(editTradeForm.commission)
    const newStrike = editTradeForm.strikePrice ? Number.parseFloat(editTradeForm.strikePrice) : undefined

    const originalPremium = originalTrade.premium

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

    const premiumDifference = newPremium - originalPremium

    const editSummary: EditSummaryData = {
      originalTrade,
      editedTrade: {
        ...originalTrade,
        type: editTradeForm.type,
        side: editTradeForm.side,
        strikePrice: newStrike,
        startDate: editTradeForm.startDate,
        expirationDate: editTradeForm.expirationDate,
        price: newPrice,
        commission: newCommission,
        premium: newPremium,
      },
      premiumDifference,
      cashImpact: premiumDifference,
    }

    setEditSummaryData(editSummary)
    setShowEditSummary(true)
  }

  const confirmEditTrade = (editSummaryData: EditSummaryData) => {
    const { editedTrade, premiumDifference } = editSummaryData

    setTrades(prev => prev.map(trade => 
      trade.id === editedTrade.id ? editedTrade : trade
    ))

    setCash(prev => prev + premiumDifference)

    if (premiumDifference > 0) {
      setPremiumCollected(prev => prev + premiumDifference)
    }

    setShowEditTrade(false)
    setShowEditSummary(false)
    setEditingTrade(null)
    setEditSummaryData(null)
  }

  const handleEditTrade = (trade: Trade, editTradeForm: EditTradeForm, setEditTradeForm: (form: EditTradeForm) => void) => {
    setEditingTrade(trade)
    setEditTradeForm({
      type: trade.type,
      side: trade.side,
      strikePrice: trade.strikePrice?.toString() || "",
      startDate: trade.startDate,
      expirationDate: trade.expirationDate || "",
      price: trade.price.toString(),
      commission: trade.commission.toString(),
    })
    setShowEditTrade(true)
  }

  const handleCloseTrade = (tradeId: string, closingPrice: number) => {
    setTrades(prev =>
      prev.map(trade => {
        if (trade.id === tradeId) {
          if (trade.type === "Put" && trade.side === "STO" && trade.secured && trade.strikePrice) {
            const collateralToRelease = trade.strikePrice * 100 * Math.abs(trade.contracts)
            setLockedCollateral(current => current - collateralToRelease)
          }
          return { ...trade, status: "closed" as const, closingPrice }
        }
        return trade
      })
    )
  }

  const handleAssignTrade = (tradeId: string) => {
    setTrades(prev => prev.map(trade => {
      if (trade.id === tradeId) {
        if (trade.type === "Put" && trade.side === "STO" && trade.secured && trade.strikePrice) {
          const collateralUsed = trade.strikePrice * 100 * Math.abs(trade.contracts)
          
          setLockedCollateral(current => current - collateralUsed)
          
          const stockPurchase: Trade = {
            id: (Date.now() + 1).toString(),
            symbol: trade.symbol,
            side: "BTO",
            type: "Stock",
            startDate: new Date().toISOString().split("T")[0],
            price: trade.strikePrice,
            contracts: Math.abs(trade.contracts) * 100,
            status: "open",
            premium: -collateralUsed,
            commission: 0,
            notes: `Stock purchased via put assignment at $${trade.strikePrice}`,
          }
          
          setTrades(current => [...current, stockPurchase])
        }
        return { ...trade, status: "assigned" as const }
      }
      return trade
    }))
  }

  const handleRollTrade = (tradeId: string, newExpiration: string, newStrike?: number, rollData?: { closingPrice?: number; openingPrice?: number }) => {
    console.log("Rolling trade", tradeId, newExpiration, newStrike, rollData)
  }

  const handleRemoveTrade = (tradeToRemove: Trade) => {
    setCash(prev => prev - tradeToRemove.premium)

    if (tradeToRemove.type === "Put" && tradeToRemove.side === "STO" && tradeToRemove.secured && tradeToRemove.strikePrice) {
      const collateralImpact = tradeToRemove.strikePrice * 100 * Math.abs(tradeToRemove.contracts)
      setLockedCollateral(prev => prev - collateralImpact)
      setCash(prev => prev + collateralImpact)
    }

    if (tradeToRemove.premium > 0) {
      setPremiumCollected(prev => prev - tradeToRemove.premium)
    }

    setTrades(prev => prev.filter(t => t.id !== tradeToRemove.id))
  }

  const handleCashTransaction = (cashAction: "deposit" | "withdraw", amount: number) => {
    if (!amount || amount <= 0) return

    const cashTrade: Trade = {
      id: Date.now().toString(),
      symbol: "CASH",
      side: cashAction === "deposit" ? "BTO" : "STO",
      type: "Stock",
      startDate: new Date().toISOString().split("T")[0],
      price: 1,
      contracts: cashAction === "deposit" ? amount : -amount,
      status: "closed",
      premium: cashAction === "deposit" ? amount : -amount,
      commission: 0,
      notes: `Cash ${cashAction}`,
    }

    setTrades(prev => [...prev, cashTrade])

    if (cashAction === "deposit") {
      setCash(prev => prev + amount)
    } else {
      setCash(prev => Math.max(0, prev - amount))
    }
  }

  const clearForm = () => {
    // This is a placeholder - actual clearForm implementation should be in the component that needs it
    // For now, we'll just return this function so it exists
  }

  return {
    handleAddTrade,
    confirmTrade,
    handleEditTradeSubmit,
    confirmEditTrade,
    handleEditTrade,
    handleCloseTrade,
    handleAssignTrade,
    handleRollTrade,
    handleRemoveTrade,
    handleCashTransaction,
    clearForm,
  }
} 