from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from typing import List
from app.database import get_db
from app.models import Transaction, Listing
from app.schemas import TopupRequest, PromoteRequest, TransactionOut
from app.security import get_current_user

router = APIRouter()

# Paket narxlari (so'm/kun). Mock — real provayder keyin ulanadi.
PACKAGE_PRICE_PER_DAY = {"vip": 15000, "top": 8000}


@router.post("/topup", response_model=TransactionOut)
async def topup(data: TopupRequest, db: AsyncSession = Depends(get_db),
                current_user=Depends(get_current_user)):
    # MOCK: darhol muvaffaqiyatli hisoblanadi
    current_user.balance = (current_user.balance or 0) + data.amount
    tx = Transaction(
        user_id=current_user.id, amount=data.amount, type="topup",
        description=f"Balans to'ldirildi: {data.amount:,.0f} so'm", status="success",
    )
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return tx


@router.post("/promote")
async def promote(data: PromoteRequest, db: AsyncSession = Depends(get_db),
                  current_user=Depends(get_current_user)):
    pkg = data.package.lower()
    if pkg not in PACKAGE_PRICE_PER_DAY:
        raise HTTPException(400, "Noto'g'ri paket (vip yoki top)")
    if data.days < 1 or data.days > 90:
        raise HTTPException(400, "Muddat 1–90 kun oralig'ida bo'lsin")

    result = await db.execute(select(Listing).where(Listing.id == data.listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(404, "E'lon topilmadi")
    if listing.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "Ruxsat yo'q")

    cost = PACKAGE_PRICE_PER_DAY[pkg] * data.days
    if (current_user.balance or 0) < cost:
        raise HTTPException(402, f"Balans yetarli emas. Kerak: {cost:,.0f} so'm")

    current_user.balance -= cost
    until = datetime.now(timezone.utc) + timedelta(days=data.days)
    listing.promoted_until = until
    if pkg == "vip":
        listing.is_vip = True
    else:
        listing.is_top = True

    tx = Transaction(
        user_id=current_user.id, amount=-cost, type="promote",
        description=f"{pkg.upper()} paket, {data.days} kun (e'lon #{listing.id})",
        status="success",
    )
    db.add(tx)
    await db.commit()
    return {"ok": True, "package": pkg, "cost": cost,
            "promoted_until": until.isoformat(), "balance": current_user.balance}


@router.get("/history", response_model=List[TransactionOut])
async def history(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc()).limit(100)
    )
    return result.scalars().all()
