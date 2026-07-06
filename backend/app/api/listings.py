from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.database import get_db
from app.models import Listing, ListingImage, User, Favorite
from app.schemas import ListingOut, ListingCreate
from app.security import get_current_user, get_current_user_optional
import os, uuid, aiofiles
from PIL import Image as PILImage
import io, math
from datetime import datetime, timezone

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
# Yangi e'lonlar avtomatik tasdiqlanadimi? "1" = darhol, "0" = admin moderatsiyasi
AUTO_APPROVE = os.getenv("AUTO_APPROVE", "1") == "1"


async def favorite_ids(db, user) -> set:
    if not user:
        return set()
    res = await db.execute(select(Favorite.listing_id).where(Favorite.user_id == user.id))
    return set(res.scalars().all())


async def save_image(file: UploadFile) -> str:
    ext = file.filename.split(".")[-1].lower() if file.filename else "jpg"
    if ext not in ["jpg", "jpeg", "png", "webp"]:
        ext = "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    contents = await file.read()
    try:
        img = PILImage.open(io.BytesIO(contents))
        if img.width > 1200 or img.height > 1200:
            img.thumbnail((1200, 1200))
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        contents = buf.getvalue()
    except Exception:
        pass
    async with aiofiles.open(path, "wb") as f:
        await f.write(contents)
    return f"uploads/{filename}"


def listing_to_out(l: Listing, fav_ids: set = None) -> dict:
    # Reklama muddati tugagan bo'lsa VIP/TOP ni o'chirib ko'rsatamiz
    is_vip, is_top = l.is_vip, l.is_top
    if l.promoted_until is not None:
        pu = l.promoted_until
        now = datetime.now(timezone.utc)
        if pu.tzinfo is None:
            pu = pu.replace(tzinfo=timezone.utc)
        if pu < now:
            is_vip, is_top = False, False
    return {
        "id": l.id, "title": l.title, "description": l.description,
        "deal_type": l.deal_type, "category": l.category,
        "price": l.price, "currency": l.currency or "ye",
        "rooms": l.rooms, "area_m2": l.area_m2, "floor": l.floor,
        "floors": l.floors, "land_sotix": l.land_sotix, "tamir": l.tamir,
        "region": l.region, "city": l.city, "address": l.address,
        "lat": l.lat, "lng": l.lng, "status": l.status,
        "is_vip": is_vip, "is_top": is_top,
        "view_count": l.view_count, "owner_id": l.owner_id,
        "created_at": l.created_at, "published_at": l.published_at,
        "images": [{"id": i.id, "file_path": i.file_path, "order": i.order} for i in l.images],
        "owner_phone": l.owner.phone if l.owner else None,
        "owner_username": l.owner.username if l.owner else None,
        "owner_name": l.owner.name if l.owner else None,
        "distance_km": None,
        "is_favorite": bool(fav_ids and l.id in fav_ids),
    }


@router.get("/", response_model=List[ListingOut])
async def get_listings(
    deal_type: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    rooms: Optional[int] = None,
    status: str = "approved",
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    q = select(Listing).options(selectinload(Listing.images), selectinload(Listing.owner))
    filters = [Listing.status == status]
    if deal_type: filters.append(Listing.deal_type == deal_type)
    if category: filters.append(Listing.category == category)
    if region: filters.append(Listing.region == region)
    if city: filters.append(Listing.city.ilike(f"%{city}%"))
    if min_price: filters.append(Listing.price >= min_price)
    if max_price: filters.append(Listing.price <= max_price)
    if rooms: filters.append(Listing.rooms == rooms)
    q = q.where(and_(*filters)).order_by(
        Listing.is_vip.desc(), Listing.is_top.desc(), Listing.published_at.desc()
    ).limit(limit).offset(offset)
    result = await db.execute(q)
    listings = result.scalars().all()
    favs = await favorite_ids(db, current_user)
    return [listing_to_out(l, favs) for l in listings]


@router.get("/near", response_model=List[ListingOut])
async def get_near(
    lat: float, lng: float, radius_km: float = 10,
    deal_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    lat_delta = radius_km / 111.0
    lng_delta = radius_km / (111.0 * math.cos(math.radians(lat)))
    q = select(Listing).options(selectinload(Listing.images), selectinload(Listing.owner)).where(
        and_(
            Listing.status == "approved",
            Listing.lat.isnot(None),
            Listing.lng.isnot(None),
            Listing.lat.between(lat - lat_delta, lat + lat_delta),
            Listing.lng.between(lng - lng_delta, lng + lng_delta),
        )
    )
    if deal_type:
        q = q.where(Listing.deal_type == deal_type)
    result = await db.execute(q)
    listings = result.scalars().all()
    favs = await favorite_ids(db, current_user)
    out = []
    for l in listings:
        if l.lat and l.lng:
            R = 6371
            dlat = math.radians(l.lat - lat)
            dlng = math.radians(l.lng - lng)
            a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat)) * math.cos(math.radians(l.lat)) * math.sin(dlng / 2) ** 2
            dist = R * 2 * math.asin(math.sqrt(a))
            if dist <= radius_km:
                d = listing_to_out(l, favs)
                d["distance_km"] = round(dist, 2)
                out.append(d)
    out.sort(key=lambda x: x["distance_km"] or 0)
    return out


