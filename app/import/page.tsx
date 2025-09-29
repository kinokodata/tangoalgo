'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Download, BookOpen, AlertCircle, CheckCircle } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/hooks/useAuth'
import ClientOnly from '@/components/ClientOnly'
import { parseCSV, downloadCSVTemplate } from '@/lib/csv-utils'
import AppHeader from '@/components/AppHeader'

function ImportContent() {
  const router = useRouter()
  const { requireAuth } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [previewCards, setPreviewCards] = useState<any[]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)

  if (!requireAuth()) {
    return null
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // CSVファイルかチェック
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('CSVファイルを選択してください')
      return
    }

    setCsvFile(file)
    setError('')

    // ファイル名から単語帳タイトルを推測
    if (!title) {
      const fileName = file.name.replace('.csv', '').replace(/[_-]/g, ' ')
      setTitle(fileName)
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string
        const cards = parseCSV(csvContent)

        if (cards.length === 0) {
          throw new Error('有効なカードデータが見つかりませんでした')
        }

        setPreviewCards(cards.slice(0, 5)) // 最初の5枚をプレビュー
      } catch (err) {
        console.error('CSVパースエラー:', err)
        setError(err instanceof Error ? err.message : 'CSVファイルの読み込みに失敗しました')
        setPreviewCards([])
      }
    }

    reader.onerror = () => {
      setError('ファイルの読み込みに失敗しました')
      setPreviewCards([])
    }

    reader.readAsText(file, 'UTF-8')
  }

  const handleImport = async () => {
    if (!csvFile || !title.trim()) {
      setError('CSVファイルと単語帳タイトルが必要です')
      return
    }

    setImporting(true)
    setError('')

    try {
      // CSVを再度パース
      const csvContent = await csvFile.text()
      const cards = parseCSV(csvContent)

      if (cards.length === 0) {
        throw new Error('有効なカードデータが見つかりませんでした')
      }

      // 単語帳を作成
      const cardSetResponse = await apiClient.createCardSet(title.trim(), description.trim() || undefined)

      if (!cardSetResponse.success) {
        throw new Error(cardSetResponse.error?.message || '単語帳の作成に失敗しました')
      }

      const cardSetId = cardSetResponse.data.id

      // カードを一括追加
      let successCount = 0
      let errorCount = 0

      for (const card of cards) {
        try {
          const response = await apiClient.createCard({
            cardSetId: cardSetId,
            frontWord: card.front_word,
            frontHint: card.front_hint,
            frontDescription: card.front_description,
            backWord: card.back_word,
            backHint: card.back_hint,
            backDescription: card.back_description,
          })

          if (response.success) {
            successCount++
          } else {
            errorCount++
            console.error('カード作成エラー:', response.error)
          }
        } catch (err) {
          errorCount++
          console.error('カード作成エラー:', err)
        }
      }

      if (successCount > 0) {
        // 成功時は編集ページに遷移
        router.push(`/word-sets/${cardSetId}/edit`)
      } else {
        throw new Error('すべてのカードのインポートに失敗しました')
      }

    } catch (err) {
      console.error('インポートエラー:', err)
      setError(err instanceof Error ? err.message : 'インポートに失敗しました')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <AppHeader
        title="CSVインポート"
        backLink="/dashboard"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">CSVファイルから単語帳を作成</h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {/* ファイル選択 */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                CSVファイルを選択
              </label>
              <div className="flex gap-4">
                <label className="btn-primary flex items-center gap-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  ファイルを選択
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    disabled={importing}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => downloadCSVTemplate()}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  テンプレートをダウンロード
                </button>
              </div>
              {csvFile && (
                <p className="text-sm text-gray-600 mt-2">
                  選択されたファイル: {csvFile.name}
                </p>
              )}
            </div>

            {/* プレビュー */}
            {previewCards.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3">プレビュー（最初の5枚）</h3>
                <div className="space-y-3">
                  {previewCards.map((card, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-bold text-primary text-sm mb-1">表面</h4>
                          <div className="font-bold">{card.front_word}</div>
                          {card.front_hint && <div className="text-sm text-gray-600">{card.front_hint}</div>}
                          {card.front_description && <div className="text-sm text-gray-700">{card.front_description}</div>}
                        </div>
                        <div>
                          <h4 className="font-bold text-success text-sm mb-1">裏面</h4>
                          <div className="font-bold">{card.back_word}</div>
                          {card.back_hint && <div className="text-sm text-gray-600">{card.back_hint}</div>}
                          {card.back_description && <div className="text-sm text-gray-700">{card.back_description}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 単語帳情報 */}
            {csvFile && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                      単語帳タイトル *
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
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                      説明（オプション）
                    </label>
                    <input
                      id="description"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="例: CSVからインポートした単語帳"
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-200 text-gray-800 text-center py-3 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                キャンセル
              </Link>
              <button
                onClick={handleImport}
                disabled={importing || !csvFile || !title.trim()}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>インポート中...</>
                ) : (
                  <>
                    <BookOpen className="h-5 w-5" />
                    単語帳を作成
                  </>
                )}
              </button>
            </div>

            {/* 使用方法 */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">CSVファイルの形式</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• ヘッダー行: 表面の単語,表面のヒント,表面の説明,裏面の単語,裏面のヒント,裏面の説明</li>
                <li>• 表面の単語と裏面の単語は必須項目です</li>
                <li>• ヒントと説明は空欄でも構いません</li>
                <li>• カンマや改行を含む場合はダブルクォートで囲んでください</li>
                <li>• 上の「テンプレートをダウンロード」ボタンでサンプルファイルを取得できます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ImportPage() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      }
    >
      <ImportContent />
    </ClientOnly>
  )
}