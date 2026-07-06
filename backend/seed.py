"""Demo ma'lumotlar qo'shish"""
import asyncio
from app.database import engine, Base, AsyncSessionLocal
from app.models import User, Listing, ListingImage

DEMO_LISTINGS = [
    {"title":"15.500 dan 1 xona kvartira","description":"Yunusobod tumani, yangi premium bino, barcha kommunikatsiyalar","deal_type":"sale","category":"apartment","price":50500,"currency":"ye","rooms":1,"area_m2":45,"floor":4,"floors":16,"region":"Toshkent shahri","city":"Toshkent","lat":41.305,"lng":69.260,"is_vip":True,"images":["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]},
    {"title":"Bozsuvda uchastka srochno sotiladi","description":"4.2 sotix, qulay joylashuv, hujjatlar tayyor","deal_type":"sale","category":"land","price":57000,"currency":"ye","land_sotix":4.2,"region":"Toshkent shahri","city":"Toshkent","lat":41.315,"lng":69.275,"is_vip":True,"images":["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"]},
    {"title":"3 xonali kvartira Xiva markazi","description":"Ichan Qal'a yaqinida, yangi ta'mir, barcha kommunikatsiyalar mavjud","deal_type":"sale","category":"apartment","price":65000,"currency":"ye","rooms":3,"area_m2":78,"floor":3,"floors":5,"region":"Xorazm","city":"Xiva","lat":41.378,"lng":60.361,"images":["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"]},
    {"title":"Katta hovli uy Xiva","description":"200 m² hovli, mevali daraxtlar, yangi ta'mir","deal_type":"sale","category":"house","price":120000,"currency":"ye","rooms":4,"area_m2":180,"region":"Xorazm","city":"Xiva","lat":41.376,"lng":60.364,"images":["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"]},
    {"title":"2 xonali kvartira ijara Xiva","description":"Mebel bilan, barcha sharoitlar, markaz yaqin","deal_type":"rent","category":"apartment","price":350,"currency":"ye","rooms":2,"area_m2":52,"region":"Xorazm","city":"Xiva","lat":41.380,"lng":60.362,"images":["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]},
    {"title":"Tijorat bino Xiva bozor yaqin","description":"45 m², yo'l ustida, ajoyib joylashuv","deal_type":"rent","category":"commercial","price":800,"currency":"ye","area_m2":45,"region":"Xorazm","city":"Xiva","lat":41.377,"lng":60.365,"images":["https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800"]},
    {"title":"Premium kvartira Yunusobodda","description":"3 xona, yangi ta'mir, pool va gym bor","deal_type":"sale","category":"apartment","price":80000,"currency":"ye","rooms":3,"area_m2":85,"floor":8,"floors":16,"region":"Toshkent shahri","city":"Toshkent","lat":41.298,"lng":69.255,"is_top":True,"images":["https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800"]},
    {"title":"6 sotix elitny Mahdumquli","description":"Elitny hudud, tayyor hujjatlar, kommunikatsiyalar bor","deal_type":"sale","category":"land","price":389000,"currency":"ye","land_sotix":6,"region":"Toshkent shahri","city":"Toshkent","lat":41.290,"lng":69.270,"is_top":True,"images":["https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800"]},
    {"title":"Ijara kvartira Chilonzorda","description":"1 xona, yangi ta'mir, 5/9 qavat","deal_type":"rent","category":"apartment","price":400,"currency":"ye","rooms":1,"area_m2":38,"region":"Toshkent shahri","city":"Toshkent","lat":41.280,"lng":69.235,"images":["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]},
    {"title":"Samarqandda hovli sotiladi","description":"6 xona, 8 sotix, shaharga yaqin","deal_type":"sale","category":"house","price":95000,"currency":"ye","rooms":6,"area_m2":250,"region":"Samarqand","city":"Samarqand","lat":39.649,"lng":66.976,"images":["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"]},
]

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select, func
        # Allaqachon seed qilinganmi? (idempotent)
        existing = await db.execute(select(func.count()).select_from(Listing))
        if (existing.scalar() or 0) > 0:
            print("ℹ️  Baza allaqachon to'ldirilgan — seed o'tkazib yuborildi.")
            return

        # Demo user (bo'lsa qayta ishlatamiz)
        res = await db.execute(select(User).where(User.phone == "+998900000000"))
        user = res.scalar_one_or_none()
        if not user:
            user = User(phone="+998900000000", name="Demo Admin", username="admin", is_admin=True)
            db.add(user)
            await db.flush()

        for d in DEMO_LISTINGS:
            imgs = d.pop("images", [])
            l = Listing(**d, owner_id=user.id, status="approved")
            db.add(l)
            await db.flush()
            for i, url in enumerate(imgs):
                db.add(ListingImage(listing_id=l.id, file_path=url, order=i))
        
        user.elonlar_count = len(DEMO_LISTINGS)
        await db.commit()
        print(f"✅ {len(DEMO_LISTINGS)} ta demo e'lon qo'shildi!")

asyncio.run(main())
