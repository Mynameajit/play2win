'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Trophy, 
  ShieldCheck,
  Smartphone,
  Coins,
  UserCheck,
  Gamepad2,
  CheckCircle2,
  Zap,
  HeadphonesIcon,
  ChevronDown,
  Lock
} from 'lucide-react'

// Demo match card data using requested images
const demoMatches = [
  {
    id: 'demo-1',
    title: 'BGMI Pro Scrims',
    game: 'BGMI',
    mode: 'Squad',
    map: 'Erangel',
    entryFee: 50,
    prizePool: 2000,
    totalSlots: 100,
    joinedSlots: 85,
    banner: '/images/bgmi-img.png'
  },
  {
    id: 'demo-2',
    title: 'Free Fire Clash Squad',
    game: 'FREE FIRE',
    mode: 'Clash Squad',
    map: 'Bermuda',
    entryFee: 30,
    prizePool: 1500,
    totalSlots: 48,
    joinedSlots: 48,
    banner: '/images/freefire-img.png'
  },
  {
    id: 'demo-3',
    title: 'PUBG Global Series',
    game: 'PUBG',
    mode: 'Solo',
    map: 'Sanhok',
    entryFee: 100,
    prizePool: 5000,
    totalSlots: 100,
    joinedSlots: 42,
    banner: '/images/pubg-img.png'
  }
]

