'use client'

import React, { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { apiClient } from '@/lib/apiClient'
import { useUserProfile, useWalletDeposit, useWalletWithdraw } from '@/hooks/useProfileQuery'
import { useWalletTransactions } from '@/hooks/useWallet'
import { 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  PlusCircle, 
  History, 
  Smartphone,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Ticket,
  Search,
  Filter
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

export const WalletView: React.FC = () => {
  const { 
    isDepositModalOpen, 
    setIsDepositModalOpen, 
    isWithdrawModalOpen, 
    setIsWithdrawModalOpen,
    showToast,
    socket
  } = useApp()

  const { data: user, isLoading: isUserLoading } = useUserProfile()
  const { data: txData, isLoading: isTxLoading } = useWalletTransactions()
  const transactions = txData?.transactions || []
  
  const depositMutation = useWalletDeposit()
  const withdrawMutation = useWalletWithdraw()
  const queryClient = useQueryClient()

  const [depositStep, setDepositStep] = useState<1 | 2>(1)
  const [depositAmount, setDepositAmount] = useState<number>(500)
  const depositMethod = 'UPI'
  const [utrRef, setUtrRef] = useState('')

  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000)
  const [upiId, setUpiId] = useState('')

  // Coupon promo state
  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  // Filter transaction histories
  const [searchQuery, setSearchQuery] = useState('')
  const [walletTab, setWalletTab] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'ENTRY_FEE' | 'WINNING' | 'COUPON_BONUS'>('ALL')

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({
    qrCodeUrl: '',
    upiId: '',
    instructions: ''
  })

  // Timer state
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds

  const fetchPaymentSettings = async () => {
    try {
      const res = await apiClient.get('/transactions/payment-settings')
      setPaymentSettings({
        qrCodeUrl: res.data.payment_qr_code || '',
        upiId: res.data.payment_upi_id || '',
        instructions: res.data.payment_instructions || ''
      })
    } catch (err) {
      console.error('Failed to load payment settings', err)
    }
  }

  useEffect(() => {
    fetchPaymentSettings()
    
    // Listen for real-time updates
    const handleSettingsUpdate = (updates: any) => {
      setPaymentSettings(prev => ({
        qrCodeUrl: updates.payment_qr_code ?? prev.qrCodeUrl,
        upiId: updates.payment_upi_id ?? prev.upiId,
        instructions: updates.payment_instructions ?? prev.instructions
      }))
    }
    
    if (socket) {
      socket.on('payment_settings_update', handleSettingsUpdate)
      return () => {
        socket.off('payment_settings_update', handleSettingsUpdate)
      }
    }
  }, [socket])

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (depositStep === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (depositStep === 2 && timeLeft === 0) {
      // Reset if expired
      showToast('Payment window expired. Please try again.', 'error')
      setDepositStep(1)
      setTimeLeft(600)
    }
    return () => clearInterval(timer)
  }, [depositStep, timeLeft, showToast])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (depositAmount <= 0) return
    setTimeLeft(600) // reset timer
    setDepositStep(2)
  }

  const handleFinalDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    const refStr = utrRef.trim()
    if (!refStr) {
      showToast('A valid 12-Digit UTR reference number is required.', 'error')
      return
    }
    try {
      await depositMutation.mutateAsync({ amount: depositAmount, method: depositMethod, utr: refStr })
      showToast('Deposit request submitted. Pending verification.', 'success')
      setIsDepositModalOpen(false)
      setDepositStep(1)
      setUtrRef('')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit deposit', 'error')
    }
  }

  const onWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (withdrawAmount <= 0 || !upiId.trim()) return
    try {
      await withdrawMutation.mutateAsync({ amount: withdrawAmount, upiId })
      showToast('Withdrawal request submitted successfully.', 'success')
      setIsWithdrawModalOpen(false)
      setUpiId('')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to request withdrawal', 'error')
    }
  }

  // COUPON PROMO REDEMPTION HANDLER
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    try {
      setIsApplyingCoupon(true)
      const response = await apiClient.post('/transactions/coupons/redeem', { code: couponCode })
      if (response.data) {
        showToast(response.data.message || 'Promo code applied!', 'success')
        setCouponCode('')
        queryClient.invalidateQueries({ queryKey: ['profile'] })
        queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Invalid or expired coupon.', 'error')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const copyUpiVpa = () => {
    const upi = paymentSettings.upiId || 'battlex.esports@upi'
    navigator.clipboard.writeText(upi)
    showToast('UPI VPA copied to clipboard!', 'info')
  }

  // Calculate total balance: deposit + winning + bonus - locked
  const depositBal = user?.depositBalance || 0
  const winningBal = user?.winningBalance || 0
  const bonusBal = user?.bonusBalance || 0
  const lockedBal = user?.lockedBalance || 0
  const totalBalance = depositBal + winningBal + bonusBal - lockedBal

  const filteredTxns = transactions.filter((t: any) => {
    const matchesTab = walletTab === 'ALL' ? true : t.type.toUpperCase() === walletTab
    const matchesSearch = t.details?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.paymentMethod?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.utr?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 md:pb-8 text-white max-w-4xl mx-auto px-4">
      <PageHeader />

      {/* Modern Responsive Wallet balances Card */}
      <div className="glass-panel rounded-3xl p-5 border border-purple-500/30 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-purple-400" />
              <span>Gamer Wallet Balance Ledger</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
              ₹{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5 text-xs">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Deposits</span>
                <strong className="text-white font-sans text-sm">₹{depositBal}</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Winnings</span>
                <strong className="text-emerald-400 font-sans text-sm">₹{winningBal}</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Bonus Cash</span>
                <strong className="text-amber-400 font-sans text-sm">₹{bonusBal}</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Locked</span>
                <strong className="text-red-400 font-sans text-sm">₹{lockedBal}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => {
                setDepositStep(1)
                setIsDepositModalOpen(true)
              }}
              className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-[0.99]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ADD MONEY</span>
            </button>

            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-[0.99]"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>WITHDRAW</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COUPON REDEEM SIDEBAR */}
        <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-3 h-fit">
          <h4 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-purple-400" />
            <span>Redeem Coupon Code</span>
          </h4>
          <p className="text-[10px] text-slate-400 leading-normal">Enter active coupon code to claim deposit discounts or bonus cash credits instantly.</p>

          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <input
              type="text" required
              value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME100"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-center font-bold text-amber-300 placeholder:text-slate-600 uppercase focus:outline-none focus:border-purple-500/50 font-mono"
            />
            <button
              type="submit" disabled={isApplyingCoupon}
              className="w-full py-2 rounded-xl bg-slate-800 border border-white/10 text-slate-100 hover:bg-slate-700 font-extrabold text-xs transition-colors"
            >
              {isApplyingCoupon ? 'Redeeming...' : 'Apply Coupon'}
            </button>
          </form>
        </div>

        {/* DETAILED TRANSACTIONS HISTORY & FILTER SEARCH */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Transaction Ledger</span>
            </h3>

            {/* Filter select */}
            <select
              value={walletTab}
              onChange={e => setWalletTab(e.target.value as any)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-bold"
            >
              <option value="ALL">All Transactions</option>
              <option value="DEPOSIT">Deposits</option>
              <option value="WITHDRAWAL">Withdrawals</option>
              <option value="ENTRY_FEE">Entry Fees</option>
              <option value="WINNING">Winnings Payout</option>
              <option value="COUPON_BONUS">Coupons Applied</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search UTR, method, or details..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Transaction Logs Table */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-3 font-semibold">Activity details</th>
                  <th className="p-3 font-semibold">Payment / Status</th>
                  <th className="p-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {isTxLoading ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-purple-500 animate-pulse font-bold">
                      Loading Ledger...
                    </td>
                  </tr>
                ) : filteredTxns.length > 0 ? (
                  filteredTxns.map((t: any) => (
                    <tr key={t.id} className="hover:bg-white/5">
                      <td className="p-3 text-slate-100 font-bold">
                        <p>{t.details || t.type}</p>
                        {t.utr && <span className="text-[10px] font-mono text-slate-400">UTR: {t.utr}</span>}
                      </td>
                      <td className="p-3 text-slate-300">
                        <p className="text-[11px]">{t.paymentMethod}</p>
                        <span className={`text-[9px] font-bold ${
                          t.status === 'COMPLETED' ? 'text-emerald-400' :
                          t.status === 'PENDING' ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className={`p-3 font-black text-right text-sm ${
                        t.type.toUpperCase() === 'DEPOSIT' || t.type.toUpperCase() === 'WINNING' || t.type.toUpperCase() === 'COUPON_BONUS' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {t.type.toUpperCase() === 'DEPOSIT' || t.type.toUpperCase() === 'WINNING' || t.type.toUpperCase() === 'COUPON_BONUS' ? '+' : '-'}
                        ₹{Number(t.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400">
                      No matching transaction logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* DEPOSIT MODAL */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title={depositStep === 1 ? 'Add Cash to Wallet' : `Scan QR to Pay ₹${depositAmount}`}
      >
        {depositStep === 1 ? (
          <form onSubmit={handleProceedToPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Quick Select Amount</label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 200, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                      depositAmount === amt ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 border-white/10 text-slate-300'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Custom Deposit Amount (₹)</label>
              <input
                type="number" min="10" required
                value={depositAmount} onChange={e => setDepositAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2"
            >
              <span>PROCEED TO PAYMENT (₹{depositAmount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleFinalDeposit} className="space-y-4 text-center">
            
            <div className="flex justify-between items-center bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4">
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Time Remaining</span>
              <span className="text-lg font-black text-red-500 font-mono tracking-wider">{formatTime(timeLeft)}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 space-y-4">
              
              {paymentSettings.qrCodeUrl && (
                <div className="space-y-2">
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-600">
                    <img src={paymentSettings.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-xs font-bold text-slate-200">Scan QR and transfer amount</p>
                </div>
              )}

              {paymentSettings.upiId && (
                <>
                  {paymentSettings.qrCodeUrl && <div className="text-xs font-bold text-slate-500">OR</div>}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
                    <span className="font-mono text-cyan-300 font-bold tracking-wide">{paymentSettings.upiId}</span>
                    <button
                      type="button"
                      onClick={copyUpiVpa}
                      className="px-3 py-1 rounded bg-purple-600 text-white font-bold text-[10px] hover:bg-purple-500 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </>
              )}

              {!paymentSettings.qrCodeUrl && !paymentSettings.upiId && (
                <div className="p-4 text-amber-400 text-xs bg-amber-500/10 rounded-xl border border-amber-500/20">
                  Payment gateway is currently being configured. Please contact support.
                </div>
              )}
            </div>

            {paymentSettings.instructions && (
              <div className="text-left bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-xl">
                <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-1.5">Payment Instructions</h4>
                <p className="text-xs text-indigo-200/80 leading-relaxed whitespace-pre-wrap">{paymentSettings.instructions}</p>
              </div>
            )}

            <div className="text-left">
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Enter 12-Digit UTR Transaction Reference No. <span className="text-red-400 font-bold">*</span>
              </label>
              <input
                type="text" required
                value={utrRef} onChange={e => setUtrRef(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 421980129841"
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDepositStep(1)}
                className="w-1/3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 font-bold text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={depositMutation.isPending}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{depositMutation.isPending ? 'SUBMITTING...' : `CONFIRM DEPOSIT OF ₹${depositAmount}`}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* WITHDRAW MODAL */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Winnings"
      >
        <form onSubmit={onWithdrawSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <span>Withdrawable Winning Balance:</span>
            <span className="font-black text-sm">₹{winningBal}</span>
          </div>

          {winningBal < 100 && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
              You need a minimum winning balance of ₹100 to withdraw.
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1 font-sans">Withdraw Amount (₹)</label>
            <input
              type="number" min="100" max={Math.max(100, winningBal)} required disabled={winningBal < 100}
              value={withdrawAmount} onChange={e => setWithdrawAmount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-bold disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Enter UPI ID VPA</label>
            <input
              type="text" required disabled={winningBal < 100}
              value={upiId} onChange={e => setUpiId(e.target.value)}
              placeholder="e.g. name@upi"
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono disabled:opacity-50"
            />
          </div>

          <button
            type="submit" disabled={winningBal < 100 || withdrawMutation.isPending}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawMutation.isPending ? 'PROCESSING...' : `CONFIRM WITHDRAWAL OF ₹${withdrawAmount}`}
          </button>
        </form>
      </Modal>

    </div>
  )
}
