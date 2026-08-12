'use client'

import React from 'react'
import Image from 'next/image'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0d0914] backdrop-blur-md">
      <div className="relative flex flex-col items-center justify-center">
        {/* Glowing aura behind the logo */}
        <div className="absolute w-24 h-24 bg-purple-600/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute w-20 h-20 bg-red-500/20 rounded-full blur-lg animate-ping" />
        
        {/* Rotating spinning rings for gaming effect */}
        <div className="absolute w-28 h-28 border-t-2 border-r-2 border-transparent border-t-purple-500 border-r-red-500 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
        <div className="absolute w-32 h-32 border-b-2 border-l-2 border-transparent border-b-orange-500 border-l-purple-500 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />

        {/* Logo Image */}
        <div className="relative w-14 h-14 z-10 flex items-center justify-center animate-pulse" style={{ animationDuration: '1.5s' }}>
          <Image 
            src="/images/logo.png" 
            alt="Loading..." 
            fill 
            className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            priority
          />
        </div>
      </div>

      {/* Loading Text */}
      <div className="mt-12 flex flex-col items-center">
        <span className="text-xs font-black italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-red-400 to-orange-400 tracking-[0.4em] uppercase drop-shadow-md animate-pulse">
          INITIALIZING
        </span>
        <div className="flex gap-1.5 mt-3">
          <span className="w-1 h-1 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-1 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
