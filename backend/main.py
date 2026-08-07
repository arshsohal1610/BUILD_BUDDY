from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import Base, engine
from sqlalchemy import inspect, text
from app.models import user, project, project_member, buddy_request, buddy_connection, message, notification, project_invitation
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.projects import router as projects_router
from app.routers.buddies import router as buddies_router
from app.routers.messages import router as messages_router
from app.routers.notifications import router as notifications_router
from app.routers.search import router as search_router
from app.routers.invitations import router as invitations_router
from app.realtime import manager

app = FastAPI()

# Allow the React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(projects_router)
app.include_router(buddies_router)
app.include_router(messages_router)
app.include_router(notifications_router)
app.include_router(search_router)
app.include_router(invitations_router)

Base.metadata.create_all(bind=engine)


def ensure_user_table_schema() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("users")}
    missing_columns = [
        ("bio", "VARCHAR"),
        ("branch", "VARCHAR"),
        ("college", "VARCHAR"),
        ("year", "VARCHAR"),
        ("skills", "VARCHAR"),
        ("github", "VARCHAR"),
        ("linkedin", "VARCHAR"),
        ("portfolio", "VARCHAR"),
        ("location", "VARCHAR"),
        ("profile_image", "VARCHAR"),
    ]

    with engine.begin() as connection:
        for column_name, column_type in missing_columns:
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"))


ensure_user_table_schema()


@app.websocket("/ws/users/{user_id}")
async def user_events(websocket: WebSocket, user_id: int):
    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)


@app.get("/")
def home():
    return {"message": "Welcome to Build Buddy Backend!"}
