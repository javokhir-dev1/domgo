from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func
from typing import List
from app.database import get_db
from app.models import Message, User
from app.schemas import MessageCreate, MessageOut, ThreadOut
from app.security import get_current_user

router = APIRouter()


@router.post("/", response_model=MessageOut)
async def send_message(data: MessageCreate, db: AsyncSession = Depends(get_db),
                       current_user=Depends(get_current_user)):
    if data.to_user_id == current_user.id:
        raise HTTPException(400, "O'zingizga xabar yubora olmaysiz")
    peer = await db.execute(select(User).where(User.id == data.to_user_id))
    if not peer.scalar_one_or_none():
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    msg = Message(
        from_user_id=current_user.id, to_user_id=data.to_user_id,
        listing_id=data.listing_id, text=data.text.strip(),
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


@router.get("/threads", response_model=List[ThreadOut])
async def get_threads(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    me = current_user.id
    result = await db.execute(
        select(Message).where(or_(Message.from_user_id == me, Message.to_user_id == me))
        .order_by(Message.created_at.desc())
    )
    msgs = result.scalars().all()

    threads: dict[int, ThreadOut] = {}
    peer_ids: set[int] = set()
    for m in msgs:
        peer = m.to_user_id if m.from_user_id == me else m.from_user_id
        peer_ids.add(peer)
        if peer not in threads:
            threads[peer] = ThreadOut(
                peer_id=peer, last_text=m.text, last_at=m.created_at,
                unread=0, listing_id=m.listing_id,
            )
        # o'qilmagan: menga kelgan va o'qilmagan
        if m.to_user_id == me and not m.is_read:
            threads[peer].unread += 1

    if peer_ids:
        users = await db.execute(select(User).where(User.id.in_(peer_ids)))
        umap = {u.id: u for u in users.scalars().all()}
        for pid, t in threads.items():
            u = umap.get(pid)
            if u:
                t.peer_name = u.name
                t.peer_username = u.username
                t.peer_avatar = u.avatar
    return list(threads.values())


@router.get("/unread-count")
async def unread_count(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(
        select(func.count(Message.id)).where(
            Message.to_user_id == current_user.id, Message.is_read == False
        )
    )
    return {"count": result.scalar() or 0}


@router.get("/{peer_id}", response_model=List[MessageOut])
async def get_conversation(peer_id: int, db: AsyncSession = Depends(get_db),
                           current_user=Depends(get_current_user)):
    me = current_user.id
    result = await db.execute(
        select(Message).where(
            or_(
                and_(Message.from_user_id == me, Message.to_user_id == peer_id),
                and_(Message.from_user_id == peer_id, Message.to_user_id == me),
            )
        ).order_by(Message.created_at.asc())
    )
    msgs = result.scalars().all()
    # kelgan xabarlarni o'qilgan deb belgilash
    changed = False
    for m in msgs:
        if m.to_user_id == me and not m.is_read:
            m.is_read = True
            changed = True
    if changed:
        await db.commit()
    return msgs
