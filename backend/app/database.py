from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from urllib.parse import quote_plus
import os
from dotenv import load_dotenv
load_dotenv()

# PostgreSQL ulanishi — .env dagi DB_* qismlaridan yig'iladi
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USERNAME", "postgres")
DB_PASS = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_DATABASE", "domgo")

# To'liq DATABASE_URL berilса — u ustuvor. Aks holda DB_* dan quramiz.
DATABASE_URL = os.getenv("DATABASE_URL") or (
    f"postgresql+asyncpg://{DB_USER}:{quote_plus(DB_PASS)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
