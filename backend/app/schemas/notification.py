from pydantic import BaseModel
from typing import Optional


class NotificationResponse(BaseModel):
    id: int
    recipient_id: int
    type: str
    message: str
    payload: Optional[str] = None
    is_read: bool
    created_at: str

    class Config:
        from_attributes = True
