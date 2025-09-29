-- TanGOAlgo Database Schema
-- このスクリプトをSupabaseのSQL Editorで実行してください

-- ユーザープロファイルテーブル
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- カードセットテーブル
CREATE TABLE IF NOT EXISTS public.card_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- カードテーブル
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_set_id UUID REFERENCES public.card_sets(id) ON DELETE CASCADE NOT NULL,
    front_word TEXT NOT NULL,
    front_hint TEXT,
    front_description TEXT,
    back_word TEXT NOT NULL,
    back_hint TEXT,
    back_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 学習セッションテーブル
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    card_set_id UUID REFERENCES public.card_sets(id) ON DELETE CASCADE NOT NULL,
    total_cards INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    incorrect_answers INTEGER NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- カード学習結果テーブル（個別カードの学習記録）
CREATE TABLE IF NOT EXISTS public.card_study_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time INTEGER, -- ミリ秒
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) を有効化
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_study_results ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成

-- user_profiles ポリシー
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- card_sets ポリシー
CREATE POLICY "Users can view own card sets" ON public.card_sets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own card sets" ON public.card_sets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own card sets" ON public.card_sets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own card sets" ON public.card_sets
    FOR DELETE USING (auth.uid() = user_id);

-- cards ポリシー
CREATE POLICY "Users can view own cards" ON public.cards
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.card_sets WHERE id = cards.card_set_id
        )
    );

CREATE POLICY "Users can insert own cards" ON public.cards
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.card_sets WHERE id = cards.card_set_id
        )
    );

CREATE POLICY "Users can update own cards" ON public.cards
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.card_sets WHERE id = cards.card_set_id
        )
    );

CREATE POLICY "Users can delete own cards" ON public.cards
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM public.card_sets WHERE id = cards.card_set_id
        )
    );

-- study_sessions ポリシー
CREATE POLICY "Users can view own study sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- card_study_results ポリシー
CREATE POLICY "Users can view own card study results" ON public.card_study_results
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.study_sessions WHERE id = card_study_results.session_id
        )
    );

CREATE POLICY "Users can insert own card study results" ON public.card_study_results
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.study_sessions WHERE id = card_study_results.session_id
        )
    );

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_card_sets_user_id ON public.card_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_card_set_id ON public.cards(card_set_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_card_set_id ON public.study_sessions(card_set_id);
CREATE INDEX IF NOT EXISTS idx_card_study_results_session_id ON public.card_study_results(session_id);
CREATE INDEX IF NOT EXISTS idx_card_study_results_card_id ON public.card_study_results(card_id);

-- テスト用のダミーデータ（開発環境のみ）
-- 注意: 本番環境では実行しないでください
INSERT INTO public.user_profiles (id, username, email) VALUES
(gen_random_uuid(), 'testuser', 'info@kinokodata.net')
ON CONFLICT (email) DO NOTHING;

-- 関数: updated_at を自動更新する
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー: updated_at を自動更新
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_card_sets_updated_at
    BEFORE UPDATE ON public.card_sets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON public.cards
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 実行完了
SELECT 'TanGOAlgo database schema created successfully!' AS status;