export const LandingPage: React.FC = () => {
  const router = useRouter()
  const [activeFaq, setActiveFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: 'How do I join a tournament?',
      a: 'Register and sign in to your account. Then go to Matches, select a tournament, input your verified Game UID/IGN, and register. Room ID & Password will be sent before the match starts.'
    },
    {
      q: 'How do I add money?',
      a: 'Go to your Wallet section after logging in, click "Add Money", choose your preferred payment method (UPI, Cards, etc.), and follow the instructions.'
    },
    {
      q: 'What is the entry fee?',
      a: 'Entry fees vary per tournament. We have free tournaments and paid tournaments ranging from ₹10 to ₹500+ depending on the prize pool.'
    },
    {
      q: 'How are winners selected?',
      a: 'Winners are determined strictly by the final match results in-game. Room Admins verify the results and screenshots before publishing them.'
    },
    {
      q: 'When will winnings be credited?',
      a: 'Winnings are credited to your BattleX Wallet immediately after the Super Admin approves the match results.'
    },
    {
      q: 'How do I withdraw?',
      a: 'Go to your Wallet, click "Withdraw", enter your UPI ID or Bank Details, and the amount. Withdrawals are processed within 24 hours.'
    }
  ]

  return (
    <div className="relative min-h-screen text-slate-100 overflow-x-hidden bg-[#0b0a15]">
      
      <div className="relative max-w-6xl mx-auto z-10 space-y-12">
          {/* shadow-[0_0_60px_rgba(124,58,237,0.2)] border border-white/10 */}
        
        {/* 1. COMPACT HERO SECTION */}
        <section className="text-center ">
          <div className="relative w-full max-w-5xl mx-auto  overflow-hidden 
          h-[350px] sm:h-[450px]">
            <Image 
              src="/images/authbeenar.png" 
              alt="BattleX Tournaments" 
              fill 
              className="object-cover opacity-80"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a15] via-[#0b0a15]/60 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-end p-6 pb-12 text-center z-10">
              {/* <h1 className="text-4xl sm:text-6xl font-black text-white italic tracking-tight uppercase drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">BATTLEX</h1> */}
              {/* <h2 className="text-sm sm:text-xl font-bold text-purple-300 tracking-widest mt-1 drop-shadow-md">PLAY • BATTLE • WIN</h2> */}
              <p className="text-slate-200 text-xs sm:text-sm font-semibold max-w-lg mx-auto mt-3 drop-shadow-md">
                Compete in BGMI, PUBG and Free Fire tournaments and win exciting rewards. Join thousands of gamers in fair, secure, and competitive matches.
              </p>
              
              <div className="mt-6 flex items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all uppercase"
                >
                  JOIN NOW
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/20 text-white font-black text-xs transition-all uppercase"
                >
                  SIGN IN
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. DEMO MATCHES (STATIC EXAMPLES) */}
        <section className='px-3'>
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white italic uppercase drop-shadow-lg">DEMO MATCHES</h2>
            <div className="w-16 h-1 bg-purple-600 mx-auto mt-2 rounded-full" />
            <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">Example of how our matches look</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoMatches.map((match) => (
              <div key={match.id} className="bg-[#100c18] rounded-3xl border border-white/5 overflow-hidden shadow-xl hover:border-purple-500/30 transition-all group">
                <div className="relative h-40">
                  <Image src={match.banner} alt={match.title} fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#100c18] via-[#100c18]/20 to-transparent" />
                  
                  {/* Game Tag */}
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                    <span className="text-[9px] font-black text-white tracking-widest">{match.game}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-purple-500/20 border border-purple-500/40 rounded-full">
                    <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                      UPCOMING
                    </span>
                  </div>
                </div>

                <div className="p-3 relative z-10 -mt-5">
                  <h3 className="font-black text-[13px] text-white italic uppercase drop-shadow-md">{match.title}</h3>
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 mb-2">
                    <span>{match.mode}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>{match.map}</span>
                  </div>

                  <div className="flex items-center justify-between mb-2 bg-slate-900/50 p-2 rounded-xl border border-white/5">
                    <div>
                      <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Entry Fee</p>
                      <p className="font-black text-[11px] text-white">₹{match.entryFee}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Prize Pool</p>
                      <p className="font-black text-[11px] text-emerald-400">₹{match.prizePool}</p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between text-[8px] font-bold mb-1">
                      <span className="text-slate-500 uppercase">Slots</span>
                      <span className="text-white">{match.joinedSlots} / {match.totalSlots}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" 
                        style={{ width: `${(match.joinedSlots / match.totalSlots) * 100}%` }}
                      />
                    </div>
                  </div>

                  <Link href="/register" className="block w-full py-1.5 my-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-center text-[8px] font-black text-white tracking-widest uppercase transition-colors">
                    LOGIN TO JOIN
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. HOW IT WORKS (Redesigned & Compact) */}
        <section id="how-it-works" className='px-3'>
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white italic uppercase">How It Works</h2>
            <div className="w-16 h-1 bg-purple-600 mx-auto mt-2 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { step: '01', icon: UserCheck, title: 'Create Account', desc: 'Sign up in seconds.' },
              { step: '02', icon: Coins, title: 'Add Money', desc: 'Top up your wallet.' },
              { step: '03', icon: Gamepad2, title: 'Join Match', desc: 'Pick & register.' },
              { step: '04', icon: Trophy, title: 'Play & Win', desc: 'Withdraw winnings.' },
            ].map((step, idx) => (
              <div key={idx} className="bg-gradient-to-b from-[#151122] to-[#0b0a15] p-5 rounded-3xl border border-purple-500/20 text-center group hover:scale-105 transition-transform duration-300 shadow-xl relative overflow-hidden">
                <div className="absolute top-2 right-4 text-3xl font-black text-white/5">{step.step}</div>
                <div className="w-12 h-12 mx-auto bg-slate-900 rounded-full flex items-center justify-center border border-white/10 mb-3 group-hover:border-purple-500/50 transition-colors relative z-10">
                  <step.icon className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-black text-xs text-white uppercase mb-1 relative z-10">{step.title}</h3>
                <p className="text-[10px] text-slate-400 relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. WHY BATTLEX (Compact) */}
        <section className='px-3'>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: CheckCircle2, title: 'Verified Tournaments' },
              { icon: Lock, title: 'Secure Wallet' },
              { icon: ShieldCheck, title: 'Fair Results' },
              { icon: Zap, title: 'Fast Payouts' },
              { icon: Smartphone, title: 'Realtime Updates' },
              { icon: HeadphonesIcon, title: '24/7 Support' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-900/40 p-3 sm:p-4 rounded-2xl border border-white/5 flex items-center gap-3 hover:bg-slate-900 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="font-bold text-[10px] sm:text-xs text-slate-200 uppercase tracking-wide leading-tight">{feature.title}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* 5. SECURE & FAIR PLAY */}
        <section className="bg-gradient-to-r from-indigo-950 to-purple-950 p-6 sm:p-8 px-3 rounded-[2rem] px-3 border border-purple-500/20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('/images/beenar.png')] opacity-10 mix-blend-overlay bg-cover bg-center" />
          <div className="relative z-10 max-w-xl mx-auto">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h2 className="text-xl sm:text-2xl font-black text-white italic uppercase mb-2">Secure & Fair Play</h2>
            <p className="text-[11px] sm:text-xs text-indigo-200 font-medium leading-relaxed">
              We maintain a zero-tolerance policy against hackers, teamers, and emulators. 
              All match results are verified manually by admins before prize distribution.
            </p>
          </div>
        </section>

        {/* 6. FAQ */}
        <section className='px-3'>
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white italic uppercase">FAQ</h2>
            <div className="w-16 h-1 bg-purple-600 mx-auto mt-2 rounded-full" />
          </div>
          <div className="max-w-3xl mx-auto space-y-2">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-[#100c18] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-bold text-xs text-slate-200 pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform duration-300 shrink-0 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="p-4 pt-0 text-[11px] text-slate-400 leading-relaxed border-t border-white/5 mt-2">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
      
      {/* FOOTER */}
      <footer className=" pt-4 mt-6 border-t border-white/5 bg-[#07050a] relative z-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="relative w-24 h-6 mx-auto mb-4 opacity-50">
            <Image src="/images/logo.png" alt="BattleX" fill className="object-contain" />
          </div>
          <p className="text-[10px] text-slate-500 max-w-md mx-auto mb-6">
            BattleX is an esports tournament platform. We are not affiliated with, endorsed by, or connected to Krafton, Tencent, Garena, or any official game publishers.
          </p>
          <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-400 mb-6">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/support" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
          <div className="text-[9px] text-slate-600 pb-8">
            © {new Date().getFullYear()} BattleX Esports. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  )
}
