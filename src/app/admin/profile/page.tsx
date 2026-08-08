'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { toast } from '@/hooks/use-toast'
import { UserCircle, LogOut, Camera, Trash } from 'lucide-react'
import apiClient from '@/lib/apiClient'
import { uploadImage } from '@/hooks/useAdminOps'
import { Input } from '@/components/ui/input'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'

export default function AdminProfilePage() {
  const { userRole, socket, handleLogout } = useApp()
  const queryClient = useQueryClient()
  
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/profile')
        if (res.data) {
          setProfile(res.data.user)
          setStats(res.data.stats)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchProfile()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const avatarUrl = await uploadImage(file)
      await apiClient.put('/profile', { avatarUrl })
      setProfile((prev: any) => ({ ...prev, profilePhoto: avatarUrl }))
      toast({ title: 'Profile photo updated successfully' })
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    try {
      await apiClient.put('/profile', { avatarUrl: null })
      setProfile((prev: any) => ({ ...prev, profilePhoto: null }))
      toast({ title: 'Profile photo removed' })
    } catch (error: any) {
      toast({ title: 'Removal failed', description: error.message, variant: 'destructive' })
    }
  }

  const performLogout = () => {
    queryClient.clear()
    if (socket) {
      socket.disconnect()
    }
    handleLogout()
  }

  if (!profile) return <div className="p-8">Loading profile...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">Manage your admin profile details.</p>
        </div>
        
        <Button 
          variant="destructive" 
          className="gap-2"
          onClick={() => {
            if (window.confirm('Are you sure you want to logout? This will end your current session and disconnect you from real-time updates.')) {
              performLogout()
            }
          }}
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative h-32 w-32 rounded-full overflow-hidden bg-muted border-4 border-background shadow-sm flex items-center justify-center">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-20 w-20 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <Button variant="outline" className="w-full gap-2" disabled={isUploading}>
                  <Camera className="h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Change'}
                </Button>
              </div>
              {profile.profilePhoto && (
                <Button variant="outline" size="icon" onClick={handleRemoveImage} disabled={isUploading}>
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" /> Admin Details
            </CardTitle>
            <CardDescription>Your personal information and account statistics.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Username</Label>
              <div className="font-medium p-2 bg-muted/50 rounded border">{profile.username}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <div className="font-medium p-2 bg-muted/50 rounded border">{profile.fullName || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <div className="font-medium p-2 bg-muted/50 rounded border">{profile.email}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Mobile Number</Label>
              <div className="font-medium p-2 bg-muted/50 rounded border">{profile.phone || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <div className="font-medium p-2 bg-muted/50 rounded border text-primary">{profile.role || userRole}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Account Status</Label>
              <div className="font-medium p-2 bg-muted/50 rounded border text-green-500">ACTIVE</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Assigned Tournament Count</Label>
              <div className="font-medium p-2 bg-muted/50 rounded border">{stats?.totalTournamentsCreated || 0}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Results Approved</Label>
              <div className="font-medium p-2 bg-muted/50 rounded border">{stats?.totalResultsApproved || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
