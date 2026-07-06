# JOYMEE — To'liq ishlaydigan qilish rejasi

Maqsad: hozir "ko'rinadi-yu ishlamaydigan" barcha imkoniyatlarni real ishlaydigan qilish.
To'lov: mock/demo rejim (real pul emas, lekin balans va paket logikasi to'liq ishlaydi).

Umumiy ketma-ketlik: har bir imkoniyat uchun avval **backend** (model → schema → API), keyin **frontend** (API chaqiruv → UI). Har fazadan keyin qisqa test.

---

## Faza 0 — Tayyorgarlik (poydevor)

- [ ] `backend/app/security.py` dagi `get_current_user_optional` ni xabar/sevimli endpointlarда qayta ishlatish (mavjud).
- [ ] Frontendда bir joyda auth tekshiruvi: token bo'lmasa `/login` ga yo'naltiruvchi umumiy helper (`lib/api.ts` ga `requireAuth()`).
- [ ] `.env.example` ga yangi o'zgaruvchilar (mock to'lov, admin telefon) qo'shish.
- [ ] Migratsiya strategiyasi: hozir `Base.metadata.create_all` ishlatiladi. Yangi ustunlar uchun **Alembic** qo'shish yoki test bazasini qayta yaratish.

---

## Faza 1 — Xabarlashuv (Messages) 🔴 eng muhim

