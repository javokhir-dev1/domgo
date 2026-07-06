"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Building2, Handshake, Heart, LogOut, X, Shield } from "lucide-react";
import { api, getUser, saveUser, clearAuth, PACKAGES, type User } from "@/lib/api";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [favs, setFavs] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  const [tab, setTab] = useState("listings");

  const [showEdit, setShowEdit] = useState(false);
  const [showTopup, setShowTopup] = useState(false);
  const [showPkg, setShowPkg] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", avatar: "" });
  const [amount, setAmount] = useState("50000");
  const [pkg, setPkg] = useState("vip");
  const [pkgDays, setPkgDays] = useState("7");
  const [pkgListing, setPkgListing] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const refreshUser = async () => {
    try { const { data } = await api.get("/api/auth/me"); setUser(data); saveUser(data); } catch {}
  };

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    setForm({ name: u.name || "", username: u.username || "", avatar: u.avatar || "" });
    api.get("/api/listings/my/listings").then(({ data }) => setMyListings(data)).catch(() => {});
    api.get("/api/favorites/").then(({ data }) => setFavs(data)).catch(() => {});
    api.get("/api/payments/history").then(({ data }) => setTxs(data)).catch(() => {});
    refreshUser();
  }, []);

  if (!user) return null;

  const saveProfile = async () => {
    try {
      const { data } = await api.patch("/api/users/me", form);
      setUser(data); saveUser(data); setShowEdit(false);
    } catch { setMsg("Saqlashda xatolik"); }
  };

  const doTopup = async () => {
    try {
      await api.post("/api/payments/topup", { amount: Number(amount) });
      await refreshUser(); setShowTopup(false);
    } catch { setMsg("Xatolik"); }
  };

  const doPromote = async () => {
    if (!pkgListing) { setMsg("E'lon tanlang"); return; }
    try {
      await api.post("/api/payments/promote", { listing_id: pkgListing, package: pkg, days: Number(pkgDays) });
      await refreshUser();
      const { data } = await api.get("/api/listings/my/listings"); setMyListings(data);
      setShowPkg(false); setMsg("");
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || "Balans yetarli emas");
    }
  };

  const price = (PACKAGES.find(p => p.key === pkg)?.perDay || 0) * Number(pkgDays || 0);

  return (
    <div style={{ minHeight: "100vh", background: "#F2F2F7", paddingBottom: 72 }}>
      <div style={{ background: "#F2F2F7", padding: "16px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>{user.username || "profil"}</span>
        <div style={{ display: "flex", gap: 10 }}>
          {user.is_admin && <button onClick={() => router.push("/admin")} style={{ background: "none", border: "none", cursor: "pointer" }}><Shield size={20} /></button>}
          <button onClick={() => setShowEdit(true)} style={{ background: "none", border: "none", cursor: "pointer" }}><Edit3 size={20} /></button>
        </div>
      </div>
      <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ddd", overflow: "hidden", flexShrink: 0 }}>
          <img src={user.avatar || `https://i.pravatar.cc/72?u=${user.id}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[["E'lonlar", user.elonlar_count || 0], ["Ko'rishlar", user.korishlar_count || 0], ["Qo'ng'iroqlar", user.qongiroqlar_count || 0]].map(([l, v]) => (
            <div key={l as string} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{v}</div>
              <div style={{ fontSize: 12, color: "#8E8E93" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 16px 12px" }}>
        <p style={{ fontSize: 17, fontWeight: 800 }}>{user.name}</p>
        <p style={{ fontSize: 14, color: "#8E8E93" }}>{user.phone}</p>
      </div>
      <div style={{ margin: "0 16px 12px" }}>
        <div className="card" style={{ padding: "14px 16px", borderRadius: 14 }}>
          <p style={{ textAlign: "center", color: "#555", marginBottom: 12, fontSize: 14 }}>Balans: {(user.balance || 0).toLocaleString()} so'm</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowTopup(true)} className="black-btn" style={{ flex: 1, padding: "12px", fontSize: 14 }}>To'ldirish</button>
            <button onClick={() => { setPkgListing(myListings[0]?.id ?? null); setShowPkg(true); }} className="yellow-btn" style={{ flex: 1, padding: "12px", fontSize: 14, borderRadius: 14 }}>Paket</button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #E5E5EA", background: "#fff", margin: "0 0 2px" }}>
        {[{ k: "listings", i: Building2 }, { k: "deals", i: Handshake }, { k: "saved", i: Heart }].map(({ k, i: Icon }) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "14px 0", background: "none", border: "none", cursor: "pointer", borderBottom: tab === k ? "2px solid #000" : "2px solid transparent", display: "flex", justifyContent: "center" }}>
            <Icon size={20} color={tab === k ? "#000" : "#8E8E93"} />
          </button>
        ))}
      </div>

      {tab === "deals" ? (
        <div style={{ padding: 16 }}>
          {txs.length === 0 ? <p style={{ textAlign: "center", color: "#8E8E93", padding: 24 }}>Tranzaksiyalar yo'q</p> :
            txs.map((t) => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F2F2F7" }}>
                <span style={{ fontSize: 14 }}>{t.description}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: t.amount < 0 ? "#FF3B30" : "#34C759" }}>{t.amount > 0 ? "+" : ""}{t.amount.toLocaleString()}</span>
              </div>
            ))}
        </div>
      ) : (
        (() => {
          const items = tab === "saved" ? favs : myListings;
          return items.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                {tab === "saved" ? <Heart size={36} color="#4d7378" /> : <Building2 size={36} color="#4d7378" />}
              </div>
              <p style={{ fontSize: 17, fontWeight: 700 }}>{tab === "saved" ? "Saqlanganlar yo'q" : "Sizda hech qanday e'lon yo'q"}</p>
            </div>
          ) : (
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {items.map((l: any) => (
                <div key={l.id} onClick={() => router.push(`/listing/${l.id}`)} className="card" style={{ overflow: "hidden", borderRadius: 12, cursor: "pointer", position: "relative" }}>
                  {(l.is_vip || l.is_top) && <span style={{ position: "absolute", top: 6, left: 6, background: l.is_vip ? "#4d7378" : "#007AFF", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 6, zIndex: 2 }}>{l.is_vip ? "VIP" : "TOP"}</span>}
                  <img src={l.images[0]?.file_path?.startsWith("http") ? l.images[0].file_path : (l.images[0]?.file_path ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/${l.images[0].file_path}` : "/ph.png")} style={{ width: "100%", height: 120, objectFit: "cover" }} alt="" />
                  <div style={{ padding: "8px 10px" }}>
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{l.price.toLocaleString()} y.e</p>
                    <p style={{ fontSize: 12, color: "#8E8E93", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })()
      )}

      <div style={{ padding: "16px" }}>
        <button onClick={() => { clearAuth(); router.push("/login"); }} style={{ width: "100%", padding: "14px", background: "none", border: "1px solid #FF3B30", borderRadius: 14, color: "#FF3B30", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <LogOut size={16} /> Chiqish
        </button>
      </div>

      {showEdit && (
        <Modal title="Profilni tahrirlash" onClose={() => setShowEdit(false)}>
          <Field label="Ism" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
          <Field label="Avatar URL" value={form.avatar} onChange={(v) => setForm({ ...form, avatar: v })} />
          <button onClick={saveProfile} className="black-btn" style={{ width: "100%", padding: 14, marginTop: 8 }}>Saqlash</button>
        </Modal>
      )}

      {showTopup && (
        <Modal title="Balansni to'ldirish" onClose={() => setShowTopup(false)}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["50000", "100000", "200000"].map((a) => (
              <button key={a} onClick={() => setAmount(a)} className={amount === a ? "black-btn" : ""} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #E5E5EA", background: amount === a ? "#000" : "#fff", color: amount === a ? "#fff" : "#000", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{Number(a).toLocaleString()}</button>
            ))}
          </div>
          <Field label="Summa (so'm)" value={amount} onChange={setAmount} />
          <p style={{ fontSize: 12, color: "#8E8E93", margin: "4px 0 10px" }}>Demo rejim — real to'lov amalga oshmaydi.</p>
          <button onClick={doTopup} className="yellow-btn" style={{ width: "100%", padding: 14, borderRadius: 12 }}>To'ldirish</button>
        </Modal>
      )}

      {showPkg && (
        <Modal title="E'lonni reklama qilish" onClose={() => setShowPkg(false)}>
          {myListings.length === 0 ? <p style={{ color: "#8E8E93" }}>Avval e'lon qo'shing.</p> : (
            <>
              <label style={{ fontSize: 13, color: "#8E8E93" }}>E'lon</label>
              <select value={pkgListing ?? ""} onChange={(e) => setPkgListing(Number(e.target.value))} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #E5E5EA", margin: "4px 0 12px" }}>
                {myListings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {PACKAGES.map((p) => (
                  <button key={p.key} onClick={() => setPkg(p.key)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "2px solid " + (pkg === p.key ? p.color : "#E5E5EA"), background: "#fff", cursor: "pointer", fontWeight: 800 }}>{p.label}<br /><span style={{ fontSize: 11, color: "#8E8E93" }}>{p.perDay.toLocaleString()}/kun</span></button>
                ))}
              </div>
              <Field label="Muddat (kun)" value={pkgDays} onChange={setPkgDays} />
              <p style={{ fontSize: 15, fontWeight: 800, margin: "8px 0" }}>Jami: {price.toLocaleString()} so'm</p>
              <button onClick={doPromote} className="black-btn" style={{ width: "100%", padding: 14 }}>Sotib olish</button>
            </>
          )}
        </Modal>
      )}
      {msg && <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "#000", color: "#fff", padding: "10px 18px", borderRadius: 20, fontSize: 13, zIndex: 200 }} onClick={() => setMsg("")}>{msg}</div>}

      <BottomNav />
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: 20, width: "100%", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 13, color: "#8E8E93" }}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #E5E5EA", marginTop: 4, fontSize: 15, outline: "none" }} />
    </div>
  );
}
