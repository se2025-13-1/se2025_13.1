// API client with token management for backend integration
const API_URL = "http://127.0.0.1:3000/api";

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
  // Bổ sung các field có thể trả về từ backend
  product?: T;
  products?: T;
  categories?: T;
  url?: string; // Cho upload
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem("accessToken");
  }
  // Set JWT token
  setToken(token: string): void {
    localStorage.setItem("accessToken", token);
  }

  // Clear JWT token (logout)
  clearToken(): void {
    localStorage.removeItem("accessToken");
  }

  // Build headers with auth
  private getHeaders(isJson = true): Record<string, string> {
    const headers: Record<string, string> = {};
    if (isJson) {
      headers["Content-Type"] = "application/json";
    }
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  // Generic fetch wrapper with error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(
            options.method !== "GET" && !(options.body instanceof FormData)
          ),
          ...options.headers,
        },
      });

      const contentType = response.headers.get("content-type");
      let body: any = null;

      if (contentType?.includes("application/json")) {
        body = await response.json();
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = "/login";
        }
        throw new Error(
          body?.error || body?.message || `HTTP ${response.status}`
        );
      }

      // Chuẩn hóa dữ liệu trả về
      // Backend trả về { product: ... } hoặc { categories: ... } hoặc { vouchers: [...] } hoặc { voucher: {...} } hoặc { data: ... }
      let responseData = body;
      if (body?.data) responseData = body.data;
      else if (body?.product) responseData = body.product;
      else if (body?.products) responseData = body.products;
      else if (body?.categories) responseData = body.categories;
      else if (body?.voucher) responseData = body.voucher;
      else if (body?.vouchers) responseData = body.vouchers;
      else if (body?.orders) responseData = body.orders;
      else if (body?.url) responseData = body.url; // Cho upload

      return {
        data: responseData,
        message: body?.message,
        status: response.status,
      };
    } catch (err: any) {
      console.error(`API Error [${endpoint}]:`, err);
      return {
        error: err.message || "Network error",
        status: 0,
      };
    }
  }

  // AUTH ENDPOINTS
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(
    name: string,
    email: string,
    password: string,
    phone: string
  ): Promise<ApiResponse<any>> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone }),
    });
  }

  async verifyOTP(email: string, otp: string): Promise<ApiResponse<any>> {
    return this.request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  }

  // UPLOAD IMAGE (Mới thêm)
  async uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("image", file); // Key phải là "image" khớp với backend multer

    // Lưu ý: Không set Content-Type header, để browser tự set multipart/form-data
    const res = await this.request<string>("/upload", {
      method: "POST",
      body: formData,
    });

    if (res.data && typeof res.data === "string") {
      return res.data; // Trả về URL ảnh
    }
    return null;
  }

  // CATEGORIES ENDPOINTS
  async getCategories(): Promise<ApiResponse<any[]>> {
    // Gọi endpoint lấy danh sách phẳng (flat) để hiển thị dropdown
    return this.request<any[]>("/categories/flat");
  }

  async getCategoryTree(): Promise<ApiResponse<any[]>> {
    // Lấy danh mục dạng cây (hierarchical)
    return this.request<any[]>("/categories");
  }

  async createCategory(data: {
    name: string;
    parent_id?: string | null;
    image_url?: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      parent_id?: string | null;
      image_url?: string;
    }
  ): Promise<ApiResponse<any>> {
    return this.request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse<any>> {
    return this.request(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  // PRODUCTS ENDPOINTS
  async getProducts(): Promise<ApiResponse<any[]>> {
    const result = await this.request<any[]>("/products");
    console.log("getProducts response:", result);
    return result;
  }

  async getProduct(id: string): Promise<ApiResponse<any>> {
    return this.request(`/products/${id}`);
  }

  async createProduct(data: any): Promise<ApiResponse<any>> {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // ORDERS ENDPOINTS

  async getOrders(id: string): Promise<ApiResponse<any>> {
    const result = await this.request<any[]>("/orders/admin/all");
    console.log("getOrders response:", result);
    return result;
  }

  async updateOrderStatus(
    id: string,
    status: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request("/statistics/dashboard");
  }

  async getRevenueChart(range: number = 7): Promise<ApiResponse<any[]>> {
    return this.request(`/statistics/revenue?range=${range}`);
  }

  async getTopProducts(): Promise<ApiResponse<any>> {
    return this.request("/statistics/top-products");
  }

  // VOUCHERS ENDPOINTS
  async getVouchers(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/vouchers");
  }

  async getVoucher(id: string): Promise<ApiResponse<any>> {
    return this.request(`/vouchers/${id}`);
  }

  async createVoucher(data: {
    code: string;
    description?: string;
    discount_type: "percent" | "fixed";
    discount_value: number;
    min_order_value?: number;
    max_discount_amount?: number;
    start_date?: string;
    end_date?: string;
    usage_limit?: number;
  }): Promise<ApiResponse<any>> {
    return this.request("/vouchers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateVoucher(
    id: string,
    data: Partial<any>
  ): Promise<ApiResponse<any>> {
    return this.request(`/vouchers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteVoucher(id: string): Promise<ApiResponse<any>> {
    return this.request(`/vouchers/${id}`, {
      method: "DELETE",
    });
  }

  async checkVoucher(
    code: string,
    total_amount: number
  ): Promise<ApiResponse<any>> {
    return this.request("/vouchers/check", {
      method: "POST",
      body: JSON.stringify({ code, total_amount }),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_URL);
