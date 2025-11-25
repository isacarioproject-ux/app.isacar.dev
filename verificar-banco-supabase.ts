import { supabase } from './src/lib/supabase'

/**
 * Script para verificar a estrutura do banco Supabase
 * Execute: npx tsx verificar-banco-supabase.ts
 */

async function verificarBanco() {
  console.log('🔍 VERIFICANDO BANCO DE DADOS SUPABASE...\n')

  try {
    // 1. Verificar se tabela workspace_invites existe
    console.log('1️⃣ Verificando tabela workspace_invites...')
    const { data: invites, error: invitesError } = await supabase
      .from('workspace_invites')
      .select('*')
      .limit(1)

    if (invitesError) {
      console.log('❌ Tabela workspace_invites NÃO EXISTE')
      console.log('   Erro:', invitesError.message)
      console.log('   Código:', invitesError.code)
      console.log('\n📋 AÇÃO: Execute o SQL CRIAR_TABELA_CONVITES_SIMPLES.sql\n')
    } else {
      console.log('✅ Tabela workspace_invites EXISTE')
      console.log('   Registros atuais:', invites?.length || 0)
    }

    // 2. Verificar colunas da tabela workspaces
    console.log('\n2️⃣ Verificando colunas em workspaces...')
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('id, name, plan_type, trial_ends_at, max_members')
      .limit(1)

    if (workspacesError) {
      console.log('❌ Erro ao consultar workspaces:', workspacesError.message)
      if (workspacesError.message.includes('plan_type')) {
        console.log('   Coluna plan_type NÃO EXISTE')
        console.log('\n📋 AÇÃO: Execute o SQL para adicionar colunas de plano\n')
      }
    } else {
      console.log('✅ Workspaces OK')
      const workspace = workspaces?.[0]
      if (workspace) {
        console.log('   Exemplo:')
        console.log('   - ID:', workspace.id)
        console.log('   - Nome:', workspace.name)
        console.log('   - Plano:', workspace.plan_type || 'NÃO DEFINIDO')
        console.log('   - Trial até:', workspace.trial_ends_at || 'NÃO DEFINIDO')
        console.log('   - Max membros:', workspace.max_members || 'NÃO DEFINIDO')
      }
    }

    // 3. Verificar workspaces do usuário atual
    console.log('\n3️⃣ Verificando seus workspaces...')
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: userWorkspaces, error: userError } = await supabase
        .from('workspace_members')
        .select('workspace_id, role, workspaces(id, name, slug)')
        .eq('user_id', user.id)

      if (userError) {
        console.log('❌ Erro ao buscar seus workspaces:', userError.message)
      } else {
        console.log(`✅ Você tem ${userWorkspaces?.length || 0} workspace(s)`)
        userWorkspaces?.forEach((wm: any, i: number) => {
          console.log(`   ${i + 1}. ${wm.workspaces?.name || 'Sem nome'} (${wm.role})`)
          console.log(`      ID: ${wm.workspace_id}`)
        })
      }
    } else {
      console.log('⚠️ Usuário não autenticado')
    }

    // 4. Verificar convites existentes
    console.log('\n4️⃣ Verificando convites existentes...')
    try {
      const { data: existingInvites, error: existingError } = await supabase
        .from('workspace_invites')
        .select('*')
        .limit(10)

      if (existingError) {
        console.log('❌ Não foi possível verificar convites')
        console.log('   Provavelmente a tabela não existe ainda')
      } else {
        console.log(`✅ Encontrados ${existingInvites?.length || 0} convite(s)`)
        if (existingInvites && existingInvites.length > 0) {
          existingInvites.forEach((invite: any, i: number) => {
            console.log(`   ${i + 1}. ${invite.email} - ${invite.status} (${invite.role})`)
          })
        }
      }
    } catch (e) {
      console.log('❌ Tabela workspace_invites não acessível')
    }

    // 5. Resumo final
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMO:')
    console.log('='.repeat(60))
    
    if (invitesError) {
      console.log('⚠️  TABELA WORKSPACE_INVITES: NÃO EXISTE')
      console.log('    Você PRECISA executar o SQL de criação')
    } else {
      console.log('✅ TABELA WORKSPACE_INVITES: EXISTE')
    }

    if (workspacesError && workspacesError.message.includes('plan_type')) {
      console.log('⚠️  COLUNAS DE PLANO: NÃO EXISTEM')
      console.log('    Você PRECISA adicionar as colunas')
    } else {
      console.log('✅ COLUNAS DE PLANO: EXISTEM')
    }

    console.log('='.repeat(60) + '\n')

  } catch (error: any) {
    console.error('❌ ERRO GERAL:', error.message)
  }
}

// Executar verificação
verificarBanco()
  .then(() => {
    console.log('✅ Verificação concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na verificação:', error)
    process.exit(1)
  })
