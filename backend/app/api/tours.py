from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from ..database import get_db
from ..models import Tour, User
from ..core.security import decode_access_token
from pydantic import BaseModel
import math

router = APIRouter(prefix="/api/tours", tags=["tours"])

class TourBase(BaseModel):
    name: str
    destination: str
    description: str
    start_date: datetime
    end_date: datetime
    price: float
    capacity: int
    is_active: bool = True
    image_url: Optional[str] = None


class TourCreate(TourBase):
    pass


class TourUpdate(TourBase):
    pass


class TourResponse(TourBase):
    id: int
    available_seats: int
    created_at: datetime

    class Config:
        orm_mode = True


def get_current_user(token: str, db: Session):
    payload = decode_access_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def verify_admin(token: str, db: Session):
    user = get_current_user(token, db)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user



@router.get("/", response_model=dict)
async def get_all_tours(
    page: int = Query(1, ge=1),  
    limit: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    destination: Optional[str] = None,
    sort: str = Query("id", regex="^(id|name|price|destination)$"),
    db: Session = Depends(get_db),
):
    
    query = db.query(Tour)

    if is_active is not None:
        query = query.filter(Tour.is_active == is_active)

    if destination:
        query = query.filter(Tour.destination.ilike(f"%{destination}%"))

    order_map = {
        "name": Tour.name,
        "price": Tour.price,
        "destination": Tour.destination,
        "id": Tour.id,
    }
    order_column = order_map.get(sort, Tour.id)
    query = query.order_by(order_column)

    total = query.count()
    total_pages = max(1, math.ceil(total / limit))  

    skip = (page - 1) * limit
    if skip >= total:
        page = total_pages
        skip = (page - 1) * limit

    tours = query.offset(skip).limit(limit).all()

    return {
        "tours": [TourResponse.from_orm(t) for t in tours],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,  
    }


@router.get("/{tour_id}", response_model=TourResponse)
async def get_tour(tour_id: int, db: Session = Depends(get_db)):
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    return tour


@router.post("/", response_model=TourResponse, status_code=status.HTTP_201_CREATED)
async def create_tour(
    tour_data: TourCreate,
    token: str,
    db: Session = Depends(get_db),
):
    verify_admin(token, db)

    existing = (
        db.query(Tour)
        .filter(
            Tour.destination == tour_data.destination,
            Tour.start_date <= tour_data.end_date,
            Tour.end_date >= tour_data.start_date,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A tour to this destination already exists in this date range",
        )

    new_tour = Tour(
        name=tour_data.name,
        destination=tour_data.destination,
        description=tour_data.description,
        start_date=tour_data.start_date,
        end_date=tour_data.end_date,
        price=tour_data.price,
        capacity=tour_data.capacity,
        available_seats=tour_data.capacity,
        is_active=tour_data.is_active,
        image_url=tour_data.image_url,
    )
    db.add(new_tour)
    db.commit()
    db.refresh(new_tour)
    return new_tour


@router.put("/{tour_id}", response_model=TourResponse)
async def update_tour(
    tour_id: int,
    tour_data: TourUpdate,
    token: str,
    db: Session = Depends(get_db),
):
    verify_admin(token, db)

    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    for key, value in tour_data.dict().items():
        setattr(tour, key, value)

    if tour_data.capacity < tour.available_seats:
        tour.available_seats = tour_data.capacity

    db.commit()
    db.refresh(tour)
    return tour


@router.patch("/{tour_id}", response_model=TourResponse)
async def patch_tour(
    tour_id: int,
    token: str,
    db: Session = Depends(get_db),
    name: Optional[str] = None,
    destination: Optional[str] = None,
    description: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    price: Optional[float] = None,
    capacity: Optional[int] = None,
    is_active: Optional[bool] = None,
    image_url: Optional[str] = None,
):
    verify_admin(token, db)

    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    if name is not None:
        tour.name = name
    if destination is not None:
        tour.destination = destination
    if description is not None:
        tour.description = description
    if start_date is not None:
        tour.start_date = start_date
    if end_date is not None:
        tour.end_date = end_date
    if price is not None:
        tour.price = price
    if capacity is not None:
        tour.capacity = capacity
        if capacity < tour.available_seats:
            tour.available_seats = capacity
    if is_active is not None:
        tour.is_active = is_active
    if image_url is not None:
        tour.image_url = image_url

    db.commit()
    db.refresh(tour)
    return tour


@router.delete("/{tour_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tour(tour_id: int, token: str, db: Session = Depends(get_db)):

    verify_admin(token, db)

    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    db.delete(tour)
    db.commit()
    return None