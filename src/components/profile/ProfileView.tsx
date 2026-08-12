'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { apiClient } from '@/lib/apiClient'
import { useUserProfile } from '@/hooks/useProfileQuery'
import { useQueryClient } from '@tanstack/react-query'
import { 
  User, 
  Phone, 
  LogOut, 
  Camera,
  ChevronRight,
  Lock,
  Gamepad2,
  Calendar,
  X
} from 'lucide-react'

export const ProfileView: React.FC = () => {
  const router = useRouter()
  const { handleLogout, showToast } = useApp()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useUserProfile()

  // Edit Mode States
  const [activeEdit, setActiveEdit] = useState<string | null>(null)

  // Form States
  const [personalDetails, setPersonalDetails] = useState({ fullName: '', phone: '' })
  const [gamingInfo, setGamingInfo] = useState({ freefireUid: '', pubgUid: '' })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Initialize form state when profile loads
  useEffect(() => {
    if (profile) {
      setPersonalDetails({ fullName: (profile as any).fullName || profile.name || '', phone: profile.phone || '' })
      setGamingInfo({ freefireUid: profile.freefireUid || '', pubgUid: profile.bgmiUid || (profile as any).pubgUid || '' })
    }
  }, [profile])

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.put('/users/profile', personalDetails)
      showToast('Profile updated!', 'success')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setActiveEdit(null)
    } catch (err) {
      showToast('Update failed.', 'error')
    }
  }

  const handleSaveGaming = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.put('/users/profile', gamingInfo)
      showToast('Gaming UID updated!', 'success')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setActiveEdit(null)
    } catch (err) {
      showToast('Update failed.', 'error')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.post('/users/profile/change-password', { currentPassword, newPassword })
      showToast('Password updated!', 'success')
      setCurrentPassword(''); setNewPassword('')
      setActiveEdit(null)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Password update failed.', 'error')
    }
  }

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <span className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20 md:pb-8 max-w-lg mx-auto text-white">
      
      {/* Header */}
      <div className="px-2 pt-2">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Profile</h2>
        <p className="text-xs text-slate-400">Manage your account details</p>
      </div>

      {/* User Profile Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-white/5 mx-2 h-36">
        <img 
          src="/images/banners/hero-banner.jpg" 
          alt="bg" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-[#302b63]/80 to-[#240b36]/90" />
        
        <div className="relative h-full flex items-center p-5 gap-4">
          <div className="relative">
            <img
              src={(profile as any).profilePhoto || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150'}
              alt={(profile as any).username || profile.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-700"
            />
            <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center border-2 border-slate-900">
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-white">{(profile as any).fullName || profile.name || (profile as any).username || 'Player123'}</h2>
            <div className="inline-block px-2 py-0.5 rounded border border-purple-500/50 bg-purple-900/30 text-purple-300 text-[9px] font-bold">
              {profile.rankTitle || 'Pro Player'}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-1">
              <Calendar className="w-3 h-3 text-purple-500" />
              <div>
                <span className="block text-[8px] text-slate-400">Member Since</span>
                <span>{(profile as any).createdAt ? new Date((profile as any).createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Recently'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-2 px-2">
        
        {/* Name */}
        <div className="bg-[#101018] rounded-2xl border border-white/5 overflow-hidden">
          <div onClick={() => setActiveEdit(activeEdit === 'name' ? null : 'name')} className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-200">Change Name</h3>
                <p className="text-[10px] text-slate-500">Update your display name</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-600 transition-transform ${activeEdit === 'name' ? 'rotate-90' : ''}`} />
          </div>
          {activeEdit === 'name' && (
            <form onSubmit={handleSavePersonal} className="p-4 pt-0 border-t border-white/5 mt-2 space-y-3">
              <input 
                type="text" value={personalDetails.fullName} onChange={e => setPersonalDetails({...personalDetails, fullName: e.target.value})} 
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" 
                placeholder="Full Name"
              />
              <button type="submit" className="w-full py-2 bg-purple-600 rounded-xl text-xs font-bold text-white">Save Name</button>
            </form>
          )}
        </div>

        {/* Phone */}
        <div className="bg-[#101018] rounded-2xl border border-white/5 overflow-hidden">
          <div onClick={() => setActiveEdit(activeEdit === 'phone' ? null : 'phone')} className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <Phone className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-200">Phone Number</h3>
                <p className="text-[10px] text-slate-500">Update your registered phone number</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-600 transition-transform ${activeEdit === 'phone' ? 'rotate-90' : ''}`} />
          </div>
          {activeEdit === 'phone' && (
            <form onSubmit={handleSavePersonal} className="p-4 pt-0 border-t border-white/5 mt-2 space-y-3">
              <input 
                type="text" value={personalDetails.phone} onChange={e => setPersonalDetails({...personalDetails, phone: e.target.value})} 
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" 
                placeholder="Phone Number"
              />
              <button type="submit" className="w-full py-2 bg-purple-600 rounded-xl text-xs font-bold text-white">Save Phone</button>
            </form>
          )}
        </div>

        {/* Password */}
        <div className="bg-[#101018] rounded-2xl border border-white/5 overflow-hidden">
          <div onClick={() => setActiveEdit(activeEdit === 'password' ? null : 'password')} className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <Lock className="w-5 h-5 text-purple-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-200">Change Password</h3>
                <p className="text-[10px] text-slate-500">Update your account password</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-600 transition-transform ${activeEdit === 'password' ? 'rotate-90' : ''}`} />
          </div>
          {activeEdit === 'password' && (
            <form onSubmit={handleChangePassword} className="p-4 pt-0 border-t border-white/5 mt-2 space-y-3">
              <input 
                type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} 
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" 
                placeholder="Current Password" required
              />
              <input 
                type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} 
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" 
                placeholder="New Password" required
              />
              <button type="submit" className="w-full py-2 bg-purple-600 rounded-xl text-xs font-bold text-white">Update Password</button>
            </form>
          )}
        </div>

        {/* Free Fire UID */}
        <div className="bg-[#101018] rounded-2xl border border-white/5 overflow-hidden">
          <div onClick={() => setActiveEdit(activeEdit === 'ff' ? null : 'ff')} className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <span className="w-5 h-5 text-orange-400 font-black italic flex items-center justify-center text-lg">F</span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Change Free Fire UID</h3>
                <p className="text-[10px] text-slate-500">Update your Free Fire UID</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-600 transition-transform ${activeEdit === 'ff' ? 'rotate-90' : ''}`} />
          </div>
          {activeEdit === 'ff' && (
            <form onSubmit={handleSaveGaming} className="p-4 pt-0 border-t border-white/5 mt-2 space-y-3">
              <input 
                type="text" value={gamingInfo.freefireUid} onChange={e => setGamingInfo({...gamingInfo, freefireUid: e.target.value})} 
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" 
                placeholder="Free Fire UID"
              />
              <button type="submit" className="w-full py-2 bg-orange-600 rounded-xl text-xs font-bold text-white">Save Free Fire UID</button>
            </form>
          )}
        </div>

        {/* PUBG UID */}
        <div className="bg-[#101018] rounded-2xl border border-white/5 overflow-hidden">
          <div onClick={() => setActiveEdit(activeEdit === 'pubg' ? null : 'pubg')} className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <Gamepad2 className="w-5 h-5 text-yellow-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-200">Change BGMI UID</h3>
                <p className="text-[10px] text-slate-500">Update your BGMI UID</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-600 transition-transform ${activeEdit === 'pubg' ? 'rotate-90' : ''}`} />
          </div>
          {activeEdit === 'pubg' && (
            <form onSubmit={handleSaveGaming} className="p-4 pt-0 border-t border-white/5 mt-2 space-y-3">
              <input 
                type="text" value={gamingInfo.pubgUid} onChange={e => setGamingInfo({...gamingInfo, pubgUid: e.target.value})} 
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" 
                placeholder="PUBG/BGMI UID"
              />
              <button type="submit" className="w-full py-2 bg-yellow-600 rounded-xl text-xs font-bold text-white">Save BGMI UID</button>
            </form>
          )}
        </div>

        {/* Logout */}
        <div 
          onClick={() => { handleLogout(); router.push('/login') }}
          className="bg-[#1a0f14] rounded-2xl border border-red-500/20 overflow-hidden p-4 flex items-center justify-between cursor-pointer hover:bg-red-950/40 transition-colors mt-4"
        >
          <div className="flex items-center gap-4">
            <LogOut className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="text-sm font-bold text-red-400">Logout</h3>
              <p className="text-[10px] text-red-500/70">Sign out from your account</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
