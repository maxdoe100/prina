export interface Trade {
  id: string
  symbol: string
  side: "STO" | "BTO"
  type: "Call" | "Put" | "Stock"
  startDate: string
  strikePrice?: number
  price: number
  contracts: number
  expirationDate?: string
  status: "open" | "closed" | "expired" | "assigned"
  premium: number
  commission: number
  notes?: string
  covered?: boolean
  secured?: boolean
  closingPrice?: number
}

export interface Position {
  symbol: string
  shares: number
  avgCostBasis: number
  originalCostBasis: number
  premiumsReceived: number
  openOptions: Trade[]
  currentPrice: number
  proposedCostBasis?: number
}

export interface AppSettings {
  defaultCommission: number
  riskAlerts: boolean
  emailNotifications: boolean
  darkMode: boolean
}

export interface NewTradeForm {
  symbol: string
  side: "STO" | "BTO"
  type: "Call" | "Put" | "Stock"
  startDate: string
  strikePrice: string
  price: string
  contracts: string
  expirationDate: string
  commission: string
  notes: string
  covered: boolean
  secured: boolean
  stockAction: "Buy" | "Sell"
}

export interface EditTradeForm {
  type: "Call" | "Put" | "Stock"
  side: "STO" | "BTO"
  strikePrice: string
  startDate: string
  expirationDate: string
  price: string
  commission: string
}

export interface TradeSummaryData {
  trade: Trade
  cashImpact: number
  collateralImpact: number
  netCredit: number
  netDebit: number
  commission: number
  stockPurchase?: {
    shares: number
    price: number
  }
}

export interface EditSummaryData {
  originalTrade: Trade
  editedTrade: Trade
  premiumDifference: number
  cashImpact: number
}

export type CashAction = "deposit" | "withdraw"
export type TradeActionType = "close" | "assign" | "roll"
export type Timeframe = "1M" | "3M" | "1Y" | "All" 