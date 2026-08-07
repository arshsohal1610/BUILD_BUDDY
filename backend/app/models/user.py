from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    bio = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    college = Column(String, nullable=True)
    year = Column(String, nullable=True)
    skills = Column(String, nullable=True)
    github = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    portfolio = Column(String, nullable=True)
    location = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)

    memberships = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
    sent_requests = relationship("BuddyRequest", foreign_keys="BuddyRequest.requester_id", back_populates="requester", cascade="all, delete-orphan")
    received_requests = relationship("BuddyRequest", foreign_keys="BuddyRequest.receiver_id", back_populates="receiver", cascade="all, delete-orphan")
    connections = relationship("BuddyConnection", foreign_keys="BuddyConnection.user_id", back_populates="user", cascade="all, delete-orphan")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender", cascade="all, delete-orphan")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="recipient", cascade="all, delete-orphan")
