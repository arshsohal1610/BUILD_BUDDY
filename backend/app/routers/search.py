from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.models.project import Project
from app.schemas.search import UserSearchResult, ProjectSearchResult

router = APIRouter()


@router.get("/search")
def search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    users = db.query(User).filter(
        (User.username.ilike(f"%{q}%"))
        | (User.email.ilike(f"%{q}%"))
        | (User.skills.ilike(f"%{q}%"))
    ).all()

    projects = db.query(Project).filter(
        (Project.title.ilike(f"%{q}%"))
        | (Project.description.ilike(f"%{q}%"))
        | (Project.skills_required.ilike(f"%{q}%"))
    ).all()

    skills = set()
    for user in users:
        if user.skills:
            skills.update([skill.strip() for skill in user.skills.split(",") if skill.strip()])
    for project in projects:
        if project.skills_required:
            skills.update([skill.strip() for skill in project.skills_required.split(",") if skill.strip()])

    return {
        "users": [UserSearchResult.from_orm(user).dict() for user in users],
        "projects": [ProjectSearchResult.from_orm(project).dict() for project in projects],
        "skills": sorted(skills),
    }
