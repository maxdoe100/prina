# 📊 PRINA OPTIONS TRACKER - TRADING LOGIC DOCUMENTATION

## 🎯 Overview

This document comprehensively explains the trading logic implemented in the PRINA Options Tracker application. The system handles complex options trading scenarios including covered calls, cash-secured puts, and stock trades with sophisticated financial calculations.

## 🏗️ Core Data Structures

### Trade Interface
```typescript
interface Trade {
  id: string                                    // Unique identifier
  symbol: string                               // Stock symbol (e.g., "AAPL")
  side: "STO" | "BTO"                         // Sell-to-Open or Buy-to-Open
  type: "Call" | "Put" | "Stock"              // Security type
  startDate: string                           // Trade execution date
  strikePrice?: number                        // Options strike price (not for stocks)
  price: number                               // Execution price per share/contract
  contracts: number                           // Number of contracts/shares (negative for STO)
  expirationDate?: string                     // Options expiration (not for stocks)
  status: "open" | "closed" | "expired" | "assigned"  // Trade status
  premium: number                             // Net cash impact (positive = credit)
  commission: number                          // Transaction fees
  notes?: string                              // Optional trade notes
  covered?: boolean                           // For STO calls - auto-buy stock coverage
  secured?: boolean                           // For STO puts - lock collateral
  closingPrice?: number                       // Price when closed
}
```

### Position Interface
```typescript
interface Position {
  symbol: string                              // Stock symbol
  shares: number                              // Current share count
  avgCostBasis: number                        // Average cost per share
  originalCostBasis: number                   // Cost basis without premiums
  premiumsReceived: number                    // Total option premiums collected
  openOptions: Trade[]                        // Active options contracts
  currentPrice: number                        // Current market price
  proposedCostBasis?: number                  // Future cost basis if assigned
}
```

## 💰 Financial Calculations

### Premium Calculations

**1. Stock Trades**
```typescript
// Buy Stock
premium = -(price × shares + commission)     // Cash outflow (negative)

// Sell Stock  
premium = (price × shares) - commission      // Cash inflow (positive)
```

**2. Options Trades**
```typescript
// Sell-to-Open (STO) - Collect Premium
premium = (price × |contracts| × 100) - commission    // Cash inflow

// Buy-to-Open (BTO) - Pay Premium  
premium = -((price × |contracts| × 100) + commission) // Cash outflow
```

**3. Contract Multiplier Logic**
- **Options**: Always multiply by 100 (standard options contract size)
- **Stocks**: Multiply by 1 (share-for-share)
- **STO Contracts**: Stored as negative numbers (e.g., -3 for selling 3 contracts)
- **BTO Contracts**: Stored as positive numbers (e.g., +2 for buying 2 contracts)

### Collateral Management

**Cash-Secured Puts**
```typescript
// When secured = true for STO puts
collateral = strikePrice × 100 × |contracts|

// Example: Sell 2 puts at $50 strike with secured=true
// Collateral = $50 × 100 × 2 = $10,000 locked
```

**Covered Calls**
```typescript
// When covered = true for STO calls
requiredShares = |contracts| × 100

// Auto-purchase logic if insufficient shares
if (availableShares < requiredShares) {
  sharesToBuy = requiredShares - availableShares
  // Creates automatic stock purchase trade
}
```

## 🔄 Position Management System

### Position Updates Algorithm
The system dynamically calculates positions from all trades:

