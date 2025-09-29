'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import UserDropdown from '@/components/UserDropdown'

interface AppHeaderProps {
  title?: string
  backLink?: string
  showBackButton?: boolean
  children?: ReactNode
}

export default function AppHeader({
  title,
  backLink,
  showBackButton = true,
  children
}: AppHeaderProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  // 認証が不要なページかどうかを判定
  const isAuthPage = pathname?.startsWith('/auth')
  const isPublicPage = pathname === '/' || isAuthPage

  // バックリンクの自動判定
  const getBackLink = () => {
    if (backLink) return backLink
    if (pathname?.includes('/study/')) return '/dashboard'
    if (pathname?.includes('/word-sets/')) return '/dashboard'
    return '/dashboard'
  }

  return (
    <header className="bg-navy-800 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 左側: ナビゲーション */}
          <div className="flex items-center gap-4">
            {/* 戻るボタン */}
            {showBackButton && !isPublicPage && (
              <Link href={getBackLink()} className="text-white hover:text-gray-300">
                <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
              </Link>
            )}

            {/* ロゴ */}
            <Link href={isPublicPage ? "/" : "/dashboard"}>
              <h1 className="text-lg md:text-2xl font-bold">
                <span className="logo-gradient">TanGOALgo</span>
              </h1>
            </Link>

            {/* ページタイトル */}
            {title && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm md:text-lg truncate max-w-[200px] md:max-w-none">
                  {title}
                </span>
              </div>
            )}
          </div>

          {/* 右側: ユーザー情報・アクション */}
          <div className="flex items-center gap-4">
            {/* カスタムコンテンツ */}
            {children}

            {/* ユーザー情報（ログイン済みの場合） */}
            {!isPublicPage && user && (
              <UserDropdown user={user} />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}