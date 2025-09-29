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

// ミドルウェア
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:13000',
  credentials: true
}))
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