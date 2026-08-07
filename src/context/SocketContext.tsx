'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false })

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let activeSocket: Socket | null = null
    
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('play2earn_session')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.accessToken) {
            const API_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
            activeSocket = io(API_URL, {
              query: { token: parsed.accessToken },
              transports: ['websocket'],
              autoConnect: true
            })

            activeSocket.on('connect', () => {
              setConnected(true)
              console.log('[Socket Context] Web socket connected.')
            })

            activeSocket.on('disconnect', () => {
              setConnected(false)
              console.log('[Socket Context] Web socket disconnected.')
            })

            setSocket(activeSocket)
          }
        } catch (e) {
          console.error('Error parsing session for socket handshake:', e)
        }
      }
    }

    return () => {
      if (activeSocket) {
        activeSocket.disconnect()
      }
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
export default SocketContext
