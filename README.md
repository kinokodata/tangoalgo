# TanGOAlgo - 次世代単語学習アプリ

アルゴリズムで効率化された次世代の単語学習アプリです。

## 機能

- 📚 個人用単語帳の作成・管理
- 🎯 フラッシュカード形式での学習
- 🔄 表裏反転モード
- 📊 学習進捗の可視化
- 📥 CSVインポート/エクスポート
- 🎲 ランダム/順次出題モード
- 📈 スコアベースの復習システム

## 技術スタック

- **フロントエンド**: Next.js 14, React 18, TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集してSupabaseの情報を設定：

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 3. Supabaseのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQL Editorで`supabase/migrations/001_initial_schema.sql`を実行
3. Authentication → Settings でメール/パスワード認証を有効化

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセス

## Docker での起動

```bash
# Docker Compose で起動
docker compose up -d

# ログを確認
docker compose logs -f web

# 停止
docker compose down
```

## プロジェクト構成

```
tangoalgo/
├── app/                  # Next.js App Router
│   ├── auth/            # 認証関連ページ
│   ├── dashboard/       # ダッシュボード
│   ├── api/            # API エンドポイント
│   └── globals.css     # グローバルスタイル
├── components/          # Reactコンポーネント
├── lib/                # ユーティリティ
├── types/              # TypeScript型定義
├── supabase/           # データベース関連
└── public/             # 静的ファイル
```

## CSV形式

カードのインポート/エクスポートに使用するCSV形式：

```csv
Front_Word,Front_Hint,Front_Description,Back_Word,Back_Hint,Back_Description
Algorithm,/ˈælɡərɪðəm/,"A step-by-step procedure",アルゴリズム,手順,"計算のための段階的な手順"
```

## ライセンス

MIT