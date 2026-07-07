import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.database import engine, Base
from app.api import auth, dashboard, tours, users, bookings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Travel Tour Management API", version="1.0.0")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key")
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(tours.router)
app.include_router(users.router)
app.include_router(bookings.router)

@app.get("/")
async def root():
    return {"message": "Travel Tour Management API"}