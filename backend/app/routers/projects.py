from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.user import User
from app.models.notification import Notification
from app.schemas.project import ProjectCreate, ProjectResponse

router = APIRouter()


@router.post("/projects", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    new_project = Project(
        title=project.title,
        description=project.description,
        skills_required=project.skills_required,
        team_size=project.team_size,
        created_by=project.created_by,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return ProjectResponse(
        id=new_project.id,
        title=new_project.title,
        description=new_project.description,
        skills_required=new_project.skills_required,
        team_size=new_project.team_size,
        created_by=new_project.created_by,
        member_count=0,
    )


@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.id.desc()).all()
    response = []
    for project in projects:
        member_count = db.query(func.count(ProjectMember.id)).filter(ProjectMember.project_id == project.id).scalar() or 0
        response.append({
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "skills_required": project.skills_required,
            "team_size": project.team_size,
            "created_by": project.created_by,
            "member_count": member_count,
        })
    return response


@router.post("/projects/{project_id}/join")
def join_project(project_id: int, user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.created_by == user.email:
        raise HTTPException(status_code=400, detail="Project creator cannot join their own project")

    existing_membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id,
    ).first()
    if existing_membership:
        raise HTTPException(status_code=400, detail="Already joined")

    member_count = db.query(func.count(ProjectMember.id)).filter(ProjectMember.project_id == project_id).scalar() or 0
    if member_count >= project.team_size:
        raise HTTPException(status_code=409, detail="Project team is full")

    membership = ProjectMember(project_id=project_id, user_id=user.id)
    db.add(membership)
    owner = db.query(User).filter(User.email == project.created_by).first()
    if owner:
        db.add(Notification(recipient_id=owner.id, type="project_joined", message=f"{user.username} joined {project.title}", payload=str(project.id)))
    db.commit()
    return {"message": "Joined project successfully"}


@router.delete("/projects/{project_id}/leave")
def leave_project(project_id: int, user_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_email).first()
    project = db.query(Project).filter(Project.id == project_id).first()
    if not user or not project:
        raise HTTPException(status_code=404, detail="Resource not found")
    if project.created_by == user.email:
        raise HTTPException(status_code=400, detail="Project creator cannot leave; ownership is not transferable")
    membership = db.query(ProjectMember).filter(ProjectMember.project_id == project_id, ProjectMember.user_id == user.id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Project membership not found")
    db.delete(membership)
    db.commit()
    return {"message": "Left project successfully"}


@router.get("/projects/{project_id}/members")
def get_project_members(project_id: int, db: Session = Depends(get_db)):
    members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
    return [{"id": m.user.id, "username": m.user.username, "email": m.user.email} for m in members]


@router.get("/users/{user_id}/projects")
def get_user_projects(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    created_projects = db.query(Project).filter(Project.created_by == user.email).all()
    joined_projects = (
        db.query(Project)
        .join(ProjectMember, ProjectMember.project_id == Project.id)
        .filter(ProjectMember.user_id == user_id)
        .all()
    )

    return {
        "created_projects": created_projects,
        "joined_projects": joined_projects,
    }
