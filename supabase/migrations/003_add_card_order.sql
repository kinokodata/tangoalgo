-- カードに順序を保存するカラムを追加（小数点対応）
ALTER TABLE cards
ADD COLUMN display_order DECIMAL(16,4) DEFAULT 0;

-- 既存のカードに順序を設定（作成日時順）
WITH ordered_cards AS (
    SELECT
        id,
        card_set_id,
        ROW_NUMBER() OVER (PARTITION BY card_set_id ORDER BY created_at) * 1000 as order_num
    FROM cards
)
UPDATE cards
SET display_order = ordered_cards.order_num
FROM ordered_cards
WHERE cards.id = ordered_cards.id;

-- インデックスを追加（検索パフォーマンス向上のため）
CREATE INDEX idx_cards_display_order ON cards(card_set_id, display_order);

-- display_orderをNOT NULLに変更
ALTER TABLE cards ALTER COLUMN display_order SET NOT NULL;