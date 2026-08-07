from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.message import Message
from app.models.user import User
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.buddy_connection import BuddyConnection
from app.models.notification import Notification
from app.realtime import manager
from app.schemas.message import MessageCreate, MessageResponse

router = APIRouter()


@router.post("/messages", response_model=MessageResponse)
async def send_message(message_in: MessageCreate, db: Session = Depends(get_db)):
    sender = db.query(User).filter(User.id == message_in.sender_id).first()
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")

    if message_in.receiver_id is None and message_in.project_id is None:
        raise HTTPException(status_code=400, detail="Receiver or project required")

    if message_in.receiver_id is not None:
        receiver = db.query(User).filter(User.id == message_in.receiver_id).first()
        if not receiver:
            raise HTTPException(status_code=404, detail="Receiver not found")
        if not db.query(BuddyConnection).filter(BuddyConnection.user_id == message_in.sender_id, BuddyConnection.buddy_id == message_in.receiver_id).first():
            raise HTTPException(status_code=403, detail="Only buddies can send direct messages")

    if message_in.project_id is not None:
        project = db.query(Project).filter(Project.id == message_in.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        is_owner = project.created_by == sender.email
        is_member = db.query(ProjectMember).filter(ProjectMember.project_id == project.id, ProjectMember.user_id == sender.id).first()
        if not is_owner and not is_member:
            raise HTTPException(status_code=403, detail="Only project participants can send project messages")

    message = Message(
        sender_id=message_in.sender_id,
        receiver_id=message_in.receiver_id,
        project_id=message_in.project_id,
        content=message_in.content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    if message.receiver_id:
        db.add(Notification(recipient_id=message.receiver_id, type="chat_message", message=f"{sender.username} sent you a message", payload=str(message.id)))
    elif message.project_id:
        recipients = db.query(ProjectMember.user_id).filter(ProjectMember.project_id == message.project_id, ProjectMember.user_id != sender.id).all()
        owner = db.query(User).filter(User.email == project.created_by).first()
        recipient_ids = {row[0] for row in recipients}
        if owner and owner.id != sender.id:
            recipient_ids.add(owner.id)
        for recipient_id in recipient_ids:
            db.add(Notification(recipient_id=recipient_id, type="project_message", message=f"New message in {project.title}", payload=str(message.id)))
    db.commit()
    event = {
        "type": "message",
        "message": {
            "id": message.id,
            "sender_id": message.sender_id,
            "receiver_id": message.receiver_id,
            "project_id": message.project_id,
            "content": message.content,
            "sent_at": message.sent_at.isoformat() if message.sent_at else None,
        },
    }
    if message.receiver_id:
        await manager.send_to_user(message.receiver_id, event)
    elif message.project_id:
        recipients = db.query(ProjectMember.user_id).filter(ProjectMember.project_id == message.project_id).all()
        owner = db.query(User).filter(User.email == project.created_by).first()
        recipient_ids = {row[0] for row in recipients}
        if owner:
            recipient_ids.add(owner.id)
        for recipient_id in recipient_ids:
            if recipient_id != sender.id:
                await manager.send_to_user(recipient_id, event)
    return message


@router.get("/messages/user/{user_id}")
def get_user_messages(user_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        (Message.sender_id == user_id) | (Message.receiver_id == user_id)
    ).order_by(Message.sent_at.asc()).all()
    return messages


@router.get("/messages/project/{project_id}")
def get_project_messages(project_id: int, user_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    user = db.query(User).filter(User.id == user_id).first()
    if not project or not user:
        raise HTTPException(status_code=404, detail="Resource not found")
    is_owner = project.created_by == user.email
    is_member = db.query(ProjectMember).filter(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id).first()
    if not is_owner and not is_member:
        raise HTTPException(status_code=403, detail="Only project participants can read project messages")
    messages = db.query(Message).filter(Message.project_id == project_id).order_by(Message.sent_at.asc()).all()
    return messages
