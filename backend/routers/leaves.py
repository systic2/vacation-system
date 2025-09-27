from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import SessionLocal
from ..security import get_user
from .auth import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from ..config import settings

router = APIRouter()

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        employee_id: str = payload.get("sub")
        if employee_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(employee_id=employee_id)
    except JWTError:
        raise credentials_exception
    user = get_user(db, employee_id=token_data.employee_id)
    if user is None:
        raise credentials_exception
    return user

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date

from .. import models, schemas, services
from .auth import get_db
from .leaves import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.Leave)
def create_leave(leave: schemas.LeaveCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Validate substitute user exists and is active
    substitute_user = db.query(models.User).filter(models.User.id == leave.substitute_id, models.User.is_active == True).first()
    if not substitute_user:
        raise HTTPException(status_code=404, detail=f"Substitute user with id {leave.substitute_id} not found")
    
    if current_user.id == leave.substitute_id:
        raise HTTPException(status_code=400, detail="Cannot assign yourself as a substitute.")

    # --- Leave Balance Validation ---
    current_year = date.today().year
    total_leave_days = services.calculate_total_leave_days(current_user, current_year)
    used_leave_days = services.calculate_used_leave_days(db, user_id=current_user.id, year=current_year)
    remaining_leave_days = total_leave_days - used_leave_days

    # Calculate requested leave duration
    requested_duration = 0
    if leave.leave_type == '연차':
        requested_duration = (leave.end_date - leave.start_date).days + 1
    elif leave.leave_type in ['오전반차', '오후반차']:
        requested_duration = 0.5

    if remaining_leave_days < requested_duration:
        raise HTTPException(status_code=400, detail=f"Insufficient leave balance. Remaining days: {remaining_leave_days}")
    # --- End Validation ---

    db_leave = models.Leave(
        **leave.dict(), 
        user_id=current_user.id, 
        status=models.LeaveStatus.PENDING
    )
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

@router.get("/", response_model=List[schemas.Leave])
def read_leaves(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    leaves = db.query(models.Leave).filter(models.Leave.user_id == current_user.id).offset(skip).limit(limit).all()
    return leaves
