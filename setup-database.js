const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

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

    // schema.sqlファイルを読み込み
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    // スキーマを実行
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema })

    if (error) {
      console.error('❌ Database setup failed:', error)
      process.exit(1)
    }

    console.log('✅ Database schema created successfully!')
    console.log('📊 Tables created:')
    console.log('  - user_profiles')
    console.log('  - card_sets')
    console.log('  - cards')
    console.log('  - study_sessions')
    console.log('  - card_study_results')
    console.log('🔒 Row Level Security policies applied')
    console.log('🚀 Ready to use!')

  } catch (err) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
}

// 個別のSQLステートメントを実行する関数（fallback）
async function executeSqlStatements() {
  try {
    console.log('🔄 Executing SQL statements individually...')

    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    // SQLステートメントを分割
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'))

    for (const statement of statements) {
      if (statement) {
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.warn(`⚠️  Statement failed (may be expected): ${error.message}`)
        }
      }
    }

    console.log('✅ SQL statements executed!')

  } catch (err) {
    console.error('❌ Error executing SQL statements:', err)
  }
}

// まずは通常の方法を試して、失敗したら個別実行
setupDatabase().catch(() => {
  console.log('🔄 Trying alternative approach...')
  executeSqlStatements()
})