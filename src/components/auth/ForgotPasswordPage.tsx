'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gamepad2, Mail, Lock, KeyRound, Loader2, ArrowLeft, ArrowRight } from 'lucide-react'

// Schema step 1: Request OTP
const step1Schema = z.object({
  email: z.string().email('Enter a valid email address')
})

type Step1FormData = z.infer<typeof step1Schema>

// Schema step 2: Reset password
const step2Schema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

type Step2FormData = z.infer<typeof step2Schema>

export const ForgotPasswordPage: React.FC = () => {
  const router = useRouter()
  const { showToast } = useApp()

  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [demoOtpCode, setDemoOtpCode] = useState('')

  // Step 1 hook-form config
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    setError: setErrorStep1,
    formState: { errors: errorsStep1 }
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema)
  })

  // Step 2 hook-form config
  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    setError: setErrorStep2,
    formState: { errors: errorsStep2 }
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema)
  })

  const onStep1Submit = async (data: Step1FormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email })
      })
      const resData = await response.json()
      setIsLoading(false)

      if (response.ok) {
        showToast(resData.message, 'success')
        if (resData.debugOtp) {
          setDemoOtpCode(resData.debugOtp)
        }
        setEmail(data.email)
        setStep(2)
      } else {
        showToast(resData.message || 'Error occurred.', 'error')
        setErrorStep1('email', { type: 'manual', message: resData.message || 'Failed to send OTP.' })
      }
    } catch (err) {
      setIsLoading(false)
      showToast('Connection error.', 'error')
      setErrorStep1('email', { type: 'manual', message: 'Connection error.' })
    }
  }

  const onStep2Submit = async (data: Step2FormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: data.otp, newPassword: data.newPassword })
      })
      const resData = await response.json()
      setIsLoading(false)

      if (response.ok) {
        showToast(resData.message, 'success')
        router.push('/login')
      } else {
        showToast(resData.message || 'Error verifying OTP.', 'error')
        
        const msg = resData.message.toLowerCase()
        if (msg.includes('otp')) {
          setErrorStep2('otp', { type: 'manual', message: resData.message })
        } else if (msg.includes('password')) {
          setErrorStep2('newPassword', { type: 'manual', message: resData.message })
        } else {
          setErrorStep2('otp', { type: 'manual', message: resData.message })
        }
      }
    } catch (err) {
      setIsLoading(false)
      showToast('Connection error.', 'error')
      setErrorStep2('otp', { type: 'manual', message: 'Connection error.' })
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-2 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-purple-500/30 shadow-2xl relative overflow-hidden space-y-6"
      >
        
        {/* Back Link */}
        <Link 
          href="/login" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 mx-auto mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Reset Password</h2>
          <p className="text-xs text-slate-400">
            {step === 1 
              ? 'Enter your email to request a 6-digit verification code.' 
              : 'Enter the code and set your new password.'
            }
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            /* STEP 1: REQUEST OTP FORM */
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmitStep1(onStep1Submit)}
              className="space-y-4"
            >
              
              {/* Email field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-200">Email Address (Gmail)</label>
                <div className="relative">
                  <input
                    type="email"
                    disabled={isLoading}
                    placeholder="user@gmail.com"
                    {...registerStep1('email')}
                    className={`w-full bg-slate-900 border ${
                      errorsStep1.email ? 'border-red-500' : 'border-white/15'
                    } rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500 transition-colors`}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errorsStep1.email && (
                  <span className="text-red-500 text-[10px] font-semibold mt-0.5 block">
                    {errorsStep1.email.message}
                  </span>
                )}
              </div>

              {/* Submit Request button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                <span>{isLoading ? 'GENERATING CODE...' : 'SEND OTP CODE'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </motion.form>
          ) : (
            /* STEP 2: VERIFY OTP AND RESET PASSWORD FORM */
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmitStep2(onStep2Submit)}
              className="space-y-4"
            >
              
              {/* Display OTP demo hint */}
              {demoOtpCode && (
                <div className="bg-slate-900 border border-white/5 p-3 rounded-xl text-center flex flex-col items-center justify-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">TESTING DEMO OTP CODE</span>
                  <strong className="text-cyan-400 text-lg tracking-widest mt-0.5">{demoOtpCode}</strong>
                </div>
              )}

              {/* OTP input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-200">6-Digit OTP Code</label>
                <input
                  type="text"
                  disabled={isLoading}
                  maxLength={6}
                  placeholder="123456"
                  {...registerStep2('otp')}
                  className={`w-full bg-slate-900 border ${
                    errorsStep2.otp ? 'border-red-500' : 'border-white/15'
                  } rounded-xl px-3 py-2.5 text-sm font-mono tracking-widest text-center text-slate-100 font-bold focus:outline-none focus:border-purple-500 transition-colors`}
                />
                {errorsStep2.otp && (
                  <span className="text-red-500 text-[10px] font-semibold mt-0.5 block text-center">
                    {errorsStep2.otp.message}
                  </span>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-200">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    disabled={isLoading}
                    placeholder="••••••••"
                    {...registerStep2('newPassword')}
                    className={`w-full bg-slate-900 border ${
                      errorsStep2.newPassword ? 'border-red-500' : 'border-white/15'
                    } rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500 transition-colors`}
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errorsStep2.newPassword && (
                  <span className="text-red-500 text-[10px] font-semibold mt-0.5 block">
                    {errorsStep2.newPassword.message}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-200">Confirm New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    disabled={isLoading}
                    placeholder="••••••••"
                    {...registerStep2('confirmPassword')}
                    className={`w-full bg-slate-900 border ${
                      errorsStep2.confirmPassword ? 'border-red-500' : 'border-white/15'
                    } rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500 transition-colors`}
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errorsStep2.confirmPassword && (
                  <span className="text-red-500 text-[10px] font-semibold mt-0.5 block">
                    {errorsStep2.confirmPassword.message}
                  </span>
                )}
              </div>

              {/* Submit Reset button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                <span>{isLoading ? 'RESETTING PASSWORD...' : 'VERIFY & RESET PASSWORD'}</span>
              </button>

              {/* Back to Step 1 */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setStep(1)}
                className="w-full text-center text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline transition-colors block mt-2"
              >
                Request a new verification code
              </button>
            </motion.form>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  )
}
