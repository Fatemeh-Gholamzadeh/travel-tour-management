from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from ..database import get_db
from ..models import Booking, Tour, User
from ..core.security import decode_access_token

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


class BookingCreate(BaseModel):
    tour_id: int
    number_of_tickets: int
    special_requests: str = ""


class BookingResponse(BaseModel):
    id: int
    user_id: int
    user_name: str  
    tour_id: int
    tour_name: str
    destination: str
    booking_date: datetime
    number_of_tickets: int
    total_price: float
    status: str
    payment_status: str
    special_requests: str = ""

    class Config:
        from_attributes = True


def get_current_user(token: str, db: Session):
    payload = decode_access_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate, token: str, db: Session = Depends(get_db)
):
    user = get_current_user(token, db)
    tour = db.query(Tour).filter(Tour.id == booking_data.tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    if not tour.is_active:
        raise HTTPException(status_code=400, detail="Tour is not active")
    if tour.available_seats < booking_data.number_of_tickets:
        raise HTTPException(
            status_code=400, detail=f"Only {tour.available_seats} seats available"
        )

    total_price = tour.price * booking_data.number_of_tickets

    new_booking = Booking(
        user_id=user.id,
        tour_id=tour.id,
        number_of_tickets=booking_data.number_of_tickets,
        total_price=total_price,
        status="pending",
        payment_status="unpaid",
        special_requests=booking_data.special_requests,
    )

    tour.available_seats -= booking_data.number_of_tickets

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)


    return {
        "id": new_booking.id,
        "user_id": new_booking.user_id,
        "user_name": user.full_name or user.username,
        "tour_id": new_booking.tour_id,
        "tour_name": tour.name,
        "destination": tour.destination,
        "booking_date": new_booking.booking_date,
        "number_of_tickets": new_booking.number_of_tickets,
        "total_price": new_booking.total_price,
        "status": new_booking.status,
        "payment_status": new_booking.payment_status,
        "special_requests": new_booking.special_requests or "",
    }


@router.get("/", response_model=List[BookingResponse])
async def get_user_bookings(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == user.id)
        .order_by(Booking.booking_date.desc())
        .all()
    )

    result = []
    for b in bookings:
        tour = db.query(Tour).filter(Tour.id == b.tour_id).first()
        booking_user = db.query(User).filter(User.id == b.user_id).first()  
        result.append(
            {
                "id": b.id,
                "user_id": b.user_id,
                "user_name": booking_user.full_name or booking_user.username if booking_user else f"User #{b.user_id}",
                "tour_id": b.tour_id,
                "tour_name": tour.name if tour else "Deleted Tour",
                "destination": tour.destination if tour else "Unknown",
                "booking_date": b.booking_date,
                "number_of_tickets": b.number_of_tickets,
                "total_price": b.total_price,
                "status": b.status,
                "payment_status": b.payment_status,
                "special_requests": b.special_requests or "",
            }
        )
    return result


@router.get("/admin", response_model=List[BookingResponse])
async def get_all_bookings(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    bookings = db.query(Booking).order_by(Booking.booking_date.desc()).all()

    result = []
    for b in bookings:
        tour = db.query(Tour).filter(Tour.id == b.tour_id).first()
        booking_user = db.query(User).filter(User.id == b.user_id).first()
        result.append(
            {
                "id": b.id,
                "user_id": b.user_id,
                "user_name": booking_user.full_name or booking_user.username if booking_user else f"User #{b.user_id}",
                "tour_id": b.tour_id,
                "tour_name": tour.name if tour else "Deleted Tour",
                "destination": tour.destination if tour else "Unknown",
                "booking_date": b.booking_date,
                "number_of_tickets": b.number_of_tickets,
                "total_price": b.total_price,
                "status": b.status,
                "payment_status": b.payment_status,
                "special_requests": b.special_requests or "",
            }
        )
    return result


@router.patch("/{booking_id}/status")
async def update_booking_status(
    booking_id: int,
    status: str,
    payment_status: str = None,
    token: str = None,
    db: Session = Depends(get_db),
):
    user = get_current_user(token, db)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    allowed_statuses = ["pending", "confirmed", "cancelled"]
    allowed_payments = ["unpaid", "paid", "refunded"]

    if status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    booking.status = status

    if payment_status and payment_status in allowed_payments:
        booking.payment_status = payment_status

    db.commit()

    return {"message": "Booking status updated successfully"}