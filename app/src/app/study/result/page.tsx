'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, TrendingUp, Target, RotateCcw, BookOpen } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/hooks/useAuth'
import ClientOnly from '@/components/ClientOnly'
import AppHeader from '@/components/AppHeader'

interface CardSet {
  id: string
  title: string
  description?: string
}

function StudyResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { requireAuth } = useAuth()

  const [cardSet, setCardSet] = useState<CardSet | null>(null)
  const [loading, setLoading] = useState(true)

  // URLパラメータから学習結果を取得
  const setId = searchParams.get('setId') || ''
  const correct = parseInt(searchParams.get('correct') || '0')
  const incorrect = parseInt(searchParams.get('incorrect') || '0')
  const total = parseInt(searchParams.get('total') || '0')
  const accuracy = parseInt(searchParams.get('accuracy') || '0')

  if (!requireAuth()) {
    return null
  }

  useEffect(() => {
    if (setId) {
      fetchCardSet()
    }
  }, [setId])

  const fetchCardSet = async () => {
    try {
      const response = await apiClient.getCardSet(setId)

      if (!response.success) {
        throw new Error(response.error?.message || '単語帳の取得に失敗しました')
      }

      setCardSet(response.data)
    } catch (err) {
      console.error('単語帳取得エラー:', err)
    } finally {
      setLoading(false)
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600'
    if (accuracy >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAccuracyMessage = (accuracy: number) => {
    if (accuracy >= 90) return '素晴らしい！完璧な理解です！'
    if (accuracy >= 80) return 'とても良くできました！'
    if (accuracy >= 70) return '良い結果です！'
    if (accuracy >= 60) return 'もう少し頑張りましょう'
    return '復習をおすすめします'
  }

  const handleRetry = () => {
    router.push(`/study/${setId}`)
  }

  const handleBackToEdit = () => {
    router.push(`/word-sets/${setId}/edit`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (!setId || total === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">無効な学習結果です</div>
          <Link href="/dashboard" className="btn-primary">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <AppHeader
        title="学習結果"
        backLink="/dashboard"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 結果カード */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="text-center mb-6">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">学習完了！</h2>
              <p className="text-gray-600 text-lg">{cardSet?.title}</p>
              {cardSet?.description && (
                <p className="text-gray-500 text-sm mt-1">{cardSet.description}</p>
              )}
            </div>

            {/* 正解率 */}
            <div className="text-center mb-8">
              <div className={`text-6xl font-bold mb-2 ${getAccuracyColor(accuracy)}`}>
                {accuracy}%
              </div>
              <p className="text-lg text-gray-600">{getAccuracyMessage(accuracy)}</p>
            </div>

            {/* 詳細統計 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{correct}</div>
                <div className="text-sm text-gray-600">正解</div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600">{incorrect}</div>
                <div className="text-sm text-gray-600">不正解</div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{total}</div>
                <div className="text-sm text-gray-600">総カード数</div>
              </div>
            </div>

            {/* プログレスバー */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>正解率</span>
                <span>{accuracy}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>

            {/* アクションボタン */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleRetry}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                もう一度学習
              </button>
              <button
                onClick={handleBackToEdit}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                単語帳を編集
              </button>
              <Link
                href="/dashboard"
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                ダッシュボード
              </Link>
            </div>
          </div>

          {/* 学習のヒント */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-bold text-blue-800 mb-3">
              <TrendingUp className="h-5 w-5 inline mr-2" />
              学習のコツ
            </h3>
            <ul className="text-blue-700 text-sm space-y-2">
              <li>• 正解率が80%以上になるまで繰り返し学習しましょう</li>
              <li>• 間違えたカードは特に重点的に覚えましょう</li>
              <li>• 定期的に復習することで長期記憶に定着します</li>
              <li>• 新しいカードを追加して語彙を増やしましょう</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudyResultPage() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      }
    >
      <StudyResultContent />
    </ClientOnly>
  )
}