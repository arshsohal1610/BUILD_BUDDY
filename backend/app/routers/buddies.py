from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.models.buddy_request import BuddyRequest
from app.models.buddy_connection import BuddyConnection
from app.models.notification import Notification
from app.schemas.buddy import BuddyRequestCreate, BuddyRequestResponse, BuddyConnectionResponse

router = APIRouter()


@router.post("/buddies/request", response_model=BuddyRequestResponse)
def send_buddy_request(request_data: BuddyRequestCreate, db: Session = Depends(get_db)):
    if request_data.requester_id == request_data.receiver_id:
        raise HTTPException(status_code=400, detail="Cannot send request to yourself")

    requester = db.query(User).filter(User.id == request_data.requester_id).first()
    receiver = db.query(User).filter(User.id == request_data.receiver_id).first()
    if not requester or not receiver:
        raise HTTPException(status_code=404, detail="User not found")

    existing_request = db.query(BuddyRequest).filter(
        ((BuddyRequest.requester_id == request_data.requester_id) & (BuddyRequest.receiver_id == request_data.receiver_id)) |
        ((BuddyRequest.requester_id == request_data.receiver_id) & (BuddyRequest.receiver_id == request_data.requester_id))
    ).first()
    if existing_request:
        raise HTTPException(status_code=400, detail="Buddy request already exists")

    connection_exists = db.query(BuddyConnection).filter(
        BuddyConnection.user_id == request_data.requester_id,
        BuddyConnection.buddy_id == request_data.receiver_id,
    ).first()
    if connection_exists:
        raise HTTPException(status_code=400, detail="Users are already connected")

    buddy_request = BuddyRequest(
        requester_id=request_data.requester_id,
        receiver_id=request_data.receiver_id,
        status="pending",
    )
    db.add(buddy_request)
    db.add(Notification(recipient_id=receiver.id, type="buddy_request", message=f"{requester.username} sent you a buddy request", payload=str(buddy_request.id)))
    db.commit()
    db.refresh(buddy_request)
    return buddy_request


@router.post("/buddies/request/{request_id}/accept", response_model=BuddyConnectionResponse)
def accept_buddy_request(request_id: int, db: Session = Depends(get_db)):
    buddy_request = db.query(BuddyRequest).filter(BuddyRequest.id == request_id).first()
    if not buddy_request:
        raise HTTPException(status_code=404, detail="Buddy request not found")
    if buddy_request.status != "pending":
        raise HTTPException(status_code=400, detail="Buddy request is not pending")

    buddy_request.status = "accepted"
    connection = BuddyConnection(
        user_id=buddy_request.requester_id,
        buddy_id=buddy_request.receiver_id,
    )
    reverse_connection = BuddyConnection(
        user_id=buddy_request.receiver_id,
        buddy_id=buddy_request.requester_id,
    )
    db.add(connection)
    db.add(reverse_connection)
    db.add(Notification(recipient_id=buddy_request.requester_id, type="buddy_accepted", message=f"{buddy_request.receiver.username} accepted your buddy request", payload=str(buddy_request.id)))
    db.commit()
    db.refresh(connection)
    return connection


@router.post("/buddies/request/{request_id}/reject")
def reject_buddy_request(request_id: int, db: Session = Depends(get_db)):
    buddy_request = db.query(BuddyRequest).filter(BuddyRequest.id == request_id).first()
    if not buddy_request:
        raise HTTPException(status_code=404, detail="Buddy request not found")
    if buddy_request.status != "pending":
        raise HTTPException(status_code=400, detail="Buddy request is not pending")

    db.delete(buddy_request)
    db.commit()
    return {"message": "Buddy request rejected"}


@router.delete("/buddies/request/{request_id}")
def cancel_buddy_request(request_id: int, requester_id: int, db: Session = Depends(get_db)):
    buddy_request = db.query(BuddyRequest).filter(BuddyRequest.id == request_id).first()
    if not buddy_request:
        raise HTTPException(status_code=404, detail="Buddy request not found")
    if buddy_request.requester_id != requester_id or buddy_request.status != "pending":
        raise HTTPException(status_code=403, detail="Only the pending request sender can cancel it")
    db.delete(buddy_request)
    db.commit()
    return {"message": "Buddy request cancelled"}


@router.get("/buddies/requests/{user_id}")
def get_buddy_requests(user_id: int, db: Session = Depends(get_db)):
    received = db.query(BuddyRequest).filter(BuddyRequest.receiver_id == user_id, BuddyRequest.status == "pending").all()
    sent = db.query(BuddyRequest).filter(BuddyRequest.requester_id == user_id, BuddyRequest.status == "pending").all()
    return {
        "received": [{"id": r.id, "requester_id": r.requester_id, "receiver_id": r.receiver_id, "username": r.requester.username} for r in received],
        "sent": [{"id": r.id, "requester_id": r.requester_id, "receiver_id": r.receiver_id, "username": r.receiver.username} for r in sent],
    }


@router.delete("/buddies/{user_id}/{buddy_id}")
def remove_connection(user_id: int, buddy_id: int, db: Session = Depends(get_db)):
    connection = db.query(BuddyConnection).filter(
        BuddyConnection.user_id == user_id,
        BuddyConnection.buddy_id == buddy_id,
    ).first()
    reverse_connection = db.query(BuddyConnection).filter(
        BuddyConnection.user_id == buddy_id,
        BuddyConnection.buddy_id == user_id,
    ).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")

    db.delete(connection)
    if reverse_connection:
        db.delete(reverse_connection)
    db.commit()
    return {"message": "Connection removed"}


@router.get("/buddies/{user_id}")
def get_user_buddies(user_id: int, db: Session = Depends(get_db)):
    connections = db.query(BuddyConnection).filter(BuddyConnection.user_id == user_id).all()
    return [{"id": c.buddy.id, "username": c.buddy.username, "email": c.buddy.email} for c in connections]
