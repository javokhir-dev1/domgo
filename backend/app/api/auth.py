from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app.models import User, OTPCode
from app.schemas import OTPRequest, OTPVerify, Token
from app.security import create_access_token, generate_otp
import httpx, os

router = APIRouter()

async def send_sms_eskiz(phone: str, text: str):
    """Eskiz.uz orqali SMS yuborish"""
    try:
        async with httpx.AsyncClient() as client:
            # Login
            login_resp = await client.post("https://notify.eskiz.uz/api/auth/login", data={
                "email": os.getenv("ESKIZ_EMAIL", ""),
                "password": os.getenv("ESKIZ_PASSWORD", ""),
            })
            if login_resp.status_code != 200:
                return False
            token = login_resp.json().get("data", {}).get("token", "")
            # Send SMS
            sms_resp = await client.post("https://notify.eskiz.uz/api/message/sms/send",
                headers={"Authorization": f"Bearer {token}"},
                data={"mobile_phone": phone.replace("+",""), "message": text, "from":"4546"}
            )
            return sms_resp.status_code == 200
    except:
        return False

@router.post("/send-otp")
async def send_otp(data: OTPRequest, db: AsyncSession = Depends(get_db)):
    phone = data.phone.strip()
    if not phone.startswith("+998") or len(phone.replace("+","").replace(" ","")) < 12:
        raise HTTPException(400, "Telefon raqami noto'g'ri")
    
    code = generate_otp()
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    # Save OTP
    otp = OTPCode(phone=phone, code=code, method=data.method, expires_at=expires)
    db.add(otp)
    await db.commit()
    
    # Send
    text = f"DomGo tasdiqlash kodi: {code}"
    if data.method == "sms":
        sent = await send_sms_eskiz(phone, text)
    else:
        sent = True  # Telegram uchun bot kerak, hozir demo
    
    # DEMO: return code in response (production da olib tashlang!)
    return {"message": "Kod yuborildi", "demo_code": code if not sent else None}

@router.post("/verify-otp", response_model=Token)
async def verify_otp(data: OTPVerify, db: AsyncSession = Depends(get_db)):
    phone = data.phone.strip()
    
    # Find latest valid OTP
    result = await db.execute(
        select(OTPCode).where(
            OTPCode.phone == phone,
            OTPCode.code == data.code,
            OTPCode.is_used == False,
            OTPCode.expires_at > datetime.now(timezone.utc)
        ).order_by(OTPCode.created_at.desc()).limit(1)
    )
    otp = result.scalar_one_or_none()
    if not otp:
        raise HTTPException(400, "Kod noto'g'ri yoki muddati o'tgan")
    
    # Mark used
    otp.is_used = True
    
    # Find or create user
    user_result = await db.execute(select(User).where(User.phone == phone))
    user = user_result.scalar_one_or_none()
    if not user:
        username = "user_" + phone[-4:]
        user = User(phone=phone, username=username, name="Foydalanuvchi")
        db.add(user)
    
    await db.commit()
    await db.refresh(user)
    
    token = create_access_token({"sub": str(user.id)})
    from app.schemas import UserOut
    return Token(access_token=token, user=UserOut.model_validate(user))

@router.get("/me")
async def get_me(current_user = Depends(__import__('app.security', fromlist=['get_current_user']).get_current_user)):
    from app.schemas import UserOut
    return UserOut.model_validate(current_user)