```typescript
const updatePositions = () => {
  const positionMap = new Map<string, Position>()

  trades.forEach((trade) => {
    // Initialize position if not exists
    if (!positionMap.has(trade.symbol)) {
      positionMap.set(trade.symbol, {
        symbol: trade.symbol,
        shares: 0,
        avgCostBasis: 0,
        originalCostBasis: 0,
        premiumsReceived: 0,
        openOptions: [],
        currentPrice: getRandomPrice(trade.symbol),
        proposedCostBasis: 0,
      })
    }

    const position = positionMap.get(trade.symbol)!

    // Handle stock trades
    if (trade.type === "Stock" && trade.status === "open") {
      const currentTotalValue = position.shares * position.avgCostBasis
      const newShares = trade.contracts  // Can be positive (buy) or negative (sell)
      const newTradeValue = newShares * trade.price
      const totalSharesAfterTrade = position.shares + newShares

      if (totalSharesAfterTrade === 0) {
        // All shares sold - reset position
        position.shares = 0
        position.avgCostBasis = 0
        position.originalCostBasis = 0
      } else {
        // Calculate weighted average cost basis
        position.avgCostBasis = (currentTotalValue + newTradeValue) / totalSharesAfterTrade
        position.shares = totalSharesAfterTrade
      }
    }

    // Handle options trades
    else if (trade.type !== "Stock") {
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
}
```

### Cost Basis Calculations

**Average Cost Basis (Weighted)**
```typescript
avgCostBasis = (totalInvestment) / (totalShares)

// With premiums included:
costBasisWithPremiums = (totalStockCost - premiumsReceived) / totalShares

// Without premiums:
originalCostBasis = totalStockCost / totalShares
```

**Proposed Cost Basis (For Puts)**
```typescript
// If STO put gets assigned:
proposedCostBasis = strikePrice - premiumReceived

// Example: Sell $50 put for $2.00 premium
// If assigned: effectiveCostBasis = $50 - $2.00 = $48.00
```

## 🎬 Trade Actions System

### 1. Close Trade Action
```typescript
const closeTradeLogic = (trade: Trade, closingPrice: number, commission: number) => {
  let cashImpact: number

  if (trade.side === "STO") {
    // Closing a sold option (Buy-to-Close)
    cashImpact = -((closingPrice × |trade.contracts| × 100) + commission)
  } else {
    // Closing a bought option (Sell-to-Close)  
    cashImpact = (closingPrice × |trade.contracts| × 100) - commission
  }

  // Net P/L = Original Premium + Closing Cash Impact
  const netPL = trade.premium + cashImpact

  return { cashImpact, netPL }
}
```

### 2. Assignment Action
```typescript
const assignmentLogic = (trade: Trade) => {
  if (trade.type === "Put" && trade.side === "STO") {
    // Put Assignment: Forced to buy stock
    const sharesPurchased = |trade.contracts| × 100
    const purchasePrice = trade.strikePrice
    const totalCost = sharesPurchased × purchasePrice
    
    // Add shares to position, remove collateral
    return {
      sharesAdded: sharesPurchased,
      cashImpact: -totalCost,
      collateralReleased: totalCost
    }
  }
  
  if (trade.type === "Call" && trade.side === "STO") {
    // Call Assignment: Forced to sell stock
    const sharesSold = |trade.contracts| × 100
    const sellPrice = trade.strikePrice
    const totalReceived = sharesSold × sellPrice
    
    // Remove shares from position, receive cash
    return {
      sharesRemoved: sharesSold,
      cashImpact: totalReceived
    }
  }
}
```

### 3. Roll Trade Action
```typescript
const rollLogic = (originalTrade: Trade, newExpiration: string, newStrike?: number) => {
  // Step 1: Close original trade (Buy-to-Close for STO)
  const closeCost = getCurrentOptionPrice(originalTrade) × |originalTrade.contracts| × 100
  
  // Step 2: Open new trade with updated parameters
  const newTrade = {
    ...originalTrade,
    id: generateNewId(),
    expirationDate: newExpiration,
    strikePrice: newStrike || originalTrade.strikePrice,
    startDate: new Date().toISOString().split("T")[0]
  }
  
  // Step 3: Calculate net credit/debit
  const newCredit = getNewOptionPrice(newTrade) × |newTrade.contracts| × 100
  const netImpact = newCredit - closeCost - (commission × 2) // Two commissions
  
  return { closedTrade: originalTrade, newTrade, netImpact }
}
```

