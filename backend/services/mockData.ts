import type { Trade, AppSettings } from "../../frontend/types/trade"

// Mock database simulation
export class MockDataService {
  private static instance: MockDataService
  private trades: Trade[] = []
  private settings: AppSettings

  private constructor() {
    this.settings = {
      defaultCommission: 1.0,
      riskAlerts: true,
      emailNotifications: false,
      darkMode: false,
    }

    // Initialize with default trades
    this.trades = [
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
  }

  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService()
    }
    return MockDataService.instance
  }

  // Trade operations
  async getAllTrades(): Promise<Trade[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.trades]), 100) // Simulate API delay
    })
  }

  async createTrade(trade: Trade): Promise<Trade> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.trades.push(trade)
        resolve(trade)
      }, 100)
    })
  }

  async updateTrade(tradeId: string, updates: Partial<Trade>): Promise<Trade> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.trades.findIndex(t => t.id === tradeId)
        if (index === -1) {
          reject(new Error("Trade not found"))
          return
        }
        
        this.trades[index] = { ...this.trades[index], ...updates }
        resolve(this.trades[index])
      }, 100)
    })
  }

  async deleteTrade(tradeId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const initialLength = this.trades.length
        this.trades = this.trades.filter(t => t.id !== tradeId)
        resolve(this.trades.length < initialLength)
      }, 100)
    })
  }

  // Settings operations
  async getSettings(): Promise<AppSettings> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...this.settings }), 50)
    })
  }

  async updateSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.settings = { ...this.settings, ...newSettings }
        resolve({ ...this.settings })
      }, 100)
    })
  }

  // Market data simulation
  async getMarketPrice(symbol: string): Promise<number> {
    const basePrices: { [key: string]: number } = {
      AAPL: 182.5,
      MSFT: 358.75,
      GOOGL: 142.3,
      TSLA: 248.5,
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const basePrice = basePrices[symbol] || 100 + Math.random() * 200
        // Add some random variation to simulate real market movement
        const variation = (Math.random() - 0.5) * 10
        resolve(Math.max(0, basePrice + variation))
      }, 200)
    })
  }

  // Portfolio analytics
  async getPortfolioSummary(): Promise<{
    totalValue: number
    totalPL: number
    premiumsCollected: number
    openPositions: number
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const premiumsCollected = this.trades
          .filter(t => t.side === "STO" && t.premium > 0)
          .reduce((sum, t) => sum + t.premium, 0)

        const openPositions = this.trades.filter(t => t.status === "open").length

        resolve({
          totalValue: 125430.5,
          totalPL: 8420.25,
          premiumsCollected,
          openPositions,
        })
      }, 150)
    })
  }
} 