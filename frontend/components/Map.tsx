"use client";
import { useEffect, useRef } from "react";
import { type Listing, getImg, fmt } from "@/lib/api";

let cnt = 0;

export default function MapComponent({ listings, center, zoom = 11, cur = "ye", pickerMode, onPick, picked, onSelect }: { listings: Listing[]; center?: [number, number]; zoom?: number; cur?: "ye" | "som"; pickerMode?: boolean; onPick?: (lat: number, lng: number) => void; picked?: { lat: number, lng: number } | null; onSelect?: (id: number) => void }) {
  const mapRef = useRef<any>(null);
  const id = useRef(`jmap${++cnt}`);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    import("leaflet").then(L => {
      if (cancelled) return;
      const el = document.getElementById(id.current);
      if (!el) return; // konteyner hali/hozir DOM'da yo'q

      // Avvalgi map (yoki hot-reload qoldig'i) bo'lsa tozalaymiz
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      if ((el as any)._leaflet_id) { (el as any)._leaflet_id = null; }

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png", shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png" });

      const c: [number, number] = center || [41.2995, 69.2401];
      const map = L.map(el).setView(c, zoom);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OSM" }).addTo(map);
      setTimeout(() => { if (mapRef.current) mapRef.current.invalidateSize(); }, 120);

      listings.forEach(l => {
        if (!l.lat || !l.lng) return;
        const icon = L.divIcon({ html: `<div class="map-price">${fmt(l.price, cur)}</div>`, className: "", iconAnchor: [40, 32] });
        const m = L.marker([l.lat, l.lng], { icon }).addTo(map);
        const cover = l.images[0];
        m.bindPopup(`<div id="pp-${l.id}" style="min-width:160px;font-family:Inter,sans-serif;cursor:pointer">${cover ? `<img src="${getImg(cover.file_path)}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:6px"/>` : ""}<b>${fmt(l.price, cur)}</b><br/><span style="font-size:11px;color:#555">${l.title}</span><div style="margin-top:6px;font-size:12px;font-weight:700;color:#4d7378">Batafsil →</div></div>`);
        if (onSelect) {
          m.on("popupopen", () => { const e = document.getElementById(`pp-${l.id}`); if (e) e.onclick = () => onSelect(l.id); });
        }
      });

      if (pickerMode && onPick) {
        let pin: any = null;
        if (picked) pin = L.marker([picked.lat, picked.lng]).addTo(map);
        map.on("click", (e: any) => { if (pin) pin.remove(); pin = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map); onPick(e.latlng.lat, e.latlng.lng); });
      }
    });

    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [listings.length, center?.[0], center?.[1], zoom]);

  return <div id={id.current} style={{ width: "100%", height: "100%" }} />;
}
