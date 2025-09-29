'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Save } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/hooks/useAuth'
import ClientOnly from '@/components/ClientOnly'
import AppHeader from '@/components/AppHeader'

function CreateWordSetContent() {
  const router = useRouter()
  const { requireAuth } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 認証チェック
  if (!requireAuth()) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('タイトルは必須です')
      return
    }

    setLoading(true)

    try {
      const response = await apiClient.createCardSet(title.trim(), description.trim() || undefined)

      if (!response.success) {
        throw new Error(response.error?.message || '単語帳の作成に失敗しました')
      }

      // 作成成功後、編集ページに遷移
      router.push(`/word-sets/${response.data.id}/edit`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <AppHeader
        title="新しい単語帳を作成"
        backLink="/dashboard"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">単語帳を作成</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                  タイトル *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例: TOEIC基礎単語"
                  required
                  maxLength={100}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {title.length}/100文字
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                  説明（オプション）
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例: TOEIC試験でよく出る基礎的な英単語500選"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {description.length}/500文字
                </p>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="flex-1 bg-gray-200 text-gray-800 text-center py-3 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  キャンセル
                </Link>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {loading ? '作成中...' : '作成して編集'}
                </button>
              </div>
            </form>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">次のステップ</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• 単語帳作成後、カードを追加できます</li>
                <li>• CSVファイルからカードを一括インポートできます</li>
                <li>• カードを追加したら学習を開始できます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreateWordSetPage() {
  return (
    <ClientOnly>
      <CreateWordSetContent />
    </ClientOnly>
  )
}