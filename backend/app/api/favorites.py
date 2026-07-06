from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from app.database import get_db
from app.models import Favorite, Listing
from app.schemas import ListingOut
from app.security import get_current_user

router = APIRouter()


@router.post("/{listing_id}")
async def toggle_favorite(listing_id: int, db: AsyncSession = Depends(get_db),
                          current_user=Depends(get_current_user)):
    listing = await db.execute(select(Listing).where(Listing.id == listing_id))
    if not listing.scalar_one_or_none():
        raise HTTPException(404, "E'lon topilmadi")
    existing = await db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id, Favorite.listing_id == listing_id
        )
    )
    fav = existing.scalar_one_or_none()
    if fav:
        await db.delete(fav)
        await db.commit()
        return {"is_favorite": False}
    db.add(Favorite(user_id=current_user.id, listing_id=listing_id))
    await db.commit()
    return {"is_favorite": True}


@router.get("/", response_model=List[ListingOut])
async def my_favorites(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from app.api.listings import listing_to_out
    result = await db.execute(
        select(Listing).join(Favorite, Favorite.listing_id == Listing.id)
        .options(selectinload(Listing.images), selectinload(Listing.owner))
        .where(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
    )
    listings = result.scalars().all()
    out = []
    for l in listings:
        d = listing_to_out(l)
        d["is_favorite"] = True
        out.append(d)
    return out
