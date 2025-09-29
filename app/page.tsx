export default function Home() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-8">
          <span className="logo-gradient">TanGOALgo</span>
        </h1>
        <p className="text-white text-xl mb-8">
          アルゴリズムで効率化された次世代の単語学習アプリ
        </p>
        <div className="space-x-4">
          <a href="/auth/login" className="btn-primary inline-block">
            ログイン
          </a>
          <a href="/auth/signup" className="btn-secondary inline-block">
            新規登録
          </a>
        </div>
      </div>
    </div>
  )
}