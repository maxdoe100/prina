"use client"

import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowDownLeft, ArrowUpLeft } from "lucide-react"
import { useTheme } from "next-themes"

// Custom hooks
import { useDashboardState } from "@/hooks/useDashboardState"
import { useTradeOperations } from "@/hooks/useTradeOperations"

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { PortfolioOverview } from "@/components/dashboard/PortfolioOverview"
import { NewTradeForm } from "@/components/dashboard/NewTradeForm"
import { PositionsTab } from "@/components/dashboard/PositionsTab"
import { TradesTab } from "@/components/dashboard/TradesTab"
import { TradeActionDialog } from "@/components/dashboard/TradeActionDialog"

// Dialog components
import { CashModal } from "@/components/dashboard/dialogs/CashModal"
import { SettingsDialog } from "@/components/dashboard/dialogs/SettingsDialog"
import { PricingModal } from "@/components/dashboard/dialogs/PricingModal"
import { TradeSummaryDialog } from "@/components/dashboard/dialogs/TradeSummaryDialog"

export default function OptionsTracker() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  
  // Use our custom hooks
  const dashboardState = useDashboardState()
  const tradeOperations = useTradeOperations({
    ...dashboardState,
    defaultCommission: dashboardState.appSettings.defaultCommission,
  })

  const {
    // Core data
    positions,
    trades,
    cash,
    setCash,
    lockedCollateral,
    setLockedCollateral,
    premiumCollected,
    portfolioValue,
    timeframe,
    setTimeframe,
    
    // UI state
    activeTab,
    setActiveTab,
    includePremiums,
    setIncludePremiums,
    animatingTrade,
    editingTrade,
    setEditingTrade,
    
    // Modal states
    showSettings,
    setShowSettings,
    showPricingModal,
    setShowPricingModal,
    showCashModal,
    setShowCashModal,
    showTradeSummary,
    setShowTradeSummary,
    cashAction,
    setCashAction,
    
    // App settings
    appSettings,
    setAppSettings,
    
    // Form states
    newTrade,
    setNewTrade,
    tradeSummaryData,
    setTradeSummaryData,
    
    // Helper functions
    getFilteredTrades,
    getFilteredPremium,
    clearForm,
  } = dashboardState

  const {
    handleAddTrade,
    handleEditTrade,
    handleCloseTrade,
    handleAssignTrade,
    handleRollTrade,
    handleRemoveTrade,
    handleCashTransaction,
    confirmTrade,
  } = tradeOperations

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900">
      {/* Header */}
      <DashboardHeader
        onSettingsOpen={() => setShowSettings(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Portfolio Overview */}
            <PortfolioOverview
              portfolioValue={portfolioValue}
              cash={cash}
              lockedCollateral={lockedCollateral}
              premiumCollected={getFilteredPremium()}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              setShowCashModal={setShowCashModal}
            />

            {/* Add New Trade */}
            <NewTradeForm
              newTrade={newTrade}
              setNewTrade={setNewTrade}
              onAddTrade={handleAddTrade}
              onClearForm={clearForm}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex justify-between items-center">
                <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <TabsTrigger value="positions" className="text-gray-700 dark:text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-900 dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900">Positions</TabsTrigger>
                  <TabsTrigger value="trades" className="text-gray-700 dark:text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-900 dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900">Trades</TabsTrigger>
                </TabsList>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCashAction("deposit")
                      setShowCashModal(true)
                    }}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
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
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  >
                    <ArrowUpLeft className="w-4 h-4 mr-2" />
                    Withdraw
                  </Button>
                </div>
              </div>

              <TabsContent value="positions" className="space-y-6">
                <PositionsTab
                  positions={positions}
                  includePremiums={includePremiums}
                  setIncludePremiums={setIncludePremiums}
                  onEditTrade={setEditingTrade}
                  animatingTrade={animatingTrade}
                />
              </TabsContent>

              <TabsContent value="trades" className="space-y-6">
                <TradesTab
                  trades={trades}
                  onEditTrade={setEditingTrade}
                  animatingTrade={animatingTrade}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <TradeActionDialog
        trade={editingTrade}
        onClose={() => setEditingTrade(null)}
        onCloseTrade={handleCloseTrade}
        onAssignTrade={handleAssignTrade}
        onRollTrade={handleRollTrade}
        onRemoveTrade={handleRemoveTrade}
        onEditTrade={(trade) => {
          // For now, just close the dialog when edit is clicked
          // TODO: Implement proper edit dialog
          console.log('Edit trade:', trade)
          setEditingTrade(null)
        }}
        defaultCommission={appSettings.defaultCommission}
        cash={cash}
        setCash={setCash}
        lockedCollateral={lockedCollateral}
        setLockedCollateral={setLockedCollateral}
      />
      
      <CashModal
        showCashModal={showCashModal}
        setShowCashModal={setShowCashModal}
        cashAction={cashAction}
        setCashAction={setCashAction}
        cash={cash}
        onCashTransaction={handleCashTransaction}
      />
      
      <SettingsDialog
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        appSettings={appSettings}
        setAppSettings={setAppSettings}
        setShowPricingModal={setShowPricingModal}
      />
      
      <PricingModal
        showPricingModal={showPricingModal}
        setShowPricingModal={setShowPricingModal}
      />
      
      <TradeSummaryDialog
        showTradeSummary={showTradeSummary}
        setShowTradeSummary={setShowTradeSummary}
        tradeSummaryData={tradeSummaryData}
        onConfirmTrade={confirmTrade}
      />
    </div>
  )
}
