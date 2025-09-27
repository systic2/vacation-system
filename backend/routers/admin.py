from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import SessionLocal
from ..routers.auth import get_db
from ..routers.leaves import get_current_user

router = APIRouter()

# Dependency to check for admin users
async def get_admin_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Administrator access required")
    return current_user

@router.get("/users", response_model=List[schemas.User], dependencies=[Depends(get_admin_user)])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.post("/users", response_model=schemas.User, dependencies=[Depends(get_admin_user)])
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.employee_id == user.employee_id).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Employee ID already registered")
    
    from ..security import get_password_hash
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        employee_id=user.employee_id,
        name=user.name,
        team=user.team,
        part=user.part,
        rank=user.rank,
        position=user.position,
        hire_date=user.hire_date,
        hashed_password=hashed_password,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}", response_model=schemas.User, dependencies=[Depends(get_admin_user)])
def deactivate_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.is_active = False
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/users/{user_id}/activate", response_model=schemas.User, dependencies=[Depends(get_admin_user)])
def activate_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.is_active = True
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/users/{user_id}/reset-password", response_model=schemas.User, dependencies=[Depends(get_admin_user)])
def reset_user_password(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    from ..security import get_password_hash
    new_hashed_password = get_password_hash("a123456!")
    db_user.hashed_password = new_hashed_password
    db_user.password_reset_required = True
    db.commit()
    db.refresh(db_user)
    return db_user
