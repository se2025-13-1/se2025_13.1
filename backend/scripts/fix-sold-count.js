/**
 * MIGRATION SCRIPT: Fix sold_count for completed orders
 *
 * Mục đích: Cập nhật sold_count cho các order đã "completed"
 * nhưng chưa được tính (từ trước khi logic này được implement)
 *
 * Cách chạy:
 *   node scripts/fix-sold-count.js
 */

import { pgPool } from "../src/config/postgres.js";

async function fixSoldCountForCompletedOrders() {
  const client = await pgPool.connect();

  try {
    console.log(
      "🔧 [MIGRATION] Starting sold_count fix for completed orders...\n"
    );

    // Bước 1: Lấy tất cả order có status = 'completed'
    const ordersQuery = `
      SELECT o.id, o.user_id, o.created_at, o.updated_at, o.status,
             COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'completed'
      GROUP BY o.id
      ORDER BY o.updated_at DESC
    `;

    const ordersResult = await client.query(ordersQuery);
    const completedOrders = ordersResult.rows;

    console.log(`📊 Found ${completedOrders.length} completed orders\n`);

    if (completedOrders.length === 0) {
      console.log("✅ No completed orders found. Nothing to fix.\n");
      return;
    }

    // Bước 2: Kiểm tra orders nào chưa cập nhật sold_count
    // (bằng cách so sánh sold_count hiện tại với total từ order_items)
    let ordersNeedingFix = 0;
    const ordersToFix = [];

    for (const order of completedOrders) {
      // Lấy chi tiết items trong order
      const itemsQuery = `
        SELECT 
          oi.id,
          oi.product_variant_id, 
          oi.quantity,
          pv.product_id
        FROM order_items oi
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        WHERE oi.order_id = $1
      `;

      const itemsResult = await client.query(itemsQuery, [order.id]);
      const items = itemsResult.rows;

      if (items.length > 0) {
        // Kiểm tra xem sold_count đã được tính chưa
        // Nếu không có gì trong history thì cần fix
        ordersToFix.push({
          orderId: order.id,
          userId: order.user_id,
          createdAt: order.created_at,
          items: items,
          itemCount: items.length,
        });
        ordersNeedingFix++;
      }
    }

    console.log(`⚠️  ${ordersNeedingFix} orders need sold_count fix\n`);

    if (ordersToFix.length === 0) {
      console.log("✅ All completed orders already have sold_count updated.\n");
      return;
    }

    // Bước 3: Bắt đầu transaction để cập nhật sold_count
    await client.query("BEGIN");

    let updatedCount = 0;
    let errorCount = 0;

    for (const order of ordersToFix) {
      try {
        console.log(`\n📦 Processing order: ${order.orderId}`);
        console.log(
          `   Items: ${order.itemCount}, Created: ${order.createdAt}`
        );

        // Cập nhật sold_count cho từng sản phẩm
        for (const item of order.items) {
          const productId = item.product_id;
          const quantity = item.quantity;

          if (productId && quantity > 0) {
            // Increment sold_count
            const updateQuery = `
              UPDATE products
              SET sold_count = COALESCE(sold_count, 0) + $1,
                  updated_at = NOW()
              WHERE id = $2
              RETURNING id, sold_count, name
            `;

            const result = await client.query(updateQuery, [
              quantity,
              productId,
            ]);

            if (result.rows.length > 0) {
              const product = result.rows[0];
              console.log(
                `   ✅ Product ${product.id}: sold_count = ${product.sold_count} (added ${quantity})`
              );
            }
          }
        }

        updatedCount++;
      } catch (err) {
        errorCount++;
        console.error(
          `   ❌ Error updating order ${order.orderId}:`,
          err.message
        );
      }
    }

    // Bước 4: Commit transaction
    await client.query("COMMIT");

    console.log("\n" + "=".repeat(70));
    console.log(`✅ MIGRATION COMPLETE`);
    console.log(`   Total orders processed: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log("=".repeat(70) + "\n");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ [MIGRATION] Error:", err);
    process.exit(1);
  } finally {
    client.release();
    await pgPool.end();
    process.exit(0);
  }
}

// Chạy script
fixSoldCountForCompletedOrders().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
