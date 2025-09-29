'use client'

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

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
}

interface CardEditModalProps {
  isOpen: boolean
  onClose: () => void
  card: Card | null
  onSuccess: (updatedCard: Card) => void
}

export default function CardEditModal({ isOpen, onClose, card, onSuccess }: CardEditModalProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    frontWord: '',
    frontHint: '',
    frontDescription: '',
    backWord: '',
    backHint: '',
    backDescription: '',
  })

  useEffect(() => {
    if (card) {
      setFormData({
        frontWord: card.front_word || card.frontWord || '',
        frontHint: card.front_hint || card.frontHint || '',
        frontDescription: card.front_description || card.frontDescription || '',
        backWord: card.back_word || card.backWord || '',
        backHint: card.back_hint || card.backHint || '',
        backDescription: card.back_description || card.backDescription || '',
      })
    }
  }, [card])

  const handleSave = async () => {
    if (!card) return

    if (!formData.frontWord.trim() || !formData.backWord.trim()) {
      setError('表面と裏面の単語は必須です')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await apiClient.updateCard(card.id, {
        frontWord: formData.frontWord.trim(),
        frontHint: formData.frontHint.trim() || undefined,
        frontDescription: formData.frontDescription.trim() || undefined,
        backWord: formData.backWord.trim(),
        backHint: formData.backHint.trim() || undefined,
        backDescription: formData.backDescription.trim() || undefined,
      })

      if (!response.success) {
        throw new Error(response.error?.message || 'カードの更新に失敗しました')
      }

      onSuccess(response.data)
      handleClose()
    } catch (err) {
      console.error('カード更新エラー:', err)
      setError(err instanceof Error ? err.message : 'カードの更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (!saving) {
      setError('')
      onClose()
    }
  }

  if (!isOpen || !card) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">カードを編集</h2>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* ボディ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 表面 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-600">表面</h3>

              <div>
                <label className="block text-sm font-bold mb-1">単語 *</label>
                <input
                  type="text"
                  value={formData.frontWord}
                  onChange={(e) => setFormData(prev => ({ ...prev, frontWord: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="例: apple"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">ヒント</label>
                <input
                  type="text"
                  value={formData.frontHint}
                  onChange={(e) => setFormData(prev => ({ ...prev, frontHint: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 赤い果物"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">説明</label>
                <textarea
                  value={formData.frontDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, frontDescription: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-20"
                  placeholder="例: 英語での発音は..."
                  maxLength={500}
                />
              </div>
            </div>

            {/* 裏面 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600">裏面</h3>

              <div>
                <label className="block text-sm font-bold mb-1">単語 *</label>
                <input
                  type="text"
                  value={formData.backWord}
                  onChange={(e) => setFormData(prev => ({ ...prev, backWord: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="例: りんご"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">ヒント</label>
                <input
                  type="text"
                  value={formData.backHint}
                  onChange={(e) => setFormData(prev => ({ ...prev, backHint: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="例: アップル"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">説明</label>
                <textarea
                  value={formData.backDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, backDescription: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 h-20"
                  placeholder="例: バラ科の果物で..."
                  maxLength={500}
                />
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            disabled={saving}
            className="flex-1 btn-secondary"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.frontWord.trim() || !formData.backWord.trim()}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}