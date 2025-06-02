import asyncio
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Numeric,
    Enum, Date, create_engine
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncAttrs, async_engine_from_config, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base, relationship, Mapped, mapped_column
import enum
import uuid
from datetime import datetime

Base = declarative_base()

# Enums
class UserRole(enum.Enum):
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"
    CASHIER = "CASHIER"
    WAITER = "WAITER"

class OrderStatus(enum.Enum):
    OPEN = "OPEN"
    PAID = "PAID"
    CANCELLED = "CANCELLED"

class PaymentType(enum.Enum):
    CASH = "CASH"
    CARD = "CARD"
    QR = "QR"
    OTHER = "OTHER"

# Models
class User(Base):
    __tablename__ = "users"
    id = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = mapped_column(String, nullable=False)
    username = mapped_column(String, unique=True, nullable=False)
    password_hash = mapped_column(Text, nullable=False)
    role = mapped_column(Enum(UserRole), nullable=False)
    is_active = mapped_column(Boolean, default=True)
    created_at = mapped_column(DateTime, default=datetime.utcnow)

class Ingredient(Base):
    __tablename__ = "ingredients"
    id = mapped_column(Integer, primary_key=True)
    name = mapped_column(String, nullable=False)
    unit = mapped_column(String, nullable=False)
    current_price = mapped_column(Numeric, nullable=False)
    in_stock = mapped_column(Numeric, nullable=False)
    created_at = mapped_column(DateTime, default=datetime.utcnow)

class Supplier(Base):
    __tablename__ = "suppliers"
    id = mapped_column(Integer, primary_key=True)
    name = mapped_column(String, nullable=False)
    phone = mapped_column(String, nullable=True)

class Delivery(Base):
    __tablename__ = "deliveries"
    id = mapped_column(Integer, primary_key=True)
    ingredient_id = mapped_column(ForeignKey("ingredients.id"), nullable=False)
    supplier_id = mapped_column(ForeignKey("suppliers.id"), nullable=False)
    quantity = mapped_column(Numeric, nullable=False)
    price_per_unit = mapped_column(Numeric, nullable=False)
    delivery_date = mapped_column(Date, nullable=False)
    created_by = mapped_column(ForeignKey("users.id"), nullable=False)

class MenuItem(Base):
    __tablename__ = "menu_items"
    id = mapped_column(Integer, primary_key=True)
    name = mapped_column(String, nullable=False)
    description = mapped_column(Text, nullable=True)
    price = mapped_column(Numeric, nullable=False)
    cost_price = mapped_column(Numeric, nullable=False)
    image_url = mapped_column(Text, nullable=True)
    is_active = mapped_column(Boolean, default=True)
    created_by = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at = mapped_column(DateTime, default=datetime.utcnow)

class MenuIngredient(Base):
    __tablename__ = "menu_ingredients"
    id = mapped_column(Integer, primary_key=True)
    menu_item_id = mapped_column(ForeignKey("menu_items.id"), nullable=False)
    ingredient_id = mapped_column(ForeignKey("ingredients.id"), nullable=False)
    quantity = mapped_column(Numeric, nullable=False)

class Shift(Base):
    __tablename__ = "shifts"
    id = mapped_column(Integer, primary_key=True)
    started_at = mapped_column(DateTime, nullable=False)
    ended_at = mapped_column(DateTime, nullable=True)
    manager_id = mapped_column(ForeignKey("users.id"), nullable=False)
    is_active = mapped_column(Boolean, default=True)

class ShiftStaff(Base):
    __tablename__ = "shift_staff"
    id = mapped_column(Integer, primary_key=True)
    shift_id = mapped_column(ForeignKey("shifts.id"), nullable=False)
    user_id = mapped_column(ForeignKey("users.id"), nullable=False)

class Order(Base):
    __tablename__ = "orders"
    id = mapped_column(Integer, primary_key=True)
    table_number = mapped_column(String, nullable=False)
    waiter_id = mapped_column(ForeignKey("users.id"), nullable=False)
    cashier_id = mapped_column(ForeignKey("users.id"), nullable=True)
    shift_id = mapped_column(ForeignKey("shifts.id"), nullable=False)
    status = mapped_column(Enum(OrderStatus), default=OrderStatus.OPEN)
    total_price = mapped_column(Numeric, nullable=False)
    created_at = mapped_column(DateTime, default=datetime.utcnow)
    paid_at = mapped_column(DateTime, nullable=True)

class OrderItem(Base):
    __tablename__ = "order_items"
    id = mapped_column(Integer, primary_key=True)
    order_id = mapped_column(ForeignKey("orders.id"), nullable=False)
    menu_item_id = mapped_column(ForeignKey("menu_items.id"), nullable=False)
    quantity = mapped_column(Integer, nullable=False)
    price = mapped_column(Numeric, nullable=False)

class MenuStopList(Base):
    __tablename__ = "menu_stop_list"
    id = mapped_column(Integer, primary_key=True)
    menu_item_id = mapped_column(ForeignKey("menu_items.id"), nullable=False)
    shift_id = mapped_column(ForeignKey("shifts.id"), nullable=False)

class IngredientStopList(Base):
    __tablename__ = "ingredient_stop_list"
    id = mapped_column(Integer, primary_key=True)
    ingredient_id = mapped_column(ForeignKey("ingredients.id"), nullable=False)
    shift_id = mapped_column(ForeignKey("shifts.id"), nullable=False)

class Payment(Base):
    __tablename__ = "payments"
    id = mapped_column(Integer, primary_key=True)
    order_id = mapped_column(ForeignKey("orders.id"), nullable=False)
    amount = mapped_column(Numeric, nullable=False)
    payment_type = mapped_column(Enum(PaymentType), nullable=False)
    paid_by_id = mapped_column(ForeignKey("users.id"), nullable=False)
    paid_at = mapped_column(DateTime, default=datetime.utcnow)

# Настройка подключения к PostgreSQL
DATABASE_URL = "postgresql+asyncpg://postgres:password@localhost:5432/your_database"

engine = create_async_engine(DATABASE_URL, echo=True)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(init_db())
