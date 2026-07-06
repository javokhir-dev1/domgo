"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { api, getUser } from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get(`/api/admin/listings?status=${status}`).then(({ data }) => setListings(data)).catch(() => {}).finally(() => setLoading(false));
    api.get("/api/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
  };

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (!u.is_admin) { router.push("/"); return; }
    load();
  }, [status]);

  const moderate = async (id: number, action: string) => {
    try { await api.patch(`/api/admin/listings/${id}?action=${action}`); load(); } catch {}
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F2F2F7", paddingBottom: 24 }}>
      <div style={{ background: "#fff", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #E5E5EA" }}>
        <button onClick={() => router.push("/profile")} style={{ background: "none", border: "none", cursor: "pointer" }}><ArrowLeft size={22} /></button>
        <span style={{ fontSize: 18, fontWeight: 800 }}>Admin panel</span>
      </div>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: 16 }}>
          {[["Foydalanuvchi", stats.users], ["E'lonlar", stats.listings_total], ["Kutilmoqda", stats.listings_pending], ["Tasdiqlangan", stats.listings_approved], ["VIP", stats.vip], ["Xabarlar", stats.messages]].map(([l, v]) => (
            <div key={l} className="card" style={{ padding: 12, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{v}</div>
              <div style={{ fontSize: 11, color: "#8E8E93" }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, padding: "0 16px 12px" }}>
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} style={{ padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: status === s ? "#000" : "#fff", color: status === s ? "#fff" : "#000" }}>{s}</button>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>
        {loading ? <p style={{ textAlign: "center", color: "#8E8E93", padding: 24 }}>Yuklanmoqda...</p> :
          listings.length === 0 ? <p style={{ textAlign: "center", color: "#8E8E93", padding: 24 }}>Bo'sh</p> :
            listings.map((l) => (
              <div key={l.id} className="card" style={{ display: "flex", gap: 12, padding: 12, borderRadius: 12, marginBottom: 10, alignItems: "center" }}>
                <img src={l.images[0]?.file_path?.startsWith("http") ? l.images[0].file_path : "/ph.png"} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} alt="" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</p>
                  <p style={{ fontSize: 12, color: "#8E8E93" }}>{l.price.toLocaleString()} y.e · {l.city} · {l.status}</p>
                </div>
                <button onClick={() => moderate(l.id, "approve")} style={{ width: 38, height: 38, borderRadius: "50%", background: "#34C759", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={18} color="#fff" /></button>
                <button onClick={() => moderate(l.id, "reject")} style={{ width: 38, height: 38, borderRadius: "50%", background: "#FF3B30", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={18} color="#fff" /></button>
              </div>
            ))}
      </div>
    </div>
  );
}
