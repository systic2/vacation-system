from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from .. import models, schemas, services
from .auth import get_db
from .leaves import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.Leave])
def get_approvals(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.position == '팀장':
        # Team leaders see requests approved by part leaders
        leaves = db.query(models.Leave).filter(models.Leave.status == models.LeaveStatus.APPROVED_BY_PART_LEADER).all()
        return leaves
    
    if current_user.position == '파트장':
        # Part leaders see pending requests from their part members
        leaves = db.query(models.Leave).join(models.User, models.Leave.user_id == models.User.id).filter(
            models.User.part == current_user.part,
            models.Leave.status == models.LeaveStatus.PENDING
        ).all()
        return leaves

    raise HTTPException(status_code=403, detail="Not authorized to view approvals")

@router.put("/{leave_id}/approve")
def approve_leave(leave_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_leave = db.query(models.Leave).filter(models.Leave.id == leave_id).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    requester = db.query(models.User).filter(models.User.id == db_leave.user_id).first()
    if not requester:
        raise HTTPException(status_code=404, detail="Requester not found")

    if current_user.position == '파트장':
        if db_leave.status == models.LeaveStatus.PENDING and requester.part == current_user.part:
            db_leave.status = models.LeaveStatus.APPROVED_BY_PART_LEADER
            db.commit()
            return {"message": "Leave approved by Part Leader"}
        else:
            raise HTTPException(status_code=400, detail="Request cannot be approved by this user or is not in the correct state.")

    if current_user.position == '팀장':
        if db_leave.status == models.LeaveStatus.APPROVED_BY_PART_LEADER:
            # --- Final Leave Balance Validation ---
            current_year = date.today().year
            total_leave_days = services.calculate_total_leave_days(requester, current_year)
            used_leave_days = services.calculate_used_leave_days(db, user_id=requester.id, year=current_year)
            remaining_leave_days = total_leave_days - used_leave_days

            requested_duration = 0
            if db_leave.leave_type == '연차':
                requested_duration = (db_leave.end_date - db_leave.start_date).days + 1
            elif db_leave.leave_type in ['오전반차', '오후반차']:
                requested_duration = 0.5

            if remaining_leave_days < requested_duration:
                # If balance is insufficient, reject the request instead of erroring
                db_leave.status = models.LeaveStatus.REJECTED
                db.commit()
                raise HTTPException(status_code=400, detail=f"Insufficient leave balance. Request rejected. Remaining days: {remaining_leave_days}")
            # --- End Validation ---

            db_leave.status = models.LeaveStatus.APPROVED
            db.commit()
            return {"message": "Leave approved by Team Leader"}
        else:
            raise HTTPException(status_code=400, detail="Leave is not in APPROVED_BY_PART_LEADER state")

    raise HTTPException(status_code=403, detail="Not authorized to approve")

@router.put("/{leave_id}/reject")
def reject_leave(leave_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.position not in ["파트장", "팀장"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    db_leave = db.query(models.Leave).filter(models.Leave.id == leave_id).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    # Add logic here to ensure approver has permission for this specific request

    db_leave.status = models.LeaveStatus.REJECTED
    db.commit()
    return {"message": "Leave rejected"}
