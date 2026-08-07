'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMaintenanceCounts, useResetModule, useFactoryReset } from '@/hooks/useMaintenance'
import { useToast } from '@/hooks/use-toast'
import { ResetDialog } from '@/components/superadmin/ResetDialog'
import { Trash2, AlertTriangle, ShieldAlert } from 'lucide-react'

export default function MaintenancePage() {
  const { data: counts, isLoading } = useMaintenanceCounts()
  const resetModuleMutation = useResetModule()
  const factoryResetMutation = useFactoryReset()
  const { toast } = useToast()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<{
    module: string,
    title: string,
    description: string,
    expectedPhrase: string,
    isFactory: boolean
  } | null>(null)

  const modules = [
    { id: 'users', label: 'Users', description: 'Delete all users except Super Admin', countKey: 'users' },
    { id: 'admins', label: 'Admins', description: 'Delete all admins', countKey: 'admins' },
    { id: 'games', label: 'Games', description: 'Delete all registered games', countKey: 'games' },
    { id: 'tournaments', label: 'Tournaments', description: 'Delete all tournaments (matches)', countKey: 'tournaments' },
    { id: 'participants', label: 'Participants', description: 'Delete all match participants', countKey: 'participants' },
    { id: 'walletTransactions', label: 'Wallet Transactions', description: 'Clear all wallet ledgers', countKey: 'walletTransactions' },
    { id: 'notifications', label: 'Notifications', description: 'Delete all notifications', countKey: 'notifications' },
    { id: 'supportTickets', label: 'Support Tickets', description: 'Delete all support tickets', countKey: 'supportTickets' },
    { id: 'activityLogs', label: 'Activity Logs', description: 'Delete user activity logs', countKey: 'activityLogs' },
    { id: 'systemLogs', label: 'System Logs', description: 'Clear internal system logs', countKey: 'systemLogs' },
    { id: 'results', label: 'Match Results', description: 'Delete all uploaded match results', countKey: 'results' },
    { id: 'coupons', label: 'Coupons', description: 'Delete all discount coupons', countKey: 'coupons' },
    { id: 'referralData', label: 'Referral Data', description: 'Clear all referral trees', countKey: 'referralData' },
  ]

  const handleOpenDialog = (modId: string, label: string) => {
    setSelectedAction({
      module: modId,
      title: `Reset ${label}`,
      description: `This will permanently delete all records in the ${label} module. This action cannot be undone.`,
      expectedPhrase: 'DELETE',
      isFactory: false
    })
    setDialogOpen(true)
  }

  const handleOpenFactoryReset = () => {
    setSelectedAction({
      module: 'ALL',
      title: `Factory Reset Database`,
      description: `WARNING: This will wipe out ALL data including Users, Tournaments, Balances, and Logs. Only Super Admin credentials and System Settings will survive. You will be forcefully logged out.`,
      expectedPhrase: 'RESET DATABASE',
      isFactory: true
    })
    setDialogOpen(true)
  }

  const handleConfirmReset = async (password: string) => {
    if (!selectedAction) return
    try {
      if (selectedAction.isFactory) {
        await factoryResetMutation.mutateAsync({ password })
        toast({ title: 'Factory Reset Complete', description: 'Redirecting to login...' })
        // Usually socket will force redirect, but just in case
        setTimeout(() => window.location.href = '/login', 3000)
      } else {
        await resetModuleMutation.mutateAsync({ module: selectedAction.module, password })
        toast({ title: 'Module Reset Successful', description: `${selectedAction.title} completed.` })
      }
    } catch (err: any) {
      throw err // Let dialog handle error display
    }
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 pb-20">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-red-500" /> Database Maintenance
        </h1>
        <p className="text-slate-400 mt-2">
          Secure zone for resetting system modules. Proceed with extreme caution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <Card key={mod.id} className="border-red-900/30 bg-slate-900/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center text-slate-200">
                {mod.label}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 h-8">
                {mod.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {isLoading ? '...' : (counts as any)?.[mod.countKey] || 0}
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Current Records</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full"
                onClick={() => handleOpenDialog(mod.id, mod.label)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Reset
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-red-900/50">
        <div className="rounded-2xl border border-red-600/30 bg-red-950/20 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-600/20 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-red-500">Factory Reset Database</h2>
              <p className="text-red-400/80 mt-2 max-w-2xl">
                This is a catastrophic action. It will delete everything including all Users, Transactions, and Tournaments. 
                Only the Super Admin Account, System Config, Payment Settings, and Cloudinary Config will be retained.
                Use only when migrating environments or destroying the instance.
              </p>
              
              <Button 
                variant="destructive" 
                className="mt-6 font-bold bg-red-600 hover:bg-red-700 h-12 px-8"
                onClick={handleOpenFactoryReset}
              >
                <Trash2 className="w-5 h-5 mr-2" /> EXECUTE FACTORY RESET
              </Button>
            </div>
          </div>
        </div>
      </div>

      {selectedAction && (
        <ResetDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={selectedAction.title}
          description={selectedAction.description}
          expectedPhrase={selectedAction.expectedPhrase}
          isFactoryReset={selectedAction.isFactory}
          onConfirm={handleConfirmReset}
        />
      )}
    </div>
  )
}
