import { Router } from 'express'
import { supabase } from '../services/supabase'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

// 認証が必要
router.use(authenticateToken)

// カード一覧取得（カードセットID指定）
router.get('/set/:setId', async (req: AuthRequest, res) => {
  try {
    // カードセットの所有者確認
    const { data: cardSet } = await supabase
      .from('card_sets')
      .select('id')
      .eq('id', req.params.setId)
      .eq('user_id', req.userId!)
      .single()

    if (!cardSet) {
      return res.status(404).json({
        success: false,
        error: { message: 'カードセットが見つかりません' }
      })
    }

    // カード取得
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('card_set_id', req.params.setId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error

    res.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('カード一覧取得エラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'カードの取得に失敗しました' }
    })
  }
})

// カード作成
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      cardSetId,
      frontWord,
      frontHint,
      frontDescription,
      backWord,
      backHint,
      backDescription
    } = req.body

    if (!cardSetId || !frontWord || !backWord) {
      return res.status(400).json({
        success: false,
        error: { message: '必須項目が不足しています' }
      })
    }

    // カードセットの所有者確認
    const { data: cardSet } = await supabase
      .from('card_sets')
      .select('id')
      .eq('id', cardSetId)
      .eq('user_id', req.userId!)
      .single()

    if (!cardSet) {
      return res.status(403).json({
        success: false,
        error: { message: '権限がありません' }
      })
    }

    // 新しいカードの順序を設定（既存カードの最大値 + 1000）
    const { data: existingCards } = await supabase
      .from('cards')
      .select('display_order')
      .eq('card_set_id', cardSetId)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = existingCards && existingCards.length > 0
      ? (existingCards[0].display_order || 0) + 1000
      : 1000

    // カード作成
    const { data, error } = await supabase
      .from('cards')
      .insert([
        {
          card_set_id: cardSetId,
          front_word: frontWord,
          front_hint: frontHint,
          front_description: frontDescription,
          back_word: backWord,
          back_hint: backHint,
          back_description: backDescription,
          display_order: nextOrder
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
    console.error('カード作成エラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'カードの作成に失敗しました' }
    })
  }
})

// カード更新
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const updateData: any = {}
    const fields = [
      'front_word', 'front_hint', 'front_description',
      'back_word', 'back_hint', 'back_description'
    ]

    // 更新するフィールドのみ設定
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field]
      }
    })

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('cards')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('カード更新エラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'カードの更新に失敗しました' }
    })
  }
})

// カード削除
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error

    res.json({
      success: true,
      message: 'カードを削除しました'
    })
  } catch (error) {
    console.error('カード削除エラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'カードの削除に失敗しました' }
    })
  }
})

// カードの順序を更新
router.put('/reorder/:setId', async (req: AuthRequest, res) => {
  try {
    const { setId } = req.params
    const { cards } = req.body // [{id: string, display_order: number}]

    if (!Array.isArray(cards)) {
      return res.status(400).json({
        success: false,
        error: { message: 'カードの配列が必要です' }
      })
    }

    // トランザクション的に全カードの順序を更新
    const updatePromises = cards.map(card =>
      supabase
        .from('cards')
        .update({ display_order: card.display_order })
        .eq('id', card.id)
        .eq('card_set_id', setId) // セキュリティ: 指定されたセットのカードのみ更新
    )

    const results = await Promise.all(updatePromises)

    // エラーチェック
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      throw new Error('一部のカードの更新に失敗しました')
    }

    res.json({
      success: true,
      message: 'カードの順序を更新しました'
    })
  } catch (error) {
    console.error('カード順序更新エラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'カードの順序更新に失敗しました' }
    })
  }
})

export default router