"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Crown } from "lucide-react"
import { AppSettings } from "@/types/dashboard"

interface SettingsDialogProps {
  showSettings: boolean
  setShowSettings: (show: boolean) => void
  appSettings: AppSettings
  setAppSettings: (settings: AppSettings | ((prev: AppSettings) => AppSettings)) => void
  setShowPricingModal: (show: boolean) => void
}

export const SettingsDialog = ({
  showSettings,
  setShowSettings,
  appSettings,
  setAppSettings,
  setShowPricingModal,
}: SettingsDialogProps) => {
  return (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-gray-200/50 dark:border-gray-800/50 max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="defaultCommission" className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Commission ($)</Label>
              <Input
                id="defaultCommission"
                type="number"
                step="0.01"
                value={appSettings.defaultCommission}
                onChange={(e) =>
                  setAppSettings((prev) => ({ ...prev, defaultCommission: Number.parseFloat(e.target.value) }))
                }
                className="h-10 mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={appSettings.emailNotifications}
                onCheckedChange={(checked) => setAppSettings((prev) => ({ ...prev, emailNotifications: checked }))}
                className="data-[state=checked]:bg-gray-900 dark:data-[state=checked]:bg-gray-100"
              />
            </div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Upgrade your Plan</h4>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Premium Plan</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unlimited trades</p>
                </div>
              </div>
              <Button 
                className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 transition-colors" 
                size="sm" 
                onClick={() => setShowPricingModal(true)}
              >
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 