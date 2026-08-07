'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  MOCK_TOURNAMENTS, 
  MOCK_TRANSACTIONS, 
  INITIAL_ADMINS, 
  INITIAL_WINNER_SUBMISSIONS,
  GAME_UID_DATABASE, 
  Tournament, 
  Transaction, 
  AdminUser,
  MatchWinnerSubmission,
  NotificationItem
} from '@/lib/mockData'
import confetti from 'canvas-confetti'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { io, Socket } from 'socket.io-client'
import { toast as shadcnToast } from '@/hooks/use-toast'

export type UserRole = 'guest' | 'user' | 'admin' | 'superadmin'

export interface UserProfile {
  id?: string
  name: string
  email: string
  phone: string
  avatar: string
  bgmiUid: string
  bgmiIgn: string
  freefireUid: string
  freefireIgn: string
  depositBalance: number
  winningBalance: number
  bonusBalance: number
  lockedBalance: number
  totalKills: number
  matchesPlayed: number
  rankTitle: string
  matchResultsWon?: { tournamentId: string, prizeAmount: number }[]
}

interface AppContextType {
  userRole: UserRole
  setUserRole: (role: UserRole) => void
  user: UserProfile
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>
  adminsList: AdminUser[]
  setAdminsList: React.Dispatch<React.SetStateAction<AdminUser[]>>
  tournaments: Tournament[]
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>
  isTournamentsLoading: boolean
  joinedTournamentIds: string[]
  selectedTournament: Tournament | null
  setSelectedTournament: (t: Tournament | null) => void
  winnerSubmissions: MatchWinnerSubmission[]
  setWinnerSubmissions: React.Dispatch<React.SetStateAction<MatchWinnerSubmission[]>>
  notifications: NotificationItem[]
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>
  isJoinModalOpen: boolean
  setIsJoinModalOpen: (open: boolean) => void
  isDetailsModalOpen: boolean
  setIsDetailsModalOpen: (open: boolean) => void
  isDepositModalOpen: boolean
  setIsDepositModalOpen: (open: boolean) => void
  isWithdrawModalOpen: boolean
  setIsWithdrawModalOpen: (open: boolean) => void
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  handleCredentialLogin: (email: string, pass: string) => Promise<{ success: boolean; role?: UserRole; message: string }>
  handleCredentialRegister: (username: string, email: string, pass: string, phone: string) => Promise<{ success: boolean; message: string }>
  handleLogout: () => void
  handleJoinTournament: (tournamentId: string, gameUid: string, nickname: string, fullName?: string, phone?: string) => Promise<boolean>
  handleDeposit: (amount: number, method: string, utrRef: string) => void
  handleWithdraw: (amount: number, upiId: string) => Promise<boolean>
  sendRoomCredentials: (tournamentId: string, roomId: string, password: any) => void
  submitMatchWinners: (
    tournamentId: string,
    firstUid: string,
    firstIgn: string,
    firstPrize: number,
    secondUid?: string,
    secondIgn?: string,
    secondPrize?: number,
    thirdUid?: string,
    thirdIgn?: string,
    thirdPrize?: number
  ) => void
  approveWinnerPayout: (submissionId: string) => void
  creditUserWallet: (amount: number, walletType: 'deposit' | 'winning', reason: string) => void
  createAdminAccount: (name: string, email: string, assignedGame: 'BGMI' | 'Free Fire' | 'ALL') => void
  verifyGameUid: (uid: string, game: 'BGMI' | 'Free Fire') => { valid: boolean; ign?: string; message: string }
  transactions: Transaction[]
  socket: any
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEY = 'play2earn_session'

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient())
  const [userRole, setUserRole] = useState<UserRole>('guest')
  
  const [user, setUser] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    bgmiUid: '',
    bgmiIgn: '',
    freefireUid: '',
    freefireIgn: '',
    depositBalance: 0,
    winningBalance: 0,
    bonusBalance: 0,
    lockedBalance: 0,
    totalKills: 0,
    matchesPlayed: 0,
    rankTitle: ''
  })

  const [adminsList, setAdminsList] = useState<AdminUser[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([]) // empty initially to show loading state instead of mock data
  const [isTournamentsLoading, setIsTournamentsLoading] = useState(true)
  const [joinedTournamentIds, setJoinedTournamentIds] = useState<string[]>([])
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  
  const [winnerSubmissions, setWinnerSubmissions] = useState<MatchWinnerSubmission[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const [socket, setSocket] = useState<any>(null)

  // INITIAL HYDRATION FROM LOCALSTORAGE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.role) setUserRole(parsed.role)
          if (parsed.user) setUser(parsed.user)
        } catch (e) {
          console.error('Error parsing localStorage session:', e)
        }
      }
    }
  }, [])

  // HELPER TO SAVE SESSION
  const saveSession = (role: UserRole, userObj: UserProfile, accessToken?: string) => {
    if (typeof window !== 'undefined') {
      if (role === 'guest') {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        const saved = localStorage.getItem(STORAGE_KEY)
        let token = accessToken
        if (!token && saved) {
          try {
            token = JSON.parse(saved).accessToken
          } catch (e) {}
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ role, user: userObj, accessToken: token }))
      }
    }
  }

  // Socket Connection and listener binding
  useEffect(() => {
    let activeSocket: any = null

    if (userRole !== 'guest') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.accessToken) {
            const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
            activeSocket = io(SOCKET_URL, {
              query: { token: parsed.accessToken },
              transports: ['websocket']
            })

            activeSocket.on('connect', () => {
              console.log('[Socket] Connected to backend.')
            })

            activeSocket.on('wallet_update', (data: { depositBalance: number; winningBalance: number }) => {
              console.log('[Socket] Received wallet_update event:', data)
              setUser(prev => ({
                ...prev,
                depositBalance: Number(data.depositBalance),
                winningBalance: Number(data.winningBalance)
              }))
              showToast('Wallet balance updated!', 'info')
            })

            activeSocket.on('notification', (data: any) => {
              console.log('[Socket] Received notification event:', data)
              const newNotif = {
                id: data.id || `notif-${Date.now()}`,
                title: data.title,
                message: data.description,
                time: 'Just now',
                unread: !data.isRead,
                type: data.type ? data.type.toLowerCase() : 'system'
              }
              setNotifications(prev => [newNotif, ...prev])
              showToast(`${data.title}: ${data.description}`, 'info')
            })

            activeSocket.on('match_update', (data: any) => {
              console.log('[Socket] Match status updated:', data)
              // Refetch matches
              apiClient.get('/tournaments').then(res => {
                if (res.data?.tournaments) {
                  setTournaments(res.data.tournaments)
                }
              })
              // Refetch profile if match completed, to get updated matchResultsWon & wallet
              if (data?.status === 'COMPLETED') {
                apiClient.get('/users/profile').then(res => {
                  if (res.data) {
                    setUser(prev => ({
                      ...prev,
                      ...res.data,
                      depositBalance: Number(res.data.depositBalance || 0),
                      winningBalance: Number(res.data.winningBalance || 0),
                      bonusBalance: Number(res.data.bonusBalance || 0),
                      lockedBalance: Number(res.data.lockedBalance || 0),
                      matchesPlayed: Number(res.data.matchesPlayed || 0),
                      totalKills: Number(res.data.totalKills || 0),
                    }))
                  }
                }).catch(() => {})
              }
            })

            activeSocket.on('tournament:update', (data: any) => {
              console.log('[Socket] Tournament updated by admin:', data)
              apiClient.get('/tournaments').then(res => {
                if (res.data?.tournaments) {
                  setTournaments(res.data.tournaments)
                }
              })
              if (data?.status === 'COMPLETED') {
                apiClient.get('/users/profile').then(res => {
                  if (res.data) {
                    setUser(prev => ({
                      ...prev,
                      ...res.data,
                      depositBalance: Number(res.data.depositBalance || 0),
                      winningBalance: Number(res.data.winningBalance || 0)
                    }))
                  }
                }).catch(() => {})
              }
            })

            activeSocket.on('room_creds', (data: any) => {
              showToast(`Match room credentials received! Room: ${data.roomId}`, 'success')
            })

            setSocket(activeSocket)
          }
        } catch (err) {
          console.error('[Socket] Init failed:', err)
        }
      }
    }

    return () => {
      if (activeSocket) {
        activeSocket.disconnect()
      }
    }
  }, [userRole])

  // Syncing database values on login
  useEffect(() => {
    if (userRole !== 'guest') {
      const fetchData = async () => {
        try {
          setIsTournamentsLoading(true)
          const [tourneyRes, txnRes, profileRes] = await Promise.all([
            apiClient.get('/tournaments'),
            apiClient.get('/transactions'),
            apiClient.get('/users/profile')
          ])

          if (tourneyRes.data && tourneyRes.data.tournaments) {
            setTournaments(tourneyRes.data.tournaments)
          }
          setIsTournamentsLoading(false)

          if (profileRes.data) {
            const parsedUser = {
              ...profileRes.data,
              depositBalance: Number(profileRes.data.depositBalance || 0),
              winningBalance: Number(profileRes.data.winningBalance || 0),
              bonusBalance: Number(profileRes.data.bonusBalance || 0),
              lockedBalance: Number(profileRes.data.lockedBalance || 0),
              matchesPlayed: Number(profileRes.data.matchesPlayed || 0),
              totalKills: Number(profileRes.data.totalKills || 0),
            }
            setUser(prev => ({ ...prev, ...parsedUser }))
            if (parsedUser.participations) {
              setJoinedTournamentIds(parsedUser.participations.map((p: any) => p.tournamentId))
            }
          }
          if (txnRes.data && txnRes.data.transactions) {
            // Map keys of backend Transactions back to frontend fields
            const mapped = txnRes.data.transactions.map((t: any) => ({
              id: t.id,
              type: t.type.toLowerCase(),
              title: t.details || `${t.type} via ${t.paymentMethod}`,
              amount: Number(t.amount),
              status: t.status,
              date: new Date(t.createdAt).toLocaleString(),
              paymentMethod: t.paymentMethod,
              balanceBefore: Number(t.balanceBefore),
              balanceAfter: Number(t.balanceAfter),
              utr: t.utr,
              details: t.details
            }))
            setTransactions(mapped)
          }
        } catch (e) {
          console.error('[App Provider] Error fetching backend data:', e)
        }
      }
      fetchData()
    }
  }, [userRole])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    shadcnToast({
      title: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info',
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    })
  }

  // CREDENTIAL BASED LOGIN WITH COOKIE AND TOKENS
  const handleCredentialLogin = async (email: string, pass: string): Promise<{ success: boolean; role?: UserRole; message: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, message: data.message || 'Login failed' }
      }

      const roleLower = data.user.role.toLowerCase() as UserRole
      setUserRole(roleLower)
      
      const mappedUser = {
        id: data.user.id,
        name: data.user.username,
        email: data.user.email,
        phone: data.user.phone,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=Play2Earn${data.user.username}`,
        bgmiUid: data.user.bgmiUid,
        bgmiIgn: data.user.bgmiIgn,
        freefireUid: data.user.freefireUid,
        freefireIgn: data.user.freefireIgn,
        depositBalance: Number(data.user.depositBalance),
        winningBalance: Number(data.user.winningBalance),
        bonusBalance: Number(data.user.bonusBalance),
        lockedBalance: Number(data.user.lockedBalance),
        totalKills: data.user.totalKills,
        matchesPlayed: data.user.matchesPlayed,
        rankTitle: data.user.rankTitle
      }
      
      setUser(mappedUser)
      saveSession(roleLower, mappedUser, data.accessToken)

      showToast(`Logged in successfully!`, 'success')
      return { success: true, role: roleLower, message: data.message }
    } catch (e: any) {
      console.error(e)
      return { success: false, message: 'Server connection error.' }
    }
  }

  // CREDENTIAL BASED REGISTER
  const handleCredentialRegister = async (
    username: string,
    email: string,
    pass: string,
    phone: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password: pass, phone })
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, message: data.message || 'Registration failed' }
      }

      // Automatically log the user in after successful registration
      const loginResult = await handleCredentialLogin(email, pass)
      if (loginResult.success) {
        showToast('Registration successful! Logging you in...', 'success')
        return { success: true, message: data.message }
      } else {
        showToast('Registered successfully, but auto-login failed.', 'info')
        return { success: true, message: data.message }
      }
    } catch (e: any) {
      console.error(e)
      return { success: false, message: 'Server connection error.' }
    }
  }

  // LOGOUT CLEARS LOCALSTORAGE AND HITS BACKEND ENDPOINT
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {}
    
    setUserRole('guest')
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      window.location.href = '/login'
    }
    showToast('Logged out successfully.', 'info')
  }

  // GAME UID VERIFICATION LOOKUP SIMULATION
  const verifyGameUid = (uid: string, game: 'BGMI' | 'Free Fire'): { valid: boolean; ign?: string; message: string } => {
    const cleanUid = uid.trim()
    if (!cleanUid || cleanUid.length < 6) {
      return { valid: false, message: `Invalid ${game} UID length. Must be at least 6 digits.` }
    }

    if (GAME_UID_DATABASE[cleanUid]) {
      const dbEntry = GAME_UID_DATABASE[cleanUid]
      if (dbEntry.game === game) {
        return { valid: true, ign: dbEntry.ign, message: `Official ${game} Server: Player Found ✓` }
      }
    }

    if (/^\d+$/.test(cleanUid)) {
      const generatedIgn = game === 'BGMI' ? `Soul_Gamer_${cleanUid.slice(-4)}` : `Total_Gamer_${cleanUid.slice(-4)}`
      return { valid: true, ign: generatedIgn, message: `${game} UID Verified on Official Server ✓` }
    }

    return { valid: false, message: `UID not found on ${game} servers. Check your profile.` }
  }

  // REGISTER PARTICIPANT TO BACKEND MATCH
  const handleJoinTournament = async (tournamentId: string, gameUid: string, nickname: string, fullName?: string, phone?: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(`/tournaments/${tournamentId}/join`, {
        gameUid,
        ign: nickname,
        fullName,
        phone
      })

      if (response.data && response.data.success) {
        // Refetch tournaments to update slots count
        const tourneyRes = await apiClient.get('/tournaments')
        if (tourneyRes.data?.tournaments) {
          setTournaments(tourneyRes.data.tournaments)
        }

        // Refetch transactions ledger
        const txnRes = await apiClient.get('/transactions')
        if (txnRes.data?.transactions) {
          const mapped = txnRes.data.transactions.map((t: any) => ({
            id: t.id,
            type: t.type.toLowerCase(),
            title: t.details || `${t.type} via ${t.paymentMethod}`,
            amount: Number(t.amount),
            status: t.status,
            date: new Date(t.createdAt).toLocaleString(),
            paymentMethod: t.paymentMethod,
            balanceBefore: Number(t.balanceBefore),
            balanceAfter: Number(t.balanceAfter),
            utr: t.utr,
            details: t.details
          }))
          setTransactions(mapped)
        }

        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
        } catch (e) {}

        setJoinedTournamentIds(prev => [...prev, tournamentId])
        showToast(`Registered successfully!`, 'success')
        return true
      }
      return false
    } catch (e: any) {
      console.error(e)
      showToast(e.response?.data?.message || 'Failed to join tournament roster.', 'error')
      return false
    }
  }

  // SUBMIT DEPOSIT REQUEST TO BACKEND
  const handleDeposit = async (amount: number, method: string, utrRef: string) => {
    try {
      const response = await apiClient.post('/transactions/deposit', {
        amount,
        method,
        utr: utrRef
      })

      if (response.data) {
        // Refetch transactions
        const txnRes = await apiClient.get('/transactions')
        if (txnRes.data?.transactions) {
          const mapped = txnRes.data.transactions.map((t: any) => ({
            id: t.id,
            type: t.type.toLowerCase(),
            title: t.details || `${t.type} via ${t.paymentMethod}`,
            amount: Number(t.amount),
            status: t.status,
            date: new Date(t.createdAt).toLocaleString(),
            paymentMethod: t.paymentMethod,
            balanceBefore: Number(t.balanceBefore),
            balanceAfter: Number(t.balanceAfter),
            utr: t.utr,
            details: t.details
          }))
          setTransactions(mapped)
        }

        showToast(`Deposit request submitted! Ref: ${utrRef}`, 'success')
      }
    } catch (e: any) {
      console.error(e)
      showToast(e.response?.data?.message || 'Deposit submission failed.', 'error')
    }
  }

  // SUBMIT WITHDRAWAL REQUEST TO BACKEND
  const handleWithdraw = async (amount: number, upiId: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/transactions/withdraw', {
        amount,
        upiId
      })

      if (response.data) {
        // Refetch transactions
        const txnRes = await apiClient.get('/transactions')
        if (txnRes.data?.transactions) {
          const mapped = txnRes.data.transactions.map((t: any) => ({
            id: t.id,
            type: t.type.toLowerCase(),
            title: t.details || `${t.type} via ${t.paymentMethod}`,
            amount: Number(t.amount),
            status: t.status,
            date: new Date(t.createdAt).toLocaleString(),
            paymentMethod: t.paymentMethod,
            balanceBefore: Number(t.balanceBefore),
            balanceAfter: Number(t.balanceAfter),
            utr: t.utr,
            details: t.details
          }))
          setTransactions(mapped)
        }

        showToast(`Withdrawal of ₹${amount} submitted!`, 'success')
        return true
      }
      return false
    } catch (e: any) {
      console.error(e)
      showToast(e.response?.data?.message || 'Withdrawal submission failed.', 'error')
      return false
    }
  }

  // ADMIN DISPATCH ROOM CREDENTIALS TO BACKEND MATCH
  const sendRoomCredentials = async (tournamentId: string, roomId: string, password: any) => {
    try {
      const response = await apiClient.post(`/tournaments/${tournamentId}/credentials`, {
        roomId,
        roomPassword: password
      })

      if (response.data && response.data.success) {
        // Refetch tournaments
        const tourneyRes = await apiClient.get('/tournaments')
        if (tourneyRes.data?.tournaments) {
          setTournaments(tourneyRes.data.tournaments)
        }
        showToast('Room ID & Password dispatched successfully!', 'success')
      }
    } catch (e: any) {
      console.error(e)
      showToast(e.response?.data?.message || 'Failed to dispatch credentials.', 'error')
    }
  }

  const submitMatchWinners = (
    tournamentId: string,
    firstUid: string,
    firstIgn: string,
    firstPrize: number,
    secondUid?: string,
    secondIgn?: string,
    secondPrize?: number,
    thirdUid?: string,
    thirdIgn?: string,
    thirdPrize?: number
  ) => {
    const target = tournaments.find(t => t.id === tournamentId)
    if (!target) return

    const newSubmission: MatchWinnerSubmission = {
      id: `SUB-${Math.floor(100 + Math.random() * 900)}`,
      tournamentId,
      tournamentTitle: target.title,
      game: target.game,
      firstPlaceUid: firstUid,
      firstPlaceIgn: firstIgn,
      firstPlacePrize: firstPrize,
      secondPlaceUid: secondUid,
      secondPlaceIgn: secondIgn,
      secondPlacePrize: secondPrize,
      thirdPlaceUid: thirdUid,
      thirdPlaceIgn: thirdIgn,
      thirdPlacePrize: thirdPrize,
      status: 'PENDING_SUPERADMIN',
      submittedAt: 'Just now'
    }

    setWinnerSubmissions(prev => [newSubmission, ...prev])
    setTournaments(prev =>
      prev.map(t => (t.id === tournamentId ? { ...t, status: 'COMPLETED', winnersDeclared: true } : t))
    )

    showToast(`Match Winners submitted! Payout request sent to Super Admin for final payment approval.`, 'success')
  }

  const approveWinnerPayout = (submissionId: string) => {
    const sub = winnerSubmissions.find(s => s.id === submissionId)
    if (!sub) return

    setWinnerSubmissions(prev =>
      prev.map(s => (s.id === submissionId ? { ...s, status: 'PAID' } : s))
    )

    if (sub.firstPlaceUid === user.bgmiUid || sub.firstPlaceUid === user.freefireUid) {
      const updatedUser = { ...user, winningBalance: user.winningBalance + sub.firstPlacePrize }
      setUser(updatedUser)
      saveSession(userRole, updatedUser)

      const winTxn: Transaction = {
        id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        type: 'winning',
        title: `Match Winner Reward: ${sub.tournamentTitle}`,
        amount: sub.firstPlacePrize,
        status: 'COMPLETED',
        date: 'Just now'
      }
      setTransactions(prev => [winTxn, ...prev])
    }

    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } })
    } catch (e) {
      console.log(e)
    }

    showToast(`Payment Approved & Released for ${sub.tournamentTitle}! Winner ₹${sub.firstPlacePrize} credited.`, 'success')
  }

  const creditUserWallet = (amount: number, walletType: 'deposit' | 'winning', reason: string) => {
    if (amount <= 0) return

    const updatedUser = {
      ...user,
      depositBalance: walletType === 'deposit' ? user.depositBalance + amount : user.depositBalance,
      winningBalance: walletType === 'winning' ? user.winningBalance + amount : user.winningBalance
    }

    setUser(updatedUser)
    saveSession(userRole, updatedUser)

    const creditTxn: Transaction = {
      id: `TXN-SUPER-${Math.floor(1000 + Math.random() * 9000)}`,
      type: walletType === 'deposit' ? 'deposit' : 'winning',
      title: `Super Admin Direct Credit: ${reason}`,
      amount: amount,
      status: 'COMPLETED',
      date: 'Just now',
      paymentMethod: 'Super Admin Vault'
    }

    setTransactions(prev => [creditTxn, ...prev])
    showToast(`Successfully credited ₹${amount} to User's ${walletType.toUpperCase()} wallet!`, 'success')
  }

  const createAdminAccount = (name: string, email: string, assignedGame: 'BGMI' | 'Free Fire' | 'ALL') => {
    const newAdmin: AdminUser = {
      id: `ADM-${Math.floor(10 + Math.random() * 90)}`,
      name,
      email,
      assignedGame,
      status: 'ACTIVE',
      createdDate: 'Today'
    }
    setAdminsList(prev => [...prev, newAdmin])
    showToast(`New Admin account created for ${name} (${assignedGame})!`, 'success')
  }

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        user,
        setUser,
        adminsList,
        setAdminsList,
        tournaments,
        setTournaments,
        isTournamentsLoading,
        joinedTournamentIds,
        selectedTournament,
        setSelectedTournament,
        winnerSubmissions,
        setWinnerSubmissions,
        notifications,
        setNotifications,
        isJoinModalOpen,
        setIsJoinModalOpen,
        isDetailsModalOpen,
        setIsDetailsModalOpen,
        isDepositModalOpen,
        setIsDepositModalOpen,
        isWithdrawModalOpen,
        setIsWithdrawModalOpen,
        toast,
        showToast,
        handleCredentialLogin,
        handleCredentialRegister,
        handleLogout,
        handleJoinTournament,
        handleDeposit,
        handleWithdraw,
        sendRoomCredentials,
        submitMatchWinners,
        approveWinnerPayout,
        creditUserWallet,
        createAdminAccount,
        verifyGameUid,
        transactions,
        socket
      }}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
