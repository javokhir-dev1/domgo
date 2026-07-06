"""
JOYMEE - Demo ma'lumotlar qo'shish
Xiva: 10 ta e'lon
Toshkent: 10 ta e'lon

Ishlatish:
  1. BASE_URL ni o'zgartiring (pastda)
  2. python seed_listings.py
"""

import asyncio
import httpx
import sys

# ─── CONFIG ───────────────────────────────────────────────────────────────────

BASE_URL = https://joymeeuzbabc-production.up.railway.app"  # ← SHU YERNI O'ZGARTIRING

BASE_URL = BASE_URL.rstrip("/")
print(f"\n📡 Backend: {BASE_URL}\n")

# ─── DEMO E'LONLAR ────────────────────────────────────────────────────────────

LISTINGS = [
    # ══════════════════ XIVA ══════════════════
    {
        "title": "Xiva shahrida 3 xona kvartira",
        "description": "Xiva markazida, Ichon-qal'aga yaqin joylashgan shinam 3 xonali kvartira. Yangi ta'mir, mebel bilan. Hammom, balkon mavjud.",
        "deal_type": "sale",
        "category": "apartment",
        "price": 45000,
        "currency": "usd",
        "rooms": 3,
        "area_m2": 78,
        "floor": 3,
        "floors": 5,
        "tamir": "evro",
        "region": "Xorazm",
        "city": "Xiva",
        "address": "Mustaqillik ko'chasi 12",
        "lat": 41.3775,
        "lng": 60.3619,
        "is_vip": True,
    },
    {
        "title": "Xiva - yangi qurilma 2 xona",
        "description": "Xivada yangi 16 qavatli uyda 2 xonali kvartira. Lift, podval, avtoturargoh. Sharqiy tomondan chiqqanda Ichon-qal'a ko'rinadi.",
        "deal_type": "sale",
        "category": "apartment",
        "price": 32000,
        "currency": "usd",
        "rooms": 2,
        "area_m2": 55,
        "floor": 7,
        "floors": 16,
        "tamir": "oddiy",
        "region": "Xorazm",
        "city": "Xiva",
        "address": "Bog'cha ko'chasi 5",
        "lat": 41.3803,
        "lng": 60.3641,
        "is_top": True,
    },
    {
        "title": "Xiva - katta hovlili 5 xona uy",
        "description": "Xiva shahrida 8 sotix hovli, 5 xona, alohida kuchxona, garaj, mevali bog'. Ko'chadan beton yo'l. Tabiiy gaz, suv, kanalizatsiya.",
        "deal_type": "sale",
        "category": "house",
        "price": 85000,
        "currency": "usd",
        "rooms": 5,
        "area_m2": 220,
        "floor": 1,
        "floors": 2,
        "land_sotix": 8,
        "tamir": "evro",
        "region": "Xorazm",
        "city": "Xiva",
        "address": "Xonqa yo'li 33",
        "lat": 41.3720,
        "lng": 60.3590,
    },
    {
        "title": "Xivada yer maydonchasi - 12 sotix",
        "description": "Xiva shahri chegarasida qurilish uchun 12 sotix toza yer. Barcha kommunikatsiyalar yaqinda. Hujjatlar tayyor.",
        "deal_type": "sale",
        "category": "land",
        "price": 28000,
        "currency": "usd",
        "land_sotix": 12,
        "region": "Xorazm",
        "city": "Xiva",
        "address": "Oltinko'l yo'nalishi",
        "lat": 41.3840,
        "lng": 60.3700,
    },
    {
        "title": "Xiva - mehmonxona binosi ijaraga",
        "description": "Ichon-qal'adan 200 metr. 3 qavatli, 12 xonali mehmonxona binosi ijaraga. Turistlar uchun qulay joylashuv. Aylana yo'l yaqinida.",
        "deal_type": "rent",
        "category": "commercial",
        "price": 5000,
        "currency": "usd",
        "area_m2": 450,
        "floor": 1,
        "floors": 3,
        "region": "Xorazm",
        "city": "Xiva",
        "address": "Amir Temur ko'chasi 8",
        "lat": 41.3791,
        "lng": 60.3625,
        "is_vip": True,
    },
    {
        "title": "Xiva markazida 1 xona kvartira ijaraga",
        "description": "Xiva markazida qulay 1 xonali kvartira. Mebel, texnika bor. Internet ulangan. Oilaviy yoki juftlik uchun ideal.",
        "deal_type": "rent",
        "category": "apartment",
        "price": 2500000,
        "currency": "uzs",
        "rooms": 1,
        "area_m2": 38,
        "floor": 2,
        "floors": 4,
        "tamir": "evro",
        "region": "Xorazm",
        "city": "Xiva",
        "address": "Pahlavon Mahmud ko'chasi 17",
        "lat": 41.3765,
        "lng": 60.3608,
    },
    {
        "title": "Xiva - kunlik ijara, turistlar uchun",
        "description": "Xiva Ichon-qal'a yonida turistik uy. 3 xona, 6 kishi sig'adi. An'anaviy o'zbek uslubidagi bezatilgan. Wi-Fi, konditsioner.",
        "deal_type": "daily",
        "category": "house",
        "price": 350000,
        "currency": "uzs",
        "rooms": 3,
        "area_m2": 90,
        "floor": 1,
        "floors": 1,
        "tamir": "dizayn",
        "region": "Xorazm",
        "city": "Xiva",
        "address": "Ichon-qal'a yonida",
        "lat": 41.3782,
        "lng": 60.3632,
        "is_top": True,
    },
    {
        "title": "Xivada ofis ijaraga - markazda",
        "description": "Xiva markazida 2-qavatda 60 kv.m ofis maydoni. Lift, konditsioner, internet. Biznes uchun qulay manzil.",
        "deal_type": "rent",
        "category": "commercial",
        "price": 1800000,
        "currency": "uzs",
        "area_m2": 60,
        "floor": 2,
        "floors": 3,
        "tamir": "evro",
        "region": "Xorazm",
        "city": "Xiva",
        "address": "Sayilgoh ko'chasi 4",
        "lat": 41.3758,
        "lng": 60.3580,
    },
    {
        "title": "Xiva - yangi uy, 4 xona, garaj bilan",
        "description": "2023-yilda qurilgan 4 xonali zamonaviy uy. 6 sotix er, ikki mashinali garaj, dam olish bog'i. Barcha hujjatlar tayyor.",
        "deal_type": "sale",
        "category": "house",
        "price": 72000,
        "currency": "usd",
        "rooms": 4,
        "area_m2": 180,
        "floor": 1,
        "floors": 2,
        "land_sotix": 6,
        "tamir": "dizayn",
        "region": "Xorazm",
        "city": "Xiva",
        "address": "Xonqa ko'chasi 55",
        "lat": 41.3810,
        "lng": 60.3660,
    },
    {
        "title": "Xiva - 2 xona kvartira, 3-qavat",
        "description": "Xivada 5 qavatli binoning 3-qavatida joylashgan 2 xonali kvartira. O'rta ta'mir. Ko'cha tomonga qaragan. Narx kelishiladi.",
        "deal_type": "sale",
        "category": "apartment",
        "price": 27000,
        "currency": "usd",
        "rooms": 2,
        "area_m2": 52,
        "floor": 3,
        "floors": 5,
        "tamir": "oddiy",
        "region": "Xorazm",
        "city": "Xiva",
        "address": "Yoshlar ko'chasi 22",
        "lat": 41.3748,
        "lng": 60.3610,
    },

    # ══════════════════ TOSHKENT ══════════════════
    {
        "title": "Yunusobod - 3 xona, 16-qavat, panorama",
        "description": "Yunusobod tumani, Amir Temur xiyoboni yaqinida. Premium bino, 16-qavatda panoramali ko'rinish. Evro ta'mir, mebel bilan. Lift, qo'riqlanadigan hovli.",
        "deal_type": "sale",
        "category": "apartment",
        "price": 148000,
        "currency": "usd",
        "rooms": 3,
        "area_m2": 95,
        "floor": 16,
        "floors": 20,
        "tamir": "dizayn",
        "region": "Toshkent",
        "city": "Toshkent",
        "address": "Amir Temur xiyoboni, 15",
        "lat": 41.3111,
        "lng": 69.2797,
        "is_vip": True,
        "is_top": True,
    },
    {
        "title": "Chilonzor - 2 xona kvartira",
        "description": "Chilonzor 9-kvartal, metro yaqinida 2 xonali kvartira. O'rta ta'mir, qulay joylashuv. Maktab, dorixona, bozor yaqin.",
        "deal_type": "sale",
        "category": "apartment",
        "price": 55000,
        "currency": "usd",
        "rooms": 2,
        "area_m2": 54,
        "floor": 5,
        "floors": 9,
        "tamir": "oddiy",
        "region": "Toshkent",
        "city": "Toshkent",
        "address": "Chilonzor 9-kvartal",
        "lat": 41.2857,
        "lng": 69.2001,
    },
    {
        "title": "Mirzo Ulug'bek - yangi bino, 1 xona",
        "description": "Mirzo Ulug'bek tumanida yangi qurilmada 1 xonali kvartira. Lift, qo'riqlanadigan hovli, parkovka. Evro ta'mir.",
        "deal_type": "sale",
        "category": "apartment",
        "price": 42000,
        "currency": "usd",
        "rooms": 1,
        "area_m2": 40,
        "floor": 8,
        "floors": 14,
        "tamir": "evro",
        "region": "Toshkent",
        "city": "Toshkent",
        "address": "Mirzo Ulug'bek tumani",
        "lat": 41.3310,
        "lng": 69.3040,
    },
    {
        "title": "Uchtepa - 4 xona, hovlili uy",
        "description": "Uchtepa tumanida 10 sotix hovli, 4 xona, garaj. Tabiiy gaz, markaziy suv. Maktab va bog'cha 5 daqiqada. Hujjatlar tayyor.",
        "deal_type": "sale",
        "category": "house",
        "price": 130000,
        "currency": "usd",
        "rooms": 4,
        "area_m2": 200,
        "floor": 1,
        "floors": 2,
        "land_sotix": 10,
        "tamir": "evro",
        "region": "Toshkent",
        "city": "Toshkent",
        "address": "Uchtepa tumani",
        "lat": 41.2740,
        "lng": 69.1980,
        "is_vip": True,
    },
    {
        "title": "Shayhontohur - ofis binosi ijaraga",
        "description": "Toshkent markazida Shayhontohur tumanida 3-qavatda 120 kv.m ofis. Server xonasi, qabul xonasi, 3 ta kabinet. Metro yaqin.",
        "deal_type": "rent",
        "category": "commercial",
        "price": 8000,
        "currency": "usd",
        "area_m2": 120,
        "floor": 3,
        "floors": 5,
        "tamir": "evro",
        "region": "Toshkent",
        "city": "Toshkent",
        "address": "Mustaqillik maydoni yaqinida",
        "lat": 41.2994,
        "lng": 69.2401,
        "is_top": True,
    },
    {
        "title": "Yakkasaroy - 3 xona kvartira ijaraga",
        "description": "Yakkasaroy tumanida evro ta'mirli 3 xonali kvartira. Mebel, texnika, internet bor. Oila yoki xorijiy mutaxassislar uchun.",
        "deal_type": "rent",
        "category": "apartment",
        "price": 1200,
        "currency": "usd",
        "rooms": 3,
        "area_m2": 85,
        "floor": 4,
        "floors": 9,
        "tamir": "dizayn",
        "region": "Toshkent",
        "city": "Toshkent",
        "address": "Yakkasaroy tumani",
        "lat": 41.2900,
        "lng": 69.2600,
    },
    {
        "title": "Sergeli - qurilish uchun 15 sotix yer",
        "description": "Sergeli tumanida kommunikatsiyali 15 sotix qurilish yeri. Asfalт yo'l, gaz, suv, elektr mavjud. Hujjatlar toza.",
        "deal_type": "sale",
        "category": "land",
        "price": 25000,
        "currency": "usd",
        "land_sotix": 15,
        "region": "Toshkent",
        "city": "Toshkent",
        "address": "Sergeli tumani",
        "lat": 41.2250,
        "lng": 69.2200,
    },
    {
        "title": "Bektemir - 2 xona, 1-qavat",
        "description": "Bektemir tumanida qulay joylashgan 2 xonali kvartira. 1-qavat, alohida kirish imkoni bor. O'zgartirib do'konga ham aylantirish mumkin.",
        "deal_type": "sale",
        "category": "apartment",
        "price": 38000,
        "currency": "usd",
        "rooms": 2,
        "area_m2": 58,
        "floor": 1,
        "floors": 5,
        "tamir": "oddiy",
        "region": "Toshkent",
        "city": "Toshkent",
        "address": "Bektemir tumani",
        "lat": 41.2600,
        "lng": 69.3200,
    },
    {
        "title": "Olmazar - kunlik kvartira ijaraga",
        "description": "Olmazar tumanida kunlik ijaraga beriladigan shinam 1 xonali kvartira. Wi-Fi, konditsioner, yangi texnika. Biznes safar yoki dam olish uchun.",
        "deal_type": "daily",
        "category": "apartment",
        "price": 250000,
        "currency": "uzs",
        "rooms": 1,
        "area_m2": 36,
        "floor": 6,
        "floors": 9,
        "tamir": "evro",
        "region": "Toshkent",
        "city": "Toshkent",
        "address": "Olmazar tumani",
        "lat": 41.3200,
        "lng": 69.2950,
        "is_top": True,
    },
    {
        "title": "Yashnobod - tijorat do'kon ijaraga",
        "description": "Yashnobod tumanida gavjum ko'chada 80 kv.m do'kon joyi. Ko'chaga alohida eshik, vitrina, suv va kanalizatsiya mavjud.",
        "deal_type": "rent",
        "category": "commercial",
        "price": 5000000,
        "currency": "uzs",
        "area_m2": 80,
        "floor": 1,
        "floors": 3,
        "tamir": "oddiy",
        "region": "Toshkent",
        "city": "Toshkent",
        "address": "Yashnobod tumani, bosh ko'cha",
        "lat": 41.3050,
        "lng": 69.3400,
    },
]

