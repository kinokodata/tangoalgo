import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  user?: any
}

// JWT認証ミドルウェア
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: '認証トークンが必要です' }
      })
    }

    const secret = process.env.JWT_SECRET || 'default-secret'
    const decoded = jwt.verify(token, secret) as any

    req.userId = decoded.userId
    req.user = decoded

    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: { message: '無効なトークンです' }
    })
  }
}