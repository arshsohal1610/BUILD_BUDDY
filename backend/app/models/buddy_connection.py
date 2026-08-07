from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.database.database import Base


class BuddyConnection(Base):
    __tablename__ = "buddy_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    buddy_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    connected_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id], back_populates="connections")
    buddy = relationship("User", foreign_keys=[buddy_id])

    __table_args__ = (UniqueConstraint("user_id", "buddy_id", name="uq_buddy_connection_pair"),)
