'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-2 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-purple-500/30 shadow-2xl relative overflow-hidden"
      >
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 mx-auto mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Create Account</h2>
          <p className="text-xs text-slate-400">Join the arena and compete to earn cash rewards.</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          
          {/* Username */}
          <div className="space-y-1">
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

      </motion.div>
    </div>
  )
}
