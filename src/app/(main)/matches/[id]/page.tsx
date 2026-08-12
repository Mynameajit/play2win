'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTournamentDetails, useJoinTournament, useMyMatches } from '@/hooks/useTournaments'
import { useUserProfile } from '@/hooks/useProfileQuery'
import { ArrowLeft, Trophy, Users, Clock, Calendar, ShieldCheck, Map, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import confetti from 'canvas-confetti'

export default function MatchDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const tournamentId = params.id as string
  const { data: tournament, isLoading, isError } = useTournamentDetails(tournamentId)
  const { data: user, isLoading: isUserLoading, isError: isUserError } = useUserProfile()
  const { data: myMatches = [] } = useMyMatches()
  const joinMutation = useJoinTournament()
  
  const userRole = isUserError || !user ? 'guest' : 'user'
  const isJoined = myMatches.some((m: any) => m.tournamentId === tournamentId)

  // Move hooks before conditional returns
  const isBgmi = tournament?.game === 'BGMI' || tournament?.game?.toLowerCase().includes('bgmi')
  const isFreeFire = tournament?.game === 'Free Fire' || tournament?.game === 'FREE FIRE' || tournament?.game?.toLowerCase().includes('free fire')

  const defaultUid = isBgmi ? user?.bgmiUid : user?.freefireUid
  const [gameUid, setGameUid] = React.useState(defaultUid || '')

  React.useEffect(() => {
    if (user && !gameUid) {
      setGameUid((isBgmi ? user.bgmiUid : user.freefireUid) || '')
    }
  }, [user, isBgmi])

  if (isLoading) {
    return <div className="min-h-screen bg-[#0b0a15] flex items-center justify-center text-purple-500 animate-pulse font-black text-xl">LOADING MATCH...</div>
  }

  if (isError || !tournament) {
    return <div className="min-h-screen bg-[#0b0a15] flex flex-col items-center justify-center text-white space-y-4">
      <h1 className="text-2xl font-black italic text-red-500">MATCH NOT FOUND</h1>
      <button onClick={() => router.push('/')} className="px-6 py-2 bg-slate-800 rounded-xl">Go Back</button>
    </div>
  }

  const handleJoin = async () => {
    if (userRole === 'guest') {
      router.push(`/login?redirect=/matches/${tournament.id}`)
      return
    }

    if (!gameUid || gameUid.trim() === '') {
      toast({ title: 'UID Required', description: `Please enter your ${tournament.game} UID.`, variant: 'destructive' })
      return
    }

    const totalBalance = (user?.depositBalance || 0) + (user?.winningBalance || 0)
    if (totalBalance < tournament.entryFee) {
      toast({ title: 'Insufficient Balance', description: 'Please add money to your wallet to join this match.', variant: 'destructive' })
      return
    }

    try {
      await joinMutation.mutateAsync({
        tournamentId,
        data: {
          gameUid: gameUid.trim(),
          ign: isBgmi ? user?.bgmiIgn : user?.freefireIgn
        }
      })
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#06b6d4', '#eab308']
      })
      toast({ title: 'Success', description: 'You have joined the match successfully!', variant: 'default' })
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to join match', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0a15] text-slate-100 pb-10">
      
      {/* Dynamic Header */}
      <div className="relative w-full h-64 sm:h-100 bg-slate-900 border-b border-white/10">
        <Image 
          src={tournament.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'}
          alt={tournament.title}
          fill
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a15] via-[#0b0a15]/80 to-transparent" />
        
        <div className="absolute top-4 left-4">
          <button onClick={() => router.back()} className="p-2.5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-black/70 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-400/20 text-cyan-400">
              {tournament.game}
            </span>
            {tournament.status === 'LIVE' && (
              <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-[10px] flex items-center gap-1.5 shadow-lg shadow-red-600/20 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white italic drop-shadow-xl">{tournament.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#100c18] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
              <Calendar className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Date</p>
              <p className="text-xs font-bold text-white mt-1">{tournament.startTime.split(' ')[0]}</p>
            </div>
            <div className="bg-[#100c18] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
              <Clock className="w-5 h-5 text-cyan-400 mb-2" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Time</p>
              <p className="text-xs font-bold text-white mt-1">{tournament.startTime.split(' ').slice(1).join(' ')}</p>
            </div>
            <div className="bg-[#100c18] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
              <Map className="w-5 h-5 text-emerald-400 mb-2" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Map</p>
              <p className="text-xs font-bold text-white mt-1">{tournament.map}</p>
            </div>
            <div className="bg-[#100c18] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
              <Shield className="w-5 h-5 text-orange-400 mb-2" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mode</p>
              <p className="text-xs font-bold text-white mt-1">{tournament.mode}</p>
            </div>
          </div>

          {/* Credentials Section if joined */}
          {isJoined && (
            <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 p-6 rounded-3xl space-y-4">
              <h2 className="text-lg font-black italic text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> ROOM CREDENTIALS
              </h2>
              {tournament.roomCredsSent ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Room ID</p>
                    <p className="text-xl font-mono font-black text-white">{tournament.roomId || 'N/A'}</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Password</p>
                    <p className="text-xl font-mono font-black text-white">{tournament.roomPassword || 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-purple-200 font-medium bg-black/20 p-4 rounded-xl border border-white/5">
                  Room credentials will be sent here 15 minutes before the match starts.
                </p>
              )}
            </div>
          )}

          {/* Rules */}
          <div className="bg-[#100c18] p-6 rounded-3xl border border-white/5 space-y-4">
            <h2 className="text-lg font-black italic text-white border-b border-white/5 pb-3">MATCH RULES</h2>
            <ul className="space-y-3">
              {tournament.rules ? tournament.rules.map((rule, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-slate-300 font-medium flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  {rule}
                </li>
              )) : (
                <li className="text-xs sm:text-sm text-slate-300 font-medium">Standard fair play rules apply. No hackers or emulators allowed.</li>
              )}
            </ul>
          </div>

        </div>

        {/* Right Column: Pricing & Join */}
        <div className="space-y-4">
          <div className="bg-[#100c18] p-4 sm:p-5 rounded-3xl border border-purple-500/20 shadow-[0_0_30px_rgba(147,51,234,0.08)] sticky top-24">
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Entry Fee</p>
                <p className="text-xl font-black text-white mt-0.5">{tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Prize Pool</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">₹{tournament.prizePool}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
                <span className="text-slate-400 uppercase">Slots Filled</span>
                <span className="text-white">{tournament.joinedSlots} / {tournament.totalSlots}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-500" 
                  style={{ width: `${Math.min((tournament.joinedSlots / tournament.totalSlots) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Game UID Input Field */}
            {userRole !== 'guest' && !isJoined && tournament.status === 'UPCOMING' && (
              <div className="mb-4 space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Your {tournament.game} UID</label>
                <input 
                  type="text" 
                  value={gameUid}
                  onChange={(e) => setGameUid(e.target.value)}
                  placeholder={`Enter ${tournament.game} UID`}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={userRole !== 'guest' && (isJoined || tournament.joinedSlots >= tournament.totalSlots || tournament.status !== 'UPCOMING' || joinMutation.isPending)}
              className={`w-full py-3 rounded-xl font-black text-[11px] transition-all uppercase tracking-widest shadow-lg ${
                isJoined ? 'bg-slate-900 border border-purple-500/50 text-purple-400 opacity-100 cursor-not-allowed' :
                'bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50'
              }`}
            >
              {joinMutation.isPending ? 'JOINING...' : 
               userRole === 'guest' ? 'SIGN IN TO JOIN' : 
               isJoined ? 'ALREADY JOINED' : 
               tournament.status !== 'UPCOMING' ? 'MATCH CLOSED' : 
               tournament.joinedSlots >= tournament.totalSlots ? 'MATCH FULL' : 
               'JOIN MATCH'}
            </button>

            <p className="text-[9px] text-slate-500 text-center font-medium mt-3">
              By joining, you agree to BattleX's Terms of Service and Anti-Cheat Policy.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}