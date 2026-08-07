'use client'

import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, CheckCircle2, XCircle, Download } from 'lucide-react'
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
import { useWithdrawals, useApproveWithdrawal, useRejectWithdrawal, WithdrawalTx } from '@/hooks/useWithdrawals'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function WithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING')
  const { data, isLoading } = useWithdrawals({ status: statusFilter === 'ALL' ? undefined : statusFilter })
  
  const approveMutation = useApproveWithdrawal()
  const rejectMutation = useRejectWithdrawal()
  const { toast } = useToast()

  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async (id: string) => {
    if (!confirm('Have you transferred the funds successfully? Approving this will mark the payout as completed.')) return
    try {
      await approveMutation.mutateAsync(id)
      toast({ title: 'Withdrawal Approved & Processed.' })
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
      toast({ title: 'Withdrawal Rejected. Funds refunded to user.' })
    } catch (err: any) {
      toast({ title: 'Action failed', description: err.response?.data?.message || err.message, variant: 'destructive' })
    }
  }

  const exportCSV = () => {
    if (!data?.transactions) return
    const headers = 'Player,Phone,Amount,Details/UPI,Status,Requested At\n'
    const csv = data.transactions.map(tx => 
      `"${tx.user.username}","${tx.user.phone}","${tx.amount}","${tx.details || ''}","${tx.status}","${new Date(tx.createdAt).toLocaleString()}"`
    ).join('\n')

    const blob = new Blob([headers + csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `withdrawals_export_${new Date().getTime()}.csv`
    a.click()
  }

  const columns: ColumnDef<WithdrawalTx>[] = [
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
      header: 'Payout Amount',
      cell: ({ row }) => (
        <div className="font-bold text-red-500">
          ₹{row.original.amount}
        </div>
      ),
    },
    {
      accessorKey: 'details',
      header: 'Payout Details (UPI)',
      cell: ({ row }) => (
        <div className="font-mono text-sm max-w-[250px] truncate" title={row.original.details}>
          {row.original.details || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Requested On',
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
                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve & Complete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRejectId(tx.id)} className="text-destructive">
                <XCircle className="mr-2 h-4 w-4" /> Reject & Refund
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
          <h1 className="text-2xl font-bold tracking-tight">Withdrawal Requests</h1>
          <p className="text-muted-foreground">Process user payouts, approve UPI transfers, and manage refunds.</p>
        </div>
        <Button onClick={exportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex mb-4 w-full sm:w-64">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Withdrawals</SelectItem>
            <SelectItem value="PENDING">Pending Approval</SelectItem>
            <SelectItem value="COMPLETED">Processed</SelectItem>
            <SelectItem value="FAILED">Rejected / Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={data?.transactions || []} isLoading={isLoading} searchKey="details" />

      <Dialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Withdrawal Request</DialogTitle></DialogHeader>
          <form onSubmit={handleReject} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Reason for rejection (Funds will be refunded automatically)</Label>
              <Input required value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Invalid UPI ID / Suspicious Activity" />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" variant="destructive" disabled={rejectMutation.isPending}>
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject & Refund Funds'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}