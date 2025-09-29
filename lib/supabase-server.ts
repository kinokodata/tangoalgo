import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// サーバーサイド専用のSupabaseクライアント
// Service Role Keyを使用してRLSをバイパス
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase環境変数が設定されていません')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// 将来的にフロントエンド用のクライアントを追加する場合
// export const createBrowserSupabaseClient = () => {
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
//   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
//
//   if (!supabaseUrl || !supabaseAnonKey) {
//     throw new Error('Supabase公開環境変数が設定されていません')
//   }
//
//   return createClient<Database>(supabaseUrl, supabaseAnonKey)
// }