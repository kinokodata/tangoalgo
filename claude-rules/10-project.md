# TanGOAlgo - 単語帳アプリ 機能仕様書

## アプリ概要
**TanGOAlgo** は、アルゴリズムで効率化された次世代の単語学習アプリです。シンプルなフラッシュカード機能と進捗管理により、効率的な語彙習得をサポートします。

## 用語定義

### 基本用語
- **カード**: 1枚の学習カード（英単語と日本語訳、例文などを含む1つの学習単位）
- **単語帳**: いくつかのカードをまとめたもの（例：TOEIC単語帳、基礎英語単語帳など）
- **セッション**: 1回の学習の取り組み（単語帳の中から一定数のカードを学習する単位）
- **フラッシュカード**: カードの表示方式（表面に英語、裏面に日本語を表示し、めくって確認する学習法）

## ユーザーフロー

### 基本的な学習フロー
1. **ログイン/新規登録**
    - メールアドレス・パスワードでの認証
    - Supabase Auth による認証処理

2. **ダッシュボード表示**
    - 自分の単語帳一覧表示
    - 学習進捗の概要表示
    - 単語帳作成・選択・インポートのオプション

3. **カードセットの作成・選択・インポート**
    - **新規作成**: タイトル・説明を入力して空のカードセットを作成
    - **既存選択**: 自分の作成済みカードセットから選択
    - **CSVインポート**: CSVファイルからカードセットを作成・インポート

4. **カードセットの編集（オプション）**
    - カードの追加・編集・削除
    - カードの他のカードセットへのコピー・移動
    - カードセットのメタデータ編集
    - **CSVエクスポート**: カードセットをCSVファイルとしてダウンロード

5. **学習セッション開始**
    - 選択したカードセットでの学習を開始
    - セッション設定（学習するカード数など）

6. **フラッシュカード学習**
    - カードの表示・裏返し
    - ◯/✗での評価
    - リアルタイム進捗表示

7. **セッション完了**
    - 学習結果の表示
    - 統計情報の更新
    - 次回学習の提案

### CSV共有フロー
1. **エクスポート**
    - カードセットをCSVファイルとしてダウンロード
    - ファイル名: `[カードセット名]_[日付].csv`
    - 他のユーザーとファイル共有（メール、クラウドストレージなど）

2. **インポート**
    - 受け取ったCSVファイルをアップロード
    - プレビュー機能で内容確認
    - 新規カードセットとして作成またはカードを既存カードセットに追加

3. **CSV形式**
   ```csv
   English,Phonetic,Japanese,Example_EN,Example_JP
   Algorithm,/ˈælɡərɪðəm/,アルゴリズム,"The algorithm efficiently sorts data","アルゴリズムは効率的にデータをソートする"
   ```

### カード管理フロー
1. **カード作成**
    - カードセット内でカードを新規作成
    - 表面と裏面の単語、ヒント、解説の入力

2. **カード編集**
    - 既存カードの内容修正
    - 音声ファイルのアップロード

3. **カードのコピー**
    - 選択したカードを他のカードセットにコピー
    - 元のカードは残存

4. **カードの移動**
    - 選択したカードを他のカードセットに移動
    - 元のカードセットからは削除

5. **カードの削除**
    - カードセットからカードを完全削除
    - 関連する学習履歴は保持

