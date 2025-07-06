// Configuração centralizada da API
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
}

// Função para criar URL completa da API
export const createApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.baseURL.replace(/\/$/, '') // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, '') // Remove leading slash
  return `${baseUrl}/${cleanEndpoint}`
}

// Função para fazer requisições HTTP
export const apiRequest = async (endpoint, options = {}) => {
  const url = createApiUrl(endpoint)
  
  const config = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  }

  // Adicionar token de autenticação se disponível
  const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY || 'datacompass_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      // Tratamento específico para diferentes códigos de erro
      if (response.status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem(import.meta.env.VITE_JWT_STORAGE_KEY || 'datacompass_token')
        window.location.href = '/login'
        throw new Error('Unauthorized - redirecting to login')
      }
      
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    return await response.text()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

// Métodos HTTP específicos
export const api = {
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, data, options = {}) => 
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: (endpoint, data, options = {}) => 
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  patch: (endpoint, data, options = {}) => 
    apiRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
}

// Endpoints específicos da API WhatsApp Analytics
export const endpoints = {
  // Autenticação
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    verify: '/auth/verify',
  },
  
  // Usuários
  users: {
    list: '/users',
    create: '/users',
    get: (id) => `/users/${id}`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    stats: '/users/stats',
    profile: '/users/profile',
  },
  
  // Mensagens WhatsApp
  messages: {
    list: '/messages',
    get: (id) => `/messages/${id}`,
    send: '/messages/send',
    stats: '/messages/stats',
    types: '/messages/types',
    history: '/messages/history',
  },
  
  // Analytics
  analytics: {
    overview: '/analytics/overview',
    registrations: '/analytics/registrations',
    activity: '/analytics/activity',
    growth: '/analytics/growth',
    engagement: '/analytics/engagement',
    reports: '/analytics/reports',
  },
  
  // WhatsApp específico
  whatsapp: {
    webhook: '/whatsapp/webhook',
    status: '/whatsapp/status',
    templates: '/whatsapp/templates',
    contacts: '/whatsapp/contacts',
  },
  
  // Configurações
  settings: {
    get: '/settings',
    update: '/settings',
    test: '/settings/test',
    whatsapp: '/settings/whatsapp',
  },
  
  // Health check
  health: '/health',
  
  // Dashboard
  dashboard: {
    overview: '/dashboard/overview',
    stats: '/dashboard/stats',
  },
}

// Função para testar conectividade com a API
export const testApiConnection = async () => {
  try {
    const response = await api.get(endpoints.health)
    return { success: true, data: response }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export default api

