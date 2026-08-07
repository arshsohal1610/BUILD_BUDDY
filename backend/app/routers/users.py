from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse, ProfileUpdate

router = APIRouter()


@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.username.asc()).all()
    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "bio": user.bio,
            "branch": user.branch,
            "college": user.college,
            "year": user.year,
            "skills": user.skills,
            "github": user.github,
            "linkedin": user.linkedin,
            "portfolio": user.portfolio,
            "location": user.location,
            "profile_image": user.profile_image,
        }
        for user in users
    ]


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, profile: ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in profile.dict(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user
