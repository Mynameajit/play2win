'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Gamepad2, Bell, PlusCircle, LogIn, ShieldCheck, Crown, LogOut } from 'lucide-react'

export const Navbar: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { userRole, user, setIsDepositModalOpen, notifications, handleLogout } = useApp()
  const unreadCount = notifications.filter(n => n.unread).length

  // Extract First Letter of User Name
  const userFirstLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl shadow-sm border-b border-white/5 px-2 sm:px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 cursor-pointer shrink-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white">
                PLAY<span className="text-purple-500">2</span>EARN
              </span>
              {userRole !== 'guest' && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                  userRole === 'admin' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                  userRole === 'superadmin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}>
                  {userRole === 'admin' ? 'ROOM ADMIN' : userRole === 'superadmin' ? 'SUPER ADMIN' : 'GAMER'}
                </span>
              )}
            </div>
            <p className="text-[8px] text-slate-400 hidden sm:block tracking-wider">BGMI & FREE FIRE</p>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/40 backdrop-blur-md p-1 rounded-2xl border border-white/5 shadow-inner">
          {userRole === 'user' && (
            <>
              <Link
                href="/"
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  pathname === '/' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  pathname.startsWith('/dashboard') || pathname.startsWith('/matches') ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Matches
              </Link>
              <Link
                href="/my-tournaments"
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  pathname === '/my-tournaments' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                My Tournaments
              </Link>
              <Link
                href="/leaderboard"
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  pathname === '/leaderboard' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Leaderboard
              </Link>
              <Link
                href="/referrals"
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  pathname === '/referrals' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Refer & Earn
              </Link>
              <Link
                href="/wallet"
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  pathname === '/wallet' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Wallet
              </Link>
            </>
          )}

          {userRole === 'admin' && (
            <Link
              href="/admin"
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                pathname === '/admin' ? 'bg-red-600 text-white' : 'text-red-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Room Admin Dashboard</span>
            </Link>
          )}

          {userRole === 'superadmin' && (
            <>
              <Link
                href="/superadmin"
                className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                  pathname === '/superadmin' ? 'bg-amber-600 text-white' : 'text-amber-300'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Super Admin Enterprise</span>
              </Link>
              <Link
                href="/admin"
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                  pathname === '/admin' ? 'bg-red-600 text-white' : 'text-red-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Room Panel</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {userRole === 'guest' ? (
            <Link
              href="/login"
              className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>SIGN IN</span>
            </Link>
          ) : (
            <>
              {/* Gamer Wallet Pill */}
              {userRole === 'user' && (
                <div className="flex items-center gap-1 bg-slate-900/90 border border-purple-500/30 px-2 py-1 rounded-xl">
                  <span className="text-[9px] text-slate-400">Bal:</span>
                  <span className="text-[11px] font-bold text-emerald-400">
                    ₹{user.depositBalance + user.winningBalance}
                  </span>
                  <button
                    onClick={() => setIsDepositModalOpen(true)}
                    className="p-0.5 rounded-lg bg-purple-600 text-white ml-0.5 hover:bg-purple-500"
                    title="Add Cash"
                  >
                    <PlusCircle className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Notification Bell */}
              <Link
                href="/notifications"
                className="relative p-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </Link>

              {/* First Letter Avatar Badge */}
              {userRole === 'user' ? (
                <Link
                  href="/profile"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  title={user.name}
                >
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-white font-black text-xs sm:text-sm">
                    {userFirstLetter}
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    handleLogout()
                    router.push('/login')
                  }}
                  className="px-2.5 py-1 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 font-bold text-xs flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Logout</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
