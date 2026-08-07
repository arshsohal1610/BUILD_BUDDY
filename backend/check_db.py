from app.database.database import engine
from sqlalchemy import text
print(engine.url)
with engine.connect() as conn:
    rows = conn.execute(text('SELECT name FROM sqlite_master WHERE type = "table"')).fetchall()
    print(rows)
