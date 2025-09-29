import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { message: 'メールアドレスとパスワードは必須です' } },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // ユーザー認証
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: { message: 'メールアドレスまたはパスワードが正しくありません' } },
        { status: 401 }
      )
    }

    // プロファイル取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single() as { data: Database['public']['Tables']['profiles']['Row'] | null }

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          username: profile?.username || null,
          displayName: profile?.display_name || null,
          avatarUrl: profile?.avatar_url || null,
          createdAt: authData.user.created_at,
        },
      },
    })

    // 簡易的なセッション管理（本番環境では適切な認証ライブラリを使用）
    response.cookies.set('user-id', authData.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1週間
    })

    return response
  } catch (error) {
    console.error('サインインエラー:', error)
    return NextResponse.json(
      { success: false, error: { message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    )
  }
}