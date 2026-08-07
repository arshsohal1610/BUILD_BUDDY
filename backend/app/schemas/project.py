from pydantic import BaseModel
from typing import Optional


class ProjectCreate(BaseModel):
    title: str
    description: str
    skills_required: str
    team_size: int
    created_by: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    skills_required: str
    team_size: int
    created_by: Optional[str]
    member_count: int

    class Config:
        from_attributes = True
