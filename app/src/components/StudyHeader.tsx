'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { ArrowLeft, RefreshCw, Edit3 } from 'lucide-react'

interface StudyHeaderProps {
  backLink?: string
  title?: string
  currentIndex: number
  totalCount: number
  correctCount: number
  incorrectCount: number
  progress?: number
  reverseMode?: boolean
  onReverseMode?: () => void
  onEdit?: () => void
}

export default function StudyHeader({
  backLink,
  title,
  currentIndex,
  totalCount,
  correctCount,
  incorrectCount,
  progress = 0,
  reverseMode = false,
  onReverseMode,
  onEdit
}: StudyHeaderProps) {
  return (
    <>
      <header className="bg-navy-800 text-white">
        <div className="container mx-auto px-4 py-3">
          {/* 1行目: ロゴ、タイトル、ステータス */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {backLink && (
                <Link href={backLink} className="text-white hover:text-gray-300 flex-shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              )}
              <h1 className="text-lg md:text-2xl font-bold flex-shrink-0">
                <span className="logo-gradient">TanGOALgo</span>
              </h1>
            </div>
            <div className="text-right">
              <div className="text-xs md:text-sm text-gray-300">
                {currentIndex} / {totalCount}
              </div>
              <div className="text-xs md:text-sm">
                正解: <span className="text-green-400">{correctCount}</span>
                <span className="mx-1">|</span>
                不正解: <span className="text-red-400">{incorrectCount}</span>
              </div>
            </div>
          </div>

          {/* 2行目: セット名、アクションボタン */}
          <div className="flex items-center justify-between">
            <div className="text-sm md:text-lg truncate max-w-[40%]">
              {title}
            </div>
            <div className="flex items-center gap-2">
              {onReverseMode && (
                <button
                  onClick={onReverseMode}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs md:text-sm transition ${
                    reverseMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">裏表逆</span>
                  <span className="sm:hidden">逆</span>
                </button>
              )}
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs md:text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                >
                  <Edit3 className="h-3 w-3 md:h-4 md:w-4" />
                  編集
                </button>
              )}
            </div>
          </div>
        </div>

        {/* プログレスバー */}
        {progress > 0 && (
          <div className="bg-navy-900 px-4 py-2">
            <div className="container mx-auto">
              <div className="bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}