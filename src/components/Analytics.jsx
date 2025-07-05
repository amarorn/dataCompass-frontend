import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, MessageSquare, Calendar, Download, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    overview: {},
    registrations: [],
    messageTypes: [],
    hourlyActivity: [],
    userGrowth: []
  })

  // Simular carregamento de dados
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setData({
        overview: {
          totalUsers: 1247,
          newUsers: 89,
          totalMessages: 8932,
          avgResponseTime: '2.3s',
          successRate: 94.2
        },
        registrations: [
          { date: '01/07', registrations: 12, conversions: 8 },
          { date: '02/07', registrations: 19, conversions: 15 },
          { date: '03/07', registrations: 15, conversions: 12 },
          { date: '04/07', registrations: 27, conversions: 22 },
          { date: '05/07', registrations: 23, conversions: 18 },
          { date: '06/07', registrations: 31, conversions: 25 },
          { date: '07/07', registrations: 18, conversions: 14 }
        ],
        messageTypes: [
          { name: 'Registros', value: 45, color: '#3b82f6' },
          { name: 'Ajuda', value: 30, color: '#10b981' },
          { name: 'Status', value: 15, color: '#f59e0b' },
          { name: 'Suporte', value: 10, color: '#ef4444' }
        ],
        hourlyActivity: [
          { hour: '00', messages: 5, users: 2 },
          { hour: '02', messages: 3, users: 1 },
          { hour: '04', messages: 2, users: 1 },
          { hour: '06', messages: 8, users: 4 },
          { hour: '08', messages: 25, users: 12 },
          { hour: '10', messages: 45, users: 23 },
          { hour: '12', messages: 67, users: 34 },
          { hour: '14', messages: 52, users: 28 },
          { hour: '16', messages: 38, users: 19 },
          { hour: '18', messages: 29, users: 15 },
          { hour: '20', messages: 18, users: 9 },
          { hour: '22', messages: 12, users: 6 }
        ],
        userGrowth: [
          { month: 'Jan', users: 450, active: 320 },
          { month: 'Fev', users: 520, active: 380 },
          { month: 'Mar', users: 680, active: 490 },
          { month: 'Abr', users: 780, active: 560 },
          { month: 'Mai', users: 920, active: 670 },
          { month: 'Jun', users: 1100, active: 820 },
          { month: 'Jul', users: 1247, active: 950 }
        ]
      })
      setLoading(false)
    }, 1000)
  }, [timeRange])

  const refreshData = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const exportData = () => {
    // Simular exportação
    alert('Dados exportados com sucesso!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Relatórios</h1>
          <p className="text-gray-600">
            Insights detalhados sobre o uso da plataforma
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalUsers?.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{data.overview.newUsers} novos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalMessages?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Processadas no período
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              Tempo médio
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.successRate}%</div>
            <p className="text-xs text-green-600">
              Comandos processados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Registros</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.newUsers}</div>
            <p className="text-xs text-muted-foreground">
              No período selecionado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Registros e Conversões</CardTitle>
            <CardDescription>
              Usuários registrados vs conversões bem-sucedidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.registrations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="registrations" fill="#3b82f6" name="Registros" />
                <Bar dataKey="conversions" fill="#10b981" name="Conversões" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Message Types */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Mensagem</CardTitle>
            <CardDescription>
              Distribuição dos tipos de comandos recebidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.messageTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.messageTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {data.messageTypes.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade por Horário</CardTitle>
            <CardDescription>
              Volume de mensagens e usuários ativos por hora
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="messages" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Mensagens"
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="2"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Usuários"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Usuários</CardTitle>
            <CardDescription>
              Evolução do número de usuários ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Total de Usuários"
                />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  name="Usuários Ativos"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Automáticos</CardTitle>
          <CardDescription>
            Análises e recomendações baseadas nos dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📈 Crescimento Acelerado</h4>
              <p className="text-sm text-blue-700">
                O número de registros aumentou 34% na última semana. Considere expandir a capacidade do sistema.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">⏰ Horário de Pico</h4>
              <p className="text-sm text-green-700">
                A maior atividade ocorre entre 10h-14h. Otimize o atendimento neste período.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">🎯 Taxa de Conversão</h4>
              <p className="text-sm text-orange-700">
                78% dos comandos de registro são bem-sucedidos. Melhore as mensagens de ajuda para aumentar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Analytics

