'use client'

import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Ban, ShieldCheck, Eye, Search } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUsers, useToggleBlockUser, useUserDetails, User } from '@/hooks/useUsers'
import { useToast } from '@/hooks/use-toast'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data, isLoading, isError } = useUsers({ search: searchTerm })
  const toggleBlockMutation = useToggleBlockUser()
  const { toast } = useToast()

  const [viewUserId, setViewUserId] = useState<string | null>(null)
  const { data: userDetails, isLoading: detailsLoading } = useUserDetails(viewUserId || '')

  const handleToggleBlock = async (id: string, currentStatus: boolean) => {
    try {
      await toggleBlockMutation.mutateAsync(id)
      toast({ title: `User ${currentStatus ? 'unblocked' : 'blocked'} successfully.` })
    } catch (err: any) {
      toast({ title: 'Action failed', description: err.message, variant: 'destructive' })
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }) => (
        <div>
          <div className="font-bold">{row.getValue('username')}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'isOnline',
      header: 'Status',
      cell: ({ row }) => {
        const isOnline = row.getValue('isOnline') as boolean
        return (
          <Badge variant={isOnline ? 'default' : 'secondary'} className={isOnline ? 'bg-green-500/10 text-green-500' : ''}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'depositBalance',
      header: 'Deposit Balance',
      cell: ({ row }) => <div className="font-medium text-orange-400">₹{parseFloat(row.getValue('depositBalance') || '0').toFixed(2)}</div>,
    },
    {
      accessorKey: 'winningBalance',
      header: 'Winning Balance',
      cell: ({ row }) => <div className="font-medium text-green-500">₹{parseFloat(row.getValue('winningBalance') || '0').toFixed(2)}</div>,
    },
    {
      accessorKey: 'isBlocked',
      header: 'Account State',
      cell: ({ row }) => {
        const isBlocked = row.getValue('isBlocked') as boolean
        return (
          <Badge variant={isBlocked ? 'destructive' : 'outline'}>
            {isBlocked ? 'Blocked' : 'Active'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewUserId(user.id)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleBlock(user.id, user.isBlocked)} className={user.isBlocked ? 'text-green-500 focus:text-green-500' : 'text-destructive focus:text-destructive'}>
                {user.isBlocked ? (
                  <><ShieldCheck className="mr-2 h-4 w-4" /> Unban User</>
                ) : (
                  <><Ban className="mr-2 h-4 w-4" /> Ban User</>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage accounts, view wallets, and moderate players.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Username, Email, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data?.users || []} 
        isLoading={isLoading} 
      />

      <Dialog open={!!viewUserId} onOpenChange={() => setViewUserId(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {detailsLoading ? (
              <p>Loading profile...</p>
            ) : userDetails ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground mb-2">Basic Info</h3>
                  <div className="space-y-1">
                    <p><strong>Name:</strong> {userDetails.fullName || 'N/A'}</p>
                    <p><strong>Username:</strong> {userDetails.username}</p>
                    <p><strong>Email:</strong> {userDetails.email}</p>
                    <p><strong>Phone:</strong> {userDetails.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground mb-2">In-Game Identities</h3>
                  <div className="space-y-1">
                    <p><strong>BGMI IGN:</strong> {userDetails.bgmiIgn || 'N/A'}</p>
                    <p><strong>BGMI UID:</strong> {userDetails.bgmiUid || 'N/A'}</p>
                    <p><strong>Free Fire IGN:</strong> {userDetails.freefireIgn || 'N/A'}</p>
                    <p><strong>Free Fire UID:</strong> {userDetails.freefireUid || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="col-span-2 pt-4 border-t">
                  <h3 className="text-sm font-bold text-muted-foreground mb-2">Recent Transactions</h3>
                  {userDetails.transactions?.length > 0 ? (
                    <div className="space-y-2">
                      {userDetails.transactions.map((tx: any) => (
                        <div key={tx.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                          <span>{tx.type}</span>
                          <span className={tx.amount > 0 ? 'text-green-500' : 'text-red-500'}>
                            {tx.amount > 0 ? '+' : ''}₹{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent transactions.</p>
                  )}
                </div>
              </div>
            ) : (
              <p>User details not found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
