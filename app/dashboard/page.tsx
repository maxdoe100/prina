"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import {
  TrendingUp,
  Plus,
  Settings,
  Moon,
  Sun,
  Wallet,
  Lock,
  ArrowUpRight,
  X,
  RotateCcw,
  Calendar,
  AlertTriangle,
  Crown,
  CreditCard,
  ArrowDownLeft,
  ArrowUpLeft,
  DollarSign,
  ArrowDown,
  Edit,
} from "lucide-react"
import { useTheme } from "next-themes"

interface Trade {
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

interface Position {
  symbol: string
  shares: number
  avgCostBasis: number
  originalCostBasis: number
  premiumsReceived: number
  openOptions: Trade[]
  currentPrice: number
  proposedCostBasis?: number
}

interface AppSettings {
  defaultCommission: number
  riskAlerts: boolean
  emailNotifications: boolean
  darkMode: boolean
}

export default function OptionsTracker() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("positions")
  const [portfolioValue, setPortfolioValue] = useState(125430.5)
  const [cash, setCash] = useState(15230.75)
  const [lockedCollateral, setLockedCollateral] = useState(28500.0)
  const [premiumCollected, setPremiumCollected] = useState(3420.25)
  const [timeframe, setTimeframe] = useState("1M")
  const [showSettings, setShowSettings] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showCashModal, setShowCashModal] = useState(false)
  const [cashAction, setCashAction] = useState<"deposit" | "withdraw">("deposit")
  const [cashAmount, setCashAmount] = useState("")
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [includePremiums, setIncludePremiums] = useState(true)
  const [animatingTrade, setAnimatingTrade] = useState<string | null>(null)
  const [showTradeSummary, setShowTradeSummary] = useState(false)
  const [tradeSummaryData, setTradeSummaryData] = useState<any>(null)
  const [showEditTrade, setShowEditTrade] = useState(false)
  const [showEditSummary, setShowEditSummary] = useState(false)
  const [editSummaryData, setEditSummaryData] = useState<any>(null)

  const [appSettings, setAppSettings] = useState<AppSettings>({
    defaultCommission: 1.0,
    riskAlerts: true,
    emailNotifications: false,
    darkMode: false,
  })

  const [trades, setTrades] = useState<Trade[]>([
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
  ])

  const [positions, setPositions] = useState<Position[]>([])

  const [newTrade, setNewTrade] = useState({
    symbol: "",
    side: "STO" as "STO" | "BTO",
    type: "Call" as "Call" | "Put" | "Stock",
    startDate: new Date().toISOString().split("T")[0],
    strikePrice: "",
    price: "",
    contracts: "1",
    expirationDate: "",
    commission: appSettings.defaultCommission.toString(),
    notes: "",
    covered: false,
    secured: false,
    stockAction: "Buy" as "Buy" | "Sell",
  })

  const [editTradeForm, setEditTradeForm] = useState({
    type: "Call" as "Call" | "Put" | "Stock",
    side: "STO" as "STO" | "BTO",
    strikePrice: "",
    startDate: "",
    expirationDate: "",
    price: "",
    commission: "",
  })

  // Update positions when trades change
  useEffect(() => {
    updatePositions()
  }, [trades])

  const updatePositions = () => {
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

    setPositions(Array.from(positionMap.values()))
  }

  const getRandomPrice = (symbol: string) => {
    // Mock price generator
    const basePrices: { [key: string]: number } = {
      AAPL: 182.5,
      MSFT: 358.75,
      GOOGL: 142.3,
      TSLA: 248.5,
    }
    return basePrices[symbol] || 100 + Math.random() * 200
  }

  const calculateTotalPL = (position: Position) => {
    // Calculate stock P/L
    const stockPL = position.shares > 0
      ? (position.currentPrice - position.avgCostBasis) * position.shares
      : 0

    // Calculate options P/L (premiums received/paid)
    const optionsPL = position.premiumsReceived

    // Total P/L
    return stockPL + optionsPL
  }

  const handleAddTrade = () => {
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
        // Check for sufficient shares before selling
        const currentPosition = positions.find(p => p.symbol === newTrade.symbol.toUpperCase())
        if (!currentPosition || currentPosition.shares < parsedContracts) {
          alert(`Error: Not enough shares of ${newTrade.symbol} to sell. You have ${currentPosition?.shares || 0} shares.`)
          return // Stop the trade if insufficient shares
        }
        effectiveContracts = -parsedContracts // Make contracts negative for selling
        premium = (parsedPrice * parsedContracts) - commission // Cash inflow from selling
      } else { // Buy stock
        premium = -(parsedPrice * parsedContracts + commission) // Cash outflow for buying
      }
    } else { // Options trade
      const baseValue = parsedPrice * Math.abs(parsedContracts) * contractMultiplier
      premium = newTrade.side === "STO" ? baseValue - commission : -(baseValue + commission)
      
      // For STO, make contracts negative
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

    // Calculate collateral impact for cash-secured puts
    let collateralImpact = 0
    if (newTrade.type === "Put" && newTrade.side === "STO" && newTrade.secured && newTrade.strikePrice) {
      collateralImpact = Number.parseFloat(newTrade.strikePrice) * 100 * Math.abs(parsedContracts)
      
      // Check if there's enough available cash for collateral
      if (cash < collateralImpact) {
        alert(`Error: Insufficient cash for collateral requirement. Need $${collateralImpact.toFixed(2)} but only have $${cash.toFixed(2)} available.`)
        return
      }
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

    // Prepare trade summary data
    const summaryData = {
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

  const confirmTrade = () => {
    if (!tradeSummaryData) return

    const { trade, cashImpact, collateralImpact, stockPurchase } = tradeSummaryData

    // Animate trade addition
    setAnimatingTrade(trade.id)
    setTimeout(() => setAnimatingTrade(null), 2000)

    const tradesToAdd = [trade]

    // Add stock purchase if needed
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
        premium: -(stockPurchase.price * stockPurchase.shares + 1), // Include $1 commission
        commission: 1,
        notes: `Auto-purchase for covered call`,
      }
      tradesToAdd.push(stockTrade)
    }

    setTrades(prev => [...prev, ...tradesToAdd])

    // Update cash - for cash-secured puts, reduce available cash by collateral amount
    let totalCashImpact = cashImpact
    if (stockPurchase) {
      totalCashImpact -= (stockPurchase.price * stockPurchase.shares + 1)
    }
    
    // For cash-secured puts: premium is added to cash, but collateral is locked (reduces available cash)
    if (trade.type === "Put" && trade.side === "STO" && trade.secured && collateralImpact > 0) {
      // Add premium (positive cash impact) but subtract collateral requirement
      setCash((prev) => prev + cashImpact - collateralImpact)
    } else {
      setCash((prev) => prev + totalCashImpact)
    }

    // Update locked collateral
    if (collateralImpact > 0) {
      setLockedCollateral((prev) => prev + collateralImpact)
    }

    // Update premium collected
    if (cashImpact > 0) {
      setPremiumCollected((prev) => prev + cashImpact)
    }

    // Reset form and close modals
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
      stockAction: "Buy" as "Buy" | "Sell",
    })

    setShowTradeSummary(false)
    setTradeSummaryData(null)
  }

  const handleEditTradeSubmit = () => {
    if (!editingTrade) return

    const originalTrade = editingTrade
    const newPrice = Number.parseFloat(editTradeForm.price)
    const newCommission = Number.parseFloat(editTradeForm.commission)
    const newStrike = editTradeForm.strikePrice ? Number.parseFloat(editTradeForm.strikePrice) : undefined

    // Calculate original premium impact
    const originalPremium = originalTrade.premium

    // Calculate new premium impact
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

    // Prepare edit summary
    const editSummary = {
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

  const confirmEditTrade = () => {
    if (!editSummaryData) return

    const { editedTrade, premiumDifference } = editSummaryData

    // Update the trade
    setTrades(prev => prev.map(trade => 
      trade.id === editedTrade.id ? editedTrade : trade
    ))

    // Update cash with the difference
    setCash(prev => prev + premiumDifference)

    // Update premium collected if it's a credit difference
    if (premiumDifference > 0) {
      setPremiumCollected(prev => prev + premiumDifference)
    }

    setShowEditTrade(false)
    setShowEditSummary(false)
    setEditingTrade(null)
    setEditSummaryData(null)
  }

  const handleCashTransaction = () => {
    const amount = Number.parseFloat(cashAmount)
    if (!amount || amount <= 0) return

    // Create a cash transaction trade record
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
      setCash((prev) => prev + amount)
    } else {
      setCash((prev) => Math.max(0, prev - amount))
    }

    setCashAmount("")
    setShowCashModal(false)
  }

  const handleEditTrade = (trade: Trade) => {
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
    setTrades((prev) =>
      prev.map((trade) => {
        if (trade.id === tradeId) {
          // Release locked collateral when closing cash-secured puts
          if (trade.type === "Put" && trade.side === "STO" && trade.secured && trade.strikePrice) {
            const collateralToRelease = trade.strikePrice * 100 * Math.abs(trade.contracts)
            setLockedCollateral(current => current - collateralToRelease)
          }
          return { ...trade, status: "closed", closingPrice }
        }
        return trade
      }),
    )
  }

  const handleAssignTrade = (tradeId: string) => {
    setTrades((prev) => prev.map((trade) => {
      if (trade.id === tradeId) {
        // Handle assignment of cash-secured puts
        if (trade.type === "Put" && trade.side === "STO" && trade.secured && trade.strikePrice) {
          const collateralUsed = trade.strikePrice * 100 * Math.abs(trade.contracts)
          
          // Release the locked collateral (it's being used to buy the stock)
          setLockedCollateral(current => current - collateralUsed)
          
          // Create a stock purchase record using the collateral
          const stockPurchase: Trade = {
            id: (Date.now() + 1).toString(),
            symbol: trade.symbol,
            side: "BTO",
            type: "Stock",
            startDate: new Date().toISOString().split("T")[0],
            price: trade.strikePrice,
            contracts: Math.abs(trade.contracts) * 100, // Convert contracts to shares
            status: "open",
            premium: -collateralUsed, // Negative because it's a purchase using collateral
            commission: 0, // No additional commission for assignment
            notes: `Stock purchased via put assignment at $${trade.strikePrice}`,
          }
          
          // Add the stock purchase trade
          setTrades(current => [...current, stockPurchase])
        }
        return { ...trade, status: "assigned" }
      }
      return trade
    }))
  }

  const handleRollTrade = (tradeId: string, newExpiration: string, newStrike?: number, rollData?: { closingPrice?: number; openingPrice?: number }) => {
    console.log("Rolling trade", tradeId, newExpiration, newStrike, rollData)
  }

  const handleRemoveTrade = (tradeToRemove: Trade) => {
    // Reverse the cash impact - for cash-secured puts, this includes both premium and collateral
    setCash(prev => prev - tradeToRemove.premium)

    // Reverse collateral impact for cash-secured puts
    if (tradeToRemove.type === "Put" && tradeToRemove.side === "STO" && tradeToRemove.secured && tradeToRemove.strikePrice) {
      const collateralImpact = tradeToRemove.strikePrice * 100 * Math.abs(tradeToRemove.contracts)
      setLockedCollateral(prev => prev - collateralImpact)
      // For cash-secured puts, also restore the collateral amount to available cash
      setCash(prev => prev + collateralImpact)
    }

    // Reverse premium collected if applicable
    if (tradeToRemove.premium > 0) {
      setPremiumCollected(prev => prev - tradeToRemove.premium)
    }

    // Remove the trade
    setTrades(prev => prev.filter(t => t.id !== tradeToRemove.id))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
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

  const getPLColor = (value: number) => {
    return value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
  }

  const formatTradeNomenclature = (trade: Trade, includePrice = true) => {
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

  const isExpiringWithin5Days = (expirationDate?: string) => {
    if (!expirationDate) return false
    const expDate = new Date(expirationDate)
    const now = new Date()
    const fiveDaysFromNow = new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000))
    return expDate <= fiveDaysFromNow && expDate >= now
  }

  const getTradeId = (trade: Trade) => {
    return formatTradeNomenclature(trade, false)
  }

  const getContractDisplay = (trade: Trade) => {
    if (trade.type === "Stock") return trade.contracts.toString()
    const sign = trade.contracts < 0 ? "-" : "+"
    return `${sign}${Math.abs(trade.contracts)}`
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
      stockAction: "Buy" as "Buy" | "Sell",
    })
  }

  const getRemainingDays = (expirationDate?: string) => {
    if (!expirationDate) return null
    const expDate = new Date(expirationDate)
    const now = new Date()
    const diffTime = expDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const TradeActionDialog = ({ trade, onClose }: { trade: Trade; onClose: () => void }) => {
    const [actionType, setActionType] = useState<"close" | "assign" | "roll">("close")
    const [closingPrice, setClosingPrice] = useState("")
    const [newExpiration, setNewExpiration] = useState("")
    const [newStrike, setNewStrike] = useState("")
    const [closingCommission, setClosingCommission] = useState(appSettings.defaultCommission.toString())
    const [assignCommission, setAssignCommission] = useState(appSettings.defaultCommission.toString())
    const [rollCommission, setRollCommission] = useState(appSettings.defaultCommission.toString())
    const [showActionSummary, setShowActionSummary] = useState(false)
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
    const [actionSummaryData, setActionSummaryData] = useState<any>(null)
    const [contractsToClose, setContractsToClose] = useState("1")
    const [contractsToRoll, setContractsToRoll] = useState("1")
    // Enhanced roll fields
    const [rollClosingPrice, setRollClosingPrice] = useState("")
    const [rollOpeningPrice, setRollOpeningPrice] = useState("")

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

      let cashImpact = -commission // Always pay commission
      let collateralReleased = 0

      if (actionType === "close" && closingPrice) {
        const closePrice = Number.parseFloat(closingPrice)
        const contractMultiplier = trade.type === "Stock" ? 1 : 100
        const baseValue = closePrice * contractsCount * contractMultiplier

        if (trade.side === "STO") {
          cashImpact -= baseValue // Pay to close short position
        } else {
          cashImpact += baseValue // Receive from closing long position
        }

        // Release locked collateral when closing cash-secured puts
        if (trade.type === "Put" && trade.side === "STO" && trade.secured && trade.strikePrice) {
          collateralReleased = trade.strikePrice * 100 * contractsCount
        }
      } else if (actionType === "assign") {
        if (trade.type === "Put" && trade.side === "STO" && trade.strikePrice) {
          // For cash-secured puts: collateral is used to buy stock, no additional cash impact
          if (trade.secured) {
            // Stock purchase is covered by existing collateral, no cash impact
            cashImpact = -commission // Only the commission
            collateralReleased = trade.strikePrice * 100 * contractsCount
          } else {
            // Non-secured put requires cash to buy stock
            cashImpact -= trade.strikePrice * 100 * contractsCount
          }
        } else if (trade.type === "Call" && trade.side === "STO" && trade.strikePrice) {
          // Assigned on short call - must sell stock
          cashImpact += trade.strikePrice * 100 * contractsCount
        }
      } else if (actionType === "roll" && rollClosingPrice && rollOpeningPrice) {
        // Calculate roll net profit: credit from new position minus cost to close current
        const closePrice = Number.parseFloat(rollClosingPrice)
        const openPrice = Number.parseFloat(rollOpeningPrice)
        const contractMultiplier = 100

        const closeCost = closePrice * contractsCount * contractMultiplier
        const openCredit = openPrice * contractsCount * contractMultiplier
        
        if (trade.side === "STO") {
          // For STO positions: pay to close, receive credit for new position
          cashImpact = openCredit - closeCost - commission
        } else {
          // For BTO positions: receive from closing, pay for new position
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
        handleCloseTrade(trade.id, Number.parseFloat(closingPrice))
      } else if (actionType === "assign") {
        handleAssignTrade(trade.id)
      } else if (actionType === "roll" && newExpiration) {
        handleRollTrade(trade.id, newExpiration, newStrike ? Number.parseFloat(newStrike) : undefined, {
          closingPrice: rollClosingPrice ? Number.parseFloat(rollClosingPrice) : undefined,
          openingPrice: rollOpeningPrice ? Number.parseFloat(rollOpeningPrice) : undefined
        })
      }

      // Apply cash impact and collateral release
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Remove Trade ({tradeId}) - {trade.symbol}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will completely remove the trade and reverse all its impacts on your portfolio.
              </p>

              <div className="bg-muted p-3 rounded-lg space-y-2">
                <h4 className="font-medium">Impact Reversal</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Cash Impact:</span>
                    <span className={trade.premium >= 0 ? "text-red-600" : "text-green-600"}>
                      {trade.premium >= 0 ? "-" : "+"}${Math.abs(trade.premium).toFixed(2)}
                    </span>
                  </div>
                  {trade.type === "Put" && trade.side === "STO" && trade.secured && trade.strikePrice && (
                    <div className="flex justify-between">
                      <span>Collateral Released:</span>
                      <span className="text-green-600">
                        +${(trade.strikePrice * 100 * Math.abs(trade.contracts)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    handleRemoveTrade(trade)
                    setShowRemoveConfirm(false)
                    onClose()
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirm Removal
                </Button>
                <Button variant="outline" onClick={() => setShowRemoveConfirm(false)}>
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{getActionTitle()} - Summary</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <h4 className="font-medium">Financial Impact</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Commission:</span>
                    <span className="text-red-600 dark:text-red-400">-${actionSummaryData.commission.toFixed(2)}</span>
                  </div>
                  {actionSummaryData.collateralReleased > 0 && (
                    <div className="flex justify-between">
                      <span>Collateral Released:</span>
                      <span className="text-green-600 dark:text-green-400">
                        +${actionSummaryData.collateralReleased.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Net Cash Impact:</span>
                    <span className={actionSummaryData.cashImpact >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                      {actionSummaryData.cashImpact >= 0 ? "+" : ""}${actionSummaryData.cashImpact.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={executeAction} className="flex-1 bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800">
                  Execute {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                </Button>
                <Button variant="outline" onClick={() => setShowActionSummary(false)} className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            {trade.notes && (
              <p className="text-sm text-muted-foreground mt-2">{trade.notes}</p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant={actionType === "close" ? "default" : "outline"}
                size="sm"
                onClick={() => setActionType("close")}
                className={`h-10 ${
                  actionType === "close" 
                    ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200" 
                    : "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
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
                    ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200" 
                    : "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
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
                    ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200" 
                    : "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditTrade(trade)}
                className="h-10 border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            {actionType === "close" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="contractsToClose">Contracts to Close</Label>
                  <Input
                    id="contractsToClose"
                    type="number"
                    min="1"
                    max={Math.abs(trade.contracts)}
                    value={contractsToClose}
                    onChange={(e) => setContractsToClose(e.target.value)}
                    placeholder="Number of contracts"
                  />
                </div>
                <div>
                  <Label htmlFor="closingPrice">Closing Price</Label>
                  <Input
                    id="closingPrice"
                    type="number"
                    step="0.01"
                    value={closingPrice}
                    onChange={(e) => setClosingPrice(e.target.value)}
                    placeholder="Enter closing price"
                  />
                </div>
                <div>
                  <Label htmlFor="closingCommission">Commission</Label>
                  <Input
                    id="closingCommission"
                    type="number"
                    step="0.01"
                    value={closingCommission}
                    onChange={(e) => setClosingCommission(e.target.value)}
                    placeholder="Commission"
                  />
                </div>
              </div>
            )}

            {actionType === "assign" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="assignCommission">Commission</Label>
                  <Input
                    id="assignCommission"
                    type="number"
                    step="0.01"
                    value={assignCommission}
                    onChange={(e) => setAssignCommission(e.target.value)}
                    placeholder="Commission"
                  />
                </div>
              </div>
            )}

            {actionType === "roll" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="contractsToRoll">Contracts to Roll</Label>
                  <Input
                    id="contractsToRoll"
                    type="number"
                    min="1"
                    max={Math.abs(trade.contracts)}
                    value={contractsToRoll}
                    onChange={(e) => setContractsToRoll(e.target.value)}
                    placeholder="Number of contracts"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="rollClosingPrice">Closing Price</Label>
                    <Input
                      id="rollClosingPrice"
                      type="number"
                      step="0.01"
                      value={rollClosingPrice}
                      onChange={(e) => setRollClosingPrice(e.target.value)}
                      placeholder="Cost to close"
                      className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rollOpeningPrice">Opening Price</Label>
                    <Input
                      id="rollOpeningPrice"
                      type="number"
                      step="0.01"
                      value={rollOpeningPrice}
                      onChange={(e) => setRollOpeningPrice(e.target.value)}
                      placeholder="Credit for new position"
                      className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                    />
                  </div>
                </div>
                {rollClosingPrice && rollOpeningPrice && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Cost to Close:</span>
                        <span className="text-red-600 dark:text-red-400">
                          -${(Number.parseFloat(rollClosingPrice) * Number.parseInt(contractsToRoll) * 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Credit from New Position:</span>
                        <span className="text-green-600 dark:text-green-400">
                          +${(Number.parseFloat(rollOpeningPrice) * Number.parseInt(contractsToRoll) * 100).toFixed(2)}
                        </span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex justify-between font-medium">
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
                  <Label htmlFor="newExpiration">New Expiration</Label>
                  <Input
                    id="newExpiration"
                    type="date"
                    value={newExpiration}
                    onChange={(e) => setNewExpiration(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="newStrike">New Strike (Optional)</Label>
                  <Input
                    id="newStrike"
                    type="number"
                    step="0.01"
                    value={newStrike}
                    onChange={(e) => setNewStrike(e.target.value)}
                    placeholder="Leave empty to keep current"
                  />
                </div>
                <div>
                  <Label htmlFor="rollCommission">Commission</Label>
                  <Input
                    id="rollCommission"
                    type="number"
                    step="0.01"
                    value={rollCommission}
                    onChange={(e) => setRollCommission(e.target.value)}
                    placeholder="Commission"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleActionConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800">
                {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </Button>
              <Button variant="outline" onClick={() => setShowRemoveConfirm(true)} className="border-red-600 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950">
                Remove
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const EditTradeDialog = () => (
    <Dialog open={showEditTrade} onOpenChange={setShowEditTrade}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Trade - {editingTrade?.symbol}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="editType">Type</Label>
              <Select
                value={editTradeForm.type}
                onValueChange={(value: "Call" | "Put" | "Stock") => 
                  setEditTradeForm({ ...editTradeForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stock">Stock</SelectItem>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Put">Put</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editSide">Side</Label>
              <Select
                value={editTradeForm.side}
                onValueChange={(value: "STO" | "BTO") => 
                  setEditTradeForm({ ...editTradeForm, side: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STO">STO (Sell)</SelectItem>
                  <SelectItem value="BTO">BTO (Buy)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {editTradeForm.type !== "Stock" && (
            <div>
              <Label htmlFor="editStrike">Strike Price</Label>
              <Input
                id="editStrike"
                type="number"
                step="0.01"
                value={editTradeForm.strikePrice}
                onChange={(e) => setEditTradeForm({ ...editTradeForm, strikePrice: e.target.value })}
                placeholder="Strike price"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="editStartDate">Start Date</Label>
              <Input
                id="editStartDate"
                type="date"
                value={editTradeForm.startDate}
                onChange={(e) => setEditTradeForm({ ...editTradeForm, startDate: e.target.value })}
              />
            </div>
            {editTradeForm.type !== "Stock" && (
              <div>
                <Label htmlFor="editExpiration">Expiration</Label>
                <Input
                  id="editExpiration"
                  type="date"
                  value={editTradeForm.expirationDate}
                  onChange={(e) => setEditTradeForm({ ...editTradeForm, expirationDate: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="editPrice">Price</Label>
              <Input
                id="editPrice"
                type="number"
                step="0.01"
                value={editTradeForm.price}
                onChange={(e) => setEditTradeForm({ ...editTradeForm, price: e.target.value })}
                placeholder="Price"
              />
            </div>
            <div>
              <Label htmlFor="editCommission">Commission</Label>
              <Input
                id="editCommission"
                type="number"
                step="0.01"
                value={editTradeForm.commission}
                onChange={(e) => setEditTradeForm({ ...editTradeForm, commission: e.target.value })}
                placeholder="Commission"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleEditTradeSubmit} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              Preview Changes
            </Button>
            <Button variant="outline" onClick={() => setShowEditTrade(false)} className="border-red-600 text-red-600">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const EditSummaryDialog = () => {
    if (!editSummaryData) return null

    const { originalTrade, editedTrade, premiumDifference, cashImpact } = editSummaryData

    return (
      <Dialog open={showEditSummary} onOpenChange={setShowEditSummary}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Trade Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Original Trade</h4>
                <div className="text-sm space-y-1">
                  <div>Type: {originalTrade.type}</div>
                  <div>Side: {originalTrade.side}</div>
                  {originalTrade.strikePrice && <div>Strike: ${originalTrade.strikePrice}</div>}
                  <div>Price: ${originalTrade.price}</div>
                  <div>Premium: {formatCurrency(originalTrade.premium)}</div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Edited Trade</h4>
                <div className="text-sm space-y-1">
                  <div>Type: {editedTrade.type}</div>
                  <div>Side: {editedTrade.side}</div>
                  {editedTrade.strikePrice && <div>Strike: ${editedTrade.strikePrice}</div>}
                  <div>Price: ${editedTrade.price}</div>
                  <div>Premium: {formatCurrency(editedTrade.premium)}</div>
                </div>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium mb-2">Impact</h4>
              <div className="flex justify-between">
                <span>Premium Difference:</span>
                <span className={getPLColor(premiumDifference)}>
                  {premiumDifference >= 0 ? "+" : ""}
                  {formatCurrency(premiumDifference)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cash Impact:</span>
                <span className={getPLColor(cashImpact)}>
                  {cashImpact >= 0 ? "+" : ""}
                  {formatCurrency(cashImpact)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={confirmEditTrade} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                Confirm Edit
              </Button>
              <Button variant="outline" onClick={() => setShowEditSummary(false)} className="border-red-600 text-red-600">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const CashModal = () => {
    const [stockPrice, setStockPrice] = useState("")

    return (
      <Dialog open={showCashModal} onOpenChange={setShowCashModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {cashAction === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant={cashAction === "deposit" ? "default" : "outline"}
                onClick={() => setCashAction("deposit")}
                className={`flex items-center justify-center h-10 ${cashAction === "deposit" ? "bg-red-600 hover:bg-red-700 text-white" : "border-red-600 text-red-600 hover:bg-red-50"}`}
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                Deposit
              </Button>
              <Button
                variant={cashAction === "withdraw" ? "default" : "outline"}
                onClick={() => setCashAction("withdraw")}
                className={`flex items-center justify-center h-10 ${cashAction === "withdraw" ? "bg-red-600 hover:bg-red-700 text-white" : "border-red-600 text-red-600 hover:bg-red-50"}`}
              >
                <ArrowUpLeft className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>

            <div>
              <Label htmlFor="cashAmount">Amount ($)</Label>
              <Input
                id="cashAmount"
                type="number"
                step="0.01"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="Enter amount"
                className="h-8 text-sm"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-lg font-semibold">{formatCurrency(cash)}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCashTransaction} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                Confirm {cashAction === "deposit" ? "Deposit" : "Withdrawal"}
              </Button>
              <Button variant="outline" onClick={() => setShowCashModal(false)} className="border-red-600 text-red-600 hover:bg-red-50">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const SettingsDialog = () => (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="defaultCommission">Default Commission ($)</Label>
              <Input
                id="defaultCommission"
                type="number"
                step="0.01"
                value={appSettings.defaultCommission}
                onChange={(e) =>
                  setAppSettings((prev) => ({ ...prev, defaultCommission: Number.parseFloat(e.target.value) }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={appSettings.emailNotifications}
                onCheckedChange={(checked) => setAppSettings((prev) => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">Upgrade your Plan</h4>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg border">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-semibold">Premium Plan</p>
                  <p className="text-sm text-muted-foreground">unlimited trades</p>
                </div>
              </div>
              <Button className="bg-destructive" size="sm" onClick={() => setShowPricingModal(true)}>
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const PricingModal = () => (
    <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                Free Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                $0<span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">✓ Up to 10 trades per month</li>
                <li className="flex items-center gap-2">✓ Basic cost basis tracking</li>
                <li className="flex items-center gap-2">✓ Portfolio overview</li>
                <li className="flex items-center gap-2 text-muted-foreground">✗ Advanced analytics</li>
                <li className="flex items-center gap-2 text-muted-foreground">✗ Real-time data</li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="relative border-2 border-primary">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Crown className="w-4 h-4 text-primary-foreground" />
                </div>
                Pro Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                $29<span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">✓ Unlimited trades</li>
                <li className="flex items-center gap-2">✓ Advanced cost basis tracking</li>
                <li className="flex items-center gap-2">✓ Real-time market data</li>
                <li className="flex items-center gap-2">✓ Risk management alerts</li>
                <li className="flex items-center gap-2">✓ Advanced analytics</li>
                <li className="flex items-center gap-2">✓ Export capabilities</li>
              </ul>
              <Button className="w-full">
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )

  const TradeSummaryModal = () => {
    if (!tradeSummaryData) return null

    const { trade, cashImpact, collateralImpact, netCredit, netDebit, commission, stockPurchase } = tradeSummaryData
    const [stockPrice, setStockPrice] = useState(stockPurchase?.price?.toString() || "")
    const [stockShares, setStockShares] = useState(stockPurchase?.shares?.toString() || "")

    const calculateTotalImpact = () => {
      let totalCashImpact = cashImpact
      if (stockPurchase && stockPrice && stockShares) {
        const price = Number.parseFloat(stockPrice)
        const shares = Number.parseInt(stockShares)
        totalCashImpact -= (price * shares + 1) // Include $1 commission
      }
      return totalCashImpact
    }

    return (
      <Dialog open={showTradeSummary} onOpenChange={setShowTradeSummary}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              Trade Summary
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Trade Details */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Trade Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="ml-2 font-medium">{trade.symbol}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium">{trade.type}</span>
                </div>
                {trade.type !== "Stock" && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Side:</span>
                      <span className="ml-2 font-medium">{trade.side}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Strike:</span>
                      <span className="ml-2 font-medium">{formatCurrency(trade.strikePrice || 0)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expiration:</span>
                      <span className="ml-2 font-medium">
                        {trade.expirationDate ? formatDate(trade.expirationDate) : "N/A"}
                      </span>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="ml-2 font-medium">
                    {getContractDisplay(trade)} {trade.type === "Stock" ? "shares" : "contracts"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Price:</span>
                  <span className="ml-2 font-medium">{formatCurrency(trade.price)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Commission:</span>
                  <span className="ml-2 font-medium">{formatCurrency(commission)}</span>
                </div>
              </div>
            </div>

            {/* Stock Purchase Section */}
            {stockPurchase && (
              <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Required Stock Purchase</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Covered call requires {Math.abs(trade.contracts) * 100} shares. Auto-purchasing additional shares.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="stockPrice">Stock Price</Label>
                    <Input
                      id="stockPrice"
                      type="number"
                      step="0.01"
                      value={stockPrice}
                      onChange={(e) => setStockPrice(e.target.value)}
                      placeholder="Stock price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stockShares">Shares to Buy</Label>
                    <Input
                      id="stockShares"
                      type="number"
                      value={stockShares}
                      onChange={(e) => setStockShares(e.target.value)}
                      placeholder="Number of shares"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Financial Impact */}
            <div className="space-y-4">
              <h3 className="font-semibold">Financial Impact</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                  <div className="text-sm text-green-700 dark:text-green-300">Net Credit</div>
                  <div className="text-lg font-bold text-green-800 dark:text-green-200">
                    {formatCurrency(netCredit)}
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                  <div className="text-sm text-red-700 dark:text-red-300">Net Debit</div>
                  <div className="text-lg font-bold text-red-800 dark:text-red-200">{formatCurrency(netDebit)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Options Cash Impact:</span>
                  <span className={`font-bold ${cashImpact >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {cashImpact >= 0 ? "+" : ""}
                    {formatCurrency(cashImpact)}
                  </span>
                </div>

                {stockPurchase && stockPrice && stockShares && (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Stock Purchase:</span>
                    <span className="font-bold text-red-600">
                      -{formatCurrency(Number.parseFloat(stockPrice) * Number.parseInt(stockShares) + 1)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg border-2">
                  <span className="text-sm font-medium">Total Cash Impact:</span>
                  <span className={`font-bold ${calculateTotalImpact() >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {calculateTotalImpact() >= 0 ? "+" : ""}
                    {formatCurrency(calculateTotalImpact())}
                  </span>
                </div>

                {collateralImpact > 0 && (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Collateral Required:</span>
                    <span className="font-bold text-orange-600">{formatCurrency(collateralImpact)}</span>
                  </div>
                )}
              </div>

              {/* Account Impact Preview */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Account Impact Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Current Available Cash:</span>
                    <span>{formatCurrency(cash)}</span>
                  </div>
                  {collateralImpact > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>Premium Received:</span>
                        <span className="text-green-600">+{formatCurrency(cashImpact)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cash Locked as Collateral:</span>
                        <span className="text-orange-600">-{formatCurrency(collateralImpact)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Net Available Cash After Trade:</span>
                        <span className={
                          (cash + cashImpact - collateralImpact) >= 0 ? "text-green-600" : "text-red-600"
                        }>
                          {formatCurrency(cash + cashImpact - collateralImpact)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Locked Collateral:</span>
                        <span>{formatCurrency(lockedCollateral)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Locked After Trade:</span>
                        <span className="text-orange-600">{formatCurrency(lockedCollateral + collateralImpact)}</span>
                      </div>
                    </>
                  )}
                  {collateralImpact === 0 && (
                    <div className="flex justify-between">
                      <span>Available Cash After Trade:</span>
                      <span className={calculateTotalImpact() >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(cash + calculateTotalImpact())}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  // Update stock purchase data if modified
                  if (stockPurchase && stockPrice && stockShares) {
                    setTradeSummaryData((prev: any) => ({
                      ...prev,
                      stockPurchase: {
                        shares: Number.parseInt(stockShares),
                        price: Number.parseFloat(stockPrice)
                      }
                    }))
                  }
                  confirmTrade()
                }} 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Trade
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTradeSummary(false)}
                className="border-black text-black hover:bg-gray-100"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500 shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">prina</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Trading Analytics Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSettings(true)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => router.push("/auth")}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-red-500/25 transition-all duration-300"
              >
                Open Account
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Portfolio Overview */}
            <Card className="bg-white/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Wallet className="w-5 h-5 text-red-500 dark:text-red-400" />
                  </div>
                  Portfolio Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Portfolio Value</span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(portfolioValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Available Cash</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCashModal(true)}
                      className="font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {formatCurrency(cash)}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Lock className="w-3 h-3" />
                      Locked Collateral
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(lockedCollateral)}</span>
                  </div>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Premium Collected</span>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="w-16 h-6 text-xs bg-red-500 text-white border-red-500 hover:bg-red-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1M">1M</SelectItem>
                        <SelectItem value="3M">3M</SelectItem>
                        <SelectItem value="1Y">1Y</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" />
                    {formatCurrency(getFilteredPremium())}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add New Trade */}
            <Card className="bg-white/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Plus className="w-5 h-5 text-red-500 dark:text-red-400" />
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
                      className="h-8 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500"
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
                      <SelectTrigger className="h-8 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
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
                      <SelectTrigger className="h-8 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
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
                        <SelectTrigger className="h-8 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
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
                        className="h-8 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500"
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
                      className="h-8 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500"
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
                      className="h-8 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500"
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
                      className="h-8 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500"
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
                      className="h-8 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500"
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
                      className="h-8 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500"
                    />
                  </div>
                )}

                {newTrade.type !== "Stock" && newTrade.side === "STO" && (
                  <div className="space-y-2">
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
                    className="h-16 text-sm resize-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddTrade}
                    className="flex-1 h-8 text-sm bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/25 transition-all duration-300"
                  >
                    Add Trade
                  </Button>
                  <Button
                    onClick={clearForm}
                    variant="outline"
                    className="h-8 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex justify-between items-center">
                <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                  <TabsTrigger value="positions" className="text-gray-700 dark:text-gray-300 data-[state=active]:text-white data-[state=active]:bg-red-500">Positions</TabsTrigger>
                  <TabsTrigger value="trades" className="text-gray-700 dark:text-gray-300 data-[state=active]:text-white data-[state=active]:bg-red-500">Trades</TabsTrigger>
                </TabsList>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCashAction("deposit")
                      setShowCashModal(true)
                    }}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:border-red-500"
                  >
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Deposit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCashAction("withdraw")
                      setShowCashModal(true)
                    }}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:border-red-500"
                  >
                    <ArrowUpLeft className="w-4 h-4 mr-2" />
                    Withdraw
                  </Button>
                </div>
              </div>

              <TabsContent value="positions" className="space-y-6">
                {/* Cost Basis Toggle */}
                <Card className="bg-white/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg text-gray-900 dark:text-white">Positions Overview</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="includePremiums" className="text-sm text-gray-700 dark:text-gray-300">
                          Include Premiums
                        </Label>
                        <Switch className="data-[state=checked]:bg-red-500" id="includePremiums" checked={includePremiums} onCheckedChange={setIncludePremiums} />
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Positions */}
                <div className="grid gap-4">
                  {positions.map((position) => (
                    <Card
                      key={position.symbol}
                      className={`bg-white/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-sm hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 ${animatingTrade ? "animate-pulse" : ""}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                            {position.symbol}
                            {position.shares > 0 && <Badge variant="outline" className="border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300">{position.shares} shares</Badge>}
                          </CardTitle>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(position.currentPrice)}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Original Cost Basis</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(position.originalCostBasis)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Premiums Received</p>
                            <p className="font-semibold text-green-600 dark:text-green-400">+{formatCurrency(position.premiumsReceived)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {includePremiums ? "Adjusted" : "Current"} Cost Basis
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(
                                includePremiums
                                  ? position.avgCostBasis - position.premiumsReceived / Math.max(position.shares, 1)
                                  : position.avgCostBasis,
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total P/L</p>
                            <p className={`font-semibold ${getPLColor(calculateTotalPL(position))}`}>
                              {calculateTotalPL(position) >= 0 ? "+" : ""}
                              {formatCurrency(calculateTotalPL(position))}
                            </p>
                          </div>
                          {position.shares > 0 && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Unrealized P&L</p>
                              <p className={`font-semibold ${getPLColor((position.currentPrice - position.avgCostBasis) * position.shares)}`}>
                                {formatCurrency((position.currentPrice - position.avgCostBasis) * position.shares)}
                              </p>
                            </div>
                          )}
                        </div>

                        {position.openOptions.length > 0 && (
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold text-gray-900 dark:text-white">Open Options</h4>
                              {position.openOptions.some((opt) => isExpiringWithin5Days(opt.expirationDate)) && (
                                <Badge variant="destructive" className="text-xs bg-red-500 text-white">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Expiring Soon
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              {position.openOptions.map((option) => (
                                <div
                                  key={option.id}
                                  className="flex justify-between items-center p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors border border-gray-300 dark:border-gray-700"
                                >
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-xs bg-red-500/20 text-red-500 dark:text-red-400 border-red-500/50">
                                      {getContractDisplay(option)}
                                    </Badge>
                                    <div>
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatTradeNomenclature(option)}
                                      </span>
                                      {option.notes && <p className="text-xs text-gray-600 dark:text-gray-400">{option.notes}</p>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <p className={`text-sm font-semibold ${getPLColor(option.premium)}`}>
                                        {option.premium >= 0 ? "+" : ""}
                                        {formatCurrency(option.premium)}
                                      </p>
                                      {option.expirationDate && (
                                        <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {getRemainingDays(option.expirationDate)} days
                                        </span>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingTrade(option)}
                                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:border-red-500"
                                    >
                                      Manage
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="trades" className="space-y-6">
                <Card className="bg-white/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">All Trades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trades.map((trade) => (
                        <div
                          key={trade.id}
                          className={`flex items-center justify-between p-4 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer ${
                            animatingTrade === trade.id ? "animate-pulse bg-green-500/20 border-green-500/50" : ""
                          }`}
                          onClick={() => trade.type !== "Stock" && setEditingTrade(trade)}
                        >
                          <div className="flex items-center gap-4">
                            <Badge
                              variant={trade.side === "STO" ? "default" : "secondary"}
                              className="min-w-[60px] justify-center text-white bg-red-500/80 dark:bg-red-500/20 border-red-500/50"
                            >
                              {trade.symbol === "CASH" ? "CASH" : (trade.type === "Stock" ? "STOCK" : trade.side)}
                            </Badge>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {trade.symbol === "CASH" ? (trade.side === "BTO" ? "DEPOSIT" : "WITHDRAWAL") : trade.symbol}
                                {trade.type !== "Stock" && (
                                  <span className="ml-1">
                                    {trade.strikePrice}
                                    {trade.type === "Call" ? "C" : "P"}
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {getContractDisplay(trade)}{" "}
                                {trade.symbol === "CASH" ? "dollars" : (trade.type === "Stock" ? "shares" : "contracts")}{" "}
                                {trade.symbol !== "CASH" && (
                                  <>
                                    • {trade.type === "Stock" ? "Price: " : "Premium: "}
                                    {formatCurrency(trade.price)}
                                  </>
                                )}
                                {trade.notes && ` • ${trade.notes}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getPLColor(trade.premium)}`}>
                              {trade.premium >= 0 ? "+" : ""}
                              {formatCurrency(trade.premium)}
                            </p>
                            <div className="flex items-center gap-2">
                            {trade.symbol !== "CASH" && (
                              <Badge variant="outline" className={`text-xs border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 ${getStatusColor(trade.status)}`}>
                                {trade.status}
                              </Badge>
                            )}
                              {trade.expirationDate && (
                                <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(trade.expirationDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {editingTrade && <TradeActionDialog trade={editingTrade} onClose={() => setEditingTrade(null)} />}
      <EditTradeDialog />
      <EditSummaryDialog />
      <TradeSummaryModal />
      <CashModal />
      <SettingsDialog />
      <PricingModal />
    </div>
  )
}
