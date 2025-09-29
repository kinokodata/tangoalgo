'use client'

import { Edit } from 'lucide-react'

interface StudyProgressProps {
  currentIndex: number
  totalCount: number
  correctCount: number
  incorrectCount: number
  progress: number
  reverseMode: boolean
  onReverseMode: () => void
  onEdit: () => void
  title?: string
}

export default function StudyProgress({
  currentIndex,
  totalCount,
  correctCount,
  incorrectCount,
  progress,
  reverseMode,
  onReverseMode,
  onEdit,
  title
}: StudyProgressProps) {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-3">
          {/* 上段: タイトルとコントロール */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {title && (
                <h2 className="text-lg font-semibold text-gray-800 truncate">
                  {title}
                </h2>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onReverseMode}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  reverseMode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {reverseMode ? '裏→表' : '表→裏'}
              </button>
              <button
                onClick={onEdit}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm font-medium flex items-center gap-1 transition"
              >
                <Edit className="h-3 w-3" />
                編集
              </button>
            </div>
          </div>

          {/* 下段: 進捗情報とプログレスバー */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {currentIndex}/{totalCount}
                </span>
                <span className="text-green-600 font-medium">
                  ✓{correctCount}
                </span>
                <span className="text-red-600 font-medium">
                  ✗{incorrectCount}
                </span>
              </div>
              <span className="text-gray-600 font-medium">
                {Math.round(progress)}%
              </span>
            </div>

            {/* プログレスバー */}
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}