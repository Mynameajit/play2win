'use client'

import React, { useState } from 'react'
import { Download, FileText, IndianRupee, Users, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'

export default function ReportsPage() {
  const { toast } = useToast()
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (type: 'revenue' | 'tournaments' | 'wallets', filename: string) => {
    setDownloading(type)
    try {
      const response = await axios.get(`/api/superadmin/reports/${type}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast({ title: 'Report downloaded successfully!' })
    } catch (err: any) {
      toast({ title: 'Download failed', variant: 'destructive' })
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Reports</h1>
        <p className="text-muted-foreground">Download comprehensive CSV reports for accounting, auditing, and analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Revenue Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><IndianRupee className="w-5 h-5 text-green-500" /> Financial Ledger</CardTitle>
            <CardDescription>Export all deposits, withdrawals, winnings, and entry fees.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-green-500 hover:bg-green-600" 
              onClick={() => handleDownload('revenue', 'revenue_ledger')}
              disabled={downloading === 'revenue'}
            >
              {downloading === 'revenue' ? 'Generating...' : <><Download className="w-4 h-4 mr-2" /> Download CSV</>}
            </Button>
          </CardContent>
        </Card>

        {/* Tournaments Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-orange-500" /> Match Analytics</CardTitle>
            <CardDescription>Export all tournament data including prize pools and filled slots.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => handleDownload('tournaments', 'tournaments_data')}
              disabled={downloading === 'tournaments'}
            >
              {downloading === 'tournaments' ? 'Generating...' : <><Download className="w-4 h-4 mr-2" /> Download CSV</>}
            </Button>
          </CardContent>
        </Card>

        {/* Wallets Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> User Wallets</CardTitle>
            <CardDescription>Export user balances, deposit, winning, and bonus wallets.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={() => handleDownload('wallets', 'user_wallets')}
              disabled={downloading === 'wallets'}
            >
              {downloading === 'wallets' ? 'Generating...' : <><Download className="w-4 h-4 mr-2" /> Download CSV</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-6 text-center text-muted-foreground flex flex-col items-center gap-2">
            <FileText className="w-10 h-10 opacity-20" />
            <p>Reports are generated in real-time from the database. For large datasets, generation may take a few seconds.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}