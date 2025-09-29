'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { RotateCcw, CheckCircle, XCircle, Trophy, ArrowLeft } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/hooks/useAuth'
import ClientOnly from '@/components/ClientOnly'
import CardEditModal from '@/components/CardEditModal'
import AppHeader from '@/components/AppHeader'
import StudyProgress from '@/components/StudyProgress'

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

interface CardSet {
  id: string
  title: string
  description?: string
  cards: Card[]
}

interface StudySession {
  correctAnswers: number
  incorrectAnswers: number
  totalCards: number
  startTime: Date
}

function StudyContent() {
  const router = useRouter()
  const params = useParams()
  const setId = params.setId as string
  const { requireAuth } = useAuth()

  const [cardSet, setCardSet] = useState<CardSet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showFrontHint, setShowFrontHint] = useState(false)
  const [reverseMode, setReverseMode] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [session, setSession] = useState<StudySession>({
    correctAnswers: 0,
    incorrectAnswers: 0,
    totalCards: 0,
    startTime: new Date()
  })
  const [studyComplete, setStudyComplete] = useState(false)

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

      if (!response.data.cards || response.data.cards.length === 0) {
        setError('この単語帳にはカードがありません')
        setLoading(false)
        return
      }

      setCardSet(response.data)
      setSession(prev => ({
        ...prev,
        totalCards: response.data.cards.length
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleReverseMode = () => {
    setReverseMode(!reverseMode)
    setIsFlipped(false)
    setShowFrontHint(false)
  }

  const handleCardUpdate = (updatedCard: Card) => {
    if (!cardSet) return

    const updatedCards = cardSet.cards.map(card =>
      card.id === updatedCard.id ? updatedCard : card
    )

    setCardSet({
      ...cardSet,
      cards: updatedCards
    })
  }

  const handleAnswer = (isCorrect: boolean) => {
    setSession(prev => ({
      ...prev,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: isCorrect ? prev.incorrectAnswers : prev.incorrectAnswers + 1
    }))

    // 次のカードへ
    if (currentCardIndex < (cardSet?.cards.length || 0) - 1) {
      setCurrentCardIndex(prev => prev + 1)
      setIsFlipped(false)
      setShowFrontHint(false)
    } else {
      // 学習完了
      setStudyComplete(true)
    }
  }

  const handleRestart = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setShowFrontHint(false)
    setSession({
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalCards: cardSet?.cards.length || 0,
      startTime: new Date()
    })
    setStudyComplete(false)
  }

  const handleFinish = () => {
    const accuracy = session.totalCards > 0 ? Math.round((session.correctAnswers / session.totalCards) * 100) : 0
    const params = new URLSearchParams({
      setId,
      correct: session.correctAnswers.toString(),
      incorrect: session.incorrectAnswers.toString(),
      total: session.totalCards.toString(),
      accuracy: accuracy.toString()
    })
    router.push(`/study/result?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (error) {
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

  if (studyComplete) {
    const accuracy = session.totalCards > 0 ? Math.round((session.correctAnswers / session.totalCards) * 100) : 0

    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader
          title="学習完了"
          backLink="/dashboard"
        />

        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">学習完了！</h2>
            <p className="text-gray-600 mb-6">{cardSet?.title}の学習が完了しました</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>正解数:</span>
                <span className="font-bold text-green-600">{session.correctAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span>不正解数:</span>
                <span className="font-bold text-red-600">{session.incorrectAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span>正解率:</span>
                <span className="font-bold text-blue-600">{accuracy}%</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                もう一度
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 btn-primary"
              >
                結果を見る
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentCard = cardSet?.cards[currentCardIndex]
  const progress = ((currentCardIndex + 1) / (cardSet?.cards.length || 1)) * 100

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* ヘッダー */}
      <AppHeader
        backLink={`/word-sets/${setId}/edit`}
      />

      {/* 進捗表示 */}
      <StudyProgress
        title={cardSet?.title}
        currentIndex={currentCardIndex + 1}
        totalCount={cardSet?.cards.length || 0}
        correctCount={session.correctAnswers}
        incorrectCount={session.incorrectAnswers}
        progress={progress}
        reverseMode={reverseMode}
        onReverseMode={handleReverseMode}
        onEdit={() => setShowEditModal(true)}
      />

      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="max-w-lg w-full">
          {/* フラッシュカード */}
          <div className="relative mb-8">
            {!isFlipped ? (
              // 問題のみ表示
              <div
                className="bg-white rounded-lg shadow-lg p-8 min-h-[300px] flex flex-col justify-center cursor-pointer"
                onClick={handleCardFlip}
              >
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-4">
                    {reverseMode
                      ? (currentCard?.back_word || currentCard?.backWord)
                      : (currentCard?.front_word || currentCard?.frontWord)
                    }
                  </h3>

                  {/* ヒント表示エリア（逆モード時は back_hint を表示） */}
                  {reverseMode
                    ? ((currentCard?.back_hint || currentCard?.backHint) && (
                        <div className="mb-3">
                          {showFrontHint ? (
                            <p className="text-gray-600 mb-2 p-2 bg-blue-50 rounded">{currentCard.back_hint || currentCard.backHint}</p>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowFrontHint(true)
                              }}
                              className="text-blue-500 hover:text-blue-700 text-sm underline"
                            >
                              ヒントを表示
                            </button>
                          )}
                        </div>
                      ))
                    : ((currentCard?.front_hint || currentCard?.frontHint) && (
                        <div className="mb-3">
                          {showFrontHint ? (
                            <p className="text-gray-600 mb-2 p-2 bg-blue-50 rounded">{currentCard.front_hint || currentCard.frontHint}</p>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowFrontHint(true)
                              }}
                              className="text-blue-500 hover:text-blue-700 text-sm underline"
                            >
                              ヒントを表示
                            </button>
                          )}
                        </div>
                      ))
                  }
                </div>
                <div className="text-center mt-6 text-gray-400 text-sm">
                  クリックしてカードをめくる
                </div>
              </div>
            ) : (
              // 表と裏を両方表示
              <div className="space-y-4">
                {/* 問題 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="text-center">
                      <h3 className="text-2xl font-bold">
                        {reverseMode
                          ? (currentCard?.back_word || currentCard?.backWord)
                          : (currentCard?.front_word || currentCard?.frontWord)
                        }
                      </h3>
                    {showFrontHint && (
                      reverseMode
                        ? ((currentCard?.back_hint || currentCard?.backHint) && (
                            <p className="text-gray-600 mt-2 p-2 bg-blue-50 rounded text-sm">{currentCard.back_hint || currentCard.backHint}</p>
                          ))
                        : ((currentCard?.front_hint || currentCard?.frontHint) && (
                            <p className="text-gray-600 mt-2 p-2 bg-blue-50 rounded text-sm">{currentCard.front_hint || currentCard.frontHint}</p>
                          ))
                    )}
                  </div>
                </div>

                {/* 答え */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-3">
                      {reverseMode
                        ? (currentCard?.front_word || currentCard?.frontWord)
                        : (currentCard?.back_word || currentCard?.backWord)
                      }
                    </h3>

                    {/* 説明（逆モード時は front_description を優先） */}
                    {reverseMode
                      ? (((currentCard?.front_description || currentCard?.frontDescription) ||
                         (currentCard?.back_description || currentCard?.backDescription)) && (
                         <p className="text-gray-700 text-sm">
                           {(currentCard?.front_description || currentCard?.frontDescription) ||
                            (currentCard?.back_description || currentCard?.backDescription)}
                         </p>
                       ))
                      : (((currentCard?.back_description || currentCard?.backDescription) ||
                         (currentCard?.front_description || currentCard?.frontDescription)) && (
                         <p className="text-gray-700 text-sm">
                           {(currentCard?.back_description || currentCard?.backDescription) ||
                            (currentCard?.front_description || currentCard?.frontDescription)}
                         </p>
                       ))
                    }
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 回答ボタン */}
          {isFlipped && (
            <div className="flex gap-4 animate-fade-in">
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition"
              >
                <XCircle className="h-5 w-5" />
                不正解
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition"
              >
                <CheckCircle className="h-5 w-5" />
                正解
              </button>
            </div>
          )}

          {/* 学習のヒント */}
          {!isFlipped ? (
            <div className="text-center text-gray-500 animate-fade-in">
              <p className="mb-2">単語の意味を思い出してからカードをめくりましょう</p>
              <p className="text-sm">思い出せたら「正解」、思い出せなかったら「不正解」を選択してください</p>
            </div>
          ) : (
            <div className="text-center text-gray-500 animate-fade-in">
              <p className="text-sm">思い出せたら「正解」、思い出せなかったら「不正解」を選択してください</p>
            </div>
          )}
        </div>
      </div>

      {/* カード編集モーダル */}
      <CardEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        card={currentCard || null}
        onSuccess={handleCardUpdate}
      />
    </div>
  )
}

export default function StudyPage() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      }
    >
      <StudyContent />
    </ClientOnly>
  )
}