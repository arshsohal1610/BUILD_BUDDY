from pydantic import BaseModel
from typing import Optional


class BuddyRequestCreate(BaseModel):
    requester_id: int
    receiver_id: int


class BuddyRequestResponse(BaseModel):
    id: int
    requester_id: int
    receiver_id: int
    status: str

    class Config:
        from_attributes = True


class BuddyConnectionResponse(BaseModel):
    id: int
    user_id: int
    buddy_id: int

    class Config:
        from_attributes = True
