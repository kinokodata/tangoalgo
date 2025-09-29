import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// ルートのインポート
import authRoutes from './routes/auth'
import cardSetsRoutes from './routes/cardSets'
import cardsRoutes from './routes/cards'
import sessionsRoutes from './routes/sessions'

// 環境変数の読み込み
dotenv.config()

const app = express()
const PORT = process.env.API_PORT || 5001

// CORS設定 - 本番環境とローカル開発環境のみ許可
const getAllowedOrigins = (): string[] => {
  const origins: string[] = []

  // 本番環境のフロントエンドURL
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL)
  }

  // Vercelデプロイ環境
  origins.push('https://tangoalgo-web.vercel.app')

  // ローカル開発環境（開発時のみ）
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:3000')
    origins.push('http://localhost:13000')
  }

  return origins
}

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins()

    // 開発環境ではoriginがない場合も許可（Postmanなど）
    if (process.env.NODE_ENV !== 'production' && !origin) {
      callback(null, true)
      return
    }

    // 許可リストに含まれる場合のみ許可
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log(`CORS blocked: ${origin} is not in allowed list:`, allowedOrigins)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // プリフライトリクエストのキャッシュ時間（24時間）
}

// ミドルウェア
app.use(cors(corsOptions))
app.use(express.json())

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Server is running' })
})

// APIルート
app.use('/api/auth', authRoutes)
app.use('/api/card-sets', cardSetsRoutes)
app.use('/api/cards', cardsRoutes)
app.use('/api/sessions', sessionsRoutes)

// エラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('エラー:', err.stack)
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'サーバーエラーが発生しました',
      code: err.code
    }
  })
})

// サーバー起動
app.listen(PORT, () => {
  console.log(`✅ APIサーバーが起動しました: http://localhost:${PORT}`)
  console.log(`📊 ヘルスチェック: http://localhost:${PORT}/health`)
})