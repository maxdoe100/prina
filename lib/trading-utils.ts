import { Trade, Position } from "@/types/dashboard"

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "closed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "expired":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    case "assigned":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

export const getPLColor = (value: number) => {
  return value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
}

export const formatTradeNomenclature = (trade: Trade, includePrice = true) => {
  if (trade.type === "Stock") return trade.symbol

  const expDate = new Date(trade.expirationDate || "")
  const month = expDate.toLocaleDateString("en-US", { month: "short" })
  const day = expDate.getDate()
  const year = expDate.getFullYear().toString().slice(-2)
  const typeSymbol = trade.type === "Call" ? "C" : "P"

  const baseNomenclature = `${month} ${day} '${year} ${trade.strikePrice}${typeSymbol}`

  if (includePrice) {
    return `${baseNomenclature} @$${trade.price.toFixed(2)}`
  }

  return baseNomenclature
}

export const isExpiringWithin5Days = (expirationDate?: string) => {
  if (!expirationDate) return false
  const expDate = new Date(expirationDate)
  const now = new Date()
  const fiveDaysFromNow = new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000))
  return expDate <= fiveDaysFromNow && expDate >= now
}

export const getTradeId = (trade: Trade) => {
  return formatTradeNomenclature(trade, false)
}

export const getContractDisplay = (trade: Trade) => {
  if (trade.type === "Stock") return trade.contracts.toString()
  const sign = trade.contracts < 0 ? "-" : "+"
  return `${sign}${Math.abs(trade.contracts)}`
}

export const getRemainingDays = (expirationDate?: string) => {
  if (!expirationDate) return null
  const expDate = new Date(expirationDate)
  const now = new Date()
  const diffTime = expDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export const getRandomPrice = (symbol: string) => {
  // Mock price generator
  const basePrices: { [key: string]: number } = {
    AAPL: 182.5,
    MSFT: 358.75,
    GOOGL: 142.3,
    TSLA: 248.5,
  }
  return basePrices[symbol] || 100 + Math.random() * 200
}

export const calculateTotalPL = (position: Position) => {
  // Calculate stock P/L
  const stockPL = position.shares > 0
    ? (position.currentPrice - position.avgCostBasis) * position.shares
    : 0

  // Calculate options P/L (premiums received/paid)
  const optionsPL = position.premiumsReceived

  // Total P/L
  return stockPL + optionsPL
}

export const updatePositions = (trades: Trade[]) => {
  const positionMap = new Map<string, Position>()

  trades.forEach((trade) => {
    if (trade.symbol === "CASH") {
      return // Skip cash trades for positions
    }
    if (!positionMap.has(trade.symbol)) {
      positionMap.set(trade.symbol, {
        symbol: trade.symbol,
        shares: 0,
        avgCostBasis: 0,
        originalCostBasis: 0,
        premiumsReceived: 0,
        openOptions: [],
        currentPrice: getRandomPrice(trade.symbol), // Mock price
        proposedCostBasis: 0,
      })
    }

    const position = positionMap.get(trade.symbol)!

    if (trade.type === "Stock" && trade.status === "open") {
      const currentTotalValue = position.shares * position.avgCostBasis
      const newShares = trade.contracts // This can be positive (buy) or negative (sell)
      const newTradeValue = newShares * trade.price

      const totalSharesAfterTrade = position.shares + newShares

      if (totalSharesAfterTrade === 0) {
        position.shares = 0
        position.avgCostBasis = 0
        position.originalCostBasis = 0 // Reset if all shares are sold
      } else {
        position.avgCostBasis = (currentTotalValue + newTradeValue) / totalSharesAfterTrade
        position.shares = totalSharesAfterTrade
      }
    } else if (trade.type !== "Stock") {
      if (trade.status === "open") {
        position.openOptions.push(trade)
      }
      if (trade.side === "STO") {
        position.premiumsReceived += trade.premium
      }
    }

    // Calculate proposed cost basis for puts
    if (trade.type === "Put" && trade.side === "STO" && trade.status === "open" && trade.strikePrice) {
      position.proposedCostBasis = trade.strikePrice - trade.price
    }
  })

  return Array.from(positionMap.values())
} 