import { useEffect, useRef, useState, useCallback } from 'react'

// Configuração do WebSocket
const WS_CONFIG = {
  url: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
  reconnectInterval: 5000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
}

// Hook para WebSocket
export const useWebSocket = (options = {}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [error, setError] = useState(null)
  
  const ws = useRef(null)
  const reconnectAttempts = useRef(0)
  const heartbeatInterval = useRef(null)
  
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoConnect = true,
    enableHeartbeat = true,
  } = options

  const connect = useCallback(() => {
    try {
      // Adicionar token de autenticação se disponível
      const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY || 'datacompass_token')
      const wsUrl = token ? `${WS_CONFIG.url}?token=${token}` : WS_CONFIG.url
      
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
        onConnect?.()

        // Iniciar heartbeat
        if (enableHeartbeat) {
          heartbeatInterval.current = setInterval(() => {
            if (ws.current?.readyState === WebSocket.OPEN) {
              ws.current.send(JSON.stringify({ type: 'ping' }))
            }
          }, WS_CONFIG.heartbeatInterval)
        }
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Ignorar mensagens de pong
          if (data.type === 'pong') return
          
          setLastMessage(data)
          onMessage?.(data)
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      ws.current.onclose = () => {
        setIsConnected(false)
        onDisconnect?.()
        
        // Limpar heartbeat
        if (heartbeatInterval.current) {
          clearInterval(heartbeatInterval.current)
          heartbeatInterval.current = null
        }

        // Tentar reconectar
        if (reconnectAttempts.current < WS_CONFIG.maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, WS_CONFIG.reconnectInterval)
        }
      }

      ws.current.onerror = (event) => {
        const error = new Error('WebSocket error')
        setError(error)
        onError?.(error)
      }
    } catch (err) {
      setError(err)
      onError?.(err)
    }
  }, [onMessage, onConnect, onDisconnect, onError, enableHeartbeat])

  const disconnect = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current)
      heartbeatInterval.current = null
    }
    
    if (ws.current) {
      ws.current.close()
      ws.current = null
    }
    
    setIsConnected(false)
  }, [])

  const sendMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
  }
}

// Hook específico para notificações em tempo real
export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState([])

  const { isConnected, sendMessage } = useWebSocket({
    onMessage: (data) => {
      if (data.type === 'notification') {
        setNotifications(prev => [data.payload, ...prev].slice(0, 50)) // Manter apenas 50 notificações
      }
    },
    onConnect: () => {
      // Subscrever a notificações
      sendMessage({ type: 'subscribe', channel: 'notifications' })
    },
  })

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    isConnected,
    markAsRead,
    clearAll,
  }
}

// Hook para estatísticas em tempo real
export const useRealTimeStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalMessages: 0,
    onlineUsers: 0,
  })

  useWebSocket({
    onMessage: (data) => {
      if (data.type === 'stats_update') {
        setStats(prev => ({ ...prev, ...data.payload }))
      }
    },
    onConnect: () => {
      // Subscrever a atualizações de estatísticas
      sendMessage({ type: 'subscribe', channel: 'stats' })
    },
  })

  return stats
}

export default useWebSocket

