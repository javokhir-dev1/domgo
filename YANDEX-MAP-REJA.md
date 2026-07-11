# Yandex Map ulash rejasi

Maqsad: hozirgi **Leaflet + OpenStreetMap** xaritasini **Yandex Maps JS API v3** bilan almashtirish.
Yondashuv: `components/Map.tsx` ichini almashtiramiz, **props interfeysi bir xil qoladi** — shu sabab uni ishlatadigan 3 sahifa avtomatik ishlaydi. Leaflet o'chiriladi.

## Hozirgi holat

`components/Map.tsx` (Leaflet) quyidagi 3 joyda ishlatiladi:

| Sahifa | Rejim | Kerakli imkoniyat |
|--------|-------|-------------------|
| `app/page.tsx` | Barcha e'lonlar | Narx markerlari + bosilganda e'longa o'tish (`onSelect`) |
| `app/listing/[id]/client.tsx` | Bitta e'lon | Bitta marker, `center` + `zoom` |
| `app/add/page.tsx` | Joy tanlash (picker) | Xaritaga bosib `lat/lng` olish (`onPick`, `picked`) |

Komponent props'lari o'zgarmasligi kerak:
`listings, center, zoom, cur, pickerMode, onPick, picked, onSelect`.

---

## Faza 0 — API kalit olish 🔑

- [ ] https://developer.tech.yandex.ru (yoki https://yandex.com/maps-api/docs) da ro'yxatdan o'tish.
- [ ] **JavaScript API va HTTP Geocoder** kaliti yaratish.
- [ ] Kalit bepul limit: kuniga ~25 000 so'rov (geocoder/router/panorama) — bizga yetadi.
- [ ] `frontend/.env.local` ga qo'shish: `NEXT_PUBLIC_YANDEX_MAP_KEY=...`
- [ ] `.env.example` ga ham namuna sifatida yozib qo'yish.
- [ ] Yandex kabinetida ruxsat etilgan domenlarga `localhost` va prod domenni qo'shish.

---

## Faza 1 — Skriptni ulash

- [ ] `app/layout.tsx` da yoki Map komponenti ichida Yandex JS API v3 ni yuklash:
      `https://api-maps.yandex.ru/v3/?apikey=${KEY}&lang=uz_UZ` (yoki `ru_RU`).
- [ ] Skript bir marta yuklanishi uchun kichik `loadYmaps()` helper (Promise, `window.ymaps3` ni kutadi).
- [ ] SSR muammosi bo'lmasligi uchun `dynamic(..., { ssr:false })` allaqachon bor — shunday qoldiramiz.

---

## Faza 2 — Map.tsx ni Yandex v3 ga o'tkazish

- [ ] Leaflet importini olib tashlash, `ymaps3.ready` bilan boshlash.
- [ ] Asosiy qatlamlar: `YMap`, `YMapDefaultSchemeLayer`, `YMapDefaultFeaturesLayer`.
- [ ] Markaz/zoom: Yandex `[lng, lat]` tartibida ishlaydi (Leaflet `[lat, lng]` edi) — **koordinata tartibini almashtirish** eng muhim ehtiyot nuqta.
- [ ] Toza qilish (cleanup): komponent unmount bo'lganda `map.destroy()`.
- [ ] Hot-reload / qayta render uchun eski map instansiyasini o'chirish (hozirgi `mapRef` mantig'iga o'xshash).

## Faza 3 — Narx markerlari (`app/page.tsx`)

- [ ] Har bir e'lon uchun `YMapMarker` + custom HTML element (hozirgi `map-price` klassi bilan bir xil ko'rinish).
- [ ] Markerga bosilganda popup: rasm + narx + sarlavha + "Batafsil →".
- [ ] `onSelect(id)` — popup yoki markerga bosilganda e'longa o'tish.
- [ ] `fmt(price, cur)` va `getImg(...)` yordamchilarini o'zgarishsiz ishlatish.

## Faza 4 — Picker rejimi (`app/add/page.tsx`)

- [ ] Xaritaga bosilganda koordinata olish (v3 `YMapListener` `onClick` → `entity` yoki `map.behaviors`), `onPick(lat, lng)` chaqirish.
- [ ] Tanlangan nuqtaga bitta marker qo'yish; qayta bosilganda avvalgisini almashtirish.
- [ ] `picked` prop bo'lsa boshlang'ich markerni ko'rsatish.

## Faza 5 — Bitta e'lon (`app/listing/[id]/client.tsx`)

- [ ] `center` va `zoom` bilan bitta marker — bu eng oddiy holat, Faza 2/3 dan keyin avtomatik ishlaydi.

---

## Faza 6 — Tozalash va tekshiruv

- [ ] `package.json` dan `leaflet` va `@types/leaflet` ni olib tashlash; `npm install`.
- [ ] Leaflet CSS/marker importlari qolgan joylarni tozalash.
- [ ] Test oqimi:
  - [ ] Bosh sahifa xarita ko'rinishi — narxlar chiqadimi, bosilganda e'lon ochiladimi.
  - [ ] E'lon qo'shish — xaritadan joy tanlab, saqlangach `lat/lng` to'g'ri ketdimi.
  - [ ] E'lon sahifasi — marker to'g'ri joyda.
  - [ ] "Menga yaqin" (geolokatsiya) markazlash ishlayaptimi.
  - [ ] Mobil ko'rinish (loyiha mobilega yo'naltirilgan).
- [ ] Kalit `.gitignore` da (`.env.local` allaqachon ignore qilingan bo'lishi kerak — tekshirish).

---

## Ehtiyot nuqtalar

1. **Koordinata tartibi**: Yandex `[lng, lat]`, Leaflet/bizning DB `lat, lng` — konvertatsiyani markazlashtirilgan bir joyda qilish.
2. **API kalit** frontendda ochiq bo'ladi (`NEXT_PUBLIC_`) — bu normal, lekin Yandex kabinetida **domen cheklovi** yoqilishi shart.
3. **Til**: `lang=uz_UZ` mavjud emas bo'lsa `ru_RU` yoki `en_US`.
4. Narx markeri dizaynini eski `.map-price` CSS bilan mos saqlash — vizual o'zgarmasin.

## Taxminiy hajm

Bitta komponent + env sozlash. Asosiy ish `Map.tsx` da (Faza 2–4). O'rta murakkablik, bir kunlik ish.
