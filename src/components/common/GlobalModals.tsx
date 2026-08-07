'use client'

import React from 'react'
import { JoinTournamentModal } from '@/components/dashboard/JoinTournamentModal'
import { TournamentDetailsModal } from '@/components/dashboard/TournamentDetailsModal'

export const GlobalModals: React.FC = () => {
  return (
    <>
      <JoinTournamentModal />
      <TournamentDetailsModal />
    </>
  )
}
