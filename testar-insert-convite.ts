import { supabase } from './src/lib/supabase'

/**
 * Testar INSERT na tabela workspace_invites
 * Execute: npx tsx testar-insert-convite.ts
 */

async function testarInsert() {
  console.log('🧪 TESTANDO INSERT NA TABELA workspace_invites\n')

  try {
    // 1. Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Usuário não autenticado')
      console.error('   Execute este script após fazer login no app')
      return
    }

    console.log('✅ Usuário autenticado:', user.email)
    console.log('   User ID:', user.id, '\n')

    // 2. Buscar workspace do usuário
    console.log('🔍 Buscando workspace...')
    const { data: membership, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (memberError || !membership) {
      console.error('❌ Erro ao buscar workspace:', memberError?.message)
      console.error('   Você precisa ter um workspace criado primeiro')
      return
    }

    console.log('✅ Workspace encontrado:', membership.workspace_id)
    console.log('   Seu role:', membership.role, '\n')

    // 3. Pular verificação de estrutura (opcional)

    // 4. Tentar INSERT de teste
    console.log('🧪 Tentando INSERT de teste...\n')
    
    const testInvite = {
      workspace_id: membership.workspace_id,
      email: 'teste@isacar.dev',
      role: 'member',
      invited_by: user.id,
      status: 'pending',
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }

    console.log('Dados do convite:')
    console.log(JSON.stringify(testInvite, null, 2), '\n')

    const { data, error } = await supabase
      .from('workspace_invites')
      .insert(testInvite)
      .select()

    if (error) {
      console.error('❌ ERRO AO INSERIR:')
      console.error('   Código:', error.code)
      console.error('   Mensagem:', error.message)
      console.error('   Detalhes:', error.details)
      console.error('   Hint:', error.hint)
      console.error('\n📋 Objeto de erro completo:')
      console.error(JSON.stringify(error, null, 2))

      // Verificar se é problema de RLS
      if (error.code === '42501' || error.message.includes('policy')) {
        console.log('\n⚠️  PROBLEMA DE RLS POLICY DETECTADO!')
        console.log('   As policies podem estar bloqueando o INSERT')
        console.log('   Verifique no Supabase Dashboard: Authentication > Policies')
      }

      // Verificar se é problema de coluna
      if (error.code === '42703' || error.message.includes('column')) {
        console.log('\n⚠️  PROBLEMA DE COLUNA DETECTADO!')
        console.log('   Alguma coluna esperada não existe na tabela')
      }

      return
    }

    console.log('✅ INSERT REALIZADO COM SUCESSO!')
    console.log('\n📝 Dados inseridos:')
    console.log(JSON.stringify(data, null, 2))

    // 5. Limpar teste
    if (data && data[0]?.id) {
      console.log('\n🧹 Limpando teste...')
      const { error: deleteError } = await supabase
        .from('workspace_invites')
        .delete()
        .eq('id', data[0].id)

      if (deleteError) {
        console.log('⚠️  Erro ao limpar:', deleteError.message)
        console.log('   Delete manualmente: DELETE FROM workspace_invites WHERE email = \'teste@isacar.dev\'')
      } else {
        console.log('✅ Teste limpo com sucesso')
      }
    }

  } catch (error: any) {
    console.error('❌ ERRO GERAL:', error.message)
    console.error(error)
  }
}

// Executar teste
testarInsert()
  .then(() => {
    console.log('\n✅ Teste concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error)
    process.exit(1)
  })
