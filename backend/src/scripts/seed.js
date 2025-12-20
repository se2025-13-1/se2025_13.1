import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { pgPool } from "../config/postgres.js";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình số lượng
const NUM_USERS = 10;
const NUM_CATEGORIES = 5;
const NUM_PRODUCTS = 20;
const NUM_ORDERS = 30;

// ✅ Hàm helper: Sinh số điện thoại an toàn (luôn 10 số)
const generatePhone = () => {
  return "09" + faker.string.numeric(8); // VD: 0912345678
};

const seed = async () => {
  const client = await pgPool.connect();

  try {
    console.log("🌱 Bắt đầu Seeding dữ liệu (Phiên bản Fix lỗi)...");
    await client.query("BEGIN");

    // 1. DỌN DẸP DỮ LIỆU CŨ
    console.log("🧹 Đang xóa dữ liệu cũ...");
    await client.query(
      "TRUNCATE TABLE reviews, order_items, orders, cart_items, carts, vouchers, vouchers, user_addresses, user_profiles, auth_providers, product_images, product_variants, products, categories, auth_users RESTART IDENTITY CASCADE"
    );

    // 2. TẠO USER
    console.log(`👤 Đang tạo ${NUM_USERS} người dùng...`);
    const userIds = [];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123123", salt);

    // Admin
    const adminRes = await client.query(
      `INSERT INTO auth_users (email, password_hash, role, is_active) VALUES ($1, $2, 'admin', true) RETURNING id`,
      ["admin@gmail.com", hashedPassword]
    );
    await client.query(
      `INSERT INTO user_profiles (user_id, full_name, phone) VALUES ($1, 'Super Admin', '0900000000')`,
      [adminRes.rows[0].id]
    );
    userIds.push(adminRes.rows[0].id);

    // Customer
    for (let i = 0; i < NUM_USERS; i++) {
      const email = faker.internet.email().toLowerCase();
      const res = await client.query(
        `INSERT INTO auth_users (email, password_hash, role) VALUES ($1, $2, 'customer') RETURNING id`,
        [email, hashedPassword]
      );
      const userId = res.rows[0].id;
      userIds.push(userId);

      // ✅ FIX: Dùng generatePhone() và slice() cho gender
      const gender = faker.person.sexType().slice(0, 10); // Cắt ngắn để chắc chắn < 20

      await client.query(
        `INSERT INTO user_profiles (user_id, full_name, avatar_url, phone, gender) VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          faker.person.fullName(),
          faker.image.avatar(),
          generatePhone(), // Số điện thoại an toàn
          gender,
        ]
      );

      // ✅ FIX: Dùng generatePhone() cho recipient_phone
      await client.query(
        `INSERT INTO user_addresses (user_id, recipient_name, recipient_phone, province, district, ward, address_detail, is_default) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
        [
          userId,
          faker.person.fullName(),
          generatePhone(), // Số điện thoại an toàn
          faker.location.state(),
          faker.location.city(),
          "Phường " + faker.location.street(),
          faker.location.streetAddress(),
        ]
      );
    }

    // 3. TẠO DANH MỤC
    console.log(`📂 Đang tạo ${NUM_CATEGORIES} danh mục...`);
    const categoryIds = [];
    const catNames = ["Áo Nam", "Quần Nam", "Áo Nữ", "Quần Nữ", "Phụ Kiện"];

    for (const name of catNames) {
      const slug = faker.helpers.slugify(name).toLowerCase();
      const res = await client.query(
        `INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id`,
        [name, slug]
      );
      categoryIds.push(res.rows[0].id);
    }

    // 4. TẠO SẢN PHẨM
    console.log(`👕 Đang tạo ${NUM_PRODUCTS} sản phẩm...`);
    const variantIds = [];

    for (let i = 0; i < NUM_PRODUCTS; i++) {
      const catId = faker.helpers.arrayElement(categoryIds);
      const name = faker.commerce.productName();
      const slug = faker.helpers.slugify(name).toLowerCase() + "-" + Date.now();
      const price = faker.commerce.price({ min: 100000, max: 1000000, dec: 0 });

      const prodRes = await client.query(
        `INSERT INTO products (category_id, name, slug, description, base_price, is_active) 
         VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
        [catId, name, slug, faker.commerce.productDescription(), price]
      );
      const prodId = prodRes.rows[0].id;

      const imgBase = `https://loremflickr.com/640/480/fashion?lock=${i}`;
      await client.query(
        `INSERT INTO product_images (product_id, image_url, display_order) VALUES ($1, $2, 0)`,
        [prodId, imgBase]
      );

      const colors = ["Red", "Blue", "Black", "White"];
      const sizes = ["S", "M", "L", "XL"];
      const selectedColors = faker.helpers.arrayElements(colors, 2);

      for (const color of selectedColors) {
        const size = faker.helpers.arrayElement(sizes);
        const sku = `${slug}-${color}-${size}`.toUpperCase().slice(0, 49); // ✅ Cắt ngắn SKU < 50

        const varRes = await client.query(
          `INSERT INTO product_variants (product_id, sku, color, size, price, stock_quantity)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            prodId,
            sku,
            color,
            size,
            price,
            faker.number.int({ min: 0, max: 100 }),
          ]
        );

        variantIds.push({
          id: varRes.rows[0].id,
          price: price,
          prodId: prodId,
        });

        await client.query(
          `INSERT INTO product_images (product_id, image_url, color_ref, display_order) VALUES ($1, $2, $3, 1)`,
          [
            prodId,
            `https://loremflickr.com/640/480/clothing,${color}?lock=${i}`,
            color,
          ]
        );
      }
    }

    // 5. TẠO VOUCHER
    console.log("🎫 Đang tạo Voucher...");
    await client.query(`
      INSERT INTO vouchers (code, discount_type, discount_value, min_order_value, start_date, end_date, usage_limit)
      VALUES 
      ('WELCOME', 'fixed', 50000, 0, NOW(), NOW() + INTERVAL '1 year', 1000),
      ('SALE10', 'percent', 10, 200000, NOW(), NOW() + INTERVAL '1 month', 100)
    `);

    // 6. TẠO ĐƠN HÀNG
    console.log(`📦 Đang tạo ${NUM_ORDERS} đơn hàng mẫu...`);

    for (let i = 0; i < NUM_ORDERS; i++) {
      const userId = faker.helpers.arrayElement(userIds);
      const status = faker.helpers.arrayElement([
        "pending",
        "shipping",
        "completed",
        "cancelled",
      ]);
      const selectedVariants = faker.helpers.arrayElements(
        variantIds,
        faker.number.int({ min: 1, max: 3 })
      );

      let subtotal = 0;
      const itemsData = [];

      for (const v of selectedVariants) {
        const qty = faker.number.int({ min: 1, max: 3 });
        subtotal += Number(v.price) * qty;
        itemsData.push({ ...v, qty });
      }

      const shippingFee = 30000;
      const total = subtotal + shippingFee;

      const shippingInfo = {
        recipient_name: faker.person.fullName(),
        phone: generatePhone(), // ✅ Dùng số an toàn
        address: faker.location.streetAddress(),
      };

      const orderRes = await client.query(
        `INSERT INTO orders (user_id, shipping_info, subtotal_amount, shipping_fee, total_amount, status, payment_method)
         VALUES ($1, $2, $3, $4, $5, $6, 'cod') RETURNING id`,
        [
          userId,
          JSON.stringify(shippingInfo),
          subtotal,
          shippingFee,
          total,
          status,
        ]
      );
      const orderId = orderRes.rows[0].id;

      for (const item of itemsData) {
        await client.query(
          `INSERT INTO order_items (order_id, product_variant_id, quantity, unit_price, total_price, product_name)
           VALUES ($1, $2, $3, $4, $5, 'Fake Product Name')`,
          [orderId, item.id, item.qty, item.price, item.price * item.qty]
        );

        if (status === "completed") {
          // Kiểm tra xem bảng products có cột sold_count chưa trước khi update
          // Để an toàn, ta dùng try-catch cho lệnh này hoặc bỏ qua nếu chưa migrate
          try {
            await client.query(
              `UPDATE products SET sold_count = sold_count + $1 WHERE id = $2`,
              [item.qty, item.prodId]
            );
          } catch (e) {
            // Bỏ qua nếu chưa có cột sold_count
          }
        }
      }
    }

    await client.query("COMMIT");
    console.log("✅ SEEDING HOÀN TẤT! Dữ liệu đã sẵn sàng.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Lỗi Seeding:", err);
  } finally {
    client.release();
    process.exit();
  }
};

seed();
