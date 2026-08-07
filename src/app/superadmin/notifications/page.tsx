'use client'

import React, { useState } from 'react'
import { Send, RadioTower } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSendNotification, useBroadcastNotification } from '@/hooks/useAdminNotifications'
import { useToast } from '@/hooks/use-toast'

export default function NotificationsPage() {
  const sendMutation = useSendNotification()
  const broadcastMutation = useBroadcastNotification()
  const { toast } = useToast()

  const [sendForm, setSendForm] = useState({ userId: '', title: '', description: '', type: 'SYSTEM', priority: 'NORMAL' })
  const [broadcastForm, setBroadcastForm] = useState({ title: '', description: '', type: 'SYSTEM', priority: 'HIGH' })

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await sendMutation.mutateAsync(sendForm)
      setSendForm({ userId: '', title: '', description: '', type: 'SYSTEM', priority: 'NORMAL' })
      toast({ title: 'Notification sent to user successfully.' })
    } catch (err: any) {
      toast({ title: 'Failed to send', description: err.response?.data?.error || err.message, variant: 'destructive' })
    }
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm('Are you sure you want to broadcast this message to ALL users?')) return
    try {
      await broadcastMutation.mutateAsync(broadcastForm)
      setBroadcastForm({ title: '', description: '', type: 'SYSTEM', priority: 'HIGH' })
      toast({ title: 'Broadcast dispatched to all users.' })
    } catch (err: any) {
      toast({ title: 'Broadcast failed', description: err.response?.data?.error || err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Push Notifications</h1>
        <p className="text-muted-foreground">Send targeted alerts or broadcast system-wide messages to players.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Send className="w-5 h-5 text-blue-500" /> Targeted Notification</CardTitle>
            <CardDescription>Send an alert to a specific player via User ID.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <Label>User ID (ObjectId)</Label>
                <Input required value={sendForm.userId} onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })} placeholder="Enter User ID" />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={sendForm.title} onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })} placeholder="Notification Title" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={sendForm.description} onChange={(e) => setSendForm({ ...sendForm, description: e.target.value })} placeholder="Message content..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={sendForm.type} onValueChange={(val: any) => setSendForm({ ...sendForm, type: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SYSTEM">System Alert</SelectItem>
                      <SelectItem value="PROMO">Promotional</SelectItem>
                      <SelectItem value="WALLET">Wallet Update</SelectItem>
                      <SelectItem value="MATCH">Match Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={sendForm.priority} onValueChange={(val: any) => setSendForm({ ...sendForm, priority: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={sendMutation.isPending}>
                {sendMutation.isPending ? 'Sending...' : 'Send Notification'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><RadioTower className="w-5 h-5 text-primary" /> Global Broadcast</CardTitle>
            <CardDescription>Send a mass notification to EVERY registered user.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={broadcastForm.title} onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })} placeholder="Announcement Title" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea required value={broadcastForm.description} onChange={(e) => setBroadcastForm({ ...broadcastForm, description: e.target.value })} placeholder="Important broadcast message..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={broadcastForm.type} onValueChange={(val: any) => setBroadcastForm({ ...broadcastForm, type: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SYSTEM">System Alert</SelectItem>
                      <SelectItem value="PROMO">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={broadcastForm.priority} onValueChange={(val: any) => setBroadcastForm({ ...broadcastForm, priority: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent (Flash)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" variant="default" className="w-full mt-2" disabled={broadcastMutation.isPending}>
                {broadcastMutation.isPending ? 'Broadcasting...' : 'Broadcast to All Users'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}