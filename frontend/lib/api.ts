import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: BASE });

// Attach token automatically
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("jm_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getImg(path: string): string {
  if (!path) return "/ph.png";
  if (path.startsWith("http")) return path;
  return `${BASE}/${path}`;
}

export const REGIONS = [
  "Toshkent shahri","Toshkent viloyati","Andijon","Farg'ona","Namangan",
  "Sirdaryo","Jizzax","Samarqand","Qashqadaryo","Surxondaryo",
  "Buxoro","Navoiy","Xorazm","Qoraqalpog'iston",
];
export const TAMIRLAR = ["Yangi ta'mir","O'rta ta'mir","Eski ta'mir","Tamirsiz"];

export function fmt(price: number, cur: "ye"|"som" = "ye"): string {
  if (cur === "som") return (price * 12700).toLocaleString("ru") + " so'm";
  return price.toLocaleString("ru") + " y.e";
}

export interface User {
  id: number; phone: string; name: string; username?: string;
  avatar?: string; balance: number; elonlar_count: number;
  korishlar_count: number; qongiroqlar_count: number;
  is_admin: boolean; created_at: string;
}

export interface Listing {
  id: number; title: string; description?: string;
  deal_type: string; category: string; price: number; currency: string;
  rooms?: number; area_m2?: number; floor?: number; floors?: number;
  land_sotix?: number; tamir?: string; region: string; city: string;
  address?: string; lat?: number; lng?: number; status: string;
  is_vip: boolean; is_top: boolean; view_count: number;
  owner_id: number; owner_phone?: string; owner_username?: string; owner_name?: string;
  created_at: string; published_at?: string;
  images: { id: number; file_path: string; order: number }[];
  distance_km?: number;
  is_favorite?: boolean;
}

// Auth helpers
export function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("jm_token") : null;
}
export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("jm_user") || "null"); } catch { return null; }
}
export function saveAuth(token: string, user: User) {
  localStorage.setItem("jm_token", token);
  localStorage.setItem("jm_user", JSON.stringify(user));
}
export function clearAuth() {
  localStorage.removeItem("jm_token");
  localStorage.removeItem("jm_user");
}

export function saveUser(user: User) {
  localStorage.setItem("jm_user", JSON.stringify(user));
}

export const PACKAGES = [
  { key: "vip", label: "VIP", perDay: 15000, color: "#F5C518" },
  { key: "top", label: "TOP", perDay: 8000, color: "#007AFF" },
];
