'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function AdminSettingsPage() {
  const handleSave = () => {
    toast({ title: 'Settings saved successfully' })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your Admin panel preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you receive alerts for your assigned matches.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="room-updates" className="flex flex-col space-y-1">
              <span>Room Updates</span>
              <span className="font-normal text-xs text-muted-foreground">Get notified when room credentials are changed.</span>
            </Label>
            <Switch id="room-updates" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="match-starts" className="flex flex-col space-y-1">
              <span>Match Starts</span>
              <span className="font-normal text-xs text-muted-foreground">Alert 15 minutes before your assigned match starts.</span>
            </Label>
            <Switch id="match-starts" defaultChecked />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="new-tickets" className="flex flex-col space-y-1">
              <span>New Support Tickets</span>
              <span className="font-normal text-xs text-muted-foreground">Notify when a new ticket is assigned to you.</span>
            </Label>
            <Switch id="new-tickets" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="results-review" className="flex flex-col space-y-1">
              <span>Results Review</span>
              <span className="font-normal text-xs text-muted-foreground">Notify when Super Admin reviews your uploaded results.</span>
            </Label>
            <Switch id="results-review" defaultChecked />
          </div>
          
          <Button onClick={handleSave} className="gap-2 mt-4">
            <Save className="h-4 w-4" /> Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
