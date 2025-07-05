import { useState, useEffect } from 'react'
import { MessageSquare, Send, Search, Filter, Clock, User, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'

const Messages = () => {
  const [messages, setMessages] = useState([])
  const [filteredMessages, setFilteredMessages] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [selectedPhone, setSelectedPhone] = useState('')

  // Simular dados de mensagens
  useEffect(() => {
    setTimeout(() => {
      const mockMessages = [
        {
          id: 1,
          from: '+5584998671188',
          userName: 'João Silva',
          message: 'registrar João Silva | joao@datacompass.com | senha123 | Data Compass',
          type: 'registration',
          status: 'processed',
          timestamp: '2025-07-05T09:30:00Z',
          response: '🎉 Cadastro realizado com sucesso! Bem-vindo à Data Compass!'
        },
        {
          id: 2,
          from: '+5511987654321',
          userName: 'Maria Santos',
          message: 'ajuda',
          type: 'help',
          status: 'processed',
          timestamp: '2025-07-05T09:25:00Z',
          response: '📝 Como se cadastrar via WhatsApp: registrar Nome | email@exemplo.com | senha123 | Empresa'
        },
        {
          id: 3,
          from: '+5521999888777',
          userName: 'Pedro Oliveira',
          message: 'status',
          type: 'status',
          status: 'processed',
          timestamp: '2025-07-05T09:20:00Z',
          response: '📊 Status da sua conta: Telefone: +5521999888777, Última consulta: 05/07/2025 09:20'
        },
        {
          id: 4,
          from: '+5531888777666',
          userName: 'Ana Costa',
          message: 'Olá, como posso acessar minha conta?',
          type: 'support',
          status: 'pending',
          timestamp: '2025-07-05T09:15:00Z',
          response: null
        },
        {
          id: 5,
          from: '+5541777666555',
          userName: 'Carlos Mendes',
          message: 'registrar Carlos Mendes | carlos@tech.com | senha456',
          type: 'registration',
          status: 'error',
          timestamp: '2025-07-05T09:10:00Z',
          response: '❌ Erro no cadastro: Email já está em uso. Digite ajuda para ver o formato correto.'
        }
      ]
      setMessages(mockMessages)
      setFilteredMessages(mockMessages)
      setLoading(false)
    }, 1000)
  }, [])

  // Filtrar mensagens
  useEffect(() => {
    let filtered = messages

    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.from.includes(searchTerm)
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(msg => msg.type === typeFilter)
    }

    setFilteredMessages(filtered)
  }, [messages, searchTerm, typeFilter])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeBadge = (type) => {
    const variants = {
      registration: { variant: 'default', label: 'Registro', icon: User },
      help: { variant: 'secondary', label: 'Ajuda', icon: MessageSquare },
      status: { variant: 'outline', label: 'Status', icon: CheckCircle },
      support: { variant: 'destructive', label: 'Suporte', icon: AlertCircle }
    }
    const config = variants[type] || variants.support
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const getStatusBadge = (status) => {
    const variants = {
      processed: { variant: 'default', label: 'Processada' },
      pending: { variant: 'secondary', label: 'Pendente' },
      error: { variant: 'destructive', label: 'Erro' }
    }
    const config = variants[status] || variants.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedPhone) return

    // Simular envio de mensagem
    const newMsg = {
      id: Date.now(),
      from: 'system',
      to: selectedPhone,
      message: newMessage,
      type: 'outbound',
      status: 'sent',
      timestamp: new Date().toISOString()
    }

    console.log('Enviando mensagem:', newMsg)
    setNewMessage('')
    setSelectedPhone('')
    
    // Aqui seria feita a chamada para a API real
    alert(`Mensagem enviada para ${selectedPhone}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensagens WhatsApp</h1>
          <p className="text-gray-600">
            {filteredMessages.length} de {messages.length} mensagens
          </p>
        </div>
      </div>

      {/* Send Message Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Enviar Mensagem</span>
          </CardTitle>
          <CardDescription>
            Envie mensagens diretamente para usuários via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Número de Telefone
              </label>
              <Input
                placeholder="+5584998671188"
                value={selectedPhone}
                onChange={(e) => setSelectedPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Mensagem
              </label>
              <Textarea
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
              />
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !selectedPhone}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensagem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar mensagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="registration">Registro</SelectItem>
                <SelectItem value="help">Ajuda</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="support">Suporte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mensagens</CardTitle>
          <CardDescription>
            Mensagens recebidas e processadas pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{message.userName}</h4>
                      <p className="text-sm text-gray-500">{message.from}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTypeBadge(message.type)}
                    {getStatusBadge(message.status)}
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(message.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Mensagem recebida:</strong>
                    </p>
                    <p className="text-gray-900 mt-1">{message.message}</p>
                  </div>

                  {message.response && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        <strong>Resposta automática:</strong>
                      </p>
                      <p className="text-blue-900 mt-1">{message.response}</p>
                    </div>
                  )}

                  {message.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Responder
                      </Button>
                      <Button size="sm" variant="outline">
                        Marcar como Resolvida
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredMessages.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma mensagem encontrada</h3>
              <p className="text-gray-500">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Ainda não há mensagens no sistema'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Messages

