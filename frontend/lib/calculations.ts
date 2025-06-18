import type { Trade, Position, Timeframe } from "../types/trade"

export const getRandomPrice = (symbol: string): number => {
  // Mock price generator
  const basePrices: { [key: string]: number } = {
    AAPL: 182.5,
    MSFT: 358.75,
    GOOGL: 142.3,
    TSLA: 248.5,
  }
  return basePrices[symbol] || 100 + Math.random() * 200
}

export const calculateTotalPL = (position: Position): number => {
  // Calculate stock P/L
  const stockPL = position.shares > 0
    ? (position.currentPrice - position.avgCostBasis) * position.shares
    : 0

  // Calculate options P/L (premiums received/paid)
  const optionsPL = position.premiumsReceived

  // Total P/L
  return stockPL + optionsPL
}

export const isExpiringWithin5Days = (expirationDate?: string): boolean => {
  if (!expirationDate) return false
  const expDate = new Date(expirationDate)
  const now = new Date()
  const fiveDaysFromNow = new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000))
  return expDate <= fiveDaysFromNow && expDate >= now
}

export const getRemainingDays = (expirationDate?: string): number | null => {
  if (!expirationDate) return null
  const expDate = new Date(expirationDate)
  const now = new Date()
  const diffTime = expDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export const getFilteredTrades = (trades: Trade[], timeframe: Timeframe): Trade[] => {
  const now = new Date()
  const cutoffDate = new Date()

  switch (timeframe) {
    case "1M":
      cutoffDate.setMonth(now.getMonth() - 1)
      break
    case "3M":
      cutoffDate.setMonth(now.getMonth() - 3)
      break
    case "1Y":
      cutoffDate.setFullYear(now.getFullYear() - 1)
      break
    case "All":
      return trades
    default:
      return trades
  }

  return trades.filter((trade) => new Date(trade.startDate) >= cutoffDate)
}

export const getFilteredPremium = (trades: Trade[], timeframe: Timeframe): number => {
  const filteredTrades = getFilteredTrades(trades, timeframe)
  return filteredTrades
    .filter((trade) => trade.side === "STO" && trade.premium > 0)
    .reduce((sum, trade) => sum + trade.premium, 0)
} 