import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/contexts/workspace-context'
import { GoogleAuthService } from '@/services/google/google-auth.service'
import { toast } from 'sonner'

interface GoogleIntegration {
  id: string
  google_email: string
  is_active: boolean
  scopes: string[]
  settings: {
    gmail: { enabled: boolean; auto_import: boolean }
    calendar: { enabled: boolean; sync_tasks: boolean }
    sheets: { enabled: boolean }
  }
  created_at: string
}

// Função auxiliar para salvar integração
const saveGoogleIntegration = async (accessToken: string, user: any) => {
  console.log('📝 saveGoogleIntegration chamada', {
    hasToken: !!accessToken,
    tokenLength: accessToken?.length,
    userId: user?.id
  })

  try {
    // Buscar email do Google
    console.log('📧 Buscando info do Google...')
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (!userInfoResponse.ok) {
      throw new Error(`Erro ao buscar info do Google: ${userInfoResponse.status}`)
    }
    
    const userInfo = await userInfoResponse.json()
    console.log('✅ Info do Google obtida:', userInfo.email)

    // Testar se token é válido fazendo request simples
    console.log('🔍 Testando token no Drive API...')
    const testResponse = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (!testResponse.ok) {
      throw new Error(`Token inválido: ${testResponse.status} - ${testResponse.statusText}`)
    }
    console.log('✅ Token válido!')

    // Salvar na tabela
    console.log('💾 Salvando na tabela google_integrations...')
    const dataToInsert = {
      user_id: user.id,
      workspace_id: null, // Pode ser atualizado depois
      google_email: userInfo.email,
      google_id: userInfo.id,
      access_token: accessToken,
      is_active: true,
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents'
      ],
      settings: {
        gmail: { enabled: true, auto_import: true },
        calendar: { enabled: true, sync_tasks: true },
        sheets: { enabled: true },
        drive: { enabled: true },
        docs: { enabled: true }
      }
    }

    console.log('📊 Dados a inserir:', {
      user_id: dataToInsert.user_id,
      email: dataToInsert.google_email,
      scopes: dataToInsert.scopes.length
    })

    const { data, error } = await supabase
      .from('google_integrations')
      .upsert(dataToInsert, {
        onConflict: 'user_id'
      })
      .select()

    if (error) {
      console.error('❌ Erro do Supabase:', error)
      throw error
    }

    console.log('✅ Google integration saved:', userInfo.email, data)
  } catch (error) {
    console.error('❌ Erro ao salvar integração Google:', error)
    throw error // Re-throw para o caller ver
  }
}

export function useGoogleIntegration() {
  const { currentWorkspace } = useWorkspace()
  const [integration, setIntegration] = useState<GoogleIntegration | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Verificar se Google está conectado
  const checkConnection = useCallback(async () => {
    try {
      // Buscar user atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setChecking(false)
        return
      }

      // Buscar integração (pessoal OU do workspace)
      let query = supabase
        .from('google_integrations')
        .select('*')
        .eq('is_active', true)

      if (currentWorkspace?.id) {
        // Se tem workspace, buscar integração do workspace
        query = query.eq('workspace_id', currentWorkspace.id)
      } else {
        // Se não tem workspace, buscar integração pessoal
        query = query.eq('user_id', user.id).is('workspace_id', null)
      }

      const { data, error } = await query.maybeSingle()

      if (error) throw error

      setIntegration(data)
    } catch (error) {
      console.error('Erro ao verificar integração Google:', error)
    } finally {
      setChecking(false)
    }
  }, [currentWorkspace?.id])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  // Listener separado para OAuth - SEM dependências para evitar loops
  useEffect(() => {
    // Flag para evitar processamento duplicado
    let processed = false
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Evitar processamento duplicado
      if (processed) return
      
      // Verificar se já foi processado nesta sessão
      const alreadyProcessed = sessionStorage.getItem('google_oauth_hook_processed')
      if (alreadyProcessed === 'true') {
        console.log('⏭️ OAuth já processado pelo hook, pulando...')
        return
      }

      console.log('🔔 Auth state changed:', event, {
        hasSession: !!session,
        hasProviderToken: !!session?.provider_token,
        provider: session?.user?.app_metadata?.provider
      })

      if (event === 'SIGNED_IN' && session?.provider_token) {
        // Marcar como processado IMEDIATAMENTE
        processed = true
        sessionStorage.setItem('google_oauth_hook_processed', 'true')
        
        console.log('✅ OAuth detectado, salvando integração...')
        try {
          // Usuário voltou do OAuth com provider_token
          await saveGoogleIntegration(session.provider_token, session.user)
          console.log('✅ Integração salva!')
          
          // Atualizar estado local diretamente (sem chamar checkConnection)
          const { data } = await supabase
            .from('google_integrations')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('is_active', true)
            .maybeSingle()
          
          if (data) {
            setIntegration(data)
            setChecking(false)
          }
          
          toast.success('Google conectado com sucesso!')
          
          // Limpar flag após 5 segundos para permitir reconexões futuras
          setTimeout(() => {
            sessionStorage.removeItem('google_oauth_hook_processed')
          }, 5000)
        } catch (error) {
          console.error('❌ Erro no listener OAuth:', error)
          toast.error('Erro ao conectar Google')
          sessionStorage.removeItem('google_oauth_hook_processed')
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, []) // SEM dependências - evita loops

  // Conectar Google (OAuth via Supabase Auth)
  const connect = useCallback(async () => {
    setLoading(true)

    try {
      // Avisar usuário que precisará fazer login novamente
      const confirmConnect = confirm(
        '⚠️ IMPORTANTE: Conectar o Google vai deslogar você temporariamente.\n\n' +
        'Após conectar, você será redirecionado para fazer login novamente.\n\n' +
        'Deseja continuar?'
      )

      if (!confirmConnect) {
        setLoading(false)
        return
      }

      // Usar Supabase Auth Provider
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/settings/integrations`,
          scopes: 'email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) throw error

      // O Supabase vai redirecionar automaticamente
      toast.info('Redirecionando para Google...', {
        description: 'Você será redirecionado de volta após conectar'
      })
      
    } catch (error: any) {
      console.error('Erro ao conectar Google:', error)
      toast.error('Erro ao conectar Google: ' + error.message)
      setLoading(false)
    }
  }, [])

  // Desconectar
  const disconnect = useCallback(async () => {
    if (!integration) return

    if (!confirm('Desconectar Google? Você precisará reconectar para usar as integrações.')) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('google_integrations')
        .delete()
        .eq('id', integration.id)

      if (error) throw error

      // Limpar cache de tokens
      GoogleAuthService.clearCache()
      
      // Atualizar estado imediatamente (sem precisar recarregar)
      setIntegration(null)
      toast.success('Google desconectado')
      console.log('✅ Google desconectado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error)
      toast.error('Erro ao desconectar Google')
    } finally {
      setLoading(false)
    }
  }, [integration])

  // Atualizar configurações
  const updateSettings = useCallback(async (newSettings: Partial<GoogleIntegration['settings']>) => {
    if (!integration) return

    try {
      const { error } = await supabase
        .from('google_integrations')
        .update({
          settings: { ...integration.settings, ...newSettings }
        })
        .eq('id', integration.id)

      if (error) throw error

      setIntegration(prev => prev ? { ...prev, settings: { ...prev.settings, ...newSettings } } : null)
      toast.success('Configurações atualizadas')
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      toast.error('Erro ao atualizar configurações')
    }
  }, [integration])

  return {
    integration,
    isConnected: !!integration,
    loading,
    checking,
    connect,
    disconnect,
    updateSettings,
    refresh: checkConnection
  }
}
