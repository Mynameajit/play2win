'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Lock, MonitorSmartphone, History, Settings, LogOut, 
  ShieldCheck, ShieldAlert, Upload, Activity, Mail, Phone, Calendar, Target,
  RefreshCw, Power
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/hooks/use-toast'
import { useApp } from '@/context/AppContext'
import { Modal } from '@/components/ui/Modal'

export default function SuperAdminProfile() {
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useToast()
  const { handleLogout } = useApp()
  const queryClient = useQueryClient()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch Profile Data
  const { data, isLoading } = useQuery({
    queryKey: ['superadmin-profile'],
    queryFn: async () => {
      const res = await apiClient.get('/profile')
      return res.data
    },
    refetchInterval: 60000 // refresh every minute
  })

  // Logout Logic
  const onConfirmLogout = () => {
    setIsLogoutModalOpen(false)
    handleLogout()
  }

  if (isLoading || !data) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-48 bg-slate-800/50 rounded-3xl" />
        <div className="h-[400px] bg-slate-800/30 rounded-3xl" />
      </div>
    )
  }

  const { user, stats, recentActivity } = data

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'sessions', label: 'Active Sessions', icon: MonitorSmartphone },
    { id: 'history', label: 'Login History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Super Admin Profile</h1>
          <p className="text-slate-400 font-medium">Manage your account settings and active sessions</p>
        </div>
        <button 
          onClick={() => setIsLogoutModalOpen(true)}
          className="px-6 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold flex items-center gap-2 transition-colors border border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1.5 bg-slate-900/50 rounded-2xl border border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab user={user} stats={stats} recentActivity={recentActivity} />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'sessions' && <SessionsTab />}
          {activeTab === 'history' && <LoginHistoryTab />}
          {activeTab === 'settings' && <SettingsTab user={user} />}
        </motion.div>
      </AnimatePresence>

      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Confirm Logout">
        <div className="space-y-6">
          <p className="text-slate-300 font-medium">Are you sure you want to log out of this device? You will need to re-enter your credentials to access the panel.</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsLogoutModalOpen(false)}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirmLogout}
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Power className="w-4 h-4" />
              Yes, Logout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// --- Tabs Components ---

