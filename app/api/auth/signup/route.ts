import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { message: 'メールアドレスとパスワードは必須です' } },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // ユーザー作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: { message: authError?.message || 'ユーザー作成に失敗しました' } },
        { status: 400 }
      )
    }

    // プロファイル作成
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          username: username || null,
          display_name: username || email.split('@')[0],
        },
      ])

    if (profileError) {
      console.error('プロファイル作成エラー:', profileError)
      // プロファイル作成に失敗してもユーザーは作成済みなので続行
    }

    // セッション情報をクッキーに保存（簡易実装）
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          username: username || null,
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
    console.error('サインアップエラー:', error)
    return NextResponse.json(
      { success: false, error: { message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    )
  }
}