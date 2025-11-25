import { supabase } from '@/lib/supabase'

interface GoogleIntegrationData {
  id: string
  user_id: string
  workspace_id: string | null
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
  is_active: boolean
  google_email: string
}

/**
 * 🔐 Google Auth Service
 * Gerencia autenticação, tokens e refresh automático
 */
export class GoogleAuthService {
  // Cache do token para evitar múltiplas chamadas
  private static tokenCache: Map<string, { token: string; expiresAt: number }> = new Map()
  
  // Margem de segurança: refresh 5 minutos antes de expirar
  private static readonly REFRESH_MARGIN_MS = 5 * 60 * 1000

  /**
   * Obter access token válido (com refresh automático se expirado)
   */
  static async getAccessToken(workspaceId?: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const cacheKey = workspaceId || user.id

      // Verificar cache primeiro
      const cached = this.tokenCache.get(cacheKey)
      if (cached && Date.now() < cached.expiresAt) {
        console.log('🔐 Token do cache (ainda válido)')
        return cached.token
      }

      // Buscar integração
      let query = supabase
        .from('google_integrations')
        .select('*')
        .eq('is_active', true)

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId)
      } else {
        query = query.eq('user_id', user.id).is('workspace_id', null)
      }

      const { data: integration, error } = await query.maybeSingle() as { 
        data: GoogleIntegrationData | null
        error: any 
      }

      if (error || !integration) {
        console.warn('⚠️ Integração Google não encontrada')
        return null
      }

      // Verificar se token expirou ou vai expirar em breve
      const needsRefresh = this.isTokenExpired(integration.token_expires_at)
      
      if (needsRefresh) {
        console.log('🔄 Token expirado ou próximo de expirar, fazendo refresh...')
        
        const refreshed = await this.refreshToken(integration.id)
        
        if (refreshed) {
          // Buscar token atualizado
          const { data: updatedIntegration } = await supabase
            .from('google_integrations')
            .select('access_token, token_expires_at')
            .eq('id', integration.id)
            .single()
          
          if (updatedIntegration) {
            // Atualizar cache
            const expiresAt = updatedIntegration.token_expires_at 
              ? new Date(updatedIntegration.token_expires_at).getTime() - this.REFRESH_MARGIN_MS
              : Date.now() + 55 * 60 * 1000 // 55 minutos default
            
            this.tokenCache.set(cacheKey, {
              token: updatedIntegration.access_token,
              expiresAt
            })
            
            console.log('✅ Token refreshed e cacheado')
            return updatedIntegration.access_token
          }
        } else {
          console.error('❌ Falha no refresh do token')
          // Limpar cache
          this.tokenCache.delete(cacheKey)
          return null
        }
      }

      // Token ainda válido, cachear e retornar
      const expiresAt = integration.token_expires_at 
        ? new Date(integration.token_expires_at).getTime() - this.REFRESH_MARGIN_MS
        : Date.now() + 55 * 60 * 1000
      
      this.tokenCache.set(cacheKey, {
        token: integration.access_token,
        expiresAt
      })

      return integration.access_token
    } catch (error) {
      console.error('Erro ao obter access token:', error)
      return null
    }
  }

  /**
   * Verificar se token expirou ou vai expirar em breve
   */
  private static isTokenExpired(expiresAt: string | null): boolean {
    if (!expiresAt) {
      // Se não tem data de expiração, assumir que precisa refresh
      return true
    }
    
    const expirationTime = new Date(expiresAt).getTime()
    const now = Date.now()
    
    // Refresh se faltam menos de 5 minutos
    return now >= expirationTime - this.REFRESH_MARGIN_MS
  }

  /**
   * Refresh token via Edge Function
   */
  static async refreshToken(integrationId: string): Promise<boolean> {
    try {
      console.log('🔄 Chamando Edge Function google-refresh-token...')
      
      const { data, error } = await supabase.functions.invoke('google-refresh-token', {
        body: { integration_id: integrationId }
      })

      if (error) {
        console.error('❌ Erro na Edge Function:', error)
        throw error
      }

      if (data?.error) {
        console.error('❌ Erro retornado pela Edge Function:', data.error)
        return false
      }

      console.log('✅ Token refreshed via Edge Function')
      return true
    } catch (error) {
      console.error('Erro ao fazer refresh do token:', error)
      return false
    }
  }

  /**
   * Limpar cache de tokens (útil ao desconectar)
   */
  static clearCache() {
    this.tokenCache.clear()
    console.log('🗑️ Cache de tokens limpo')
  }

  /**
   * Verificar se integração está ativa e token válido
   */
  static async isConnected(workspaceId?: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken(workspaceId)
      return !!token
    } catch {
      return false
    }
  }

  /**
   * Testar se o token atual é válido fazendo uma request simples
   */
  static async testConnection(workspaceId?: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken(workspaceId)
      if (!token) return false

      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: { Authorization: `Bearer ${token}` }
      })

      return response.ok
    } catch {
      return false
    }
  }
}
