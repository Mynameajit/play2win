'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/context/AppContext'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gamepad2, Mail, Lock, LogIn, Loader2, ArrowRight } from 'lucide-react'

const loginFormSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})

type LoginFormData = z.infer<typeof loginFormSchema>

export const AuthPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get('redirect')
  
  const { handleCredentialLogin, showToast } = useApp()
  const [isLoading, setIsLoading] = useState(false)

  // react-hook-form with Zod schema verification
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    const result = await handleCredentialLogin(data.email, data.password)
    setIsLoading(false)

    if (result.success && result.role) {
      if (result.role === 'user') {
        router.push(redirectPath || '/dashboard')
      }
      else if (result.role === 'admin') router.push('/admin')
      else if (result.role === 'superadmin') router.push('/superadmin')
    } else {
      showToast(result.message, 'error')
      
      const msg = result.message.toLowerCase()
      if (msg.includes('email') || msg.includes('account') || msg.includes('found')) {
        setError('email', { type: 'manual', message: result.message })
      } else if (msg.includes('password')) {
        setError('password', { type: 'manual', message: result.message })
      } else {
        setError('email', { type: 'manual', message: result.message })
      }
    }
  }

  return (
    <div className=" bg-slate-950 flex flex-col items-center relative overflow-hidden pb-5">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 top-0 left-0 right-0 h-[55vh] z-0">
        <Image 
          src="/images/authbeenar.png" 
          alt="Background" 
          fill 
          className="object-cover opacity-70 mix-blend-screen"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b001a]/20 via-[#0b001a]/80 to-slate-950" />
      </div>

      {/* Top Bar with Back Button */}
      <div className="w-full max-w-md p-2 relative z-10 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full bg-slate-900/60 border border-white/10 flex items-center justify-center text-white backdrop-blur-md hover:bg-slate-800 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>

      {/* Header Info */}
      <div className="w-full max-w-md px-6 text-center relative z-10 mt-4 mb-2">
        <div className="flex justify-center mb-6">
          <div className="relative w-48 h-16">
            {/* <Image 
              src="/images/logo.png" 
              alt="BattleX" 
              fill 
              className="object-contain"
              priority
            /> */}
          </div>
        </div>
        
          </div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md px-4 relative z-10"
      >
        <div className="bg-[#0b0a15] rounded-3xl p-6 border border-purple-500/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            
<h1 className="text-3xl font-black text-white italic text-center tracking-tight mb-2 uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">WELCOME BACK</h1>
        {/* <p className="text-xs text-slate-300 font-medium max-w-xs mx-auto leading-relaxed">Log in to your account to continue dominating the leaderboards.</p> */}
    

            {/* Email Field */}
            <div className="space-y-1 pt-6">
              <label className="block text-xs font-bold text-slate-200">Email Address (Gmail)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled={isLoading}
                  placeholder="user@gmail.com"
                  {...register('email')}
                  className={`w-full bg-slate-900 border ${
                    errors.email ? 'border-red-500' : 'border-white/15'
                  } rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500 transition-colors`}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              {errors.email && (
                <span className="text-red-500 text-[10px] font-semibold mt-0.5 block">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-200">Password</label>
              <div className="relative">
                <input
                  type="password"
                  disabled={isLoading}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full bg-slate-900 border ${
                    errors.password ? 'border-red-500' : 'border-white/15'
                  } rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500 transition-colors`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <div className="flex justify-end mt-1.5">
                <Link 
                  href="/forgot-password" 
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
                >
                  Forgot Password?
                </Link>
              </div>
              {errors.password && (
                <span className="text-red-500 text-[10px] font-semibold mt-0.5 block">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{isLoading ? 'SIGNING IN...' : 'SIGN IN'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
            
          </form>

          {/* Footer Actions */}
          <div className="text-center mt-8 text-xs text-slate-400">
            <span>Don't have an account? </span>
            <Link href="/register" className="text-[#a78bfa] font-bold hover:underline transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
