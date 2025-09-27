import sys
import os
from datetime import date

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import SessionLocal, engine
from backend.models import User, Base
from backend.security import get_password_hash

def seed_data():
    db = SessionLocal()

    # Create tables
    Base.metadata.create_all(bind=engine)

    # Create or get testuser 1
    user1 = db.query(User).filter(User.employee_id == 'testuser').first()
    if not user1:
        hashed_password = get_password_hash("password")
        user1 = User(
            employee_id="testuser",
            hashed_password=hashed_password,
            name="Test User",
            team="철강형강시스템팀",
            part="생산지원",
            rank="매니저",
            position="파트원",
            hire_date=date(2023, 1, 1),
            is_admin=False,
            is_active=True,
            password_reset_required=False
        )
        db.add(user1)
        print("Test user 1 created.")

    # Create or get testuser 2
    user2 = db.query(User).filter(User.employee_id == 'testuser2').first()
    if not user2:
        hashed_password2 = get_password_hash("password2")
        user2 = User(
            employee_id="testuser2",
            hashed_password=hashed_password2,
            name="Test User 2",
            team="철강형강시스템팀",
            part="생산지원",
            rank="매니저",
            position="파트장",
            hire_date=date(2023, 1, 1),
            is_admin=False,
            is_active=True,
            password_reset_required=False
        )
        db.add(user2)
        print("Test user 2 created.")
    
    # Create or get testuser 3 (Team Leader)
    user3 = db.query(User).filter(User.employee_id == 'testuser3').first()
    if not user3:
        hashed_password3 = get_password_hash("password3")
        user3 = User(
            employee_id="testuser3",
            hashed_password=hashed_password3,
            name="Test User 3",
            team="철강형강시스템팀",
            part="",  # Team leader might not belong to a specific part
            rank="책임매니저",
            position="팀장",
            hire_date=date(2022, 1, 1),
            is_admin=True,
            is_active=True,
            password_reset_required=False
        )
        db.add(user3)
        print("Test user 3 (Team Leader) created.")
    
    db.commit()

    # Eagerly load the IDs
    db.refresh(user1)
    db.refresh(user2)
    db.refresh(user3)

    print(f"--- User Info ---")
    print(f"ID: {user1.id}, Name: {user1.name}, Position: {user1.position}")
    print(f"ID: {user2.id}, Name: {user2.name}, Position: {user2.position}")
    print(f"ID: {user3.id}, Name: {user3.name}, Position: {user3.position}")
    print(f"-----------------")

    db.close()

if __name__ == "__main__":
    seed_data()
