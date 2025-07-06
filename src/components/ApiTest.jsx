import React, { useState, useEffect } from 'react'
import { testApiConnection, endpoints, api } from '../lib/api'

const ApiTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing')
  const [apiData, setApiData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setConnectionStatus('testing')
    setError(null)
    
    try {
      // Teste de health check
      const healthResult = await testApiConnection()
      
      if (healthResult.success) {
        setConnectionStatus('connected')
        setApiData(healthResult.data)
        
        // Teste adicional - buscar dados do dashboard
        try {
          const dashboardData = await api.get(endpoints.dashboard.overview)
          setApiData(prev => ({ ...prev, dashboard: dashboardData }))
        } catch (dashError) {
          console.warn('Dashboard endpoint not available:', dashError.message)
        }
      } else {
        setConnectionStatus('error')
        setError(healthResult.error)
      }
    } catch (err) {
      setConnectionStatus('error')
      setError(err.message)
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'testing': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '✅'
      case 'error': return '❌'
      case 'testing': return '🔄'
      default: return '⚪'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">🔗 Status da Conexão com API</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getStatusIcon()}</span>
          <div>
            <p className={`font-medium ${getStatusColor()}`}>
              {connectionStatus === 'testing' && 'Testando conexão...'}
              {connectionStatus === 'connected' && 'Conectado com sucesso!'}
              {connectionStatus === 'error' && 'Erro na conexão'}
            </p>
            <p className="text-sm text-gray-600">
              API: a71a0f8becdf94197abfe18833485ad4-1029135396.us-east-1.elb.amazonaws.com
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">
              <strong>Erro:</strong> {error}
            </p>
          </div>
        )}

        {apiData && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-green-800 text-sm font-medium mb-2">
              Dados da API recebidos:
            </p>
            <pre className="text-xs text-green-700 bg-green-100 p-2 rounded overflow-auto">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={connectionStatus === 'testing'}
          >
            {connectionStatus === 'testing' ? 'Testando...' : 'Testar Novamente'}
          </button>
          
          <button
            onClick={() => window.open('/api/health', '_blank')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Abrir Health Check
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApiTest

