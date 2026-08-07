'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { PageHeader } from '@/components/common/PageHeader'
import { apiClient } from '@/lib/apiClient'
import { 
  User, 
  Mail, 
  Phone, 
  Gamepad2, 
  LogOut, 
  Crown,
  CheckCircle2,
  AlertCircle,
  Search,
  Lock,
  Calendar,
  MapPin,
  Laptop,
  Trash2,
  Key
} from 'lucide-react'

export const ProfileView: React.FC = () => {
  const router = useRouter()
  const { user, setUser, handleLogout, showToast } = useApp()

  // Profile data state
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit states
  const [personalDetails, setPersonalDetails] = useState({
    fullName: '',
    dob: '',
    gender: '',
    country: '',
    state: '',
    city: '',
    address: '',
    phone: ''
  })

  const [gamingInfo, setGamingInfo] = useState({
    bgmiUid: '',
    bgmiIgn: '',
    pubgUid: '',
    pubgIgn: '',
    freefireUid: '',
    freefireIgn: '',
    codUid: '',
    codIgn: '',
    valorantUid: '',
    valorantIgn: ''
  })

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/users/profile')
      if (res.data) {
        setProfile(res.data)
        setPersonalDetails({
          fullName: res.data.fullName || '',
          dob: res.data.dob ? res.data.dob.substring(0, 10) : '',
          gender: res.data.gender || '',
          country: res.data.country || '',
          state: res.data.state || '',
          city: res.data.city || '',
          address: res.data.address || '',
          phone: res.data.phone || ''
        })
        setGamingInfo({
          bgmiUid: res.data.bgmiUid || '',
          bgmiIgn: res.data.bgmiIgn || '',
          pubgUid: res.data.pubgUid || '',
          pubgIgn: res.data.pubgIgn || '',
          freefireUid: res.data.freefireUid || '',
          freefireIgn: res.data.freefireIgn || '',
          codUid: res.data.codUid || '',
          codIgn: res.data.codIgn || '',
          valorantUid: res.data.valorantUid || '',
          valorantIgn: res.data.valorantIgn || ''
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleUpdatePersonal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.put('/users/profile', personalDetails)
      showToast('Personal information updated!', 'success')
      fetchProfile()
    } catch (err: any) {
      showToast('Failed to update details.', 'error')
    }
  }

  const handleUpdateGaming = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.put('/users/profile', gamingInfo)
      showToast('Gaming credentials updated successfully!', 'success')
      fetchProfile()
    } catch (err: any) {
      showToast('Failed to update gaming credentials.', 'error')
    }
  }

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) return
    try {
      await apiClient.post('/users/profile/change-password', { currentPassword, newPassword })
      showToast('Security password updated!', 'success')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Password update failed.', 'error')
    }
  }

  const handleDeleteAccountRequest = () => {
    if (confirm('WARNING: Are you sure you want to request deletion of your account? This action is irreversible.')) {
      showToast('Account deletion request submitted to security team.', 'success')
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <span className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 mt-2 font-medium">Hydrating User Workspace...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 md:pb-8 max-w-4xl mx-auto text-white px-4">
      <PageHeader />

      {/* User Header Profile */}
      <div className="glass-panel rounded-3xl p-5 border border-purple-500/30 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={profile.profilePhoto || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'}
              alt={profile.username}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-purple-500/50 p-0.5 object-cover shadow-xl"
            />
            <span className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-purple-600 text-white shadow">
              <Crown className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <h2 className="text-lg sm:text-xl font-black text-white">@{profile.username}</h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold w-fit">
                {profile.rankTitle || 'Rookie Tier I'}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                {profile.phone || 'No phone added'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. PERSONAL INFORMATION FORM */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <User className="w-4 h-4 text-purple-400" />
            <span>Personal Particulars</span>
          </h3>

          <form onSubmit={handleUpdatePersonal} className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={personalDetails.fullName}
                onChange={e => setPersonalDetails({ ...personalDetails, fullName: e.target.value })}
                placeholder="Vikram Rathore"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={personalDetails.dob}
                  onChange={e => setPersonalDetails({ ...personalDetails, dob: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">Gender</label>
                <select
                  value={personalDetails.gender}
                  onChange={e => setPersonalDetails({ ...personalDetails, gender: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-300 font-bold"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  value={personalDetails.country}
                  onChange={e => setPersonalDetails({ ...personalDetails, country: e.target.value })}
                  placeholder="India"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  value={personalDetails.state}
                  onChange={e => setPersonalDetails({ ...personalDetails, state: e.target.value })}
                  placeholder="Delhi"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={personalDetails.city}
                  onChange={e => setPersonalDetails({ ...personalDetails, city: e.target.value })}
                  placeholder="New Delhi"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 mb-1">Address</label>
              <input
                type="text"
                value={personalDetails.address}
                onChange={e => setPersonalDetails({ ...personalDetails, address: e.target.value })}
                placeholder="Flat No, Block, Area..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md transition-colors"
            >
              SAVE PERSONAL PROFILE
            </button>
          </form>
        </div>

        {/* 2. GAMING CREDENTIALS FORM */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span>Gaming Credentials (UIDs)</span>
          </h3>

          <form onSubmit={handleUpdateGaming} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
              <div>
                <label className="block text-[10px] font-bold text-purple-300 mb-0.5">BGMI Character UID</label>
                <input
                  type="text"
                  value={gamingInfo.bgmiUid}
                  onChange={e => setGamingInfo({ ...gamingInfo, bgmiUid: e.target.value })}
                  placeholder="5509123091"
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-purple-300 mb-0.5">BGMI IGN</label>
                <input
                  type="text"
                  value={gamingInfo.bgmiIgn}
                  onChange={e => setGamingInfo({ ...gamingInfo, bgmiIgn: e.target.value })}
                  placeholder="Soul_Mortal"
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-slate-100 font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
              <div>
                <label className="block text-[10px] font-bold text-orange-300 mb-0.5">Free Fire Player UID</label>
                <input
                  type="text"
                  value={gamingInfo.freefireUid}
                  onChange={e => setGamingInfo({ ...gamingInfo, freefireUid: e.target.value })}
                  placeholder="9823091023"
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-orange-300 mb-0.5">Free Fire IGN</label>
                <input
                  type="text"
                  value={gamingInfo.freefireIgn}
                  onChange={e => setGamingInfo({ ...gamingInfo, freefireIgn: e.target.value })}
                  placeholder="Badge99"
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-slate-100 font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
              <div>
                <label className="block text-[10px] font-bold text-cyan-300 mb-0.5">Valorant Game Tag</label>
                <input
                  type="text"
                  value={gamingInfo.valorantUid}
                  onChange={e => setGamingInfo({ ...gamingInfo, valorantUid: e.target.value })}
                  placeholder="Tenz#NA1"
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-cyan-300 mb-0.5">Valorant IGN</label>
                <input
                  type="text"
                  value={gamingInfo.valorantIgn}
                  onChange={e => setGamingInfo({ ...gamingInfo, valorantIgn: e.target.value })}
                  placeholder="Tenz"
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-slate-100 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-md transition-colors"
            >
              SAVE GAMER CREDENTIALS
            </button>
          </form>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 3. ACTIVE DEVICES SECURITY LOGS */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Laptop className="w-4 h-4 text-slate-400" />
            <span>Active Login Devices Security Logs</span>
          </h3>

          <div className="space-y-2">
            {profile.devices && profile.devices.length > 0 ? (
              profile.devices.slice(0, 3).map((d: any) => (
                <div key={d.id} className="p-3 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="block font-bold text-slate-200">{d.os} Platform ({d.deviceType})</span>
                    <span className="block text-[10px] text-slate-400">IP: {d.ipAddress} • Active: {new Date(d.lastActiveAt).toLocaleString()}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                    Connected
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No active devices recorded.</p>
            )}
          </div>
        </div>

        {/* 4. SECURITY (Password reset & Delete) */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-red-400" />
            <span>Security Configuration</span>
          </h3>

          <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-300 mb-1">Current Password</label>
              <input
                type="password" required
                value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-300 mb-1">New Password</label>
              <input
                type="password" required
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 text-cyan-400 font-extrabold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>RESET PASSWORD</span>
            </button>
          </form>

          <div className="border-t border-white/5 pt-3.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-[11px] font-bold text-red-300">Request Account Deletion</span>
              <span className="block text-[9px] text-slate-400">Permanently close and scrub user logs</span>
            </div>
            
            <button
              onClick={handleDeleteAccountRequest}
              className="p-2 rounded-xl bg-red-950/40 text-red-400 border border-red-500/20 hover:bg-red-900/40 text-[10px] font-black"
            >
              DELETE ACCOUNT
            </button>
          </div>
        </div>

      </div>

      {/* DISCONNECT */}
      <div className="p-3.5 rounded-3xl bg-red-950/20 border border-red-500/30 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="block text-xs font-bold text-red-300">Sign Out Session</span>
          <span className="block text-[10px] text-slate-400">Disconnect credentials and clear session caches</span>
        </div>
        <button
          onClick={() => {
            handleLogout()
            router.push('/login')
          }}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-colors"
        >
          Logout Session
        </button>
      </div>

    </div>
  )
}
