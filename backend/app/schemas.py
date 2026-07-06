from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class OTPRequest(BaseModel):
    phone: str
    method: str = "sms"

class OTPVerify(BaseModel):
    phone: str
    code: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    id: int
    phone: str
    name: str
    username: Optional[str] = None
    avatar: Optional[str] = None
    balance: float = 0
    elonlar_count: int = 0
    korishlar_count: int = 0
    qongiroqlar_count: int = 0
    is_admin: bool = False
    created_at: datetime
    model_config = {"from_attributes": True}

class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    avatar: Optional[str] = None

class MessageCreate(BaseModel):
    to_user_id: int
    listing_id: Optional[int] = None
    text: str = Field(..., min_length=1, max_length=2000)

class MessageOut(BaseModel):
    id: int
    from_user_id: int
    to_user_id: int
    listing_id: Optional[int] = None
    text: str
    is_read: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class ThreadOut(BaseModel):
    peer_id: int
    peer_name: Optional[str] = None
    peer_username: Optional[str] = None
    peer_avatar: Optional[str] = None
    last_text: str
    last_at: datetime
    unread: int = 0
    listing_id: Optional[int] = None

class TopupRequest(BaseModel):
    amount: float = Field(..., gt=0)

class PromoteRequest(BaseModel):
    listing_id: int
    package: str
    days: int = 7

class TransactionOut(BaseModel):
    id: int
    amount: float
    type: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}

class ImageOut(BaseModel):
    id: int
    file_path: str
    order: int
    model_config = {"from_attributes": True}

class ListingCreate(BaseModel):
    title: str = Field(..., max_length=120)
    description: Optional[str] = None
    deal_type: str
    category: str
    price: float
    currency: str = "ye"
    rooms: Optional[int] = None
    area_m2: Optional[float] = None
    floor: Optional[int] = None
    floors: Optional[int] = None
    land_sotix: Optional[float] = None
    tamir: Optional[str] = None
    region: str
    city: str
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    phone: Optional[str] = None

class ListingOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    deal_type: str
    category: str
    price: float
    currency: str
    rooms: Optional[int] = None
    area_m2: Optional[float] = None
    floor: Optional[int] = None
    floors: Optional[int] = None
    land_sotix: Optional[float] = None
    tamir: Optional[str] = None
    region: str
    city: str
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: str
    is_vip: bool = False
    is_top: bool = False
    view_count: int = 0
    owner_id: int
    owner_phone: Optional[str] = None
    owner_username: Optional[str] = None
    owner_name: Optional[str] = None
    created_at: datetime
    published_at: Optional[datetime] = None
    images: List[ImageOut] = []
    distance_km: Optional[float] = None
    is_favorite: bool = False
    model_config = {"from_attributes": True}

Token.model_rebuild()