## デザインコンセプト
- **集中力重視**: 深いネイビーブルー (#0f172a) を基調とした落ち着いた配色
- **シンプル**: 余計な装飾を排除し、学習に集中できるミニマルデザイン
- **直感的操作**: ◯/✗の2択による簡単な評価システム

## 配色設計

### メインカラー
- **背景色**: #0f172a (深いネイビーブルー)
- **ヘッダー**: #1e293b (ややライトなネイビー)
- **カード・UI背景**: #ffffff (白)
- **テキスト**: #0f172a (背景と同色で統一)

### アクセントカラー
- **正解・成長**: #10b981 (緑)
- **不正解・注意**: #ef4444 (赤)
- **機能・リンク**: #3b82f6 (青)

### ロゴデザイン
- **TanGOALgo**: 横方向グラデーション
  ```css
  background: linear-gradient(90deg, #3b82f6 0%, #3b82f6 18%, #10b981 40%, #10b981 60%, #3b82f6 82%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  ```
    - Tan (青) + GOAL (緑) + go (青)
    - 境界を自然ににじませる

## 画面構成

## 画面構成

### 1. 認証画面
- **ログイン画面**: メール・パスワード入力
- **新規登録画面**: ユーザー情報入力

### 2. ダッシュボード
- **個人の単語帳一覧**: 自分が作成・インポートした単語帳のみ表示
- **学習進捗概要**: 個人の学習統計・間違い分析
- **クイックアクション**: 新規作成・学習開始・CSVインポート
- **復習推奨**: 間違いの多いカードを含む単語帳の強調表示

### 3. 単語帳管理画面
- **単語帳作成**: タイトル・説明入力フォーム（個人専用）
- **単語帳編集**: メタデータ編集
- **カード管理**: カード一覧・追加・編集・削除・移動・コピー
- **統計表示**: カードごとのスコア・実施回数・習得度表示
- **CSV機能**: インポート・エクスポートボタン
- **学習状況**: 未出題・低スコア・高スコアカードの分類表示

### 4. CSV インポート/エクスポート画面
- **ファイルアップロード**: ドラッグ&ドロップ対応のCSVアップロード
- **プレビュー機能**: インポート前の内容確認・編集
- **形式検証**: CSV形式の自動チェック・エラー表示
- **インポートオプション**: 新規作成 or 既存単語帳への追加
- **エクスポート**: ワンクリックでCSVダウンロード

### 4. 学習セッション画面（メイン機能）

#### ヘッダー
- **ロゴ**: TanGOALgo（グラデーション文字）
  ```css
  background: linear-gradient(90deg, #3b82f6 0%, #3b82f6 18%, #10b981 40%, #10b981 60%, #3b82f6 82%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  ```
- **プログレスバー**: 現在の学習進捗（緑のバー）
- **セッション情報**: 「35/100 | Session 3」
- **反転モード切り替え**: 表面↔裏面を入れ替えるトグルボタン
- **出題順序切り替え**: ランダム↔順次のトグルボタン

#### メインエリア
##### セッション統計パネル（白背景）
- **正解数**: 現在のセッションでの正解数
- **残り数**: 残りの単語数
- **正解率**: リアルタイム計算される正解率（%）
- **学習モード**: 通常 or 反転モード表示
- **出題方式**: ランダム or 順次出題表示

##### フラッシュカード
- **サイズ**: 800px幅 × 400px高さ（最大）
- **形状**: 角丸の白いカード
- **アニメーション**: 3D回転エフェクト
- **操作**: クリック/タップで裏返し

**表面**
- メインワード（大きなフォント）
- ヒントボタン（クリックでヒント表示）
- 解説文（常時表示、1文程度）
- 音声再生ボタン（右上）
- フリップヒント（右下）

**裏面**
- メインワード（大きなフォント）
- ヒントボタン（クリックでヒント表示）
- 解説文（常時表示、1文程度）

##### 操作ボタン
- **✗ ボタン**: 不正解（赤色、円形、80px）
- **◯ ボタン**: 正解（緑色、円形、80px）
- **配置**: カード下部、中央揃え

##### 反転モード・出題順序
- **通常モード**: front → back の順で表示
- **反転モード**: back → front の順で表示
- **ランダム出題**: カードをシャッフルして出題
- **順次出題**: 作成順で出題
- **切り替え**: ヘッダーのトグルボタンで即座に切り替え可能
- **優先出題**: 低スコア・未出題カードを優先的に出題

##### 学習アルゴリズム
- **スコアベース**: 低スコアカードを優先出題
- **頻度ベース**: 実施回数の少ないカードを優先
- **習得度計算**: スコア ÷ 実施回数 で習得度を算出
- **復習タイミング**: スコアが負の値のカードを重点的に復習

### 5. 結果画面
- **セッション結果**: 正解数・正解率・所要時間
- **詳細統計**: カード別の結果
- **次回学習提案**: 復習推奨カードなど

## 機能仕様

### 基本機能

#### 1. ユーザー専用単語帳システム
- **完全分離**: ユーザごとに独立した単語帳作成・管理
- **プライベート**: 他のユーザーとの共有機能なし
- **個人所有**: すべての単語帳・カードはユーザーに紐づく

#### 2. 汎用フラッシュカード表示
- **表面/裏面構造**: 言語に依存しない汎用的なカード構造
- **ヒント機能**: 表面・裏面それぞれにヒント表示ボタン
- **解説表示**: 各面に短い解説文を常時表示
- **カード切り替え**: 回答後に次のカードを自動表示
- **アニメーション**: スライドイン効果

#### 3. 裏表反転機能
- **通常モード**: 表面 → 裏面の順で学習
- **反転モード**: 裏面 → 表面の順で学習
- **リアルタイム切り替え**: セッション中でも即座に切り替え可能
- **状態保持**: セッションごとに反転状態を記録

#### 4. 学習進捗管理
- **セッション統計**: 正解数、残り数、正解率をリアルタイム更新
- **プログレスバー**: 全体進捗の視覚化
- **セッション管理**: 連続学習セッションの管理
- **反転モード対応**: 通常・反転それぞれの学習記録

#### 5. 間違い記録・スコアシステム
- **スコア管理**: 正解+1、不正解-1の±累積システム
- **実施回数**: カードが出題された回数を記録
- **習得度計算**: スコア ÷ 実施回数で習得度を算出
- **未出題検出**: 実施回数0のカードを特定
- **復習推奨**: 低スコアカードの自動抽出

#### 6. 出題順序機能
- **ランダム出題**: カードをシャッフルして出題
- **順次出題**: 作成順または指定順序で出題
- **優先出題**: 低スコア・未出題カードを優先
- **リアルタイム切り替え**: セッション中の出題方式変更
- **出題履歴**: 同セッション内での重複防止

#### 5. 評価システム
- **2択評価**: ◯（正解）/ ✗（不正解）のシンプル評価
- **統計更新**: 評価に基づく即座の統計更新（間違い回数・正解回数）
- **次カード表示**: 評価後の自動遷移

#### 6. 音声機能
- **発音再生**: 音声ボタンクリックで単語の発音を再生
- **視覚フィードバック**: 再生時のボタンアニメーション

#### 7. CSV インポート/エクスポート機能
- **CSVエクスポート**: 単語帳をCSV形式でダウンロード
- **CSVインポート**: CSVファイルから単語帳作成・カード追加
- **形式検証**: CSV形式の自動チェック機能
- **プレビュー**: インポート前の内容確認
- **ファイル共有**: CSVファイルを通じた単語帳の共有（メール、クラウドストレージなど）

### CSV ファイル形式仕様
```csv
Front_Word,Front_Hint,Front_Description,Back_Word,Back_Hint,Back_Description
Algorithm,/ˈælɡərɪðəm/,"A step-by-step procedure for calculations",アルゴリズム,手順,"計算や問題解決のための段階的な手順"
Apple,fruit,"A red or green fruit",りんご,果物,"赤や緑の果実"
√,"square root","Mathematical symbol for finding the root",平方根,ルート,"数の2乗して元の数になる値"
```

**必須フィールド**: Front_Word, Back_Word
**オプション**: Front_Hint, Front_Description, Back_Hint, Back_Description
**エンコーディング**: UTF-8
**区切り文字**: カンマ（,）
**引用符**: ダブルクォート（"）でエスケープ

### 使用例
1. **英語学習**: 英語 → 日本語
2. **語学学習**: 単語 → 意味・例文
3. **資格試験**: 問題 → 答え・解説
4. **数学**: 公式 → 説明・使用例
5. **歴史**: 年号 → 出来事・詳細
6. **反転学習**: 意味 → 単語（裏表反転モード）

### 操作方法

#### マウス/タッチ操作
- **カードクリック**: 表面↔裏面の切り替え
- **◯ボタン**: 正解として記録、次のカードへ
- **✗ボタン**: 不正解として記録、次のカードへ
- **音声ボタン**: 発音再生

#### キーボードショートカット
- **スペース/Enter**: カードの裏返し
- **1キー/左矢印**: ✗（不正解）
- **2キー/右矢印**: ◯（正解）

## データベース設計

### Supabase テーブル構成

#### users テーブル
```sql
-- Supabase Auth の users テーブルを拡張
-- auth.users テーブルは自動生成されるため、プロファイル情報のみ追加
```

#### profiles テーブル
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### card_sets テーブル（カードセット）
```sql
CREATE TABLE card_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- 所有者
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ユーザーごとのカードセットインデックス
CREATE INDEX idx_card_sets_user ON card_sets(user_id, created_at);
```

#### cards テーブル（カード）
```sql
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_set_id UUID REFERENCES card_sets(id) ON DELETE CASCADE,
  
  -- 表面情報
  front_word TEXT NOT NULL,           -- 表面のメインワード
  front_hint TEXT,                    -- 表面のヒント（オプション）
  front_description TEXT,             -- 表面の解説（オプション）
  
  -- 裏面情報
  back_word TEXT NOT NULL,            -- 裏面のメインワード
  back_hint TEXT,                     -- 裏面のヒント（オプション）
  back_description TEXT,              -- 裏面の解説（オプション）
  
  -- メタ情報
  audio_url TEXT,                     -- 音声ファイルURL（オプション）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 検索用インデックス
CREATE INDEX idx_cards_card_set ON cards(card_set_id);
CREATE INDEX idx_cards_front_word ON cards(front_word);
CREATE INDEX idx_cards_back_word ON cards(back_word);
```

#### user_card_stats テーブル（ユーザ別カード統計）
```sql
CREATE TABLE user_card_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  
  -- スコア管理（±による習得度）
  score INTEGER DEFAULT 0,               -- 正解+1、不正解-1の累積
  total_attempts INTEGER DEFAULT 0,      -- 実施回数（出題された回数）
  
  -- 詳細統計
  correct_count INTEGER DEFAULT 0,       -- 正解回数
  incorrect_count INTEGER DEFAULT 0,     -- 不正解回数
  
  -- 学習状況
  last_studied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- ユーザ×カードの組み合わせは一意
  UNIQUE(user_id, card_id)
);

-- インデックス
CREATE INDEX idx_user_card_stats_user ON user_card_stats(user_id);
CREATE INDEX idx_user_card_stats_score ON user_card_stats(user_id, score);
CREATE INDEX idx_user_card_stats_attempts ON user_card_stats(user_id, total_attempts);
CREATE INDEX idx_user_card_stats_last_studied ON user_card_stats(user_id, last_studied_at);
```

#### learning_sessions テーブル（学習セッション）
```sql
CREATE TABLE learning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  card_set_id UUID REFERENCES card_sets(id),
  
  -- 学習設定
  is_reversed BOOLEAN DEFAULT false,      -- 裏表反転モード
  is_random_order BOOLEAN DEFAULT true,   -- ランダム出題（true）/ 順次出題（false）
  
  -- セッション情報
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_words INTEGER,
  correct_words INTEGER,
  accuracy DECIMAL(5,2)
);
```

#### card_progress テーブル（カード別学習進捗）
```sql
CREATE TABLE card_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  card_id UUID REFERENCES cards(id),
  session_id UUID REFERENCES learning_sessions(id),
  is_correct BOOLEAN,
  response_time INTEGER, -- ミリ秒
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Row Level Security (RLS) ポリシー

#### profiles テーブル
```sql
-- ユーザーは自分のプロファイルのみ参照・更新可能
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### word_sets テーブル
```sql
ALTER TABLE word_sets ENABLE ROW LEVEL SECURITY;

-- 自分の単語帳のみ全操作可能
CREATE POLICY "Users can only access own word sets" ON word_sets
  FOR ALL USING (auth.uid() = user_id);
```

#### user_card_stats テーブル
```sql
-- ユーザは自分のカード統計のみアクセス可能
ALTER TABLE user_card_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own card stats" ON user_card_stats
  FOR ALL USING (auth.uid() = user_id);
```

#### cards テーブル
```sql
-- カードは所属する単語帳の所有者のみアクセス可能
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access cards through owned word sets" ON cards
  FOR ALL USING (
    word_set_id IN (
      SELECT id FROM word_sets WHERE auth.uid() = user_id
    )
  );
```

## API エンドポイント設計

### 認証関連
```
POST /api/auth/signup     - ユーザー登録
POST /api/auth/signin     - ログイン
POST /api/auth/signout    - ログアウト
GET  /api/auth/user       - ユーザー情報取得
```

### 単語帳管理
```
GET    /api/word-sets            - 自分の単語帳一覧取得
POST   /api/word-sets            - 単語帳作成
GET    /api/word-sets/[id]       - 単語帳詳細取得
PUT    /api/word-sets/[id]       - 単語帳更新
DELETE /api/word-sets/[id]       - 単語帳削除
```

### CSV インポート/エクスポート
```
POST   /api/word-sets/import     - CSVファイルから単語帳作成
GET    /api/word-sets/[id]/export - 単語帳をCSVでエクスポート
POST   /api/word-sets/[id]/import-cards - 既存単語帳にCSVからカード追加
POST   /api/csv/validate         - CSVファイルの形式検証
POST   /api/csv/preview          - CSVファイルのプレビュー表示
```

### カード管理
```
GET    /api/word-sets/[id]/words     - カード一覧取得
POST   /api/word-sets/[id]/words     - カード追加
PUT    /api/words/[id]               - カード更新
DELETE /api/words/[id]               - カード削除
POST   /api/words/[id]/copy          - カードを自分の他の単語帳にコピー
POST   /api/words/[id]/move          - カードを自分の他の単語帳に移動
POST   /api/words/batch-copy         - 複数カードの一括コピー
POST   /api/words/batch-move         - 複数カードの一括移動
```

### カード統計・間違い記録
```
GET    /api/cards/[id]/stats         - カードの個人統計取得
PUT    /api/cards/[id]/stats         - カード統計更新（間違い回数など）
POST   /api/sessions/[id]/record     - セッション内の回答記録
GET    /api/users/mistake-cards      - 間違いの多いカード一覧
GET    /api/users/weak-cards         - 復習推奨カード一覧
```

### 学習セッション
```
POST /api/sessions                   - 学習セッション開始
PUT  /api/sessions/[id]              - セッション更新
POST /api/sessions/[id]/progress     - 単語回答記録
GET  /api/sessions/[id]/stats        - セッション統計取得
```

### 学習進捗・統計
```
GET /api/users/[id]/progress         - ユーザー全体の学習進捗
GET /api/cards/[id]/progress         - カード別学習履歴
GET /api/analytics/dashboard         - ダッシュボード用統計（個人データのみ）
GET /api/analytics/mistake-analysis  - 間違い分析レポート
GET /api/analytics/learning-trends   - 学習傾向分析
```

## レスポンシブ対応

### デスクトップ (768px以上)
- カードサイズ: 800px × 400px
- ボタンサイズ: 80px × 80px
- フォントサイズ: 英語 3rem、日本語 2.5rem

### モバイル (768px未満)
- カードサイズ: 350px高さに調整
- ボタンサイズ: 70px × 70px
- フォントサイズ: 英語 2.5rem、日本語 2rem
- プログレスバー: 120px幅に縮小

## 技術スタック

### フロントエンド
- **Next.js 14+**: React フレームワーク
- **React 18+**: UI ライブラリ
- **TypeScript**: 型安全性の確保
- **Tailwind CSS**: ユーティリティファーストCSS
- **CSS Modules/Styled Components**: コンポーネント単位のスタイリング

### バックエンド
- **Vercel Functions**: サーバーレス API エンドポイント
- **Next.js API Routes**: /api ディレクトリでの API 実装
- **Node.js**: ランタイム環境

### データベース・認証
- **Supabase**: PostgreSQL データベース + 認証
- **Supabase Auth**: ユーザー認証・セッション管理
- **Supabase Storage**: 音声ファイル等のメディアストレージ
- **Row Level Security (RLS)**: データアクセス制御

### デプロイ・インフラ
- **Vercel**: フロントエンド + API のホスティング
- **Vercel Analytics**: パフォーマンス監視
- **GitHub**: ソースコード管理・CI/CD

### 開発ツール
- **Claude Code**: AI アシスタントによる開発
- **ESLint + Prettier**: コード品質・フォーマット
- **Husky**: Git hooks でのコード品質チェック

### ブラウザ対応
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### パフォーマンス
- **初期表示**: 2秒以内
- **カード切り替え**: 300ms以内
- **アニメーション**: 60fps維持

## 今後の拡張予定

### 学習機能
- 間隔反復アルゴリズム（忘却曲線対応）
- 難易度別の復習スケジューリング
- 学習履歴とパフォーマンス分析

### データ管理
- 音声ファイルのアップロード・管理
- 画像カード機能
- より詳細な統計・分析機能

### UI/UX改善
- ダークモード切り替え
- 効果音とハプティックフィードバック
- より豊富なアニメーション効果

### その他
- オフライン対応
- 複数言語サポート
- モバイルアプリ化

## プロジェクト構成

```
tangolago/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 認証関連ページ
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/         # ダッシュボード
│   │   ├── word-sets/         # 単語帳管理
│   │   │   ├── [id]/          # 単語帳詳細・編集
│   │   │   │   ├── edit/      # カード管理
│   │   │   │   └── study/     # 学習開始
│   │   │   └── create/        # 新規作成
│   │   ├── study/             # 学習セッション
│   │   │   ├── [setId]/       # セッション実行
│   │   │   └── result/        # 結果表示
│   │   ├── api/               # API Routes（Supabase接続層）
│   │   │   ├── auth/          # 認証API
│   │   │   │   ├── signup/
│   │   │   │   ├── signin/
│   │   │   │   ├── signout/
│   │   │   │   └── user/
│   │   │   ├── word-sets/     # 単語帳API
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   ├── cards/         # カードAPI
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   ├── sessions/      # セッションAPI
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   ├── csv/           # CSV処理API
│   │   │   │   ├── import/
│   │   │   │   ├── export/
│   │   │   │   └── validate/
│   │   │   ├── analytics/     # 統計API
│   │   │   └── users/         # ユーザー関連API
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx           # ランディング
│   ├── components/            # React コンポーネント
│   │   ├── ui/               # 基本UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── CsvUploader.tsx # CSVアップロード
│   │   ├── features/         # 機能別コンポーネント
│   │   │   ├── flashcard/
│   │   │   │   ├── FlashCard.tsx
│   │   │   │   ├── SessionStats.tsx
│   │   │   │   ├── ControlButtons.tsx
│   │   │   │   └── ReverseToggle.tsx # 反転切り替え
│   │   │   ├── word-sets/
│   │   │   │   ├── WordSetList.tsx
│   │   │   │   ├── WordSetForm.tsx
│   │   │   │   └── WordSetSelector.tsx
│   │   │   ├── cards/
│   │   │   │   ├── CardList.tsx
│   │   │   │   ├── CardForm.tsx
│   │   │   │   ├── CardCopyModal.tsx
│   │   │   │   ├── CardMoveModal.tsx
│   │   │   │   └── HintButton.tsx # ヒント表示
│   │   │   ├── csv/
│   │   │   │   ├── CsvImportModal.tsx
│   │   │   │   ├── CsvPreview.tsx
│   │   │   │   └── CsvExportButton.tsx
│   │   │   └── auth/
│   │   └── layout/           # レイアウトコンポーネント
│   │       ├── Header.tsx
│   │       ├── Navigation.tsx
│   │       └── Footer.tsx
│   ├── lib/                  # ユーティリティ・設定
│   │   ├── supabase-server.ts # Supabase サーバーサイドクライアント
│   │   ├── api-client.ts    # フロントエンド用API クライアント
│   │   ├── auth.ts          # 認証ヘルパー（API経由）
│   │   ├── database.ts      # DB操作ヘルパー（サーバーサイドのみ）
│   │   ├── card-manager.ts  # カード操作ヘルパー
│   │   ├── csv-processor.ts # CSV処理ヘルパー
│   │   ├── validations.ts   # 入力値検証
│   │   └── utils.ts         # 汎用ユーティリティ
│   ├── hooks/               # カスタムフック（API経由）
│   │   ├── useAuth.ts       # 認証フック（API経由）
│   │   ├── useWordSets.ts   # 単語帳フック（API経由）
│   │   ├── useCards.ts      # カード操作（API経由）
│   │   ├── useStudySession.ts # セッション（API経由）
│   │   └── useCsvProcessor.ts # CSV処理（API経由）
│   ├── types/               # TypeScript 型定義
│   │   ├── database.ts      # データベース型
│   │   ├── api.ts           # API レスポンス型
│   │   ├── auth.ts          # 認証型
│   │   ├── study.ts         # 学習セッション型
│   │   ├── card-manager.ts  # カード操作の型
│   │   └── csv.ts           # CSV関連の型
│   └── styles/              # スタイル関連
│       ├── components.css
│       └── animations.css
├── supabase/               # Supabase関連ファイル
│   ├── migrations/         # SQLマイグレーション
│   ├── seed.sql           # テストデータ
│   └── schema.sql         # スキーマ定義
├── tests/                  # テストコード
│   ├── components/
│   ├── api/
│   └── utils/
├── docs/                   # ドキュメント
│   ├── api.md
│   ├── deployment.md
│   ├── supabase-setup.md   # Supabase設定手順
│   ├── architecture.md     # アーキテクチャ設計
│   └── development.md
├── scripts/                # ユーティリティスクリプト
│   ├── setup.sh
│   └── supabase-setup.sh   # Supabase初期設定
├── public/
│   ├── icons/
│   ├── audio/              # 音声ファイル
│   └── images/
├── compose.yml             # Docker Compose設定
├── .env.example            # 環境変数サンプル
├── .gitignore
├── README.md               # 日本語のREADME
├── CLAUDE.md               # Claude用設定
├── claude-rules/          # Claudeルール
│   └── 00-global.md
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 開発環境設定

### Docker環境
```yaml
# compose.yml (V2形式)
services:
  web:
    image: node:20-alpine
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      # サーバーサイドのみの環境変数
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    volumes:
      - .:/app
      - /app/node_modules
    working_dir: /app
    command: npm run dev

networks:
  default:
    name: tangolago_network
```

### 環境変数設定
```bash
# .env.example
# Supabase設定（サーバーサイドのみ）
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 認証設定（将来的にフロントエンド直接接続用）
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# アプリ設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# 本番環境URL
VERCEL_URL=your_vercel_app_url
```

### セットアップ手順
```bash
# プロジェクトクローン
git clone <repository>
cd tangolago

# 環境変数設定
cp .env.example .env
# .envファイルを編集してSupabaseの情報を設定

# Docker Composeでサービス起動
docker compose up -d

# 依存関係インストール（コンテナ内）
docker compose exec web npm install

# Supabaseテーブル作成（Supabase Dashboard で実行）
# または migration スクリプト実行
docker compose exec web npm run db:setup

# 開発サーバー起動確認
docker compose logs -f web
```

### 開発コマンド
```bash
# サービス起動
docker compose up -d

# ログ確認
docker compose logs -f web

# コンテナ内でコマンド実行
docker compose exec web npm run build
docker compose exec web npm run test
docker compose exec web npm run db:migrate

# サービス停止
docker compose down

# コンテナ再ビルド
docker compose up -d --build
```

### Supabase セットアップ
1. **プロジェクト作成**
    - Supabase ダッシュボードで新しいプロジェクトを作成
    - プロジェクトURLとAPIキーを取得

2. **データベーステーブル作成**
   ```sql
   -- SQL Editor で以下のSQLを実行
   -- profiles, word_sets, words, user_card_stats, learning_sessions, word_progress テーブル
   ```

3. **RLS ポリシー設定**
   ```sql
   -- Row Level Security ポリシーを設定
   -- ユーザーごとのデータアクセス制御
   ```

4. **認証設定**
    - Authentication → Settings でメール/パスワード認証を有効化
    - 必要に応じてソーシャルログインも設定