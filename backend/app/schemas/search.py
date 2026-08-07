from pydantic import BaseModel
from typing import Any, List, Optional


class SearchResponse(BaseModel):
    users: List[Any]
    projects: List[Any]
    skills: List[str]


class UserSearchResult(BaseModel):
    id: int
    username: str
    email: str
    skills: Optional[str] = None

    class Config:
        from_attributes = True


class ProjectSearchResult(BaseModel):
    id: int
    title: str
    description: str
    skills_required: str
    created_by: Optional[str] = None

    class Config:
        from_attributes = True
