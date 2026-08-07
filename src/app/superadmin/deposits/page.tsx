'use client'

import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, CheckCircle2, XCircle } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useDeposits, useApproveDeposit, useRejectDeposit, DepositTx } from '@/hooks/useDeposits'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function DepositsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING')
  const { data, isLoading } = useDeposits({ status: statusFilter === 'ALL' ? undefined : statusFilter })
  
  const approveMutation = useApproveDeposit()
  const rejectMutation = useRejectDeposit()
  const { toast } = useToast()

  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this deposit and credit the wallet?')) return
    try {
      await approveMutation.mutateAsync(id)
      toast({ title: 'Deposit Approved & Wallet Credited.' })
    } catch (err: any) {
      toast({ title: 'Action failed', description: err.response?.data?.message || err.message, variant: 'destructive' })
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectId) return
    try {
      await rejectMutation.mutateAsync({ id: rejectId, reason: rejectReason })
      setRejectId(null)
      setRejectReason('')
      toast({ title: 'Deposit Rejected.' })
    } catch (err: any) {
      toast({ title: 'Action failed', description: err.response?.data?.message || err.message, variant: 'destructive' })
    }
  }

  const columns: ColumnDef<DepositTx>[] = [
    {
      accessorKey: 'user',
      header: 'Player',
      cell: ({ row }) => (
        <div>
          <div className="font-bold">{row.original.user?.username || 'Unknown'}</div>
          <div className="text-xs text-muted-foreground">{row.original.user?.phone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="font-bold text-green-500">
          ₹{row.original.amount}
        </div>
      ),
    },
    {
      accessorKey: 'utr',
      header: 'UTR / Ref',
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.original.utr || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={status === 'PENDING' ? 'secondary' : status === 'COMPLETED' ? 'default' : 'destructive'} 
            className={status === 'COMPLETED' ? 'bg-green-500 hover:bg-green-600' : status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' : ''}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const tx = row.original
        if (tx.status !== 'PENDING') return null
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleApprove(tx.id)} className="text-green-500">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Deposit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRejectId(tx.id)} className="text-destructive">
                <XCircle className="mr-2 h-4 w-4" /> Reject Deposit
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
          <h1 className="text-2xl font-bold tracking-tight">Deposit Requests</h1>
          <p className="text-muted-foreground">Verify UTR numbers and approve deposits to credit user wallets.</p>
        </div>
      </div>

      <div className="flex mb-4 w-full sm:w-64">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Deposits</SelectItem>
            <SelectItem value="PENDING">Pending Approval</SelectItem>
            <SelectItem value="COMPLETED">Approved</SelectItem>
            <SelectItem value="FAILED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={data?.transactions || []} isLoading={isLoading} searchKey="utr" />

      <Dialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Deposit Request</DialogTitle></DialogHeader>
          <form onSubmit={handleReject} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Reason for rejection (sent to user)</Label>
              <Input required value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Invalid UTR Number / Payment not received" />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" variant="destructive" disabled={rejectMutation.isPending}>
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Deposit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}