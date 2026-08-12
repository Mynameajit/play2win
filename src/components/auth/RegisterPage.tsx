'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/context/AppContext'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gamepad2, User, Mail, Lock, Phone, UserPlus, Loader2, ArrowRight } from 'lucide-react'

const registerFormSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Alphanumeric or underscores only'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(10, 'Mobile number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

type RegisterFormData = z.infer<typeof registerFormSchema>

export const RegisterPage: React.FC = () => {
  const router = useRouter()
  const { handleCredentialRegister, showToast } = useApp()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema)
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    const result = await handleCredentialRegister(data.username, data.email, data.password, data.phone)
    setIsLoading(false)

    if (result.success) {
      router.push('/dashboard')
    } else {
      showToast(result.message, 'error')
      
      const msg = result.message.toLowerCase()
      if (msg.includes('username') || msg.includes('exist')) {
        if (msg.includes('username')) {
          setError('username', { type: 'manual', message: result.message })
        } else if (msg.includes('email')) {
          setError('email', { type: 'manual', message: result.message })
        } else {
          setError('username', { type: 'manual', message: result.message })
        }
      } else if (msg.includes('email') || msg.includes('registered')) {
        setError('email', { type: 'manual', message: result.message })
      } else if (msg.includes('phone') || msg.includes('mobile')) {
        setError('phone', { type: 'manual', message: result.message })
      } else {
        setError('username', { type: 'manual', message: result.message })
      }
    }
  }

  return (
    <div className="min-h-full bg-slate-950 flex flex-col items-center relative overflow-hidden pb-10">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 top-0 left-0 right-0 h-[30vh] md:h-[55vh] z-0">
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
      <div className="w-full max-w-md p-4 relative z-10 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full bg-slate-900/60 border border-white/10 flex items-center justify-center text-white backdrop-blur-md hover:bg-slate-800 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>

      {/* Header Info */}
      <div className="w-full max-w-md px-2 text-center relative z-10 mt-2 mb-6">
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
        
        {/* <p className="text-xs text-slate-300 font-medium max-w-xs mx-auto leading-relaxed">Join the arena and compete to earn cash rewards.</p> */}
      </div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md px-4 relative z-10"
      >
        <div className="bg-[#0b0a15] rounded-3xl p-6 border border-purple-500/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">

        <h2 className="text-3xl font-black text-center text-white italic tracking-tight mb-2 uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">CREATE ACCOUNT</h2>
        {/* Register Form */}   
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-6">
          
          {/* Username */}
          <div className="space-y-1 ">
            <label className="block text-xs font-bold text-slate-200">Username</label>
            <div className="relative">
              <input
                type="text"
                disabled={isLoading}
                placeholder="mortal_sniper"
                {...register('username')}
                className={`w-full bg-slate-900 border ${
                  errors.username ? 'border-red-500' : 'border-white/15'
                } rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500 transition-colors`}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            {errors.username && (
              <span className="text-red-500 text-[10px] font-semibold mt-0.5 block">
                {errors.username.message}
              </span>
            )}
          </div>

          {/* Email (Gmail) */}
          <div className="space-y-1">
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

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-200">Mobile Number</label>
            <div className="relative">
              <input
                type="tel"
                disabled={isLoading}
                placeholder="9876543210"
                {...register('phone')}
                className={`w-full bg-slate-900 border ${
                  errors.phone ? 'border-red-500' : 'border-white/15'
                } rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500 transition-colors`}
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            {errors.phone && (
              <span className="text-red-500 text-[10px] font-semibold mt-0.5 block">
                {errors.phone.message}
              </span>
            )}
          </div>

          {/* Password */}
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
            {errors.password && (
              <span className="text-red-500 text-[10px] font-semibold mt-0.5 block">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-200">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                disabled={isLoading}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={`w-full bg-slate-900 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-white/15'
                } rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500 transition-colors`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            {errors.confirmPassword && (
              <span className="text-red-500 text-[10px] font-semibold mt-0.5 block">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{isLoading ? 'CREATING PROFILE...' : 'REGISTER ACCOUNT'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer actions */}
        <div className="text-center pt-3 text-xs text-slate-400 border-t border-white/10 mt-2">
          <span>Already have an account? </span>
          <Link href="/login" className="text-cyan-400 font-bold hover:underline">
            Login Here
          </Link>
        </div>

        </div>
      </motion.div>
    </div>
  )
}
