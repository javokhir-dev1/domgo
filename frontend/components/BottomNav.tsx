"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, getUser } from "@/lib/api";
import { Home, Search, Plus, MessageSquare, User, Trophy } from "lucide-react";

const TABS = [
  { href: "/", icon: Home, label: "Asosiy" },
  { href: "/search", icon: Search, label: "Qidirish" },
  { href: "/add", icon: Plus, label: "Qo'shish", special: true },
  { href: "/messages", icon: MessageSquare, label: "Xabarlar" },
  { href: "/profile", icon: User, label: "Profil" },
];

// Desktop sidebar
export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ width: 38, height: 38, background: "#4d7378", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><Home size={22} color="#fff" /></div>
        <span>DomGo</span>
      </div>
      <nav className="sidebar-nav">
        {TABS.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className={`sidebar-link${path === href ? " active" : ""}`}>
            <Icon size={20} />
            {label}
          </Link>
        ))}
        <Link href="/top10" className={`sidebar-link${path === "/top10" ? " active" : ""}`}>
          <Trophy size={20} />
          TOP 10
        </Link>
      </nav>
      <div style={{ padding: "16px 8px", borderTop: "1px solid #F2F2F7", marginTop: "auto" }}>
        <div style={{ fontSize: 12, color: "#8E8E93", textAlign: "center" }}>© 2026 DomGo.uz</div>
      </div>
    </aside>
  );
}

// Mobile bottom nav
export default function BottomNav() {
  const path = usePathname();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!getUser()) return;
    const load = () => api.get("/api/messages/unread-count").then(({ data }) => setUnread(data.count || 0)).catch(() => {});
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, []);
  return (
    <nav className="bottom-nav">
      {TABS.map(({ href, icon: Icon, label, special }) => {
        const active = path === href;
        if (special) return (
          <Link key={href} href={href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", marginTop: -18, boxShadow: "0 4px 16px rgba(0,0,0,.25)" }}>
              <Icon size={22} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#8E8E93", marginTop: 2 }}>{label}</span>
          </Link>
        );
        return (
          <Link key={href} href={href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 12px", textDecoration: "none", position: "relative" }}>
            <div style={{ position: "relative" }}>
              <Icon size={22} color={active ? "#000" : "#8E8E93"} strokeWidth={active ? 2.5 : 2} />
              {href === "/messages" && unread > 0 && (
                <span style={{ position: "absolute", top: -6, right: -10, minWidth: 16, height: 16, lineHeight: "16px", background: "#FF3B30", color: "#fff", borderRadius: 8, fontSize: 10, fontWeight: 700, padding: "0 4px", textAlign: "center" }}>{unread}</span>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#000" : "#8E8E93" }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