### 4. Expiration Handling
```typescript
const expirationLogic = (trade: Trade) => {
  if (trade.side === "STO") {
    // Sold options expire worthless - keep full premium
    return {
      cashImpact: 0,  // No additional cash impact
      premiumKept: trade.premium,  // Original premium retained
      collateralReleased: trade.secured ? (trade.strikePrice × 100 × |trade.contracts|) : 0
    }
  } else {
    // Bought options expire worthless - lose premium paid
    return {
      cashImpact: 0,  // No additional cash impact
      totalLoss: Math.abs(trade.premium)  // Premium paid is lost
    }
  }
}
```

## 📈 Portfolio Calculations

### Portfolio Value Components
```typescript
const calculatePortfolioValue = () => {
  // 1. Cash available for trading
  const availableCash = cash - lockedCollateral

  // 2. Stock positions value
  const stockValue = positions.reduce((total, position) => {
    return total + (position.shares × position.currentPrice)
  }, 0)

  // 3. Unrealized options value
  const optionsValue = positions.reduce((total, position) => {
    return total + position.openOptions.reduce((optionTotal, option) => {
      const currentOptionPrice = getCurrentOptionPrice(option)
      const contractValue = currentOptionPrice × Math.abs(option.contracts) × 100
      // STO positions have negative value (liability), BTO have positive (asset)
      return optionTotal + (option.side === "STO" ? -contractValue : contractValue)
    }, 0)
  }, 0)

  // 4. Total portfolio value
  const totalValue = cash + stockValue + optionsValue

  return {
    cash,
    lockedCollateral,
    availableCash,
    stockValue,
    optionsValue,
    totalValue
  }
}
```

### P&L Calculations
```typescript
const calculateTotalPL = (position: Position) => {
  // Stock P/L: (Current Price - Average Cost) × Shares
  const stockPL = position.shares > 0
    ? (position.currentPrice - position.avgCostBasis) × position.shares
    : 0

  // Options P/L: Net premiums received/paid
  const optionsPL = position.premiumsReceived

  // Total position P/L
  return stockPL + optionsPL
}
```

### Premium Tracking
```typescript
const getFilteredPremium = (trades: Trade[], timeframe: Timeframe) => {
  const filteredTrades = getFilteredTrades(trades, timeframe)
  return filteredTrades
    .filter((trade) => trade.side === "STO" && trade.premium > 0)
    .reduce((sum, trade) => sum + trade.premium, 0)
}

// Timeframe options: "1M", "3M", "1Y", "All"
```

## 🔍 Business Rules & Validations

### Trade Validation Rules
```typescript
const validateTrade = (trade: NewTradeForm) => {
  // 1. Stock sale validation
  if (trade.type === "Stock" && trade.stockAction === "Sell") {
    const currentPosition = positions.find(p => p.symbol === trade.symbol.toUpperCase())
    if (!currentPosition || currentPosition.shares < Number.parseInt(trade.contracts)) {
      throw new Error(`Insufficient shares to sell`)
    }
  }

  // 2. Covered call validation
  if (trade.type === "Call" && trade.side === "STO" && trade.covered) {
    const requiredShares = Math.abs(Number.parseInt(trade.contracts)) × 100
    const currentPosition = positions.find(p => p.symbol === trade.symbol.toUpperCase())
    const availableShares = currentPosition?.shares || 0
    
    // Auto-purchase stock if insufficient (handled in trade creation)
    if (availableShares < requiredShares) {
      // System will create automatic stock purchase
    }
  }

  // 3. Cash-secured put validation
  if (trade.type === "Put" && trade.side === "STO" && trade.secured) {
    const requiredCollateral = Number.parseFloat(trade.strikePrice) × 100 × Math.abs(Number.parseInt(trade.contracts))
    // Note: System allows collateral > available cash (shows as deficit)
  }

  // 4. Input validation
  if (!trade.symbol || !trade.price || !trade.contracts) {
    throw new Error("Required fields missing")
  }

  if (Number.parseFloat(trade.strikePrice) <= 0 && trade.type !== "Stock") {
    throw new Error("Strike price must be positive")
  }
}
```