**Backend** (`Message` modeli allaqachon bor, faqat API yo'q):
- [ ] `backend/app/api/messages.py` yaratish:
  - `POST /api/messages` — `{to_user_id, listing_id?, text}` yuborish (auth).
  - `GET /api/messages/threads` — foydalanuvchining barcha suhbatlari (oxirgi xabar + o'qilmagan soni bilan).
  - `GET /api/messages/{peer_id}` — ma'lum foydalanuvchi bilan to'liq suhbat, ochilganda `is_read=True`.
  - `GET /api/messages/unread-count` — badge uchun.
- [ ] `schemas.py` ga `MessageCreate`, `MessageOut`, `ThreadOut`.
- [ ] `main.py` da router'ni ulash.

**Frontend**:
- [ ] `app/listing/[id]/client.tsx` — "Sotuvchiga yozing" tugmasiga `onClick` → `/messages/[peerId]` ga o'tish, `listing_id` bilan.
- [ ] `app/messages/page.tsx` — statik placeholder o'rniga real `GET /threads` ro'yxati (avatar, oxirgi xabar, vaqt, o'qilmagan nuqta).
- [ ] `app/messages/[peerId]/page.tsx` (yangi) — chat oynasi: xabarlar, yuborish inputi, 5–10 sekundlik polling.
- [ ] `BottomNav` — xabarlar ikoniga o'qilmagan badge.

---

## Faza 2 — Sevimlilar (Favorites) 🔴

**Backend**:
- [ ] `models.py` ga `Favorite` modeli: `user_id`, `listing_id`, `created_at` (unique juftlik).
- [ ] `backend/app/api/favorites.py`:
  - `POST /api/favorites/{listing_id}` — qo'shish/olib tashlash (toggle).
  - `GET /api/favorites` — foydalanuvchi saqlaganlari (to'liq listing bilan).
- [ ] `ListingOut` ga ixtiyoriy `is_favorite` maydoni (`get_current_user_optional` orqali).

**Frontend**:
- [ ] `app/listing/[id]/client.tsx` — ❤️ tugmasi lokal `useState` o'rniga `POST /favorites/{id}`, holat serverdan.
- [ ] `components/ListingCard.tsx` — kartochkada yurak ikoni (ixtiyoriy).
- [ ] `app/profile/page.tsx` — "saved" (❤️) tabida real `GET /favorites` ro'yxati.

---

## Faza 3 — To'lov, Balans, VIP/TOP paketlar 🟡 (mock)

**Backend**:
- [ ] `models.py` ga `Transaction` modeli: `user_id`, `amount`, `type` (topup/purchase), `status`, `created_at`.
- [ ] `backend/app/api/payments.py`:
  - `POST /api/payments/topup` — `{amount}` mock: balansni oshiradi, tranzaksiya yozadi (darhol `success`).
  - `GET /api/payments/history` — tranzaksiyalar.
  - `POST /api/payments/promote` — `{listing_id, package}` (vip/top, muddat). Balansdan yechadi, `is_vip`/`is_top`=True, `promoted_until` ga muddat. Balans yetmasa 402.
- [ ] `Listing` ga `promoted_until` (DateTime) qo'shish; muddati o'tganда flag'ni o'chirish.
- [ ] Paket narxlari — `config` (masalan VIP 7 kun = 50 000 so'm).

**Frontend**:
- [ ] `app/profile/page.tsx` — "To'ldirish" → modal (summa) → `POST /topup`. "Paket" → paket tanlash.
- [ ] "my listings" da "VIP qilish" tugmasi → `POST /promote`.
- [ ] Tranzaksiyalar tarixi bo'limi (ixtiyoriy).

> Real Payme/Click keyin: mock qismini provayder webhook'iga almashtirish kifoya — arxitektura tayyor bo'ladi.

---

## Faza 4 — Profil tahrirlash 🟢 (backend tayyor)

`PATCH /api/users/me` allaqachon ishlaydi, faqat frontend ulanmagan.
- [ ] `app/profile/page.tsx` — Edit (✏️) → modal: ism, username, avatar.
- [ ] Avatar yuklash: `POST /api/upload/image` (mavjud) → `PATCH /users/me` da `avatar` saqlash.
- [ ] Share (🔗) → profil havolasini nusxalash (`/u/{username}`, ixtiyoriy jamoat profili).

---

## Faza 5 — Foydalanuvchi statistikasi 🟢

Hozir `korishlar_count`, `qongiroqlar_count` doim 0.
- [ ] E'lon ko'rilganda (`GET /listings/{id}`) — egasining `korishlar_count` ni ham oshirish.
- [ ] "Qo'ng'iroq" bosilganda `POST /api/listings/{id}/call` → egasining `qongiroqlar_count` ni oshirish.

---

## Faza 6 — Admin / Moderatsiya 🟡

Hozir e'lonlar to'g'ridan-to'g'ri `approved`. `ListingStatus` (pending/approved/rejected) modeli bor.
- [ ] `backend/app/api/admin.py` (faqat `is_admin`):
  - `GET /api/admin/listings?status=pending` — kutayotganlar.
  - `PATCH /api/admin/listings/{id}` — approve/reject.
  - `GET /api/admin/stats` — umumiy raqamlar.
- [ ] Yangi e'lonlar `status="pending"` bilan yaratilsin (sozlanadigan).
- [ ] `app/admin/page.tsx` — oddiy moderatsiya paneli.
- [ ] Seed'да bitta admin foydalanuvchi (`is_admin=True`).

---

## Faza 7 — Telegram OTP (ixtiyoriy) ⚪

- [ ] Telegram bot, `method=telegram` uchun bot orqali kod yuborish (foydalanuvchi botga /start bosishi kerak).
- [ ] Murakkab bo'lsa — hozircha SMS + demo yetarli, keyinga qoldirish.

---

## Faza 8 — Yakuniy tekshiruv (verification)

- [ ] Backend: har bir yangi endpoint uchun `pytest` (auth, xato, ruxsat).
- [ ] To'liq oqim: ro'yxatdan o'tish → e'lon qo'shish → sevimli → xabar → VIP sotib olish → admin approve.
- [ ] `docker-compose up` bilan toza bazada seed + qo'lda smoke-test.
- [ ] Frontend: token yo'q holatда himoyalangan sahifalar `/login` ga yo'naltirishini tekshirish.
- [ ] CORS, rasm limiti (10 ta), narx/maydon validatsiyasi.

---

## Taxminiy tartib va hajm

| Faza | Imkoniyat | Murakkablik |
|------|-----------|-------------|
| 1 | Xabarlashuv | O'rta-Yuqori |
| 2 | Sevimlilar | Past |
| 3 | To'lov/VIP (mock) | O'rta |
| 4 | Profil tahrirlash | Past |
| 5 | Statistika | Past |
| 6 | Admin panel | O'rta |
| 7 | Telegram OTP | (ixtiyoriy) |
| 8 | Test | — |

Tavsiya etilgan tartib: **2 → 4 → 5 → 1 → 3 → 6**. Kichik va mustaqil qismlar avval bitib, ilova tez "to'liq" ko'rina boshlaydi.
