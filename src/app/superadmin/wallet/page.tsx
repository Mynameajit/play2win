'use client'

import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Plus, Minus, Search } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useWalletTransactions, useAdjustWallet, WalletTx } from '@/hooks/useWallet'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function WalletPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const { data, isLoading } = useWalletTransactions({ search: searchTerm, type: typeFilter === 'ALL' ? undefined : typeFilter })
  
  const adjustMutation = useAdjustWallet()
  const { toast } = useToast()

  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [adjustForm, setAdjustForm] = useState({
    userId: '',
    type: 'CREDIT' as 'CREDIT' | 'DEBIT',
    walletType: 'DEPOSIT' as 'DEPOSIT' | 'WINNING' | 'BONUS',
    amount: '',
    reason: ''
  })

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await adjustMutation.mutateAsync({
        ...adjustForm,
        amount: Number(adjustForm.amount)
      })
      setIsAdjustOpen(false)
      setAdjustForm({ userId: '', type: 'CREDIT', walletType: 'DEPOSIT', amount: '', reason: '' })
      toast({ title: 'Wallet adjusted successfully.' })
    } catch (err: any) {
      toast({ title: 'Adjustment failed', description: err.response?.data?.error || err.message, variant: 'destructive' })
    }
  }

  const columns: ColumnDef<WalletTx>[] = [
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
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type
        return (
          <Badge variant="outline" className={
            type.includes('CREDIT') || type === 'DEPOSIT' || type === 'WINNINGS' || type === 'COUPON_BONUS' ? 'border-green-500 text-green-500' :
            type.includes('DEBIT') || type === 'WITHDRAWAL' || type === 'ENTRY_FEE' ? 'border-red-500 text-red-500' : ''
          }>
            {type.replace('_', ' ')}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const isCredit = ['DEPOSIT', 'WINNINGS', 'COUPON_BONUS', 'MANUAL_CREDIT'].includes(row.original.type)
        return (
          <div className={`font-bold ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
            {isCredit ? '+' : '-'}₹{row.original.amount}
          </div>
        )
      },
    },
    {
      accessorKey: 'details',
      header: 'Details',
      cell: ({ row }) => (
        <div className="text-sm max-w-[300px] truncate" title={row.original.details}>
          {row.original.details || row.original.paymentMethod || 'N/A'}
        </div>
      ),
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
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wallet Ledger</h1>
          <p className="text-muted-foreground">Monitor all transactions, entry fees, winnings, and manually adjust balances.</p>
        </div>
        <Button onClick={() => setIsAdjustOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Manual Adjustment
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Player..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Filter Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Transactions</SelectItem>
            <SelectItem value="DEPOSIT">Deposits</SelectItem>
            <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
            <SelectItem value="ENTRY_FEE">Entry Fees</SelectItem>
            <SelectItem value="WINNINGS">Winnings</SelectItem>
            <SelectItem value="MANUAL_CREDIT">Manual Credits</SelectItem>
            <SelectItem value="MANUAL_DEBIT">Manual Debits</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={data?.transactions || []} isLoading={isLoading} searchKey="details" />

      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manual Wallet Adjustment</DialogTitle></DialogHeader>
          <form onSubmit={handleAdjust} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>User ID (ObjectId)</Label>
              <Input required value={adjustForm.userId} onChange={(e) => setAdjustForm({ ...adjustForm, userId: e.target.value })} placeholder="Enter exact User ID" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Adjustment Type</Label>
                <Select value={adjustForm.type} onValueChange={(val: any) => setAdjustForm({ ...adjustForm, type: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREDIT">Add Funds (+)</SelectItem>
                    <SelectItem value="DEBIT">Deduct Funds (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Wallet Account</Label>
                <Select value={adjustForm.walletType} onValueChange={(val: any) => setAdjustForm({ ...adjustForm, walletType: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEPOSIT">Deposit Wallet</SelectItem>
                    <SelectItem value="WINNING">Winning Wallet</SelectItem>
                    <SelectItem value="BONUS">Bonus Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input required type="number" min="1" value={adjustForm.amount} onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Reason (Visible to user)</Label>
              <Input required value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} placeholder="e.g. Compensating for canceled match" />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={adjustMutation.isPending}>
                {adjustMutation.isPending ? 'Processing...' : 'Confirm Adjustment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}