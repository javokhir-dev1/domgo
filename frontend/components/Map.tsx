"use client";
import { useEffect, useRef } from "react";
import { type Listing, getImg, fmt } from "@/lib/api";
import { loadYmaps } from "@/lib/ymaps";

type Props = {
  listings: Listing[];
  center?: [number, number];        // [lat, lng]
  zoom?: number;
  cur?: "ye" | "som";
  pickerMode?: boolean;
  onPick?: (lat: number, lng: number) => void;
  picked?: { lat: number; lng: number } | null;
  onSelect?: (id: number) => void;
  userLoc?: [number, number] | null; // [lat, lng] — foydalanuvchi joylashuvi
};

// "Открыть в Яндекс Картах" tugmasini yashiradi (majburiy © logotip qoladi)
function hideOpenMapsButton(root: HTMLElement) {
  const kill = () => {
    root.querySelectorAll("a, button").forEach((n) => {
      const t = (n.textContent || "").toLowerCase();
      if (t.includes("открыть") || t.includes("open") || t.includes("yandex maps")) {
        (n as HTMLElement).style.display = "none";
      }
    });
  };
  kill();
  setTimeout(kill, 400);
  setTimeout(kill, 1200);
}

export default function MapComponent({ listings, center, zoom = 11, cur = "ye", pickerMode, onPick, picked, onSelect, userLoc }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    loadYmaps()
      .then((ymaps3) => {
        if (cancelled || !elRef.current) return;
        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapListener } = ymaps3;

        if (mapRef.current) { mapRef.current.destroy(); mapRef.current = null; }
        elRef.current.innerHTML = "";

        // Yandex [lng, lat] tartibida ishlaydi — bizning DB esa [lat, lng]
        const c: [number, number] = center ? [center[1], center[0]] : [69.2401, 41.2995];

        const map = new YMap(elRef.current, { location: { center: c, zoom } });
        mapRef.current = map;
        map.addChild(new YMapDefaultSchemeLayer());
        map.addChild(new YMapDefaultFeaturesLayer());
        if (elRef.current) hideOpenMapsButton(elRef.current);

        // Foydalanuvchi joylashuvi — ko'k nuqta
        if (userLoc && userLoc[0] && userLoc[1]) {
          const dot = document.createElement("div");
          dot.className = "ymgeo";
          map.addChild(new YMapMarker({ coordinates: [userLoc[1], userLoc[0]], zIndex: 900 }, dot));
        }

        listings.forEach((l) => {
          if (!l.lat || !l.lng) return;
          const wrap = document.createElement("div");
          wrap.className = "ymk";
          const cover = l.images[0];
          wrap.innerHTML =
            `<div class="map-price">${fmt(l.price, cur)}</div>` +
            `<div class="ymk-pop" style="display:none">` +
              (cover ? `<img src="${getImg(cover.file_path)}" alt=""/>` : "") +
              `<b>${fmt(l.price, cur)}</b>` +
              `<span>${l.title}</span>` +
              `<div class="ymk-more">Batafsil →</div>` +
            `</div>`;

          const bubble = wrap.querySelector(".map-price") as HTMLElement;
          const pop = wrap.querySelector(".ymk-pop") as HTMLElement;
          bubble.onclick = (e) => {
            e.stopPropagation();
            const open = pop.style.display === "none";
            pop.style.display = open ? "block" : "none";
            wrap.style.zIndex = open ? "1000" : "";
          };
          if (onSelect) pop.onclick = (e) => { e.stopPropagation(); onSelect(l.id); };

          map.addChild(new YMapMarker({ coordinates: [l.lng, l.lat] }, wrap));
        });

        if (pickerMode && onPick) {
          const pin = document.createElement("div");
          pin.className = "ympin";
          const marker = new YMapMarker(
            { coordinates: picked ? [picked.lng, picked.lat] : c },
            pin
          );
          let added = false;
          if (picked) { map.addChild(marker); added = true; }

          const listener = new YMapListener({
            layer: "any",
            onClick: (_obj: any, ev: any) => {
              const coords = ev?.coordinates;
              if (!coords) return;
              const [lng, lat] = coords;
              marker.update({ coordinates: [lng, lat] });
              if (!added) { map.addChild(marker); added = true; }
              onPick(lat, lng);
            },
          });
          map.addChild(listener);
        }
      })
      .catch((e) => console.error("Yandex Maps:", e));

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.destroy(); mapRef.current = null; }
    };
  }, [listings.length, center?.[0], center?.[1], zoom, userLoc?.[0], userLoc?.[1]]);

  return <div ref={elRef} style={{ width: "100%", height: "100%", touchAction: "none", overscrollBehavior: "none" }} />;
}
