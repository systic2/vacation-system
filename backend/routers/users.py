from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from .. import models, schemas, services
from .auth import get_db
from .leaves import get_current_user

router = APIRouter()

class LeaveBalance(schemas.BaseModel):
    total: int
    used: float
    remaining: float

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/me/leave-balance", response_model=LeaveBalance)
async def get_user_leave_balance(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    current_year = date.today().year
    total_days = services.calculate_total_leave_days(current_user, current_year)
    used_days = services.calculate_used_leave_days(db, user_id=current_user.id, year=current_year)
    remaining_days = total_days - used_days
    return {"total": total_days, "used": used_days, "remaining": remaining_days}

@router.post("/me/change-password", response_model=schemas.User)
async def change_user_password(password_data: schemas.PasswordChange, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    from ..security import get_password_hash
    new_hashed_password = get_password_hash(password_data.new_password)
    current_user.hashed_password = new_hashed_password
    current_user.password_reset_required = False
    db.commit()
    db.refresh(current_user)
    return current_user
