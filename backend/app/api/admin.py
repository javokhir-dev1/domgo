from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.database import get_db
from app.models import Listing, User, Message
from app.schemas import ListingOut
from app.security import get_current_user

router = APIRouter()


async def require_admin(current_user=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(403, "Faqat admin uchun")
    return current_user


@router.get("/listings", response_model=List[ListingOut])
async def admin_listings(status: Optional[str] = "pending", db: AsyncSession = Depends(get_db),
                         admin=Depends(require_admin)):
    from app.api.listings import listing_to_out
    q = select(Listing).options(selectinload(Listing.images), selectinload(Listing.owner))
    if status and status != "all":
        q = q.where(Listing.status == status)
    q = q.order_by(Listing.created_at.desc())
    result = await db.execute(q)
    return [listing_to_out(l) for l in result.scalars().all()]


@router.patch("/listings/{listing_id}")
async def moderate(listing_id: int, action: str, db: AsyncSession = Depends(get_db),
                   admin=Depends(require_admin)):
    if action not in ("approve", "reject", "archive"):
        raise HTTPException(400, "action: approve | reject | archive")
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(404, "E'lon topilmadi")
    listing.status = {"approve": "approved", "reject": "rejected", "archive": "archived"}[action]
    await db.commit()
    return {"ok": True, "status": listing.status}


@router.get("/stats")
async def stats(db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    async def count(model, *where):
        q = select(func.count()).select_from(model)
        for w in where:
            q = q.where(w)
        return (await db.execute(q)).scalar() or 0

    return {
        "users": await count(User),
        "listings_total": await count(Listing),
        "listings_pending": await count(Listing, Listing.status == "pending"),
        "listings_approved": await count(Listing, Listing.status == "approved"),
        "vip": await count(Listing, Listing.is_vip == True),
        "messages": await count(Message),
    }
