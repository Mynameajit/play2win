'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useFinancialAnalytics } from '@/hooks/useFinancialAnalytics'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  IndianRupee, ArrowDownToLine, ArrowUpFromLine, 
  Wallet, Trophy, Users, TrendingUp, AlertCircle
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts'

export default function SuperAdminDashboard() {
  const { data, isLoading, isError } = useFinancialAnalytics()

  if (isError) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-red-500/50 bg-red-500/5">
        <div className="text-center text-red-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="font-bold">Failed to load financial analytics.</p>
          <p className="text-sm opacity-80">Please check your database connection.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-100">Financial Analytics</h1>
        <p className="text-slate-400">Real-time enterprise revenue, deposits, and platform metrics.</p>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : data ? (
        <>
          {/* Top Level Financial Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Platform Profit"
              value={`₹${data.financialOverview.platformProfit.toLocaleString()}`}
              subtitle="All-time net profit"
              icon={TrendingUp}
              highlight
            />
            <MetricCard
              title="Total Revenue"
              value={`₹${data.financialOverview.totalEntryFee.toLocaleString()}`}
              subtitle={`₹${data.financialOverview.todayEntryFee.toLocaleString()} today`}
              icon={IndianRupee}
            />
            <MetricCard
              title="Total Deposits"
              value={`₹${data.financialOverview.totalDeposit.toLocaleString()}`}
              subtitle={`₹${data.financialOverview.todayDeposit.toLocaleString()} today`}
              icon={ArrowDownToLine}
            />
            <MetricCard
              title="Total Withdrawals"
              value={`₹${data.financialOverview.totalWithdraw.toLocaleString()}`}
              subtitle={`₹${data.financialOverview.todayWithdraw.toLocaleString()} today`}
              icon={ArrowUpFromLine}
            />
          </div>

          {/* Charts Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-slate-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Revenue vs Winnings (30 Days)</CardTitle>
                <CardDescription>Daily trend of entry fees collected vs prizes distributed.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWinning" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" />
                    <Area type="monotone" name="Entry Fees" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                    <Area type="monotone" name="Prizes Distributed" dataKey="winning" stroke="#ef4444" fillOpacity={1} fill="url(#colorWinning)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Deposits vs Withdrawals (30 Days)</CardTitle>
                <CardDescription>Daily comparison of user deposits and withdrawals.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      cursor={{ fill: '#1e293b' }}
                    />
                    <Legend iconType="circle" />
                    <Bar name="Deposits" dataKey="deposit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar name="Withdrawals" dataKey="withdraw" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Wallet Analytics */}
            <Card className="bg-slate-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2"><Wallet className="w-4 h-4 text-purple-400" /> Wallet Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-sm text-slate-400">Total System Balance</span>
                    <span className="font-black text-white">₹{data.walletAnalytics.totalWalletBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Total Deposit Balance</span>
                    <span className="font-bold text-blue-400">₹{data.walletAnalytics.totalDepositBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Total Winning Balance</span>
                    <span className="font-bold text-emerald-400">₹{data.walletAnalytics.totalWinningBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Total Bonus Balance</span>
                    <span className="font-bold text-purple-400">₹{data.walletAnalytics.totalBonusBalance.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Actions */}
            <Card className="bg-slate-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-400" /> Pending Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <ActionRow label="Pending Deposits" count={data.pendingActions.pendingDeposits} color="blue" />
                  <ActionRow label="Pending Withdrawals" count={data.pendingActions.pendingWithdraws} color="amber" />
                  <ActionRow label="Pending Results" count={data.pendingActions.pendingResults} color="emerald" />
                  <ActionRow label="Open Support Tickets" count={data.pendingActions.pendingTickets} color="rose" />
                </div>
              </CardContent>
            </Card>

            {/* User Analytics */}
            <Card className="bg-slate-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400" /> User Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.userAnalytics.highestDepositor && (
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Highest Depositor</span>
                        <span className="text-sm font-bold text-slate-200">@{data.userAnalytics.highestDepositor.username}</span>
                      </div>
                      <span className="font-bold text-blue-400">₹{data.userAnalytics.highestDepositor.amount.toLocaleString()}</span>
                    </div>
                  )}
                  {data.userAnalytics.highestWinner && (
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Highest Winner</span>
                        <span className="text-sm font-bold text-slate-200">@{data.userAnalytics.highestWinner.username}</span>
                      </div>
                      <span className="font-bold text-emerald-400">₹{data.userAnalytics.highestWinner.amount.toLocaleString()}</span>
                    </div>
                  )}
                  {data.userAnalytics.highestWithdraw && (
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Highest Withdraw</span>
                        <span className="text-sm font-bold text-slate-200">@{data.userAnalytics.highestWithdraw.username}</span>
                      </div>
                      <span className="font-bold text-amber-400">₹{data.userAnalytics.highestWithdraw.amount.toLocaleString()}</span>
                    </div>
                  )}
                  {data.userAnalytics.mostActiveUser && (
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Most Active Player</span>
                        <span className="text-sm font-bold text-slate-200">@{data.userAnalytics.mostActiveUser.username}</span>
                      </div>
                      <span className="font-bold text-purple-400">{data.userAnalytics.mostActiveUser.matchesPlayed} Matches</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tournament Analytics Table */}
          <Card className="bg-slate-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /> Recent Tournament Financials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-950">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Tournament Name</th>
                      <th className="px-4 py-3 text-center">Players Joined</th>
                      <th className="px-4 py-3 text-right">Entry Collection</th>
                      <th className="px-4 py-3 text-right">Prize Distributed</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">Platform Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tournamentAnalytics.map((t) => (
                      <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-medium text-slate-200">{t.title}</td>
                        <td className="px-4 py-3 text-center text-slate-300">{t.playersJoined}</td>
                        <td className="px-4 py-3 text-right text-emerald-400">₹{t.entryCollection.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-red-400">₹{t.prizeDistributed.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-white">₹{t.platformProfit.toLocaleString()}</td>
                      </tr>
                    ))}
                    {data.tournamentAnalytics.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No recent tournaments found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon: Icon, highlight = false }: any) {
  return (
    <Card className={`bg-slate-900 border-white/10 ${highlight ? 'border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <Icon className={`w-4 h-4 ${highlight ? 'text-emerald-500' : 'text-slate-500'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-black ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

function ActionRow({ label, count, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }
  
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-300">{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${colors[color] || colors.blue}`}>
        {count}
      </span>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-900 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <Skeleton className="h-4 w-4 bg-white/10 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 bg-white/10 mb-2" />
              <Skeleton className="h-3 w-20 bg-white/10" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[380px] w-full rounded-xl bg-slate-900 border border-white/5" />
        <Skeleton className="h-[380px] w-full rounded-xl bg-slate-900 border border-white/5" />
      </div>
    </div>
  )
}
