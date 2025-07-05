import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

// Hook para fazer requisições à API
export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const {
    immediate = true,
    method = 'GET',
    dependencies = [],
    onSuccess,
    onError,
  } = options

  const execute = useCallback(async (customEndpoint, customOptions = {}) => {
    const finalEndpoint = customEndpoint || endpoint
    const finalOptions = { ...options, ...customOptions }

    if (!finalEndpoint) {
      setError(new Error('Endpoint is required'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      let result
      const { data: requestData, ...requestOptions } = finalOptions

      switch (method.toUpperCase()) {
        case 'GET':
          result = await api.get(finalEndpoint, requestOptions)
          break
        case 'POST':
          result = await api.post(finalEndpoint, requestData, requestOptions)
          break
        case 'PUT':
          result = await api.put(finalEndpoint, requestData, requestOptions)
          break
        case 'PATCH':
          result = await api.patch(finalEndpoint, requestData, requestOptions)
          break
        case 'DELETE':
          result = await api.delete(finalEndpoint, requestOptions)
          break
        default:
          throw new Error(`Unsupported method: ${method}`)
      }

      setData(result)
      onSuccess?.(result)
      return result
    } catch (err) {
      setError(err)
      onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint, method, onSuccess, onError, ...dependencies])

  useEffect(() => {
    if (immediate && endpoint) {
      execute()
    }
  }, [execute, immediate])

  return {
    data,
    loading,
    error,
    execute,
    refetch: () => execute(),
  }
}

// Hook específico para listar dados com paginação
export const useApiList = (endpoint, options = {}) => {
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20,
    total: 0,
    totalPages: 0,
  })

  const {
    filters = {},
    sortBy = '',
    sortOrder = 'asc',
    ...apiOptions
  } = options

  const queryParams = new URLSearchParams({
    page: pagination.page,
    limit: pagination.limit,
    sortBy,
    sortOrder,
    ...filters,
  }).toString()

  const finalEndpoint = `${endpoint}?${queryParams}`

  const { data, loading, error, execute } = useApi(finalEndpoint, {
    ...apiOptions,
    onSuccess: (result) => {
      if (result.items) {
        setItems(result.items)
        setPagination(prev => ({
          ...prev,
          total: result.total || 0,
          totalPages: result.totalPages || 0,
        }))
      } else {
        setItems(Array.isArray(result) ? result : [])
      }
      apiOptions.onSuccess?.(result)
    },
  })

  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }, [])

  const changeLimit = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))
  }, [])

  const refresh = useCallback(() => {
    execute()
  }, [execute])

  return {
    items,
    pagination,
    loading,
    error,
    changePage,
    changeLimit,
    refresh,
    execute,
  }
}

// Hook para operações CRUD
export const useCrud = (baseEndpoint) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const create = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.post(baseEndpoint, data)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [baseEndpoint])

  const update = useCallback(async (id, data) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.put(`${baseEndpoint}/${id}`, data)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [baseEndpoint])

  const remove = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.delete(`${baseEndpoint}/${id}`)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [baseEndpoint])

  return {
    create,
    update,
    remove,
    loading,
    error,
  }
}

