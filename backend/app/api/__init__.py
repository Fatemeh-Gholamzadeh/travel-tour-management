from .auth import router as auth_router
from .dashboard import router as dashboard_router
from .tours import router as tours_router
from .users import router as users_router
from .bookings import router as bookings_router

__all__ = [
    "auth_router",
    "dashboard_router", 
    "tours_router",
    "users_router",
    "bookings_router",
]