import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  username?: string
  displayName?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [])

  const checkAuth = () => {
    // ブラウザ環境でのみlocalStorageにアクセス
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    const token = localStorage.getItem('auth_token')

    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      // JWTトークンから基本的なユーザー情報をデコード（簡易版）
      const payload = JSON.parse(atob(token.split('.')[1]))

      // トークンの有効期限をチェック
      if (payload.exp * 1000 < Date.now()) {
        // トークンが期限切れ
        localStorage.removeItem('auth_token')
        setUser(null)
        setLoading(false)
        return
      }

      setUser({
        id: payload.userId,
        email: payload.email,
      })
    } catch (error) {
      console.error('トークンの検証エラー:', error)
      localStorage.removeItem('auth_token')
      setUser(null)
    }

    setLoading(false)
  }

  const login = (token: string, userData: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
    setUser(userData)
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
    setUser(null)
    router.push('/auth/login')
  }

  const requireAuth = () => {
    if (!loading && !mounted) {
      return false // まだマウントされていない
    }
    if (!loading && !user) {
      router.push('/auth/login')
      return false
    }
    return true
  }

  return {
    user,
    loading: loading || !mounted,
    login,
    logout,
    requireAuth,
    isAuthenticated: !!user && mounted,
    checkAuth
  }
}