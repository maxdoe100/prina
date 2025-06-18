import { useState, useEffect, useCallback } from "react"
import type { Trade, Position } from "../types/trade"
import { getRandomPrice } from "../lib/calculations"

export const usePositions = (trades: Trade[]) => {
  const [positions, setPositions] = useState<Position[]>([])

  const updatePositions = useCallback(() => {
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
  }, [trades])

  useEffect(() => {
    updatePositions()
  }, [updatePositions])

  return {
    positions,
    updatePositions,
  }
} 