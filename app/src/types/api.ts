// API レスポンス型定義

// 共通レスポンス型
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
  }
}

// ユーザー関連
export interface User {
  id: string
  email: string
  username?: string
  displayName?: string
  avatarUrl?: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  username?: string
  displayName?: string
}

export interface AuthResponse {
  user: User
  session: {
    accessToken: string
    refreshToken: string
    expiresAt: string
  }
}

// カードセット関連
export interface CardSet {
  id: string
  userId: string
  title: string
  description?: string
  cardCount?: number
  lastStudiedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateCardSetRequest {
  title: string
  description?: string
}

export interface UpdateCardSetRequest {
  title?: string
  description?: string
}

// カード関連
export interface Card {
  id: string
  cardSetId: string
  frontWord: string
  frontHint?: string
  frontDescription?: string
  backWord: string
  backHint?: string
  backDescription?: string
  audioUrl?: string
  stats?: CardStats
  createdAt: string
  updatedAt: string
}

export interface CardStats {
  score: number
  totalAttempts: number
  correctCount: number
  incorrectCount: number
  lastStudiedAt?: string
  masteryLevel: number // 習得度（0-100）
}

export interface CreateCardRequest {
  frontWord: string
  frontHint?: string
  frontDescription?: string
  backWord: string
  backHint?: string
  backDescription?: string
  audioUrl?: string
}

export interface UpdateCardRequest extends Partial<CreateCardRequest> {}

export interface BatchCardOperation {
  cardIds: string[]
  targetCardSetId: string
}

// 学習セッション関連
export interface StudySession {
  id: string
  userId: string
  cardSetId: string
  isReversed: boolean
  isRandomOrder: boolean
  startedAt: string
  completedAt?: string
  totalWords: number
  correctWords: number
  accuracy: number
  cards?: Card[]
}

export interface CreateSessionRequest {
  cardSetId: string
  isReversed?: boolean
  isRandomOrder?: boolean
  cardLimit?: number
}

export interface SessionProgress {
  cardId: string
  isCorrect: boolean
  responseTime?: number
}

export interface UpdateSessionRequest {
  progress: SessionProgress
}

// CSV関連
export interface CsvImportRequest {
  file: File
  cardSetId?: string // 既存のカードセットに追加する場合
  createNewSet?: boolean // 新しいカードセットを作成する場合
  setTitle?: string // 新しいカードセットのタイトル
  setDescription?: string // 新しいカードセットの説明
}

export interface CsvValidationResult {
  isValid: boolean
  errors?: string[]
  preview?: {
    rows: Card[]
    totalCount: number
  }
}

export interface CsvExportResponse {
  fileName: string
  content: string
  mimeType: string
}

// 統計・分析関連
export interface DashboardStats {
  totalCardSets: number
  totalCards: number
  totalSessions: number
  averageAccuracy: number
  streakDays: number
  todayProgress: {
    cardsStudied: number
    correctAnswers: number
    timeSpent: number // 分
  }
  weakCards: Card[]
  recommendedSets: CardSet[]
}

export interface LearningProgress {
  date: string
  cardsStudied: number
  accuracy: number
  timeSpent: number
}

export interface MistakeAnalysis {
  card: Card
  mistakeCount: number
  lastMistake: string
  suggestionReason: string
}