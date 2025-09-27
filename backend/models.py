from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import enum

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    team = Column(String)
    part = Column(String)
    rank = Column(String)
    position = Column(String)
    hire_date = Column(Date)
    is_admin = Column(Boolean, server_default='false', nullable=False)
    is_active = Column(Boolean, server_default='true', nullable=False)
    password_reset_required = Column(Boolean, server_default='false', nullable=False)

    leaves = relationship("Leave", foreign_keys="[Leave.user_id]", back_populates="owner")

class LeaveStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED_BY_PART_LEADER = "APPROVED_BY_PART_LEADER"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    leave_type = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    reason = Column(String)
    substitute_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(LeaveStatus))

    owner = relationship("User", back_populates="leaves", foreign_keys=[user_id])
    substitute = relationship("User", foreign_keys=[substitute_id])
    approvals = relationship("Approval", back_populates="leave")

class ApprovalStatus(str, enum.Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    leave_id = Column(Integer, ForeignKey("leaves.id"))
    approver_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(ApprovalStatus))
    comment = Column(String)

    leave = relationship("Leave", back_populates="approvals")
    approver = relationship("User")
