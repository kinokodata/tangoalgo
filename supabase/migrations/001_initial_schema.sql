-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- profiles テーブル（ユーザープロファイル）
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- card_sets テーブル（カードセット）
CREATE TABLE card_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- cards テーブル（カード）
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_set_id UUID REFERENCES card_sets(id) ON DELETE CASCADE,

  -- 表面情報
  front_word TEXT NOT NULL,
  front_hint TEXT,
  front_description TEXT,

  -- 裏面情報
  back_word TEXT NOT NULL,
  back_hint TEXT,
  back_description TEXT,

  -- メタ情報
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- user_card_stats テーブル（ユーザ別カード統計）
CREATE TABLE user_card_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,

  -- スコア管理
  score INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,

  -- 詳細統計
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,

  -- 学習状況
  last_studied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- ユーザ×カードの組み合わせは一意
  UNIQUE(user_id, card_id)
);

-- learning_sessions テーブル（学習セッション）
CREATE TABLE learning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  card_set_id UUID REFERENCES card_sets(id),

  -- 学習設定
  is_reversed BOOLEAN DEFAULT false,
  is_random_order BOOLEAN DEFAULT true,

  -- セッション情報
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_words INTEGER,
  correct_words INTEGER,
  accuracy DECIMAL(5,2)
);

-- card_progress テーブル（カード別学習進捗）
CREATE TABLE card_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  card_id UUID REFERENCES cards(id),
  session_id UUID REFERENCES learning_sessions(id),
  is_correct BOOLEAN,
  response_time INTEGER,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- インデックス作成
CREATE INDEX idx_card_sets_user ON card_sets(user_id, created_at);
CREATE INDEX idx_cards_card_set ON cards(card_set_id);
CREATE INDEX idx_cards_front_word ON cards(front_word);
CREATE INDEX idx_cards_back_word ON cards(back_word);
CREATE INDEX idx_user_card_stats_user ON user_card_stats(user_id);
CREATE INDEX idx_user_card_stats_score ON user_card_stats(user_id, score);
CREATE INDEX idx_user_card_stats_attempts ON user_card_stats(user_id, total_attempts);
CREATE INDEX idx_user_card_stats_last_studied ON user_card_stats(user_id, last_studied_at);

-- Row Level Security (RLS) ポリシー
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_card_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_progress ENABLE ROW LEVEL SECURITY;

-- profiles テーブルのRLSポリシー
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- card_sets テーブルのRLSポリシー
CREATE POLICY "Users can view own card sets" ON card_sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own card sets" ON card_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own card sets" ON card_sets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own card sets" ON card_sets
  FOR DELETE USING (auth.uid() = user_id);

-- cards テーブルのRLSポリシー
CREATE POLICY "Users can access cards through owned card sets" ON cards
  FOR ALL USING (
    card_set_id IN (
      SELECT id FROM card_sets WHERE auth.uid() = user_id
    )
  );

-- user_card_stats テーブルのRLSポリシー
CREATE POLICY "Users can access own card stats" ON user_card_stats
  FOR ALL USING (auth.uid() = user_id);

-- learning_sessions テーブルのRLSポリシー
CREATE POLICY "Users can access own learning sessions" ON learning_sessions
  FOR ALL USING (auth.uid() = user_id);

-- card_progress テーブルのRLSポリシー
CREATE POLICY "Users can access own card progress" ON card_progress
  FOR ALL USING (auth.uid() = user_id);

-- トリガー関数：updated_atを自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_atトリガーを各テーブルに設定
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_sets_updated_at BEFORE UPDATE ON card_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_card_stats_updated_at BEFORE UPDATE ON user_card_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();