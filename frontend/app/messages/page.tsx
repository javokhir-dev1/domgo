"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getUser } from "@/lib/api";
import BottomNav from "@/components/BottomNav";

interface Thread {
  peer_id: number; peer_name?: string; peer_username?: string; peer_avatar?: string;
  last_text: string; last_at: string; unread: number; listing_id?: number;
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "hozir";
  if (s < 3600) return `${Math.floor(s / 60)} daq`;
  if (s < 86400) return `${Math.floor(s / 3600)} soat`;
  return `${Math.floor(s / 86400)} kun`;
}

export default function MessagesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getUser()) { router.push("/login"); return; }
    api.get("/api/messages/threads")
      .then(({ data }) => setThreads(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", paddingBottom: 72 }}>
      <div style={{ background: "#4d7378", margin: 16, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎧</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>DomGo.uz</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.85)" }}>Biz yordam berishdan xursand bo'lamiz</p>
        </div>
        <span style={{ fontSize: 20, color: "rgba(255,255,255,.7)" }}>›</span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#8E8E93" }}>Yuklanmoqda...</div>
      ) : threads.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📪</div>
          <p style={{ fontSize: 16, color: "#555" }}>Hali hech qanday xabar yo'q...</p>
        </div>
      ) : (
        <div>
          {threads.map((t) => (
            <div key={t.peer_id} onClick={() => router.push(`/messages/${t.peer_id}`)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #F2F2F7" }}>
              <img src={t.peer_avatar || `https://i.pravatar.cc/48?u=${t.peer_id}`}
                style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} alt="" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{t.peer_name || t.peer_username || `Foydalanuvchi #${t.peer_id}`}</p>
                <p style={{ fontSize: 13, color: "#8E8E93", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.last_text}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: 12, color: "#8E8E93" }}>{timeAgo(t.last_at)}</p>
                {t.unread > 0 && (
                  <span style={{ display: "inline-block", marginTop: 4, minWidth: 20, height: 20, lineHeight: "20px", background: "#FF3B30", color: "#fff", borderRadius: 10, fontSize: 12, fontWeight: 700, padding: "0 6px" }}>{t.unread}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <BottomNav />
    </div>
  );
}
