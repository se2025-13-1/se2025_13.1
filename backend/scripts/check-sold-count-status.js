/**
 * DIAGNOSTIC SCRIPT: Kiểm tra trạng thái sold_count
 *
 * Mục đích: Xem có bao nhiêu completed orders chưa được cập nhật sold_count
 *
 * Cách chạy:
 *   node scripts/check-sold-count-status.js
 */

import { pgPool } from "../src/config/postgres.js";

async function checkSoldCountStatus() {
  const client = await pgPool.connect();

  try {
    console.log("\n🔍 [DIAGNOSTIC] Checking sold_count status...\n");

    // Query 1: Tổng số completed orders
    const completedOrdersQuery = `
      SELECT COUNT(*) as total_completed_orders
      FROM orders
      WHERE status = 'completed'
    `;

    const completedResult = await client.query(completedOrdersQuery);
    const totalCompletedOrders = completedResult.rows[0].total_completed_orders;

    console.log(`📊 Total completed orders: ${totalCompletedOrders}\n`);

    // Query 2: Xem chi tiết từng order
    const detailsQuery = `
      SELECT 
        o.id as order_id,
        o.user_id,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count,
        STRING_AGG(
          CONCAT(oi.product_name, ' x', oi.quantity), 
          ' | ' 
        ) as items,
        STRING_AGG(
          CAST(oi.quantity as TEXT), 
          ',' 
        ) as quantities
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'completed'
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 20
    `;

    const detailsResult = await client.query(detailsQuery);
    const orders = detailsResult.rows;

    console.log("📋 Recent completed orders:\n");

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      console.log(`${i + 1}. Order: ${order.order_id}`);
      console.log(`   User: ${order.user_id}`);
      console.log(`   Created: ${order.created_at}`);
      console.log(`   Items (${order.item_count}): ${order.items}`);
      console.log(`   Quantities: ${order.quantities}`);
      console.log();
    }

    // Query 3: Kiểm tra sản phẩm có sold_count > 0 không
    const productsWithSalesQuery = `
      SELECT 
        p.id,
        p.name,
        p.sold_count,
        COUNT(oi.id) as total_items_sold
      FROM products p
      LEFT JOIN order_items oi ON EXISTS (
        SELECT 1 FROM product_variants pv 
        WHERE pv.product_id = p.id 
        AND pv.id = oi.product_variant_id
        AND EXISTS (
          SELECT 1 FROM orders o 
          WHERE o.id = oi.order_id 
          AND o.status = 'completed'
        )
      )
      WHERE p.sold_count > 0 OR p.id IN (
        SELECT DISTINCT pv.product_id
        FROM order_items oi
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status = 'completed'
      )
      GROUP BY p.id
      ORDER BY p.sold_count DESC
      LIMIT 20
    `;

    const productsResult = await client.query(productsWithSalesQuery);
    const products = productsResult.rows;

    console.log("🏆 Products with sales:\n");

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`${i + 1}. ${product.name}`);
      console.log(`   Current sold_count: ${product.sold_count}`);
      console.log(
        `   Total items in completed orders: ${product.total_items_sold}`
      );
      console.log();
    }

    // Summary
    console.log("=".repeat(70));
    console.log("📌 SUMMARY");
    console.log("=".repeat(70));
    console.log(`✅ Total completed orders: ${totalCompletedOrders}`);
    console.log(`📦 First 20 orders shown above`);
    console.log(`🏆 Products with sales shown above\n`);

    if (totalCompletedOrders > 0 && products.length > 0) {
      console.log("⚠️  If sold_count doesn't match items in orders,");
      console.log("    run: node scripts/fix-sold-count.js\n");
    }
  } catch (err) {
    console.error("❌ [DIAGNOSTIC] Error:", err);
  } finally {
    client.release();
    await pgPool.end();
  }
}

// Chạy script
checkSoldCountStatus().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
