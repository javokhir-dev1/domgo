"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { api, getUser } from "@/lib/api";

interface Msg {
  id: number; from_user_id: number; to_user_id: number;
  listing_id?: number; text: string; is_read: boolean; created_at: string;
}

function ChatInner() {
  const router = useRouter();
  const params = useParams();
  const search = useSearchParams();
  const peerId = Number(params.peerId);
  const listingId = search.get("listing");
  const [me, setMe] = useState<number | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = () => {
    api.get(`/api/messages/${peerId}`).then(({ data }) => setMsgs(data)).catch(() => {});
  };

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setMe(u.id);
    load();
    const iv = setInterval(load, 6000);
    return () => clearInterval(iv);
  }, [peerId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      await api.post("/api/messages/", {
        to_user_id: peerId, text: t,
        listing_id: listingId ? Number(listingId) : null,
      });
      setText("");
      load();
    } catch {}
    setSending(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F2F2F7", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "sticky", top: 0, background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, zIndex: 10 }}>
        <button onClick={() => router.push("/messages")} style={{ background: "none", border: "none", cursor: "pointer" }}><ArrowLeft size={22} /></button>
        <img src={`https://i.pravatar.cc/40?u=${peerId}`} style={{ width: 40, height: 40, borderRadius: "50%" }} alt="" />
        <span style={{ fontWeight: 700, fontSize: 16 }}>Suhbat</span>
      </div>

      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
        {msgs.length === 0 && <p style={{ textAlign: "center", color: "#8E8E93", marginTop: 40 }}>Suhbatni boshlang</p>}
        {msgs.map((m) => {
          const mine = m.from_user_id === me;
          return (
            <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "75%", background: mine ? "#4d7378" : "#fff", color: mine ? "#fff" : "#000", padding: "10px 14px", borderRadius: 16, borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4, fontSize: 15, boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}>
              {m.text}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: "1px solid #E5E5EA", padding: "10px 12px", display: "flex", gap: 8 }}>
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Xabar yozing..."
          style={{ flex: 1, padding: "12px 16px", borderRadius: 24, border: "1px solid #E5E5EA", fontSize: 15, outline: "none" }} />
        <button onClick={send} disabled={sending} style={{ width: 46, height: 46, borderRadius: "50%", background: "#000", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Send size={20} color="#fff" />
        </button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Yuklanmoqda...</div>}>
      <ChatInner />
    </Suspense>
  );
}
