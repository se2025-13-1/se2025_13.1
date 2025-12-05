import { ReviewRepository } from "./review.repository.js";

export const ReviewService = {
  async createReview(userId, { order_item_id, rating, comment, images }) {
    // 1. Validate input
    if (!rating || rating < 1 || rating > 5)
      throw new Error("Số sao phải từ 1 đến 5");

    // 2. Kiểm tra quyền Review (Verified Purchase)
    const orderItem = await ReviewRepository.findOrderItemForValidation(
      order_item_id,
      userId
    );

    if (!orderItem) {
      throw new Error("Không tìm thấy sản phẩm trong lịch sử mua hàng của bạn");
    }

    // 3. Kiểm tra trạng thái đơn hàng
    if (orderItem.order_status !== "completed") {
      throw new Error(
        "Bạn chỉ có thể đánh giá khi đơn hàng đã hoàn thành (Giao thành công)"
      );
    }

    // 4. Tạo Review (Database có constraint UNIQUE nên nếu trùng sẽ tự báo lỗi)
    try {
      const review = await ReviewRepository.create({
        userId,
        productId: orderItem.product_id, // Lấy product_id từ orderItem
        orderItemId: order_item_id,
        rating,
        comment,
        images: images || [],
      });

      // 5. Tính lại điểm trung bình cho sản phẩm (Chạy ngầm, không cần await nếu muốn nhanh)
      await ReviewRepository.updateProductStats(orderItem.product_id);

      return review;
    } catch (err) {
      if (err.code === "23505") {
        // Mã lỗi Duplicate Key của Postgres
        throw new Error("Bạn đã đánh giá sản phẩm này rồi");
      }
      throw err;
    }
  },

  async getProductReviews(productId, query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    return await ReviewRepository.findByProductId(productId, { limit, offset });
  },
};
