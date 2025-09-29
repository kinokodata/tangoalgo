import { Router } from 'express'
import { supabase } from '../services/supabase'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

// 認証が必要なエンドポイントにミドルウェアを適用
router.use(authenticateToken)

// カードセット一覧取得
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('card_sets')
      .select('*, cards(count)')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      data: data.map(set => ({
        ...set,
        cardCount: set.cards?.[0]?.count || 0
      }))
    })
  } catch (error) {
    console.error('カードセット一覧取得エラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'カードセットの取得に失敗しました' }
    })
  }
})

// カードセット詳細取得
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('card_sets')
      .select('*, cards(*)')
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .single()

    if (error) throw error

    if (!data) {
      return res.status(404).json({
        success: false,
        error: { message: 'カードセットが見つかりません' }
      })
    }

    res.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('カードセット詳細取得エラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'カードセットの取得に失敗しました' }
    })
  }
})

// カードセット作成
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body

    if (!title) {
      return res.status(400).json({
        success: false,
        error: { message: 'タイトルは必須です' }
      })
    }

    const { data, error } = await supabase
      .from('card_sets')
      .insert([
        {
          user_id: req.userId!,
          title,
          description: description || null
        }
      ])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      success: true,
      data
    })
  } catch (error) {
    console.error('カードセット作成エラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'カードセットの作成に失敗しました' }
    })
  }
})

// カードセット更新
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body

    const { data, error } = await supabase
      .from('card_sets')
      .update({
        title,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return res.status(404).json({
        success: false,
        error: { message: 'カードセットが見つかりません' }
      })
    }

    res.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('カードセット更新エラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'カードセットの更新に失敗しました' }
    })
  }
})

// カードセット削除
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { error } = await supabase
      .from('card_sets')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)

    if (error) throw error

    res.json({
      success: true,
      message: 'カードセットを削除しました'
    })
  } catch (error) {
    console.error('カードセット削除エラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'カードセットの削除に失敗しました' }
    })
  }
})

export default router