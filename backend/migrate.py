"""Idempotent migratsiya: yangi jadval/ustunlarni mavjud bazaga qo'shadi.
Ishlatish: python migrate.py
"""
import asyncio
from sqlalchemy import text
from app.database import engine, Base
import app.models  # noqa: modellarni ro'yxatga olish uchun


async def main():
    # 1) Yangi jadvallar (favorites, transactions) — mavjud bo'lmasa yaratiladi
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # 2) listings jadvaliga promoted_until ustuni
    async with engine.begin() as conn:
        try:
            await conn.execute(text(
                "ALTER TABLE listings ADD COLUMN IF NOT EXISTS promoted_until TIMESTAMPTZ"
            ))
        except Exception as e:
            print("promoted_until:", e)
        try:
            await conn.execute(text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255)"
            ))
        except Exception as e:
            print("avatar:", e)
    print("✅ Migratsiya tugadi")


if __name__ == "__main__":
    asyncio.run(main())
