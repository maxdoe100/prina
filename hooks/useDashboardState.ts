import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trade, Position, AppSettings, NewTradeForm, EditTradeForm, TradeSummaryData, EditSummaryData } from "@/types/dashboard"
import { updatePositions } from "@/lib/trading-utils"

const initialAppSettings: AppSettings = {
  defaultCommission: 1.0,
  riskAlerts: true,
  emailNotifications: false,
  darkMode: false,
}

const initialTrades: Trade[] = [
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

export const useDashboardState = () => {
  const router = useRouter()
  
  // Main state
  const [activeTab, setActiveTab] = useState("positions")
  const [portfolioValue, setPortfolioValue] = useState(125430.5)
  const [cash, setCash] = useState(15230.75)
  const [lockedCollateral, setLockedCollateral] = useState(28500.0)
  const [premiumCollected, setPremiumCollected] = useState(3420.25)
  const [timeframe, setTimeframe] = useState("1M")
  const [includePremiums, setIncludePremiums] = useState(true)
  const [animatingTrade, setAnimatingTrade] = useState<string | null>(null)

  // Modal states
  const [showSettings, setShowSettings] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showCashModal, setShowCashModal] = useState(false)
  const [showTradeSummary, setShowTradeSummary] = useState(false)
  const [showEditTrade, setShowEditTrade] = useState(false)
  const [showEditSummary, setShowEditSummary] = useState(false)

  // Cash transaction state
  const [cashAction, setCashAction] = useState<"deposit" | "withdraw">("deposit")
  const [cashAmount, setCashAmount] = useState("")

  // Trade management state
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [tradeSummaryData, setTradeSummaryData] = useState<TradeSummaryData | null>(null)
  const [editSummaryData, setEditSummaryData] = useState<EditSummaryData | null>(null)

  // Data state
  const [appSettings, setAppSettings] = useState<AppSettings>(initialAppSettings)
  const [trades, setTrades] = useState<Trade[]>(initialTrades)
  const [positions, setPositions] = useState<Position[]>([])

  // Form state
  const [newTrade, setNewTrade] = useState<NewTradeForm>({
    symbol: "",
    side: "STO",
    type: "Call",
    startDate: new Date().toISOString().split("T")[0],
    strikePrice: "",
    price: "",
    contracts: "1",
    expirationDate: "",
    commission: initialAppSettings.defaultCommission.toString(),
    notes: "",
    covered: false,
    secured: false,
    stockAction: "Buy",
  })

  const [editTradeForm, setEditTradeForm] = useState<EditTradeForm>({
    type: "Call",
    side: "STO",
    strikePrice: "",
    startDate: "",
    expirationDate: "",
    price: "",
    commission: "",
  })

  // Update positions when trades change
  useEffect(() => {
    const updatedPositions = updatePositions(trades)
    setPositions(updatedPositions)
  }, [trades])

  // Helper functions for filtered data
  const getFilteredTrades = () => {
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

  const getFilteredPremium = () => {
    const filteredTrades = getFilteredTrades()
    return filteredTrades
      .filter((trade) => trade.side === "STO" && trade.premium > 0)
      .reduce((sum, trade) => sum + trade.premium, 0)
  }

  const clearForm = () => {
    setNewTrade({
      symbol: "",
      side: "STO",
      type: "Call",
      startDate: new Date().toISOString().split("T")[0],
      strikePrice: "",
      price: "",
      contracts: "1",
      expirationDate: "",
      commission: appSettings.defaultCommission.toString(),
      notes: "",
      covered: false,
      secured: false,
      stockAction: "Buy",
    })
  }

  return {
    // State
    activeTab,
    setActiveTab,
    portfolioValue,
    setPortfolioValue,
    cash,
    setCash,
    lockedCollateral,
    setLockedCollateral,
    premiumCollected,
    setPremiumCollected,
    timeframe,
    setTimeframe,
    includePremiums,
    setIncludePremiums,
    animatingTrade,
    setAnimatingTrade,

    // Modal states
    showSettings,
    setShowSettings,
    showPricingModal,
    setShowPricingModal,
    showCashModal,
    setShowCashModal,
    showTradeSummary,
    setShowTradeSummary,
    showEditTrade,
    setShowEditTrade,
    showEditSummary,
    setShowEditSummary,

    // Cash states
    cashAction,
    setCashAction,
    cashAmount,
    setCashAmount,

    // Trade management
    editingTrade,
    setEditingTrade,
    tradeSummaryData,
    setTradeSummaryData,
    editSummaryData,
    setEditSummaryData,

    // Data
    appSettings,
    setAppSettings,
    trades,
    setTrades,
    positions,
    setPositions,

    // Forms
    newTrade,
    setNewTrade,
    editTradeForm,
    setEditTradeForm,

    // Router
    router,

    // Helper functions
    getFilteredTrades,
    getFilteredPremium,
    clearForm,
  }
} 