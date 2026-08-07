from pydantic import BaseModel
from typing import Optional
from pydantic import Field


class MessageCreate(BaseModel):
    sender_id: int
    receiver_id: Optional[int] = None
    project_id: Optional[int] = None
    content: str = Field(min_length=1, max_length=4000)


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: Optional[int] = None
    project_id: Optional[int] = None
    content: str
    sent_at: str

    class Config:
        from_attributes = True
