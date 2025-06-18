import type { Trade } from "../types/trade"

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export const getStatusColor = (status: string): string => {
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

export const getPLColor = (value: number): string => {
  return value >= 0 ? "text-green-600" : "text-red-600"
}

export const formatTradeNomenclature = (trade: Trade, includePrice = true): string => {
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

export const getTradeId = (trade: Trade): string => {
  return formatTradeNomenclature(trade, false)
}

export const getContractDisplay = (trade: Trade): string => {
  if (trade.type === "Stock") return trade.contracts.toString()
  const sign = trade.contracts < 0 ? "-" : "+"
  return `${sign}${Math.abs(trade.contracts)}`
} 