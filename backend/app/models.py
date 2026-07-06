from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class DealType(str, enum.Enum):
    sale = "sale"
    rent = "rent"
    kunlik = "kunlik"

class Category(str, enum.Enum):
    apartment = "apartment"
    house = "house"
    hotel = "hotel"
    commercial = "commercial"
    land = "land"

class ListingStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    archived = "archived"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), default="Foydalanuvchi")
    username = Column(String(50), unique=True, index=True, nullable=True)
    avatar = Column(String(255), nullable=True)
    balance = Column(Float, default=0)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    elonlar_count = Column(Integer, default=0)
    korishlar_count = Column(Integer, default=0)
    qongiroqlar_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    listings = relationship("Listing", back_populates="owner")

class OTPCode(Base):
    __tablename__ = "otp_codes"
    id = Column(Integer, primary_key=True)
    phone = Column(String(20), index=True, nullable=False)
    code = Column(String(10), nullable=False)
    method = Column(String(20), default="sms")
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)

class Listing(Base):
    __tablename__ = "listings"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    deal_type = Column(String(20), nullable=False)
    category = Column(String(20), nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String(5), default="ye")
    rooms = Column(Integer, nullable=True)
    area_m2 = Column(Float, nullable=True)
    floor = Column(Integer, nullable=True)
    floors = Column(Integer, nullable=True)
    land_sotix = Column(Float, nullable=True)
    tamir = Column(String(50), nullable=True)
    region = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    address = Column(String(255), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    status = Column(String(20), default="approved")
    is_vip = Column(Boolean, default=False)
    is_top = Column(Boolean, default=False)
    promoted_until = Column(DateTime(timezone=True), nullable=True)
    view_count = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    published_at = Column(DateTime(timezone=True), server_default=func.now())
    owner = relationship("User", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", order_by="ListingImage.order")

class ListingImage(Base):
    __tablename__ = "listing_images"
    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(255), nullable=False)
    order = Column(Integer, default=0)
    listing = relationship("Listing", back_populates="images")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=True)
    text = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "listing_id", name="uq_user_listing"),)
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    type = Column(String(20), nullable=False)
    description = Column(String(255), nullable=True)
    status = Column(String(20), default="success")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
