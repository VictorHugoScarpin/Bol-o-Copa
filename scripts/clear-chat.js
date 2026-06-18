import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  realtime: { transport: ws, params: { eventsPerSecond: -1 } },
  global: { fetch: fetch },
})

async function clearStorage() {
  // Lista todos os arquivos no bucket chat-media
  const { data: files, error: listError } = await supabase.storage
    .from('chat-media')
    .list('', { limit: 1000 })

  if (listError) {
    console.error('❌ Erro ao listar storage:', listError.message)
    return
  }

  if (!files || files.length === 0) {
    console.log('📦 Storage já estava vazio.')
    return
  }

  // Lista arquivos dentro de cada pasta (subpastas por user_id)
  const allPaths = []
  for (const folder of files) {
    const { data: innerFiles } = await supabase.storage
      .from('chat-media')
      .list(folder.name, { limit: 1000 })
    if (innerFiles) {
      innerFiles.forEach(f => allPaths.push(`${folder.name}/${f.name}`))
    }
  }

  if (allPaths.length === 0) {
    console.log('📦 Nenhum arquivo encontrado no storage.')
    return
  }

  const { error: deleteError } = await supabase.storage
    .from('chat-media')
    .remove(allPaths)

  if (deleteError) {
    console.error('❌ Erro ao limpar storage:', deleteError.message)
  } else {
    console.log(`✅ Storage limpo! ${allPaths.length} arquivo(s) removido(s).`)
  }
}

async function clearChat() {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (error) {
    console.error('❌ Erro ao limpar chat:', error.message)
    process.exit(1)
  }

  console.log('✅ Chat limpo com sucesso!')
  await clearStorage()
}

// Executa a função, pois este arquivo será chamado apenas pelo GitHub Actions
clearChat()
