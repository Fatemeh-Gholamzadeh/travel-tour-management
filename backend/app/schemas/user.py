from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    is_admin: bool
    created_at: str

    class Config:
        from_attributes = True

    @validator('created_at', pre=True, allow_reuse=True)
    def convert_created_at(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse