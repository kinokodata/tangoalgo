import { Router } from 'express'
import { supabase } from '../services/supabase'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

// 認証が必要
router.use(authenticateToken)

// 学習セッション開始
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { cardSetId, isReversed = false, isRandomOrder = true } = req.body

    if (!cardSetId) {
      return res.status(400).json({
        success: false,
        error: { message: 'カードセットIDが必要です' }
      })
    }

    // カードセットの所有者確認とカード取得
    const { data: cardSet } = await supabase
      .from('card_sets')
      .select('*, cards(*)')
      .eq('id', cardSetId)
      .eq('user_id', req.userId!)
      .single()

    if (!cardSet) {
      return res.status(404).json({
        success: false,
        error: { message: 'カードセットが見つかりません' }
      })
    }

    // セッション作成
    const { data: session, error } = await supabase
      .from('learning_sessions')
      .insert([
        {
          user_id: req.userId!,
          card_set_id: cardSetId,
          is_reversed: isReversed,
          is_random_order: isRandomOrder,
          total_words: cardSet.cards?.length || 0
        }
      ])
      .select()
      .single()

    if (error) throw error

    // カードをシャッフル（ランダムモードの場合）
    let cards = cardSet.cards || []
    if (isRandomOrder) {
      cards = cards.sort(() => Math.random() - 0.5)
    }

    res.json({
      success: true,
      data: {
        session,
        cards
      }
    })
  } catch (error) {
    console.error('セッション開始エラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'セッションの開始に失敗しました' }
    })
  }
})

// セッション進捗更新
router.put('/:id/progress', async (req: AuthRequest, res) => {
  try {
    const { cardId, isCorrect, responseTime } = req.body

    // カード進捗記録
    const { error: progressError } = await supabase
      .from('card_progress')
      .insert([
        {
          user_id: req.userId!,
          session_id: req.params.id,
          card_id: cardId,
          is_correct: isCorrect,
          response_time: responseTime
        }
      ])

    if (progressError) throw progressError

    // カード統計更新
    const { data: existingStats } = await supabase
      .from('user_card_stats')
      .select('*')
      .eq('user_id', req.userId!)
      .eq('card_id', cardId)
      .single()

    if (existingStats) {
      // 既存の統計を更新
      const { error: updateError } = await supabase
        .from('user_card_stats')
        .update({
          score: existingStats.score + (isCorrect ? 1 : -1),
          total_attempts: existingStats.total_attempts + 1,
          correct_count: existingStats.correct_count + (isCorrect ? 1 : 0),
          incorrect_count: existingStats.incorrect_count + (isCorrect ? 0 : 1),
          last_studied_at: new Date().toISOString()
        })
        .eq('id', existingStats.id)
    } else {
      // 新規統計作成
      const { error: insertError } = await supabase
        .from('user_card_stats')
        .insert([
          {
            user_id: req.userId!,
            card_id: cardId,
            score: isCorrect ? 1 : -1,
            total_attempts: 1,
            correct_count: isCorrect ? 1 : 0,
            incorrect_count: isCorrect ? 0 : 1,
            last_studied_at: new Date().toISOString()
          }
        ])

      if (insertError) throw insertError
    }

    res.json({
      success: true,
      message: '進捗を更新しました'
    })
  } catch (error) {
    console.error('進捗更新エラー:', error)
    res.status(500).json({
      success: false,
      error: { message: '進捗の更新に失敗しました' }
    })
  }
})

// セッション完了
router.put('/:id/complete', async (req: AuthRequest, res) => {
  try {
    const { correctWords, accuracy } = req.body

    const { data, error } = await supabase
      .from('learning_sessions')
      .update({
        completed_at: new Date().toISOString(),
        correct_words: correctWords,
        accuracy
      })
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('セッション完了エラー:', error)
    res.status(500).json({
      success: false,
      error: { message: 'セッションの完了処理に失敗しました' }
    })
  }
})

export default router