'use client'

import React, { useEffect, useState } from 'react'
import { Settings, Save, ShieldAlert, Wallet, Smartphone, Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { data: initialSettings, isLoading } = useSettings()
  const updateMutation = useUpdateSettings()
  const { toast } = useToast()

  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings)
    }
  }, [initialSettings])

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleToggle = (key: string, checked: boolean) => {
    setSettings(prev => ({ ...prev, [key]: checked ? 'true' : 'false' }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateMutation.mutateAsync(settings)
      toast({ title: 'System settings saved successfully.' })
    } catch (err: any) {
      toast({ title: 'Failed to save settings', variant: 'destructive' })
    }
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading system configuration...</div>

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure global platform variables, limits, and maintenance modes.</p>
        </div>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save All Settings</>}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* General & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-500" /> Platform Status</CardTitle>
            <CardDescription>Global security and maintenance controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border p-3 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Disable user logins and matches.</p>
              </div>
              <Switch 
                checked={settings['MAINTENANCE_MODE'] === 'true'} 
                onCheckedChange={(c) => handleToggle('MAINTENANCE_MODE', c)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Support WhatsApp Number</Label>
              <Input 
                value={settings['SUPPORT_WHATSAPP'] || ''} 
                onChange={(e) => handleChange('SUPPORT_WHATSAPP', e.target.value)} 
                placeholder="+91..."
              />
            </div>
            <div className="space-y-2">
              <Label>Support Email Address</Label>
              <Input 
                type="email"
                value={settings['SUPPORT_EMAIL'] || ''} 
                onChange={(e) => handleChange('SUPPORT_EMAIL', e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-green-500" /> Financial Limits</CardTitle>
            <CardDescription>Minimum and maximum transaction boundaries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Deposit (₹)</Label>
                <Input 
                  type="number" 
                  value={settings['MIN_DEPOSIT'] || '10'} 
                  onChange={(e) => handleChange('MIN_DEPOSIT', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Max Deposit (₹)</Label>
                <Input 
                  type="number" 
                  value={settings['MAX_DEPOSIT'] || '10000'} 
                  onChange={(e) => handleChange('MAX_DEPOSIT', e.target.value)} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Withdrawal (₹)</Label>
                <Input 
                  type="number" 
                  value={settings['MIN_WITHDRAWAL'] || '50'} 
                  onChange={(e) => handleChange('MIN_WITHDRAWAL', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Withdrawal Fee (%)</Label>
                <Input 
                  type="number" 
                  value={settings['WITHDRAWAL_FEE_PERCENT'] || '0'} 
                  onChange={(e) => handleChange('WITHDRAWAL_FEE_PERCENT', e.target.value)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards & Affiliates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-purple-500" /> Rewards & Affiliates</CardTitle>
            <CardDescription>Configure referral bonuses and sign-up rewards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sign-up Bonus (₹)</Label>
                <Input 
                  type="number" 
                  value={settings['SIGNUP_BONUS'] || '10'} 
                  onChange={(e) => handleChange('SIGNUP_BONUS', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Referral Bonus (₹)</Label>
                <Input 
                  type="number" 
                  value={settings['REFERRAL_BONUS'] || '10'} 
                  onChange={(e) => handleChange('REFERRAL_BONUS', e.target.value)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Versioning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Smartphone className="w-5 h-5 text-orange-500" /> App Versioning</CardTitle>
            <CardDescription>Force users to update their APK.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current APK Version</Label>
                <Input 
                  value={settings['APP_VERSION'] || '1.0.0'} 
                  onChange={(e) => handleChange('APP_VERSION', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Update URL</Label>
                <Input 
                  type="url"
                  value={settings['APP_DOWNLOAD_URL'] || ''} 
                  onChange={(e) => handleChange('APP_DOWNLOAD_URL', e.target.value)} 
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex items-center justify-between border p-3 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Force Update</Label>
                <p className="text-sm text-muted-foreground">Block old versions from opening.</p>
              </div>
              <Switch 
                checked={settings['FORCE_UPDATE'] === 'true'} 
                onCheckedChange={(c) => handleToggle('FORCE_UPDATE', c)} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}