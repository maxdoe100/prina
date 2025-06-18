import type { AppSettings, Trade, NewTradeForm } from "../types/trade"

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultCommission: 1.0,
  riskAlerts: true,
  emailNotifications: false,
  darkMode: false,
}

export const DEFAULT_PORTFOLIO_VALUES = {
  portfolioValue: 125430.5,
  cash: 15230.75,
  lockedCollateral: 28500.0,
  premiumCollected: 3420.25,
}

export const MOCK_TRADES: Trade[] = [
  {
    id: "1",
    symbol: "AAPL",
    side: "STO",
    type: "Call",
    startDate: "2024-01-15",
    strikePrice: 185,
    price: 2.5,
    contracts: -3,
    expirationDate: "2024-01-19",
    status: "open",
    premium: 748,
    commission: 2,
    notes: "Covered call on existing position",
    covered: true,
  },
  {
    id: "2",
    symbol: "MSFT",
    side: "STO",
    type: "Put",
    startDate: "2024-01-10",
    strikePrice: 350,
    price: 4.2,
    contracts: 1,
    expirationDate: "2024-01-26",
    status: "open",
    premium: 419,
    commission: 1,
    notes: "Cash-secured put",
    secured: true,
  },
  {
    id: "3",
    symbol: "AAPL",
    side: "BTO",
    type: "Stock",
    startDate: "2024-01-05",
    price: 178.45,
    contracts: 150,
    status: "open",
    premium: -26767.5,
    commission: 10,
    notes: "Initial stock purchase",
  },
]

export const createDefaultNewTrade = (defaultCommission: number): NewTradeForm => ({
  symbol: "",
  side: "STO",
  type: "Call",
  startDate: new Date().toISOString().split("T")[0],
  strikePrice: "",
  price: "",
  contracts: "1",
  expirationDate: "",
  commission: defaultCommission.toString(),
  notes: "",
  covered: false,
  secured: false,
  stockAction: "Buy",
})

export const PRICING_PLANS = {
  free: {
    name: "Free Plan",
    price: 0,
    features: [
      "Up to 10 trades per month",
      "Basic cost basis tracking", 
      "Portfolio overview",
    ],
    limitations: [
      "Advanced analytics",
      "Real-time data",
    ],
  },
  pro: {
    name: "Pro Plan", 
    price: 29,
    features: [
      "Unlimited trades",
      "Advanced cost basis tracking",
      "Real-time market data",
      "Risk management alerts", 
      "Advanced analytics",
      "Export capabilities",
    ],
    limitations: [],
  },
} 