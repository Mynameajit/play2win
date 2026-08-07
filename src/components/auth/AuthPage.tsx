'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
      email: 'user@gmail.com',
      password: '123456'
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    const result = await handleCredentialLogin(data.email, data.password)
    setIsLoading(false)

    if (result.success && result.role) {
      if (result.role === 'user') router.push('/dashboard')
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
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-2 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-purple-500/30 shadow-2xl relative overflow-hidden"
      >
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 mx-auto mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Sign In to Play2Earn</h2>
          <p className="text-xs text-slate-400">Enter your account email and password to log in.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email input */}
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
                } rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500 transition-colors`}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            {errors.email && (
              <span className="text-red-500 text-[10px] font-semibold mt-0.5 block">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-200">Password</label>
              <Link 
                href="/forgot-password" 
                className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                disabled={isLoading}
                placeholder="••••••••"
                {...register('password')}
                className={`w-full bg-slate-900 border ${
                  errors.password ? 'border-red-500' : 'border-white/15'
                } rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500 transition-colors`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            {errors.password && (
              <span className="text-red-500 text-[10px] font-semibold mt-0.5 block">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{isLoading ? 'PLEASE WAIT...' : 'AUTHENTICATE & LOG IN'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer actions */}
        <div className="text-center pt-4 text-xs text-slate-400 border-t border-white/10 mt-2">
          <span>Don't have an account? </span>
          <Link href="/register" className="text-cyan-400 font-bold hover:underline">
            Register Here
          </Link>
        </div>

        {/* Demo notice */}
        {/* <div className="text-[10px] text-slate-400 font-mono bg-slate-900/40 p-2.5 rounded-lg border border-white/5 text-center leading-normal">
          Demo: <strong>user@gmail.com</strong> | <strong>admin@gmail.com</strong> | <strong>superadmin@gmail.com</strong> (Pass: 123456)
        </div> */}

      </motion.div>
    </div>
  )
}
