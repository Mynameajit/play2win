'use client'

import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { apiClient } from '@/lib/apiClient'
import { Save, Image as ImageIcon, QrCode, Smartphone, XCircle } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function PaymentSettingsPage() {
  const { showToast } = useApp()
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [upiId, setUpiId] = useState('')
  const [instructions, setInstructions] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const res = await apiClient.get('/superadmin/settings')
      const data = res.data
      setQrCodeUrl(data.payment_qr_code || '')
      setUpiId(data.payment_upi_id || '')
      setInstructions(data.payment_instructions || '')
    } catch (error) {
      showToast('Failed to load payment settings', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error')
      return
    }

    const formData = new FormData()
    formData.append('image', file)

    try {
      setIsUploading(true)
      const res = await apiClient.post('/superadmin/upload/qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.url) {
        setQrCodeUrl(res.data.url)
        showToast('QR Code uploaded successfully', 'success')
      }
    } catch (error) {
      showToast('Failed to upload QR Code', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveQrCode = () => {
    setQrCodeUrl('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      await apiClient.post('/superadmin/settings', {
        payment_qr_code: qrCodeUrl,
        payment_upi_id: upiId,
        payment_instructions: instructions
      })
      showToast('Payment settings saved successfully', 'success')
    } catch (error) {
      showToast('Failed to save settings', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading settings...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <PageHeader
        title="Payment Settings"
        description="Configure the manual deposit gateway, including QR codes and UPI IDs."
      />

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* QR Code Section */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-purple-400" />
            <span>QR Code Image</span>
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-48 h-48 rounded-2xl bg-slate-900 border-2 border-dashed border-white/20 flex flex-col items-center justify-center relative overflow-hidden group">
              {qrCodeUrl ? (
                <>
                  <img src={qrCodeUrl} alt="Payment QR" className="w-full h-full object-contain bg-white" />
                  <button 
                    type="button" 
                    onClick={handleRemoveQrCode}
                    className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <span className="text-xs text-slate-400">No QR Code Uploaded</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <p className="text-xs text-slate-400">
                Upload a clear image of your payment QR code. Supported formats: JPG, PNG. Max size: 5MB.
              </p>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="qr-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label 
                  htmlFor="qr-upload"
                  className={`inline-flex px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-slate-200 text-xs font-bold cursor-pointer hover:bg-slate-700 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {isUploading ? 'Uploading...' : 'Upload QR Code'}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* UPI ID Section */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <span>UPI ID Details</span>
          </h3>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">UPI VPA</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. merchant@upi"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:border-purple-500/50 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-2">
              Users can copy this UPI ID directly from the Add Money modal to complete their payment.
            </p>
          </div>
        </div>

        {/* Payment Instructions Section */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="text-emerald-400 text-lg">ℹ️</span>
            <span>Payment Instructions</span>
          </h3>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Instruction Text</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter step-by-step instructions for the user..."
              rows={5}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-2">
              This text will be displayed below the QR Code / UPI ID on the deposit screen.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl flex items-center gap-2 hover:shadow-purple-500/25 transition-all ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
