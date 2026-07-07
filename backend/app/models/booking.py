from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tour_id = Column(Integer, ForeignKey("tours.id"), nullable=False)
    booking_date = Column(DateTime, default=datetime.utcnow)
    number_of_tickets = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String(20), default="pending") 
    payment_status = Column(String(20), default="unpaid") 
    special_requests = Column(Text, nullable=True)

    user = relationship("User", back_populates="bookings")
    tour = relationship("Tour", back_populates="bookings")
