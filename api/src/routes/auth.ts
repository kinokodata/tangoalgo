import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { supabase } from '../services/supabase'

const router = Router()

// ユーザー登録
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'メールアドレスとパスワードは必須です' }
      })
    }

    // Supabase Authでユーザー作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError || !authData.user) {
      return res.status(400).json({
        success: false,
        error: { message: authError?.message || 'ユーザー作成に失敗しました' }
      })
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
    }

    // JWTトークン生成
    const token = jwt.sign(
      { userId: authData.user.id, email: authData.user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          username: username || null,
        },
        token
      }
    })
  } catch (error) {
    console.error('サインアップエラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'サーバーエラーが発生しました' }
    })
  }
})

// ログイン
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'メールアドレスとパスワードは必須です' }
      })
    }

    // Supabase認証
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'メールアドレスまたはパスワードが正しくありません' }
      })
    }

    // プロファイル取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    // JWTトークン生成
    const token = jwt.sign(
      { userId: authData.user.id, email: authData.user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          username: profile?.username || null,
          displayName: profile?.display_name || null,
        },
        token
      }
    })
  } catch (error) {
    console.error('サインインエラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'サーバーエラーが発生しました' }
    })
  }
})

// ログアウト
router.post('/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('ログアウトエラー:', error)
    }

    res.json({
      success: true,
      message: 'ログアウトしました'
    })
  } catch (error) {
    console.error('サインアウトエラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'サーバーエラーが発生しました' }
    })
  }
})

export default router