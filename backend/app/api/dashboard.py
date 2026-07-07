from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Tour, Booking, User
from ..core.security import decode_access_token

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(token: str, db: Session = Depends(get_db)):

    payload = decode_access_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    active_tours = db.query(Tour).filter(Tour.is_active == True).count()

    total_bookings = db.query(Booking).count()

    today = datetime.utcnow().date()
    today_start = datetime(today.year, today.month, today.day)
    today_bookings = (
        db.query(Booking).filter(Booking.booking_date >= today_start).count()
    )

    popular_destinations = (
        db.query(Tour.destination, func.count(Booking.id).label("booking_count"))
        .join(Booking, Booking.tour_id == Tour.id)
        .group_by(Tour.destination)
        .order_by(func.count(Booking.id).desc())
        .limit(5)
        .all()
    )

    current_month_start = datetime(today.year, today.month, 1)
    monthly_revenue = (
        db.query(func.sum(Booking.total_price))
        .filter(
            and_(
                Booking.booking_date >= current_month_start,
                Booking.status == "confirmed",
                Booking.payment_status == "paid",
            )
        )
        .scalar()
    ) or 0

    total_revenue = (
        db.query(func.sum(Booking.total_price))
        .filter(and_(Booking.status == "confirmed", Booking.payment_status == "paid"))
        .scalar()
    ) or 0

    return {
        "active_tours": active_tours,
        "total_bookings": total_bookings,
        "today_bookings": today_bookings,
        "popular_destinations": [
            {"destination": d.destination, "count": d.booking_count}
            for d in popular_destinations
        ],
        "monthly_revenue": float(monthly_revenue),
        "total_revenue": float(total_revenue),
    }
