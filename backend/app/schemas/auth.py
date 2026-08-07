from pydantic import BaseModel, EmailStr
from typing import Optional


class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    bio: Optional[str] = None
    branch: Optional[str] = None
    college: Optional[str] = None
    year: Optional[str] = None
    skills: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    location: Optional[str] = None
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    message: str
    user: UserResponse


class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    branch: Optional[str] = None
    college: Optional[str] = None
    year: Optional[str] = None
    skills: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    location: Optional[str] = None
    profile_image: Optional[str] = None
