const { createClient } = require('@supabase/supabase-js')

// .envファイルを読み込み
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database schema...')

    // まず基本的なテーブルを作成
    console.log('Creating card_sets table...')
    const { error: cardSetsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.card_sets (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `
    })

    if (cardSetsError && !cardSetsError.message.includes('already exists')) {
      console.error('Card sets table error:', cardSetsError)
    } else {
      console.log('✅ card_sets table ready')
    }

    console.log('Creating cards table...')
    const { error: cardsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.cards (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          card_set_id UUID NOT NULL,
          front_word TEXT NOT NULL,
          front_hint TEXT,
          front_description TEXT,
          back_word TEXT NOT NULL,
          back_hint TEXT,
          back_description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `
    })

    if (cardsError && !cardsError.message.includes('already exists')) {
      console.error('Cards table error:', cardsError)
    } else {
      console.log('✅ cards table ready')
    }

    // テスト用のダミーデータを挿入
    console.log('Creating test data...')

    // テスト用の単語帳を作成
    const { data: cardSet, error: insertError } = await supabase
      .from('card_sets')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // ダミーのユーザーID
        title: 'TOEIC基礎単語',
        description: 'TOEIC頻出の基礎単語500選'
      })
      .select()
      .single()

    if (insertError) {
      console.log('Card set may already exist:', insertError.message)

      // 既存のカードセットを取得
      const { data: existingCardSet } = await supabase
        .from('card_sets')
        .select('*')
        .eq('title', 'TOEIC基礎単語')
        .single()

      if (existingCardSet) {
        console.log('✅ Using existing card set')

        // テストカードを追加
        const { error: cardInsertError } = await supabase
          .from('cards')
          .insert([
            {
              card_set_id: existingCardSet.id,
              front_word: 'Algorithm',
              front_hint: '/ˈælɡərɪðəm/',
              front_description: 'A step-by-step procedure for calculations',
              back_word: 'アルゴリズム',
              back_hint: '手順',
              back_description: '計算や問題解決のための段階的な手順'
            },
            {
              card_set_id: existingCardSet.id,
              front_word: 'Database',
              front_hint: '/ˈdeɪtəbeɪs/',
              front_description: 'A collection of organized information',
              back_word: 'データベース',
              back_hint: '情報の集合',
              back_description: '組織化された情報の集合体'
            }
          ])

        if (cardInsertError) {
          console.log('Cards may already exist:', cardInsertError.message)
        } else {
          console.log('✅ Test cards created')
        }
      }
    } else {
      console.log('✅ Test card set created:', cardSet.title)

      // カードを追加
      const { error: cardInsertError } = await supabase
        .from('cards')
        .insert([
          {
            card_set_id: cardSet.id,
            front_word: 'Algorithm',
            front_hint: '/ˈælɡərɪðəm/',
            front_description: 'A step-by-step procedure for calculations',
            back_word: 'アルゴリズム',
            back_hint: '手順',
            back_description: '計算や問題解決のための段階的な手順'
          },
          {
            card_set_id: cardSet.id,
            front_word: 'Database',
            front_hint: '/ˈdeɪtəbeɪs/',
            front_description: 'A collection of organized information',
            back_word: 'データベース',
            back_hint: '情報の集合',
            back_description: '組織化された情報の集合体'
          }
        ])

      if (cardInsertError) {
        console.error('Error creating cards:', cardInsertError)
      } else {
        console.log('✅ Test cards created')
      }
    }

    console.log('\n🚀 Database setup complete!')
    console.log('📊 You can now test the application')

  } catch (err) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
}

setupDatabase()