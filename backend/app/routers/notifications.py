from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationResponse

router = APIRouter()


@router.get("/notifications/{user_id}", response_model=list[NotificationResponse])
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return db.query(Notification).filter(Notification.recipient_id == user_id).order_by(Notification.created_at.desc()).all()


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    return {"message": "Notification marked read"}


@router.get("/notifications/{user_id}/unread-count")
def unread_notification_count(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"count": db.query(Notification).filter(Notification.recipient_id == user_id, Notification.is_read.is_(False)).count()}


@router.post("/notifications/{user_id}/read-all")
def mark_all_notifications_read(user_id: int, db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.recipient_id == user_id, Notification.is_read.is_(False)).update({"is_read": True})
    db.commit()
    return {"message": "Notifications marked read"}
