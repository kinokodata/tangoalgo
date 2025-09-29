'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { ArrowLeft, LogOut } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface HeaderProps {
  backLink?: string
  title?: string
  showLogo?: boolean
  showLogout?: boolean
  onLogout?: () => void
  rightContent?: ReactNode
  children?: ReactNode
}

export default function Header({
  backLink,
  title,
  showLogo = true,
  showLogout = false,
  onLogout,
  rightContent,
  children
}: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await apiClient.signout()
    } catch (error) {
      console.error('サインアウトエラー:', error)
    }
    // ローカルストレージをクリア
    localStorage.removeItem('token')
    router.push('/auth/login')
  }

  return (
    <header className="bg-navy-800 text-white">
      <div className="container mx-auto px-4 py-4">
        {/* デフォルトヘッダーレイアウト */}
        {!children ? (
          <div className="flex items-center justify-between">
            {/* 左側 */}
            <div className="flex items-center gap-4">
              {backLink && (
                <Link href={backLink} className="text-white hover:text-gray-300">
                  <ArrowLeft className="h-6 w-6" />
                </Link>
              )}
              {showLogo && (
                <h1 className="text-2xl font-bold">
                  <span className="logo-gradient">TanGOALgo</span>
                </h1>
              )}
              {title && <span className="text-lg">{title}</span>}
            </div>

            {/* 右側 */}
            <div className="flex items-center gap-4">
              {rightContent}
              {showLogout && (
                <button
                  onClick={onLogout || handleLogout}
                  className="text-sm bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  ログアウト
                </button>
              )}
            </div>
          </div>
        ) : (
          // カスタムレイアウト
          children
        )}
      </div>
    </header>
  )
}