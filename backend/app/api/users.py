from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator  
from typing import Optional, List
from datetime import datetime  
from ..database import get_db
from ..models import User
from ..core.security import decode_access_token, get_password_hash, verify_password

router = APIRouter(prefix="/api/users", tags=["users"])


class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    phone: Optional[str]
    is_admin: bool
    created_at: str

    class Config:
        orm_mode = True

    @validator('created_at', pre=True, allow_reuse=True)
    def convert_created_at(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


def get_current_user_from_token(token: str, db: Session):
    payload = decode_access_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user




@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(token: str, db: Session = Depends(get_db)):
    user = get_current_user_from_token(token, db)
    return user


@router.put("/me", response_model=UserProfileResponse)
async def update_my_profile(
    token: str, update_data: UserProfileUpdate, db: Session = Depends(get_db)
):
    user = get_current_user_from_token(token, db)

    if update_data.full_name is not None:
        user.full_name = update_data.full_name
    if update_data.phone is not None:
        user.phone = update_data.phone
    if update_data.email is not None:
        existing = (
            db.query(User)
            .filter(User.email == update_data.email, User.id != user.id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = update_data.email

    if update_data.new_password:
        if not update_data.current_password:
            raise HTTPException(status_code=400, detail="Current password is required")
        if not verify_password(update_data.current_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        user.password_hash = get_password_hash(update_data.new_password)

    db.commit()
    db.refresh(user)
    return user


@router.get("/", response_model=List[UserProfileResponse])
async def get_all_users(token: str, db: Session = Depends(get_db)):
    user = get_current_user_from_token(token, db)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    users = db.query(User).all()
    return users


@router.patch("/{user_id}/role", response_model=UserProfileResponse)
async def change_user_role(
    user_id: int, token: str, is_admin: bool, db: Session = Depends(get_db)
):
    current_user = get_current_user_from_token(token, db)
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot change your own role")

    user.is_admin = is_admin
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, token: str, db: Session = Depends(get_db)):

    current_user = get_current_user_from_token(token, db)
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400, detail="You cannot delete your own account"
        )

    db.delete(user)
    db.commit()
    return None