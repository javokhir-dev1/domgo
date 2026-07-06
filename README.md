# DomGo — Ko'chmas Mulk Platformasi

## Tarkib
- **frontend/** — Next.js 14 (React)
- **backend/** — FastAPI (standart holatda SQLite, DB server kerak emas)

---

## Qo'lda ishga tushirish (Docker kerak emas)

Talab: **Python 3.10+** va **Node.js 18+** o'rnatilgan bo'lsin.

### Eng oson yo'l (Windows)
1. `backend\run.bat` ni ikki marta bosing — venv yaratadi, kutubxonalarni o'rnatadi,
   demo ma'lumot qo'shadi va serverni ishga tushiradi.
2. `frontend\run.bat` ni ikki marta bosing — paketlarni o'rnatib, frontendni ishga tushiradi.

- Frontend: http://localhost:3000
- Backend API hujjatlari: http://localhost:8000/docs

### Qo'lda (terminal orqali)

#### Backend
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env      # ixtiyoriy
python seed.py              # demo ma'lumot (SQLite: backend\domgo.db yaratiladi)
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```powershell
cd frontend
npm install
npm run dev
```

Frontend standart holatda `http://localhost:8000` backendiga ulanadi
(o'zgartirish uchun `frontend/.env.local` da `NEXT_PUBLIC_API_URL`).

---

## Ma'lumotlar bazasi

Standart — **SQLite** (`backend/domgo.db`), hech qanday server kerak emas.
Bazani tozalash uchun shu faylni o'chirib, `python seed.py` ni qayta ishga tushiring.

Postgres ishlatmoqchi bo'lsangiz, `backend/.env` da:
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/domgo
```
(Postgres uchun `pip install asyncpg` ham kerak.)

---

## Asosiy imkoniyatlar
- OTP auth (telefon + SMS/demo_code)
- E'lon qo'shish (10 rasm, xarita orqali joylashuv tanlash)
- Galereya va Xarita ko'rinishi, "Menga yaqin" (geolokatsiya)
- Qidiruv va filtrlar
- Xabarlashuv, Sevimlilar
- Balans + VIP/TOP paket (mock to'lov)
- Profil tahrirlash, statistika
- Admin panel (moderatsiya)

## Demo kirish
SMS sozlanmagan bo'lsa, `/api/auth/send-otp` javobida `demo_code` qaytadi.

> Eslatma: eski `docker-compose.yml` va `Dockerfile` fayllari endi kerak emas —
> ularni bemalol o'chirib tashlashingiz mumkin.