function OverviewTab({ user, stats, recentActivity }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 lg:col-span-1 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-600/30 to-purple-600/30" />
        
        <div className="relative pt-6 flex flex-col items-center text-center">
          <div className="relative group">
            <img 
              src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full border-4 border-slate-900 object-cover shadow-xl bg-slate-800"
            />
            <button className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="w-5 h-5 text-white mb-1" />
              <span className="text-[9px] font-bold text-white tracking-wider uppercase">Update</span>
            </button>
          </div>
          <h2 className="mt-4 text-xl font-black text-white">{user.fullName || user.username}</h2>
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-black text-xs tracking-wider uppercase">Super Admin</span>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <User className="w-4 h-4" /> Username
            </div>
            <span className="text-white font-medium">@{user.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Mail className="w-4 h-4" /> Email
            </div>
            <span className="text-white font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Phone className="w-4 h-4" /> Phone
            </div>
            <span className="text-white font-medium">{user.phone}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Calendar className="w-4 h-4" /> Joined
            </div>
            <span className="text-white font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Stats & Activity */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Tournaments Created" value={stats.totalTournamentsCreated} icon={Target} color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
          <StatCard title="Results Approved" value={stats.totalResultsApproved} icon={ShieldCheck} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
          <StatCard title="Admin Actions" value={stats.totalAdminActions} icon={Activity} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
          <StatCard title="Active Sessions" value={stats.activeSessionsCount} icon={MonitorSmartphone} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-primary-400" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((log: any) => (
                <div key={log.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="p-2 rounded-xl bg-primary-500/20 text-primary-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{log.action.replace(/_/g, ' ')}</h4>
                    <p className="text-xs text-slate-400 mt-1">{log.reason || 'No reason provided'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, bg, border }: any) {
  return (
    <div className={`p-4 rounded-2xl border ${border} ${bg} flex flex-col gap-3`}>
      <div className={`p-2 rounded-xl inline-flex w-fit bg-slate-900/50 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">{title}</p>
      </div>
    </div>
  )
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { toast } = useToast()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await apiClient.put('/profile/security/password', { currentPassword, newPassword })
    },
    onSuccess: () => {
      toast({ title: "success", description: "Password updated successfully!" })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.error || 'Failed to update password', variant: 'destructive' })
    }
  })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' })
      return
    }
    mutate()
  }

  return (
    <div className="max-w-2xl">
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary-500/20 text-primary-400 rounded-xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Change Password</h3>
            <p className="text-sm text-slate-400">Ensure your account is using a long, random password to stay secure.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Current Password</label>
            <input 
              type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">New Password</label>
            <input 
              type="password" required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Confirm New Password</label>
            <input 
              type="password" required minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500 transition-colors"
            />
          </div>
          <button 
            type="submit" disabled={isPending}
            className="mt-4 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

function SessionsTab() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: async () => {
      const res = await apiClient.get('/profile/sessions')
      return res.data
    }
  })

  const { mutate: revokeSession } = useMutation({
    mutationFn: async (id: string) => await apiClient.delete(`/profile/sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] })
      toast({ title: "success", description: "Session revoked successfully" })
    }
  })

  const { mutate: revokeOthers } = useMutation({
    mutationFn: async () => await apiClient.delete('/profile/sessions/other'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] })
      toast({ title: "success", description: "All other sessions revoked" })
    }
  })

  if (isLoading) return <div className="text-center p-8 text-slate-400">Loading sessions...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel p-6 rounded-3xl border border-white/5">
        <div>
          <h3 className="text-xl font-bold text-white">Active Sessions</h3>
          <p className="text-sm text-slate-400">Manage and logout your active sessions on other browsers and devices.</p>
        </div>
        <button 
          onClick={() => revokeOthers()}
          className="px-5 py-2.5 bg-red-500/10 text-red-400 font-bold border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors text-sm"
        >
          Revoke Other Sessions
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions?.map((s: any, idx: number) => (
          <div key={s.id} className="glass-panel p-5 rounded-2xl border border-white/5 flex gap-4 items-start relative">
            <div className="p-3 bg-slate-800 rounded-xl text-slate-300 shrink-0">
              {s.os?.toLowerCase().includes('mac') || s.os?.toLowerCase().includes('windows') ? <MonitorSmartphone className="w-6 h-6" /> : <MonitorSmartphone className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                {s.deviceName} 
                {idx === 0 && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded uppercase tracking-wider border border-emerald-500/20">This Device</span>}
              </h4>
              <p className="text-xs text-slate-400 mt-1">{s.browser} on {s.os}</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-slate-500">
                <span>IP: {s.ipAddress}</span>
                <span>•</span>
                <span>Active: {new Date(s.lastActive).toLocaleString()}</span>
              </div>
            </div>
            {idx !== 0 && (
              <button 
                onClick={() => revokeSession(s.id)}
                className="absolute top-4 right-4 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Revoke Session"
              >
                <Power className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function LoginHistoryTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['login-history'],
    queryFn: async () => {
      const res = await apiClient.get('/profile/login-history')
      return res.data
    }
  })

  if (isLoading) return <div className="text-center p-8 text-slate-400">Loading history...</div>

  return (
    <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h3 className="text-xl font-bold text-white">Login History</h3>
        <p className="text-sm text-slate-400">A detailed log of all your login attempts.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">IP Address</th>
              <th className="px-6 py-4">Device & Browser</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.history?.map((log: any) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                  {new Date(log.loginTime).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-400 text-xs">
                  {log.ipAddress}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-slate-200 font-medium">{log.deviceName}</p>
                  <p className="text-xs text-slate-500">{log.browser} • {log.os}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {log.status === 'SUCCESS' ? (
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-bold uppercase tracking-wider">
                      Success
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-xs font-bold uppercase tracking-wider">
                      Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {data?.history?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No login history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SettingsTab({ user }: any) {
  return (
    <div className="max-w-3xl glass-panel p-6 md:p-8 rounded-3xl border border-white/5">
      <div className="mb-6 border-b border-white/5 pb-4">
        <h3 className="text-xl font-bold text-white">Account Preferences</h3>
        <p className="text-sm text-slate-400">Customize your dashboard experience.</p>
      </div>

      <div className="space-y-6">
        {/* Toggle Switches (Mocked for UI) */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-white/5 hover:border-white/10 transition-colors">
          <div>
            <h4 className="text-white font-bold text-sm">Email Notifications</h4>
            <p className="text-xs text-slate-400 mt-1">Receive daily summaries and critical alerts via email.</p>
          </div>
          <div className="w-12 h-6 bg-primary-600 rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-white/5 hover:border-white/10 transition-colors">
          <div>
            <h4 className="text-white font-bold text-sm">Desktop Notifications</h4>
            <p className="text-xs text-slate-400 mt-1">Receive push notifications for realtime events.</p>
          </div>
          <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-slate-400 rounded-full absolute left-1 top-1" />
          </div>
        </div>
      </div>
    </div>
  )
}