### Risk Management Features
```typescript
const riskChecks = {
  // 1. Expiration alerts
  isExpiringWithin5Days: (expirationDate?: string) => {
    if (!expirationDate) return false
    const expDate = new Date(expirationDate)
    const now = new Date()
    const fiveDaysFromNow = new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000))
    return expDate <= fiveDaysFromNow && expDate >= now
  },

  // 2. Position sizing alerts
  isOverConcentrated: (position: Position, totalPortfolioValue: number) => {
    const positionValue = position.shares × position.currentPrice
    const concentration = positionValue / totalPortfolioValue
    return concentration > 0.25 // Alert if > 25% of portfolio
  },

  // 3. Margin requirements (for secured puts)
  hasAdequateCollateral: (trade: Trade, availableCash: number) => {
    if (trade.type === "Put" && trade.side === "STO" && trade.secured) {
      const requiredCollateral = trade.strikePrice × 100 × Math.abs(trade.contracts)
      return availableCash >= requiredCollateral
    }
    return true
  }
}
```

## 🎨 Trade Nomenclature System

### Display Formatting
```typescript
const formatTradeNomenclature = (trade: Trade, includePrice = true) => {
  if (trade.type === "Stock") {
    const action = trade.contracts > 0 ? "Buy" : "Sell"
    const shares = Math.abs(trade.contracts)
    return `${action} ${shares} ${trade.symbol} @ $${trade.price.toFixed(2)}`
  }

  // Options nomenclature: "STO 3 AAPL Jan19'24 $185 C @ $2.50"
  const sideDisplay = trade.side
  const contractsDisplay = Math.abs(trade.contracts)
  const expiration = trade.expirationDate ? formatOptionDate(trade.expirationDate) : ""
  const strike = trade.strikePrice ? `$${trade.strikePrice}` : ""
  const typeSymbol = trade.type === "Call" ? "C" : "P"
  const priceDisplay = includePrice ? ` @ $${trade.price.toFixed(2)}` : ""

  return `${sideDisplay} ${contractsDisplay} ${trade.symbol} ${expiration} ${strike} ${typeSymbol}${priceDisplay}`
}
```

## 📊 State Management

### Trade Status Flow
```
open → closed     (manually closed)
open → expired    (expiration date passed)
open → assigned   (option assigned)
```

### Cash Flow Tracking
```typescript
const cashFlowSources = {
  tradePremiums: "Premium received/paid on trade execution",
  commissions: "Broker fees (always negative)",
  assignments: "Cash from stock sales or purchases via assignment",
  closingTrades: "Cash impact from closing positions",
  deposits: "Manual cash additions",
  withdrawals: "Manual cash removals"
}
```

## 🎯 Key Features Summary

### Automated Features
1. **Auto-Stock Purchase**: For covered calls when insufficient shares
2. **Collateral Locking**: For cash-secured puts
3. **Position Updates**: Real-time recalculation of positions
4. **Cost Basis Tracking**: With/without premium adjustments
5. **Expiration Monitoring**: 5-day expiration alerts
6. **P&L Calculations**: Real-time profit/loss tracking

### Manual Features
1. **Trade Entry**: Full trade management with validation
2. **Trade Actions**: Close, assign, roll, edit capabilities
3. **Cash Management**: Deposit/withdrawal tracking
4. **Settings**: Commission defaults, preferences
5. **Filtering**: Time-based premium tracking
6. **Notes**: Trade-specific annotations

---

**🔧 Technical Implementation**: This logic is currently implemented across:
- **Main Application**: `prina/app/page.tsx` (2,223 lines)
- **Type Definitions**: `prina/frontend/types/trade.ts`
- **Business Logic**: `prina/frontend/hooks/useTradeManagement.ts`
- **Calculations**: `prina/frontend/lib/calculations.ts`

**📈 Complexity Level**: ADVANCED - Handles sophisticated options trading scenarios with real-world financial calculations and risk management features. 