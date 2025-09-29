'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Download, X, FileText, AlertCircle } from 'lucide-react'
import { parseCSV, downloadCSVTemplate } from '@/lib/csv-utils'
import { apiClient } from '@/lib/api-client'

interface CSVImportModalProps {
  isOpen: boolean
  onClose: () => void
  cardSetId?: string
  onSuccess: () => void
}

export default function CSVImportModal({ isOpen, onClose, cardSetId, onSuccess }: CSVImportModalProps) {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [previewCards, setPreviewCards] = useState<any[]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 新規作成モードか既存追加モードか
  const isNewMode = !cardSetId

  const handleFileSelect = useCallback((file: File) => {
    // CSVファイルかチェック
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('CSVファイルを選択してください')
      return
    }

    setCsvFile(file)
    setError('')

    // 新規モードの場合、ファイル名から単語帳タイトルを推測
    if (isNewMode && !title) {
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

        setPreviewCards(cards.slice(0, 3)) // 最初の3枚をプレビュー
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
  }, [isNewMode, title])

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find(file => file.name.toLowerCase().endsWith('.csv'))

    if (csvFile) {
      handleFileSelect(csvFile)
    } else if (files.length > 0) {
      setError('CSVファイルをドロップしてください')
    }
  }, [handleFileSelect])

  const handleImport = async () => {
    if (!csvFile) {
      setError('CSVファイルを選択してください')
      return
    }

    if (isNewMode && !title.trim()) {
      setError('単語帳タイトルを入力してください')
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

      let targetCardSetId = cardSetId

      // 新規モードの場合、まず単語帳を作成
      if (isNewMode) {
        const cardSetResponse = await apiClient.createCardSet(title.trim(), description.trim() || undefined)

        if (!cardSetResponse.success) {
          throw new Error(cardSetResponse.error?.message || '単語帳の作成に失敗しました')
        }

        targetCardSetId = cardSetResponse.data.id
      }

      // カードを一括追加
      let successCount = 0
      let errorCount = 0

      for (const card of cards) {
        try {
          const response = await apiClient.createCard({
            cardSetId: targetCardSetId,
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
          }
        } catch (err) {
          errorCount++
        }
      }

      if (successCount > 0) {
        const message = `${successCount}枚のカードを正常にインポートしました。${errorCount > 0 ? `\n${errorCount}枚のカードでエラーが発生しました。` : ''}`
        alert(message)
        onSuccess()
        handleClose()
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

  const handleClose = () => {
    if (!importing) {
      setCsvFile(null)
      setPreviewCards([])
      setError('')
      setTitle('')
      setDescription('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Upload className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">
              {isNewMode ? 'CSVから新規単語帳作成' : 'CSVからカードを追加'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={importing}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* ボディ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ドラッグ&ドロップエリア */}
          <div
            className={`mb-6 p-8 border-2 border-dashed rounded-lg text-center transition-colors ${
              isDragging
                ? 'border-primary bg-blue-50'
                : csvFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              disabled={importing}
              className="hidden"
            />

            {csvFile ? (
              <div>
                <FileText className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <p className="font-semibold text-green-700">{csvFile.name}</p>
                <p className="text-sm text-gray-600 mt-1">クリックして別のファイルを選択</p>
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="font-semibold mb-2">
                  CSVファイルをドロップ、またはクリックして選択
                </p>
                <p className="text-sm text-gray-600">対応形式: .csv</p>
              </div>
            )}
          </div>

          {/* 新規作成時の情報入力 */}
          {isNewMode && csvFile && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">単語帳タイトル *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="例: TOEIC基礎単語"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">説明（オプション）</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="例: CSVからインポートした単語帳"
                  maxLength={200}
                />
              </div>
            </div>
          )}

          {/* プレビュー */}
          {previewCards.length > 0 && (
            <div>
              <h3 className="font-bold mb-3">プレビュー（最初の3枚）</h3>
              <div className="space-y-2">
                {previewCards.map((card, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-white">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-bold text-primary">表: </span>
                        {card.front_word}
                        {card.front_hint && <span className="text-gray-500 ml-2">({card.front_hint})</span>}
                      </div>
                      <div>
                        <span className="font-bold text-success">裏: </span>
                        {card.back_word}
                        {card.back_hint && <span className="text-gray-500 ml-2">({card.back_hint})</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                合計 {previewCards.length} 枚のカードが検出されました
              </p>
            </div>
          )}

          {/* テンプレート */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-semibold mb-1">CSVファイルの形式</p>
                <p className="text-sm text-blue-700">
                  ヘッダー行: 表面の単語,表面のヒント,表面の説明,裏面の単語,裏面のヒント,裏面の説明
                </p>
                <button
                  onClick={() => downloadCSVTemplate()}
                  className="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
                >
                  <Download className="h-4 w-4 inline mr-1" />
                  テンプレートをダウンロード
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            disabled={importing}
            className="flex-1 btn-secondary"
          >
            キャンセル
          </button>
          <button
            onClick={handleImport}
            disabled={importing || !csvFile || (isNewMode && !title.trim())}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {importing ? 'インポート中...' : 'インポート'}
          </button>
        </div>
      </div>
    </div>
  )
}