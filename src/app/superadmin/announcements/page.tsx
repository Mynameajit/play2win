'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAdminAnnouncements } from '@/hooks/useAnnouncements'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { BellRing, Pin, Trash2, CalendarClock, Globe } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PageHeader } from '@/components/common/PageHeader'

export default function AnnouncementsManagement() {
  const { data: announcements, isLoading, create, update, remove } = useAdminAnnouncements()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // Form State
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('ANNOUNCEMENT')
  const [priority, setPriority] = useState('MEDIUM')
  const [targetRole, setTargetRole] = useState('ALL')
  const [isPinned, setIsPinned] = useState(false)
  
  const handleCreate = async () => {
    if (!title || !message) {
      toast({ title: 'Error', description: 'Title and message are required', variant: 'destructive' })
      return
    }

    try {
      await create.mutateAsync({
        title,
        message,
        type,
        priority,
        targetRole: targetRole === 'ALL' ? null : targetRole,
        isPinned
      })
      toast({ title: 'Success', description: 'Announcement created successfully' })
      setIsCreateModalOpen(false)
      // Reset
      setTitle('')
      setMessage('')
      setIsPinned(false)
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to create announcement', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await remove.mutateAsync(id)
        toast({ title: 'Success', description: 'Announcement deleted' })
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to delete announcement', variant: 'destructive' })
      }
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <PageHeader />
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Announcements Management</h2>
          <p className="text-muted-foreground mt-1">Manage global system announcements and offers.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <BellRing className="w-4 h-4 mr-2" />
          Create
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <p>Loading announcements...</p>
        ) : announcements?.length === 0 ? (
          <Card className="bg-black/40 border-white/10">
            <CardContent className="p-8 text-center text-muted-foreground">
              No announcements found.
            </CardContent>
          </Card>
        ) : (
          announcements?.map(ann => (
            <Card key={ann.id} className={`bg-black/40 border-white/10 ${ann.isPinned ? 'border-purple-500/50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-lg">{ann.title}</h3>
                      {ann.isPinned && <Badge variant="secondary" className="bg-purple-500/20 text-purple-300"><Pin className="w-3 h-3 mr-1" /> Pinned</Badge>}
                      <Badge variant="outline" className="opacity-80">{ann.type}</Badge>
                      <Badge variant={ann.priority === 'HIGH' ? 'destructive' : 'secondary'} className="opacity-80">{ann.priority}</Badge>
                      <Badge variant="outline" className="opacity-80">
                        <Globe className="w-3 h-3 mr-1" /> 
                        {ann.targetRole ? `Role: ${ann.targetRole}` : 'All Users'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground whitespace-pre-wrap mt-2">{ann.message}</p>
                    <div className="text-xs text-muted-foreground mt-4 flex items-center gap-4">
                      <span>Created by {ann.admin?.username || 'System'}</span>
                      <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" /> {new Date(ann.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="hover:text-red-400" onClick={() => handleDelete(ann.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g. Diwali Offer Extravaganza!" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type announcement message..." className="min-h-[100px]" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                    <SelectItem value="OFFER">Offer</SelectItem>
                    <SelectItem value="SYSTEM">System</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Users</SelectItem>
                    <SelectItem value="ADMIN">Admins Only</SelectItem>
                    <SelectItem value="SUPERADMIN">Super Admins Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 p-4 border border-white/10 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Pin to Dashboard</Label>
                <p className="text-sm text-muted-foreground">Keep this announcement at the top</p>
              </div>
              <Switch checked={isPinned} onCheckedChange={setIsPinned} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={create.isPending} className="bg-purple-600 hover:bg-purple-700">
              {create.isPending ? 'Publishing...' : 'Publish Announcement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