@router.get("/{listing_id}", response_model=ListingOut)
async def get_listing(listing_id: int, db: AsyncSession = Depends(get_db),
                      current_user=Depends(get_current_user_optional)):
    result = await db.execute(
        select(Listing).options(selectinload(Listing.images), selectinload(Listing.owner))
        .where(Listing.id == listing_id)
    )
    l = result.scalar_one_or_none()
    if not l:
        raise HTTPException(404, "E'lon topilmadi")
    l.view_count = (l.view_count or 0) + 1
    if l.owner:
        l.owner.korishlar_count = (l.owner.korishlar_count or 0) + 1
    await db.commit()
    favs = await favorite_ids(db, current_user)
    return listing_to_out(l, favs)


@router.post("/{listing_id}/call")
async def register_call(listing_id: int, db: AsyncSession = Depends(get_db)):
    """Qo'ng'iroq tugmasi bosilganda egasining qongiroqlar_count ini oshiradi."""
    result = await db.execute(
        select(Listing).options(selectinload(Listing.owner)).where(Listing.id == listing_id)
    )
    l = result.scalar_one_or_none()
    if not l:
        raise HTTPException(404, "E'lon topilmadi")
    if l.owner:
        l.owner.qongiroqlar_count = (l.owner.qongiroqlar_count or 0) + 1
        await db.commit()
    return {"ok": True, "phone": l.owner.phone if l.owner else None}


@router.post("/", response_model=ListingOut)
async def create_listing(
    title: str = Form(...),
    deal_type: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    region: str = Form(...),
    city: str = Form(...),
    currency: str = Form("ye"),
    description: Optional[str] = Form(None),
    rooms: Optional[int] = Form(None),
    area_m2: Optional[float] = Form(None),
    floor: Optional[int] = Form(None),
    floors: Optional[int] = Form(None),
    land_sotix: Optional[float] = Form(None),
    tamir: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    images: List[UploadFile] = File(default=[]),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    listing = Listing(
        title=title, deal_type=deal_type, category=category, price=price,
        region=region, city=city, currency=currency, description=description,
        rooms=rooms, area_m2=area_m2, floor=floor, floors=floors,
        land_sotix=land_sotix, tamir=tamir, address=address, lat=lat, lng=lng,
        owner_id=current_user.id, status="approved" if AUTO_APPROVE else "pending",
    )
    db.add(listing)
    await db.flush()
    for i, img in enumerate(images[:10]):
        if img.filename:
            path = await save_image(img)
            db.add(ListingImage(listing_id=listing.id, file_path=path, order=i))
    current_user.elonlar_count = (current_user.elonlar_count or 0) + 1
    await db.commit()
    await db.refresh(listing)
    result = await db.execute(
        select(Listing).options(selectinload(Listing.images), selectinload(Listing.owner))
        .where(Listing.id == listing.id)
    )
    return listing_to_out(result.scalar_one())


@router.delete("/{listing_id}")
async def delete_listing(listing_id: int, db: AsyncSession = Depends(get_db),
                         current_user=Depends(get_current_user)):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    l = result.scalar_one_or_none()
    if not l:
        raise HTTPException(404, "Topilmadi")
    if l.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "Ruxsat yo'q")
    await db.delete(l)
    await db.commit()
    return {"ok": True}


@router.get("/my/listings", response_model=List[ListingOut])
async def my_listings(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(
        select(Listing).options(selectinload(Listing.images), selectinload(Listing.owner))
        .where(Listing.owner_id == current_user.id)
        .order_by(Listing.created_at.desc())
    )
    favs = await favorite_ids(db, current_user)
    return [listing_to_out(l, favs) for l in result.scalars().all()]
