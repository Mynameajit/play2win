'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminDashboardStats } from '@/hooks/useAdminOps'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import { Users, Swords, Gamepad2, AlertCircle } from 'lucide-react'

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useAdminDashboardStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to the Admin Control Panel. Here's an overview of your assigned matches.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <SkeletonLoader key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return <ErrorState message="Failed to load dashboard stats" onRetry={() => refetch()} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the Admin Control Panel. Here's an overview of your assigned matches.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Matches</CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAssigned || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Matches</CardTitle>
            <Gamepad2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.liveMatches || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Joined Players</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalParticipants || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Results</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingResults || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity?.length ? (
               <div className="space-y-4">
                 {stats.recentActivity.map((activity: any, i: number) => (
                   <div key={i} className="flex items-center">
                     <div className="ml-4 space-y-1">
                       <p className="text-sm font-medium leading-none">{activity.action}</p>
                       <p className="text-sm text-muted-foreground">{activity.details}</p>
                     </div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="text-sm text-muted-foreground flex items-center justify-center h-32">
                No recent activity.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
