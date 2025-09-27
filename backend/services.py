from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models

def calculate_total_leave_days(user: models.User, year: int) -> int:
    hire_date = user.hire_date
    hire_year = hire_date.year

    if year < hire_year:
        return 0

    # Rule for new hires this year
    if year == hire_year:
        hire_month = hire_date.month
        if hire_date.day <= 10:
            return 12 - hire_month + 1
        else:
            return 12 - hire_month

    # Rule for existing hires
    years_of_service = year - hire_year
    if years_of_service <= 1:
        return 15
    else:
        # 15 days base + 1 day for every 2 years after the first year
        additional_days = (years_of_service - 1) // 2
        total_days = 15 + additional_days
        # The summary example implies a max of 25 days, a common rule.
        # Let's assume a max of 25 for now.
        return min(total_days, 25)

def calculate_used_leave_days(db: Session, user_id: int, year: int) -> float:
    leaves = db.query(models.Leave).filter(
        models.Leave.user_id == user_id,
        models.Leave.status.in_([
            models.LeaveStatus.APPROVED,
            models.LeaveStatus.PENDING,
            models.LeaveStatus.APPROVED_BY_PART_LEADER
        ]),
        # Assuming start_date is the determining year for the leave
        func.extract('year', models.Leave.start_date) == year
    ).all()

    used_days = 0.0
    for leave in leaves:
        # Only count types that deduct from balance
        if leave.leave_type in ['연차', '오전반차', '오후반차']:
            if leave.leave_type == '연차':
                # This is a simplification. A real implementation would need to account for weekends/holidays.
                duration = (leave.end_date - leave.start_date).days + 1
                used_days += duration
            else: # 반차
                used_days += 0.5
    return used_days
