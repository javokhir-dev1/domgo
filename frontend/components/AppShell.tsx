"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/BottomNav";

// Sidebar/layout ko'rsatilmaydigan "yalang'och" sahifalar (faqat login)
const BARE_ROUTES = ["/login"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "";
  const bare = BARE_ROUTES.some((r) => path === r || path.startsWith(r + "/"));

  if (bare) return <>{children}</>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
