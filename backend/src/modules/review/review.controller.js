import { ReviewService } from "./review.service.js";

export const ReviewController = {
  async create(req, res) {
    try {
      const userId = req.user.id;
      const { order_item_id, rating, comment, images } = req.body;

      if (!order_item_id)
        return res.status(400).json({ error: "Thiếu order_item_id" });

      const review = await ReviewService.createReview(userId, {
        order_item_id,
        rating,
        comment,
        images,
      });

      return res.status(201).json({ message: "Đánh giá thành công", review });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async listByProduct(req, res) {
    try {
      const { productId } = req.params;
      const reviews = await ReviewService.getProductReviews(
        productId,
        req.query
      );
      return res.json({ reviews });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async listByOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const reviews = await ReviewService.getOrderReviews(orderId, userId);
      return res.json({ reviews });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
