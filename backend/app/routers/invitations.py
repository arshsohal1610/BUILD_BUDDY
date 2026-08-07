from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.project_invitation import ProjectInvitation
from app.models.project_member import ProjectMember
from app.models.buddy_connection import BuddyConnection
from app.models.notification import Notification

router = APIRouter()


@router.post("/projects/{project_id}/invite")
def invite_to_project(project_id: int, inviter_id: int, invitee_id: int, db: Session = Depends(get_db)):
    inviter = db.query(User).filter(User.id == inviter_id).first()
    invitee = db.query(User).filter(User.id == invitee_id).first()
    project = db.query(Project).filter(Project.id == project_id).first()
    if not inviter or not invitee or not project:
        raise HTTPException(status_code=404, detail="Resource not found")
    if project.created_by != inviter.email:
        raise HTTPException(status_code=403, detail="Only project owner can invite")
    if not db.query(BuddyConnection).filter(BuddyConnection.user_id == inviter_id, BuddyConnection.buddy_id == invitee_id).first():
        raise HTTPException(status_code=403, detail="Project owners can only invite buddies")

    existing_invite = db.query(ProjectInvitation).filter(
        ProjectInvitation.project_id == project_id,
        ProjectInvitation.invitee_id == invitee_id,
    ).first()
    if existing_invite:
        raise HTTPException(status_code=400, detail="Invite already sent")

    invitation = ProjectInvitation(
        project_id=project_id,
        inviter_id=inviter_id,
        invitee_id=invitee_id,
        status="pending",
    )
    db.add(invitation)
    db.add(Notification(recipient_id=invitee_id, type="project_invitation", message=f"{inviter.username} invited you to join {project.title}", payload=str(invitation.id)))
    db.commit()
    db.refresh(invitation)
    return {"message": "Invitation sent"}


@router.post("/invitations/{invitation_id}/accept")
def accept_project_invitation(invitation_id: int, db: Session = Depends(get_db)):
    invitation = db.query(ProjectInvitation).filter(ProjectInvitation.id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail="Invitation is not pending")

    existing = db.query(ProjectMember).filter(ProjectMember.project_id == invitation.project_id, ProjectMember.user_id == invitation.invitee_id).first()
    if not existing:
        db.add(ProjectMember(project_id=invitation.project_id, user_id=invitation.invitee_id))

    invitation.status = "accepted"
    db.commit()
    return {"message": "Invitation accepted"}


@router.post("/invitations/{invitation_id}/reject")
def reject_project_invitation(invitation_id: int, db: Session = Depends(get_db)):
    invitation = db.query(ProjectInvitation).filter(ProjectInvitation.id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail="Invitation is not pending")

    invitation.status = "rejected"
    db.commit()
    return {"message": "Invitation rejected"}
