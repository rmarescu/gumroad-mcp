interface Product {
  id: string;
  name: string;
  preview_url: string | null;
  description: string;
  custom_permalink: string | null;
  custom_receipt: string | null;
  custom_summary: string;
  custom_fields: Record<string, string>[];
  customizable_price: number | null;
  require_shipping: boolean;
  custom_fields_enabled: boolean;
  subscription_duration: string | null;
  published: boolean;
  url: string;
  price: number;
  currency: string;
  short_url: string;
  thumbnail_url: string;
  sales_count?: string;
  sales_usd_cents?: string;
  tags: string[];
}

interface GumroadUser {
  bio: string;
  name: string;
  twitter_handle: string | null;
  user_id: string;
  email?: string;
  url?: string;
}

interface Sale {
  id: string;
  email: string;
  seller_id: string;
  timestamp: string;
  daystamp: string;
  created_at: string;
  product_name: string;
  product_has_variants: boolean;
  price: number;
  gumroad_fee: number;
  subscription_duration: string | null;
  currency_symbol: string;
  product_id: string;
  product_permalink: string;
  purchase_email: string;
  order_id: number;
  sale_id: string;
  variants?: Record<string, string>;
  license_key?: string;
}

interface GumroadResponse<T> {
  success: boolean;
  next_page_key?: string;
  next_page_url?: string;
  products?: T[];
  sales?: T[];
}

interface GetSalesArgs {
  after?: string;
  before?: string;
  product_id?: string;
  email?: string;
  order_id?: string;
  page_key?: string;
}

export class GumroadClient {
  private static readonly BASE_URL = "https://api.gumroad.com";

  private headers: { Authorization: string; "Content-Type": string };
  private apiUrl: string;

  constructor(accessToken: string, baseUrl: string | undefined) {
    this.headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
    let url = baseUrl || GumroadClient.BASE_URL;
    url = url.replace(/\/$/, "");
    if (url !== GumroadClient.BASE_URL) {
      // Disable certificate verification for non-production environments (e.g. for gumroad.dev)
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    this.apiUrl = `${url}/v2`;
    console.error("Gumroad client initialized with base URL:", this.apiUrl);
  }

  async getUser(): Promise<{ success: boolean; user?: GumroadUser; message?: string }> {
    const url = `${this.apiUrl}/user`;
    console.error("Making request to:", url);
    const response = await fetch(url, { headers: this.headers });
    return response.json();
  }

  async getProduct(productId: string): Promise<{ success: boolean; product?: Product; message?: string }> {
    const url = `${this.apiUrl}/products/${productId}`;
    console.error("Making request to:", url);
    const response = await fetch(url, { headers: this.headers });
    return response.json();
  }

  async getProducts(): Promise<GumroadResponse<Product>> {
    const response = await fetch(`${this.apiUrl}/products`, {
      headers: this.headers,
    });

    return response.json();
  }

  async getSales(params?: GetSalesArgs): Promise<GumroadResponse<Sale>> {
    const queryParams = new URLSearchParams();

    if (params?.after) queryParams.append("after", params.after);
    if (params?.before) queryParams.append("before", params.before);
    if (params?.product_id) queryParams.append("product_id", params.product_id);
    if (params?.email) queryParams.append("email", params.email);
    if (params?.order_id) queryParams.append("order_id", params.order_id);
    if (params?.page_key) queryParams.append("page_key", params.page_key);

    const url = `${this.apiUrl}/sales${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    console.error("Making request to:", url);

    const response = await fetch(url, { headers: this.headers });
    return response.json();
  }
}
