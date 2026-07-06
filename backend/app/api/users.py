from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models import User, Listing
from app.schemas import UserOut, UserUpdate
from app.security import get_current_user

router = APIRouter()

@router.get("/top", response_model=list[UserOut])
async def get_top_users(limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).order_by(User.elonlar_count.desc()).limit(limit)
    )
    return result.scalars().all()

@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    return user

@router.patch("/me", response_model=UserOut)
async def update_me(data: UserUpdate, db: AsyncSession = Depends(get_db),
                    current_user = Depends(get_current_user)):
    if data.name: current_user.name = data.name
    if data.username: current_user.username = data.username
    if data.avatar is not None: current_user.avatar = data.avatar
    await db.commit()
    await db.refresh(current_user)
    return current_user