# ─── SEED FUNCTION ─────────────────────────────────────────────────────────────

async def seed():
    async with httpx.AsyncClient(timeout=30) as client:

        # 1. Health check
        try:
            r = await client.get(f"{BASE_URL}/health")
            print(f"✅ Backend ishlayapti: {r.json()}")
        except Exception as e:
            print(f"❌ Backend ga ulanib bo'lmadi: {e}")
            print(f"   URL ni tekshiring: {BASE_URL}")
            sys.exit(1)

        # 2. Demo foydalanuvchi yaratish / kirish
        print("\n👤 Demo foydalanuvchi yaratilmoqda...")
        phone = "+998901234567"

        # OTP so'rash
        try:
            r = await client.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": phone, "method": "sms"})
            data = r.json()
            print(f"   OTP yuborildi: {data}")
        except Exception as e:
            print(f"   OTP xatosi: {e}")

        # Demo code bilan kirish (backend demo_code qaytaradi)
        otp_code = "12345"  # Backend demo rejimda shu kodni qabul qiladi
        try:
            r = await client.post(f"{BASE_URL}/api/auth/verify-otp", json={"phone": phone, "code": otp_code})
            auth = r.json()
            if "access_token" not in auth:
                print(f"❌ OTP xato: {auth}")
                print("   Iltimos, avval backendda demo rejim ishlayotganini tekshiring")
                sys.exit(1)
            token = auth["access_token"]
            print(f"✅ Token olindi!")
        except Exception as e:
            print(f"❌ Kirish xatosi: {e}")
            sys.exit(1)

        headers = {"Authorization": f"Bearer {token}"}

        # 3. E'lonlarni qo'shish
        print(f"\n📦 {len(LISTINGS)} ta e'lon qo'shilmoqda...\n")
        success = 0
        failed = 0

        for i, listing in enumerate(LISTINGS, 1):
            city = listing.get("city", "")
            title = listing.get("title", "")
            print(f"  [{i:02d}/{len(LISTINGS)}] {city}: {title[:50]}...", end=" ", flush=True)

            try:
                r = await client.post(
                    f"{BASE_URL}/api/listings/",
                    json=listing,
                    headers=headers
                )
                if r.status_code in (200, 201):
                    resp = r.json()
                    lid = resp.get("id", "?")
                    print(f"✅ (ID: {lid})")
                    success += 1
                else:
                    print(f"❌ {r.status_code}: {r.text[:100]}")
                    failed += 1
            except Exception as e:
                print(f"❌ {e}")
                failed += 1

        # 4. Natija
        print(f"\n{'='*50}")
        print(f"✅ Muvaffaqiyatli: {success} ta")
        if failed:
            print(f"❌ Xato: {failed} ta")
        print(f"{'='*50}")
        print(f"\n🌐 E'lonlarni tekshiring: {BASE_URL}/docs")
        print(f"🏠 Frontend: sizning Netlify URL\n")

if __name__ == "__main__":
    asyncio.run(seed())
