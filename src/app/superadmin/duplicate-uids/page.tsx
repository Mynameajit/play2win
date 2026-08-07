'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, UserMinus, ShieldAlert, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DuplicateGroup {
  field: string
  uid: string
  users: {
    id: string
    username: string
    email: string
    [key: string]: any
    createdAt: string
  }[]
}

export default function DuplicateUidsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: duplicates = [], isLoading } = useQuery<DuplicateGroup[]>({
    queryKey: ['duplicateUids'],
    queryFn: async () => {
      const res = await apiClient.get('/superadmin/duplicate-uids')
      return res.data
    }
  })

  const resolveMutation = useMutation({
    mutationFn: async ({ userId, field }: { userId: string, field: string }) => {
      const res = await apiClient.post('/superadmin/duplicate-uids/resolve', { userId, field })
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Duplicate resolved', description: 'The UID has been cleared from the user profile.' })
      queryClient.invalidateQueries({ queryKey: ['duplicateUids'] })
    },
    onError: (err: any) => {
      toast({ title: 'Resolution failed', variant: 'destructive', description: err.response?.data?.message || err.message })
    }
  })

  const handleResolve = (userId: string, field: string) => {
    if (confirm('Are you sure you want to clear the Game UID for this user to resolve the duplicate?')) {
      resolveMutation.mutate({ userId, field })
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Scanning for duplicate Game UIDs...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Duplicate UID Report</h1>
        <p className="text-muted-foreground">Scan and resolve duplicate game UIDs across the platform.</p>
      </div>

      {duplicates.length === 0 ? (
        <div className="border border-green-500/50 bg-green-500/10 rounded-lg p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="text-green-500 font-bold mb-1">System Secure</h4>
            <p className="text-green-400 text-sm">
              No duplicate Game UIDs found in the database. The database is clean and unique constraints are safe.
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-destructive/50 bg-destructive/10 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <h4 className="text-destructive font-bold mb-1">Duplicates Detected</h4>
            <p className="text-destructive/90 text-sm">
              Found {duplicates.length} duplicate UID group(s). Please clear the UID from fake or incorrect accounts to restore global uniqueness.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {duplicates.map((group, i) => (
          <Card key={i} className="border-destructive/50">
            <CardHeader className="bg-destructive/10 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Duplicate {group.field}: <span className="font-mono text-destructive bg-background px-2 py-1 rounded">{group.uid}</span>
              </CardTitle>
              <CardDescription>
                This UID is being used by {group.users.length} different users.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {group.users.map(user => (
                  <div key={user.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{user.username}</h3>
                      <div className="text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                        <p>ID: <span className="font-mono text-xs">{user.id}</span></p>
                        <p>Email: {user.email}</p>
                        <p>Created: {new Date(user.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleResolve(user.id, group.field)}
                      disabled={resolveMutation.isPending}
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Clear UID from User
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
