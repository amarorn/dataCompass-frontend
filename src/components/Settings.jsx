import { useState } from 'react'
import { Settings as SettingsIcon, Save, RefreshCw, Database, MessageSquare, Shield, Bell, Smartphone, Globe } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'

const Settings = () => {
  const [settings, setSettings] = useState({
    // WhatsApp Settings
    whatsappToken: 'EAA6vzqopk5M***',
    phoneNumberId: '753380541185021',
    webhookUrl: 'https://data-links-creatures-difficulties.trycloudflare.com/api/whatsapp/webhook',
    
    // Database Settings
    mongoUrl: 'mongodb://mongo:27017/datacompass',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    slackNotifications: true,
    
    // Auto Response Settings
    autoResponse: true,
    welcomeMessage: '🎉 Bem-vindo à Data Compass! Digite "ajuda" para ver os comandos disponíveis.',
    helpMessage: '📝 Como se cadastrar via WhatsApp:\nregistrar Nome | email@exemplo.com | senha123 | Empresa\n\nOutros comandos:\n• status - Ver informações da conta\n• ajuda - Ver esta mensagem',
    
    // System Settings
    maxUsersPerDay: 100,
    rateLimitPerMinute: 10,
    sessionTimeout: 30,
    
    // Security Settings
    requireEmailVerification: true,
    passwordMinLength: 6,
    enableTwoFactor: false
  })

  const [saving, setSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simular salvamento
    setTimeout(() => {
      setSaving(false)
      alert('Configurações salvas com sucesso!')
    }, 1500)
  }

  const testConnection = async () => {
    setTestingConnection(true)
    // Simular teste de conexão
    setTimeout(() => {
      setTestingConnection(false)
      alert('Conexão testada com sucesso!')
    }, 2000)
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600">
            Gerencie as configurações da plataforma DataCompass
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={testConnection} disabled={testingConnection}>
            <RefreshCw className={`w-4 h-4 mr-2 ${testingConnection ? 'animate-spin' : ''}`} />
            Testar Conexão
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Status do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">WhatsApp API</p>
                <p className="text-xs text-green-700">Conectado</p>
              </div>
              <Badge variant="default" className="bg-green-600">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">MongoDB</p>
                <p className="text-xs text-green-700">Conectado</p>
              </div>
              <Badge variant="default" className="bg-green-600">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">Webhook</p>
                <p className="text-xs text-blue-700">Ativo</p>
              </div>
              <Badge variant="default" className="bg-blue-600">Funcionando</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span>Configurações WhatsApp</span>
          </CardTitle>
          <CardDescription>
            Configure a integração com a API do WhatsApp Business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="whatsappToken">Access Token</Label>
              <Input
                id="whatsappToken"
                type="password"
                value={settings.whatsappToken}
                onChange={(e) => updateSetting('whatsappToken', e.target.value)}
                placeholder="EAA6vzqopk5M..."
              />
            </div>
            <div>
              <Label htmlFor="phoneNumberId">Phone Number ID</Label>
              <Input
                id="phoneNumberId"
                value={settings.phoneNumberId}
                onChange={(e) => updateSetting('phoneNumberId', e.target.value)}
                placeholder="753380541185021"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              value={settings.webhookUrl}
              onChange={(e) => updateSetting('webhookUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Database Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Configurações do Banco de Dados</span>
          </CardTitle>
          <CardDescription>
            Configure a conexão com o MongoDB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mongoUrl">URL de Conexão MongoDB</Label>
            <Input
              id="mongoUrl"
              value={settings.mongoUrl}
              onChange={(e) => updateSetting('mongoUrl', e.target.value)}
              placeholder="mongodb://..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto Response Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Respostas Automáticas</span>
          </CardTitle>
          <CardDescription>
            Configure as mensagens automáticas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoResponse">Respostas Automáticas</Label>
              <p className="text-sm text-gray-500">Ativar respostas automáticas para comandos</p>
            </div>
            <Switch
              id="autoResponse"
              checked={settings.autoResponse}
              onCheckedChange={(checked) => updateSetting('autoResponse', checked)}
            />
          </div>
          
          <div>
            <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
            <Textarea
              id="welcomeMessage"
              value={settings.welcomeMessage}
              onChange={(e) => updateSetting('welcomeMessage', e.target.value)}
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="helpMessage">Mensagem de Ajuda</Label>
            <Textarea
              id="helpMessage"
              value={settings.helpMessage}
              onChange={(e) => updateSetting('helpMessage', e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notificações</span>
          </CardTitle>
          <CardDescription>
            Configure como você deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificações por Email</Label>
              <p className="text-sm text-gray-500">Receber alertas por email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificações por SMS</Label>
              <p className="text-sm text-gray-500">Receber alertas por SMS</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificações Slack</Label>
              <p className="text-sm text-gray-500">Enviar alertas para o Slack</p>
            </div>
            <Switch
              checked={settings.slackNotifications}
              onCheckedChange={(checked) => updateSetting('slackNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5" />
            <span>Limites do Sistema</span>
          </CardTitle>
          <CardDescription>
            Configure os limites de uso da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="maxUsersPerDay">Máx. Usuários/Dia</Label>
              <Input
                id="maxUsersPerDay"
                type="number"
                value={settings.maxUsersPerDay}
                onChange={(e) => updateSetting('maxUsersPerDay', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="rateLimitPerMinute">Rate Limit/Min</Label>
              <Input
                id="rateLimitPerMinute"
                type="number"
                value={settings.rateLimitPerMinute}
                onChange={(e) => updateSetting('rateLimitPerMinute', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Timeout Sessão (min)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Configurações de Segurança</span>
          </CardTitle>
          <CardDescription>
            Configure as políticas de segurança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Verificação de Email</Label>
              <p className="text-sm text-gray-500">Exigir verificação de email no registro</p>
            </div>
            <Switch
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Autenticação de Dois Fatores</Label>
              <p className="text-sm text-gray-500">Ativar 2FA para administradores</p>
            </div>
            <Switch
              checked={settings.enableTwoFactor}
              onCheckedChange={(checked) => updateSetting('enableTwoFactor', checked)}
            />
          </div>
          
          <div>
            <Label htmlFor="passwordMinLength">Tamanho Mínimo da Senha</Label>
            <Select 
              value={settings.passwordMinLength.toString()} 
              onValueChange={(value) => updateSetting('passwordMinLength', parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 caracteres</SelectItem>
                <SelectItem value="8">8 caracteres</SelectItem>
                <SelectItem value="10">10 caracteres</SelectItem>
                <SelectItem value="12">12 caracteres</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings

