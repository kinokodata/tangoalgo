import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Supabaseからログアウト
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('ログアウトエラー:', error)
    }

    const response = NextResponse.json({
      success: true,
      message: 'ログアウトしました',
    })

    // セッションクッキーをクリア
    response.cookies.delete('user-id')

    return response
  } catch (error) {
    console.error('サインアウトエラー:', error)
    return NextResponse.json(
      { success: false, error: { message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    )
  }
}