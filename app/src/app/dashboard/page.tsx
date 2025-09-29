'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, BookOpen, TrendingUp, Target, FileText } from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/hooks/useAuth'
import ClientOnly from '@/components/ClientOnly'
import CSVImportModal from '@/components/CSVImportModal'
import AppHeader from '@/components/AppHeader'

interface CardSetWithStats {
  id: string
  title: string
  description?: string
  cardCount: number
  lastStudiedAt?: string
  accuracy?: number
}

function DashboardContent() {
  const router = useRouter()
  const { user, loading: authLoading, logout, requireAuth } = useAuth()
  const [cardSets, setCardSets] = useState<CardSetWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)
  const [stats, setStats] = useState({
    totalSets: 0,
    totalCards: 0,
    totalSessions: 0,
    averageAccuracy: 0,
  })

  useEffect(() => {
    if (!authLoading) {
      if (requireAuth()) {
        fetchDashboardData()
      }
    }
  }, [authLoading])

  const fetchDashboardData = async () => {
    try {
      // 実際のAPIからカードセット一覧を取得
      const response = await apiClient.getCardSets()

      if (!response.success) {
        throw new Error(response.error?.message || 'データの取得に失敗しました')
      }

      const cardSetsData = response.data.map((cardSet: any) => ({
        id: cardSet.id,
        title: cardSet.title,
        description: cardSet.description,
        cardCount: cardSet.cardCount || 0,
        lastStudiedAt: cardSet.lastStudiedAt,
        accuracy: cardSet.accuracy
      }))

      setCardSets(cardSetsData)

      // 統計情報を計算
      const totalCards = cardSetsData.reduce((sum: number, set: any) => sum + set.cardCount, 0)
      const setsWithAccuracy = cardSetsData.filter((set: any) => set.accuracy)
      const averageAccuracy = setsWithAccuracy.length > 0
        ? setsWithAccuracy.reduce((sum: number, set: any) => sum + set.accuracy, 0) / setsWithAccuracy.length
        : 0

      setStats({
        totalSets: cardSetsData.length,
        totalCards: totalCards,
        totalSessions: 0, // TODO: 実装時に学習セッション数を取得
        averageAccuracy: Math.round(averageAccuracy * 10) / 10,
      })
    } catch (error) {
      console.error('ダッシュボードデータ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await apiClient.signout()
    } catch (error) {
      console.error('サインアウトエラー:', error)
    }
    logout()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* ヘッダー */}
      <AppHeader showBackButton={false} />

      <div className="container mx-auto px-4 py-8">
        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">単語帳数</p>
                <p className="text-2xl font-bold">{stats.totalSets}</p>
              </div>
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">総カード数</p>
                <p className="text-2xl font-bold">{stats.totalCards}</p>
              </div>
              <FileText className="h-10 w-10 text-success" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">学習セッション</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
              <Target className="h-10 w-10 text-error" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">平均正解率</p>
                <p className="text-2xl font-bold">{stats.averageAccuracy}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-4 mb-8">
          <Link href="/word-sets/create" className="btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            新規作成
          </Link>
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <FileText className="h-5 w-5" />
            CSVインポート
          </button>
        </div>

        {/* 単語帳一覧 */}
        <div>
          <h2 className="text-xl font-bold mb-4">あなたの単語帳</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardSets.map((set) => (
              <div key={set.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">{set.title}</h3>
                  {set.description && (
                    <p className="text-gray-600 text-sm mb-4">{set.description}</p>
                  )}
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>{set.cardCount} カード</span>
                    {set.accuracy && <span>正解率: {set.accuracy}%</span>}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/study/${set.id}`}
                      className="flex-1 bg-success text-white text-center py-2 rounded hover:bg-green-600 transition"
                    >
                      学習開始
                    </Link>
                    <Link
                      href={`/word-sets/${set.id}/edit`}
                      className="flex-1 bg-gray-200 text-gray-800 text-center py-2 rounded hover:bg-gray-300 transition"
                    >
                      編集
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* 単語帳がない場合 */}
            {cardSets.length === 0 && (
              <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">まだ単語帳がありません</p>
                <Link href="/word-sets/create" className="btn-primary inline-flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  最初の単語帳を作成
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSVインポートモーダル */}
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          fetchDashboardData()
          router.refresh()
        }}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      }
    >
      <DashboardContent />
    </ClientOnly>
  )
}