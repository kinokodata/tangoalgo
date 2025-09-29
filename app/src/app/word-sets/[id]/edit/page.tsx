'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Plus, Edit, Trash2, Play, Download, Upload, Save, Check, X as XIcon, GripVertical } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/hooks/useAuth'
import ClientOnly from '@/components/ClientOnly'
import { exportToCSV } from '@/lib/csv-utils'
import CSVImportModal from '@/components/CSVImportModal'
import CardEditModal from '@/components/CardEditModal'
import AppHeader from '@/components/AppHeader'

interface Card {
  id: string
  frontWord?: string
  front_word?: string
  frontHint?: string
  front_hint?: string
  frontDescription?: string
  front_description?: string
  backWord?: string
  back_word?: string
  backHint?: string
  back_hint?: string
  backDescription?: string
  back_description?: string
  createdAt?: string
  created_at?: string
}

interface CardSet {
  id: string
  title: string
  description?: string
  cards?: Card[]
  createdAt: string
}

function EditWordSetContent() {
  const router = useRouter()
  const params = useParams()
  const setId = params.id as string
  const { requireAuth } = useAuth()

  const [cardSet, setCardSet] = useState<CardSet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddCard, setShowAddCard] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [hasReorderedCards, setHasReorderedCards] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 新しいカードのフォーム
  const [newCard, setNewCard] = useState({
    frontWord: '',
    frontHint: '',
    frontDescription: '',
    backWord: '',
    backHint: '',
    backDescription: ''
  })

  // 認証チェック
  if (!requireAuth()) {
    return null
  }

  useEffect(() => {
    fetchCardSet()
  }, [setId])

  const fetchCardSet = async () => {
    try {
      const response = await apiClient.getCardSet(setId)

      if (!response.success) {
        throw new Error(response.error?.message || '単語帳の取得に失敗しました')
      }

      setCardSet(response.data)
      setEditedTitle(response.data.title)
      setEditedDescription(response.data.description || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCard.frontWord.trim() || !newCard.backWord.trim()) {
      setError('表面と裏面の単語は必須です')
      return
    }

    try {
      const response = await apiClient.createCard({
        cardSetId: setId,
        frontWord: newCard.frontWord.trim(),
        frontHint: newCard.frontHint.trim() || undefined,
        frontDescription: newCard.frontDescription.trim() || undefined,
        backWord: newCard.backWord.trim(),
        backHint: newCard.backHint.trim() || undefined,
        backDescription: newCard.backDescription.trim() || undefined,
      })

      if (!response.success) {
        throw new Error(response.error?.message || 'カードの追加に失敗しました')
      }

      // フォームをリセット
      setNewCard({
        frontWord: '',
        frontHint: '',
        frontDescription: '',
        backWord: '',
        backHint: '',
        backDescription: ''
      })
      setShowAddCard(false)
      setError('')

      // カードセットを再取得
      fetchCardSet()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('このカードを削除しますか？')) {
      return
    }

    try {
      const response = await apiClient.deleteCard(cardId)

      if (!response.success) {
        throw new Error(response.error?.message || 'カードの削除に失敗しました')
      }

      // カードセットを再取得
      fetchCardSet()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    }
  }

  const handleStartStudy = () => {
    if (!cardSet?.cards || cardSet.cards.length === 0) {
      alert('学習を開始するには、少なくとも1つのカードが必要です')
      return
    }
    router.push(`/study/${setId}`)
  }

  const handleExportCSV = () => {
    if (!cardSet?.cards || cardSet.cards.length === 0) {
      alert('エクスポートするカードがありません')
      return
    }

    const filename = `${cardSet.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')}.csv`
    exportToCSV(cardSet.cards, filename)
  }

  const handleStartEditingTitle = () => {
    setIsEditingTitle(true)
    setEditedTitle(cardSet?.title || '')
    setEditedDescription(cardSet?.description || '')
  }

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) {
      alert('タイトルは必須です')
      return
    }

    try {
      const response = await apiClient.updateCardSet(setId, editedTitle.trim(), editedDescription.trim() || undefined)

      if (!response.success) {
        throw new Error(response.error?.message || '単語帳の更新に失敗しました')
      }

      // ローカルの状態を更新
      if (cardSet) {
        setCardSet({
          ...cardSet,
          title: editedTitle.trim(),
          description: editedDescription.trim() || undefined
        })
      }

      setIsEditingTitle(false)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました')
    }
  }

  const handleCancelEditingTitle = () => {
    setIsEditingTitle(false)
    setEditedTitle(cardSet?.title || '')
    setEditedDescription(cardSet?.description || '')
    setError('')
  }

  const handleDeleteCardSet = async () => {
    if (!cardSet) return

    try {
      const response = await apiClient.deleteCardSet(setId)

      if (!response.success) {
        throw new Error(response.error?.message || '単語帳の削除に失敗しました')
      }

      // 削除成功後、ダッシュボードにリダイレクト
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setShowDeleteConfirm(false)
    }
  }

  // ドラッグ&ドロップ関連のハンドラー
  const handleDragStart = (index: number) => {
    setDraggingIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggingIndex === null || draggingIndex === dropIndex || !cardSet?.cards) return

    const draggedCard = cardSet.cards[draggingIndex]
    const newCards = [...cardSet.cards]

    // カードを削除して新しい位置に挿入
    newCards.splice(draggingIndex, 1)
    newCards.splice(dropIndex, 0, draggedCard)

    // display_orderを再計算（小数を使って効率的に）
    const updatedCards = newCards.map((card, index) => ({
      ...card,
      display_order: (index + 1) * 1000
    }))

    setCardSet({
      ...cardSet,
      cards: updatedCards
    })

    setHasReorderedCards(true)
    setDraggingIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggingIndex(null)
    setDragOverIndex(null)
  }

  const handleSaveOrder = async () => {
    if (!cardSet?.cards || !hasReorderedCards) return

    try {
      const cardsWithOrder = cardSet.cards.map((card, index) => ({
        id: card.id,
        display_order: (index + 1) * 1000
      }))

      const response = await apiClient.reorderCards(setId, cardsWithOrder)

      if (!response.success) {
        throw new Error(response.error?.message || '順序の更新に失敗しました')
      }

      setHasReorderedCards(false)
      alert('カードの順序を保存しました')
    } catch (err) {
      setError(err instanceof Error ? err.message : '順序の保存に失敗しました')
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (error && !cardSet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
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
        backLink="/dashboard"
      />

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 単語帳情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            {isEditingTitle ? (
              <div className="flex-1 mr-4">
                <div className="mb-3">
                  <label className="block text-sm font-bold mb-1">タイトル</label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary text-xl font-bold"
                    placeholder="単語帳タイトル"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">説明</label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="単語帳の説明（オプション）"
                    rows={2}
                    maxLength={500}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleSaveTitle}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" />
                    保存
                  </button>
                  <button
                    onClick={handleCancelEditingTitle}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <XIcon className="h-4 w-4" />
                    キャンセル
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    単語帳を削除
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div>
                      <h2 className="text-xl font-bold mb-2">{cardSet?.title}</h2>
                      {cardSet?.description && (
                        <p className="text-gray-600">{cardSet.description}</p>
                      )}
                    </div>
                    <button
                      onClick={handleStartEditingTitle}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="編集"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="単語帳を削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            <div className="text-right text-sm text-gray-500">
              <div>カード数: {cardSet?.cards?.length || 0}</div>
              <div>作成日: {cardSet && new Date(cardSet.createdAt).toLocaleDateString('ja-JP')}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddCard(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              カード追加
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              CSVインポート
            </button>
            <div className="relative">
              <button
                onClick={handleExportCSV}
                className="btn-secondary flex items-center gap-2"
                disabled={!cardSet?.cards || cardSet.cards.length === 0}
              >
                <Download className="h-4 w-4" />
                CSVエクスポート
              </button>
            </div>
          </div>
        </div>

        {/* カード追加フォーム */}
        {showAddCard && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">新しいカードを追加</h3>
            <form onSubmit={handleAddCard}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 表面 */}
                <div>
                  <h4 className="font-bold text-primary mb-3">表面</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-bold mb-1">単語 *</label>
                      <input
                        type="text"
                        value={newCard.frontWord}
                        onChange={(e) => setNewCard(prev => ({ ...prev, frontWord: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="例: Algorithm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">ヒント</label>
                      <input
                        type="text"
                        value={newCard.frontHint}
                        onChange={(e) => setNewCard(prev => ({ ...prev, frontHint: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="例: /ˈælɡərɪðəm/"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">説明</label>
                      <textarea
                        value={newCard.frontDescription}
                        onChange={(e) => setNewCard(prev => ({ ...prev, frontDescription: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="例: A step-by-step procedure"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* 裏面 */}
                <div>
                  <h4 className="font-bold text-success mb-3">裏面</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-bold mb-1">単語 *</label>
                      <input
                        type="text"
                        value={newCard.backWord}
                        onChange={(e) => setNewCard(prev => ({ ...prev, backWord: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="例: アルゴリズム"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">ヒント</label>
                      <input
                        type="text"
                        value={newCard.backHint}
                        onChange={(e) => setNewCard(prev => ({ ...prev, backHint: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="例: 手順"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">説明</label>
                      <textarea
                        value={newCard.backDescription}
                        onChange={(e) => setNewCard(prev => ({ ...prev, backDescription: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="例: 計算や問題解決のための段階的な手順"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="btn-secondary"
                >
                  キャンセル
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  カードを追加
                </button>
              </div>
            </form>
          </div>
        )}

        {/* カード一覧 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-bold">カード一覧 ({cardSet?.cards?.length || 0})</h3>
            <div className="flex items-center gap-2">
              {hasReorderedCards && (
                <button
                  onClick={handleSaveOrder}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  順序を保存
                </button>
              )}
              <button
                onClick={handleStartStudy}
                className="bg-success hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                disabled={!cardSet?.cards || cardSet.cards.length === 0}
              >
                <Play className="h-4 w-4" />
                学習開始
              </button>
            </div>
          </div>

          {cardSet?.cards && cardSet.cards.length > 0 ? (
            <div className="divide-y">
              {cardSet.cards.map((card, index) => (
                <div
                  key={card.id}
                  className={`p-6 hover:bg-gray-50 transition-all cursor-move ${
                    draggingIndex === index ? 'opacity-50' : ''
                  } ${
                    dragOverIndex === index ? 'border-t-4 border-blue-500' : ''
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-start gap-4">
                    <div className="pt-4 cursor-move text-gray-400 hover:text-gray-600">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 表面 */}
                    <div>
                      <h4 className="font-bold text-primary mb-2">表面</h4>
                      <div className="space-y-1">
                        <div className="font-bold">{card.front_word || card.frontWord}</div>
                        {(card.front_hint || card.frontHint) && (
                          <div className="text-sm text-gray-600">{card.front_hint || card.frontHint}</div>
                        )}
                        {(card.front_description || card.frontDescription) && (
                          <div className="text-sm text-gray-700">{card.front_description || card.frontDescription}</div>
                        )}
                      </div>
                    </div>

                    {/* 裏面 */}
                    <div>
                      <h4 className="font-bold text-success mb-2">裏面</h4>
                      <div className="space-y-1">
                        <div className="font-bold">{card.back_word || card.backWord}</div>
                        {(card.back_hint || card.backHint) && (
                          <div className="text-sm text-gray-600">{card.back_hint || card.backHint}</div>
                        )}
                        {(card.back_description || card.backDescription) && (
                          <div className="text-sm text-gray-700">{card.back_description || card.backDescription}</div>
                        )}
                      </div>
                    </div>
                  </div>

                      {/* アクションボタン */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => setEditingCard(card)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">カードがありません</p>
              <p className="mb-4">「カード追加」ボタンから最初のカードを追加しましょう</p>
              <button
                onClick={() => setShowAddCard(true)}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                カード追加
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSVインポートモーダル */}
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        cardSetId={setId}
        onSuccess={() => {
          fetchCardSet()
        }}
      />

      {/* カード編集モーダル */}
      <CardEditModal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        card={editingCard}
        onSuccess={(updatedCard) => {
          if (cardSet && cardSet.cards) {
            const updatedCards = cardSet.cards.map(c =>
              c.id === updatedCard.id ? updatedCard : c
            )
            setCardSet({
              ...cardSet,
              cards: updatedCards
            })
          }
          setEditingCard(null)
        }}
      />

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-red-600">単語帳を削除</h3>
            <p className="text-gray-700 mb-4">
              「{cardSet?.title}」を削除しますか？
            </p>
            <p className="text-sm text-red-600 mb-6">
              ※ この単語帳に含まれるすべてのカードも同時に削除されます。この操作は取り消すことができません。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteCardSet}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Trash2 className="h-4 w-4" />
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function EditWordSetPage() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      }
    >
      <EditWordSetContent />
    </ClientOnly>
  )
}