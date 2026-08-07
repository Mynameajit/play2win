'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ResetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  expectedPhrase: string
  isFactoryReset?: boolean
  onConfirm: (password: string) => Promise<void>
}

export const ResetDialog: React.FC<ResetDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  expectedPhrase,
  isFactoryReset = false,
  onConfirm,
}) => {
  const [phrase, setPhrase] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (phrase !== expectedPhrase) {
      setError(`Please type ${expectedPhrase} to confirm.`)
      return
    }
    if (!password) {
      setError('Super Admin password is required.')
      return
    }

    setError('')
    setIsLoading(true)
    try {
      await onConfirm(password)
      setPhrase('')
      setPassword('')
      onOpenChange(false)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Operation failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isLoading) {
        onOpenChange(val)
        if (!val) {
          setPhrase('')
          setPassword('')
          setError('')
        }
      }
    }}>
      <DialogContent className={`sm:max-w-[425px] ${isFactoryReset ? 'border-red-600/50 bg-red-950/20' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2 text-slate-300">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label className="text-slate-200">
              Type <strong className="text-red-400 select-all">{expectedPhrase}</strong> to confirm
            </Label>
            <Input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder={expectedPhrase}
              className="border-red-900/50 focus-visible:ring-red-500"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Super Admin Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="border-red-900/50 focus-visible:ring-red-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={phrase !== expectedPhrase || !password || isLoading}
            className={isFactoryReset ? 'bg-red-600 hover:bg-red-700 font-bold' : ''}
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isLoading ? 'Processing...' : 'Confirm Action'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
