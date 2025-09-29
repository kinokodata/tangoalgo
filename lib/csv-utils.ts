// CSVユーティリティ関数

export interface CardData {
  front_word?: string
  frontWord?: string
  front_hint?: string
  frontHint?: string
  front_description?: string
  frontDescription?: string
  back_word?: string
  backWord?: string
  back_hint?: string
  backHint?: string
  back_description?: string
  backDescription?: string
}

export function exportToCSV(cards: CardData[], filename: string = 'flashcards.csv') {
  // CSVヘッダー
  const headers = [
    '表面の単語',
    '表面のヒント',
    '表面の説明',
    '裏面の単語',
    '裏面のヒント',
    '裏面の説明'
  ]

  // データを CSV 形式に変換
  const csvContent = [
    headers.join(','),
    ...cards.map(card => [
      escapeCsvField(card.front_word || card.frontWord || ''),
      escapeCsvField(card.front_hint || card.frontHint || ''),
      escapeCsvField(card.front_description || card.frontDescription || ''),
      escapeCsvField(card.back_word || card.backWord || ''),
      escapeCsvField(card.back_hint || card.backHint || ''),
      escapeCsvField(card.back_description || card.backDescription || '')
    ].join(','))
  ].join('\n')

  // BOM付きUTF-8でエンコード（Excelで正しく表示されるため）
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })

  // ダウンロードリンクを作成
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  // ダウンロードを実行
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // メモリを解放
  URL.revokeObjectURL(url)
}

// CSVフィールドのエスケープ処理
function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    // ダブルクォートをエスケープして、全体をダブルクォートで囲む
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

// CSVインポート用のパース関数
export function parseCSV(csvContent: string): CardData[] {
  const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line)

  if (lines.length < 2) {
    throw new Error('CSVファイルが空または無効です')
  }

  // ヘッダー行をスキップ
  const dataLines = lines.slice(1)

  const cards: CardData[] = []

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i]
    const fields = parseCSVLine(line)

    if (fields.length < 6) {
      console.warn(`行 ${i + 2}: フィールド数が不足しています`)
      continue
    }

    // 必須フィールド（表面と裏面の単語）が空でないかチェック
    if (!fields[0].trim() || !fields[3].trim()) {
      console.warn(`行 ${i + 2}: 表面または裏面の単語が空です`)
      continue
    }

    cards.push({
      front_word: fields[0].trim(),
      front_hint: fields[1].trim() || undefined,
      front_description: fields[2].trim() || undefined,
      back_word: fields[3].trim(),
      back_hint: fields[4].trim() || undefined,
      back_description: fields[5].trim() || undefined
    })
  }

  return cards
}

// CSV行のパース（カンマ区切り、ダブルクォート対応）
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // エスケープされたダブルクォート
        current += '"'
        i += 2
      } else {
        // クォートの開始/終了
        inQuotes = !inQuotes
        i++
      }
    } else if (char === ',' && !inQuotes) {
      // フィールドの区切り
      result.push(current)
      current = ''
      i++
    } else {
      current += char
      i++
    }
  }

  // 最後のフィールドを追加
  result.push(current)

  return result
}

// CSVテンプレートの生成
export function generateCSVTemplate(): string {
  const headers = [
    '表面の単語',
    '表面のヒント',
    '表面の説明',
    '裏面の単語',
    '裏面のヒント',
    '裏面の説明'
  ]

  const sampleData = [
    ['Hello', '/həˈloʊ/', 'A greeting', 'こんにちは', '挨拶', '人に会ったときの挨拶'],
    ['Thank you', '/θæŋk juː/', 'Expression of gratitude', 'ありがとう', '感謝', '感謝の気持ちを表す言葉'],
    ['Good morning', '/ɡʊd ˈmɔːrnɪŋ/', 'Morning greeting', 'おはよう', '朝の挨拶', '朝に使う挨拶']
  ]

  return [
    headers.join(','),
    ...sampleData.map(row => row.map(field => escapeCsvField(field)).join(','))
  ].join('\n')
}

// CSVテンプレートのダウンロード
export function downloadCSVTemplate(filename: string = 'flashcard_template.csv') {
  const csvContent = generateCSVTemplate()
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })

  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}