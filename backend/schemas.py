from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional
from .models import LeaveStatus

class UserBase(BaseModel):
    employee_id: str
    name: str
    team: str
    part: str
    rank: str
    position: str

class UserCreate(UserBase):
    password: str
    hire_date: date

class User(UserBase):
    id: int
    hire_date: date
    is_admin: bool
    is_active: bool

    class Config:
        from_attributes = True

class LeaveBase(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    reason: str
    substitute_id: int

class LeaveCreate(LeaveBase):
    pass

class Leave(LeaveBase):
    id: int
    user_id: int
    status: LeaveStatus

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    password_reset_required: bool

class TokenData(BaseModel):
    employee_id: Optional[str] = None

class PasswordChange(BaseModel):
    new_password: str
