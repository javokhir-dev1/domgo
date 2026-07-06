"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, Share2, Heart, MapPin } from "lucide-react";
import { api, fmt, getImg, getUser, type Listing } from "@/lib/api";
import Carousel from "@/components/Carousel";

const MapComponent = dynamic(() => import("@/components/Map"), { ssr: false });

export default function ListingClient({ id }: { id: string }) {
  const router = useRouter();
  const [l, setL] = useState<Listing | null>(null);
  const [saved, setSaved] = useState(false);
  const [cur] = useState<"ye" | "som">("ye");

  useEffect(() => {
    api.get(`/api/listings/${id}`).then(({ data }) => { setL(data); setSaved(!!data.is_favorite); }).catch(() => router.push("/"));
  }, [id]);

  if (!l) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spin" style={{ width: 32, height: 32, border: "3px solid #F2F2F7", borderTop: "3px solid #4d7378", borderRadius: "50%" }} />
    </div>
  );

  const days = l.published_at ? Math.floor((Date.now() - new Date(l.published_at).getTime()) / 86400000) : null;
  const DEAL_L: Record<string,string> = { sale: "Sotuv", rent: "Ijara", kunlik: "Kunlik" };
  const CAT_L: Record<string,string> = { apartment: "Kvartira", house: "Hovli", commercial: "Tijorat", land: "Yer", hotel: "Mehmonxona" };

  const toggleFav = async () => {
    if (!getUser()) { router.push("/login"); return; }
    try { const { data } = await api.post(`/api/favorites/${l.id}`); setSaved(data.is_favorite); } catch {}
  };
  const goMessage = () => {
    if (!getUser()) { router.push("/login"); return; }
    router.push(`/messages/${l.owner_id}?listing=${l.id}`);
  };
  const registerCall = () => { api.post(`/api/listings/${l.id}/call`).catch(() => {}); };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", paddingBottom: 24, position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 30, display: "flex", justifyContent: "space-between", padding: "12px 16px" }}>
        <button onClick={() => router.back()} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Share2 size={16} />
          </button>
          <button onClick={toggleFav} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={16} fill={saved ? "#FF3B30" : "none"} color={saved ? "#FF3B30" : "#000"} />
          </button>
        </div>
      </div>

      <Carousel images={l.images} />

      <div style={{ padding: "12px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <img src={`https://i.pravatar.cc/76?u=${l.owner_id}`} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }} alt="" />
        <span style={{ fontSize: 15, fontWeight: 700 }}>{l.owner_username || l.owner_name || "Foydalanuvchi"}</span>
      </div>
      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ background: "#F2F2F7", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{DEAL_L[l.deal_type] || l.deal_type}</span>
        <span style={{ background: "#F2F2F7", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{CAT_L[l.category] || l.category}</span>
        {days !== null && <span style={{ marginLeft: "auto", fontSize: 13, color: "#8E8E93" }}>{days === 0 ? "Bugun" : `${days} kun oldin`}</span>}
      </div>
      <div style={{ padding: "0 16px 8px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.4 }}>
          ID {String(l.id).padStart(4, "0")} 📍 {l.city}<br />{l.title}
        </h1>
      </div>
      <div style={{ padding: "0 16px 16px" }}>
        <p style={{ fontSize: 32, fontWeight: 900 }}>{fmt(l.price, cur)}</p>
      </div>
      {l.description && (
        <div style={{ padding: "0 16px 16px" }}>
          <p style={{ fontSize: 15, color: "#333", lineHeight: 1.6, whiteSpace: "pre-line" }}>{l.description}</p>
        </div>
      )}
      <div style={{ margin: "0 16px 16px", background: "#F8F8F8", borderRadius: 14, overflow: "hidden" }}>
        {[
          l.land_sotix && ["Maydon, sotix", `${l.land_sotix}`],
          l.area_m2 && ["Maydon, m²", `${l.area_m2}`],
          l.floor && l.floors && ["Qavat", `${l.floor}/${l.floors}`],
          l.rooms && ["Xonalar", `${l.rooms} ta`],
          l.tamir && ["Ta'mirlash", l.tamir],
        ].filter(Boolean).map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < 3 ? "1px solid #EBEBEB" : "none" }}>
            <span style={{ fontSize: 14, color: "#8E8E93" }}>{(row as string[])[0]}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>— {(row as string[])[1]}</span>
          </div>
        ))}
      </div>
      {l.lat && l.lng && (
        <div style={{ padding: "0 16px 16px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Joylashuv</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <MapPin size={16} />
            <span style={{ fontSize: 15, color: "#555" }}>{l.city}, {l.region}</span>
          </div>
          <div style={{ height: 220, borderRadius: 14, overflow: "hidden", position: "relative", zIndex: 0 }}>
            <MapComponent listings={[l]} center={[l.lat, l.lng]} zoom={15} />
          </div>
        </div>
      )}
      <div style={{ position: "sticky", bottom: 0, width: "100%", background: "#fff", borderTop: "1px solid #E5E5EA", zIndex: 50 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "stretch", padding: "12px 16px", maxWidth: 640, margin: "0 auto" }}>
          <button onClick={goMessage} style={{ flex: 1, padding: "10px 14px", background: "#F2F2F7", borderRadius: 50, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", lineHeight: 1.2 }}>Sotuvchiga yozing</button>
          <a href={`tel:${l.owner_phone || "+998901234567"}`} onClick={registerCall} className="yellow-btn" style={{ flex: 1.4, padding: "10px 14px", fontSize: 15, textDecoration: "none", borderRadius: 50, whiteSpace: "nowrap" }}>
            📞 Qo&apos;ng&apos;iroq
          </a>
        </div>
      </div>
    </div>
  );
}
