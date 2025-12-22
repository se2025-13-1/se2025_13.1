-- ============================================================================
-- DIAGNOSTIC QUERY: Kiểm tra những order completed mà chưa cập nhật sold_count
-- ============================================================================

-- 1. Xem tất cả completed orders và số lượng sản phẩm đã bán
SELECT 
  o.id as order_id,
  o.user_id,
  o.status,
  o.created_at,
  o.updated_at,
  COUNT(oi.id) as total_items,
  SUM(oi.quantity) as total_quantity_sold,
  STRING_AGG(
    CONCAT(oi.product_name, ' (', oi.quantity, ')'), 
    ', ' 
  ) as products_sold
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'completed'
GROUP BY o.id
ORDER BY o.updated_at DESC;

-- ============================================================================
-- 2. Xem detailed: Mỗi sản phẩm và hiện tại sold_count là bao nhiêu
-- ============================================================================

SELECT 
  o.id as order_id,
  oi.product_name,
  oi.quantity,
  pv.product_id,
  p.sold_count as current_sold_count,
  oi.created_at as order_item_created_at,
  p.updated_at as product_last_updated
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN product_variants pv ON oi.product_variant_id = pv.id
JOIN products p ON pv.product_id = p.id
WHERE o.status = 'completed'
ORDER BY o.created_at DESC, p.name;

-- ============================================================================
-- 3. Tìm những order items có thể chưa được cộng vào sold_count
-- (So sánh với timestamp - nếu order item tạo trước khi script implement)
-- ============================================================================

SELECT 
  CONCAT(o.id, ' - ', oi.product_name) as order_product,
  o.status,
  o.created_at as when_order_completed,
  oi.quantity,
  p.sold_count as current_sold_count,
  COUNT(*) OVER (PARTITION BY oi.product_id) as total_items_for_this_product
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN product_variants pv ON oi.product_variant_id = pv.id
JOIN products p ON pv.product_id = p.id
WHERE o.status = 'completed'
ORDER BY o.created_at ASC;

-- ============================================================================
-- 4. RESET sold_count to 0 (nếu muốn reset toàn bộ để test lại)
-- ⚠️  CHỈ CHẠY NẾU BẠN MUỐN RESET!
-- ============================================================================

-- UPDATE products SET sold_count = 0 WHERE sold_count > 0;
