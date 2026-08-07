#!/usr/bin/env python
"""Populate the local database with test users"""

import sys
from pathlib import Path

# Add the backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database.database import SessionLocal, Base, engine
from app.models.user import User

# Create all tables
Base.metadata.create_all(bind=engine)

# Get session
session = SessionLocal()

# Test users data
test_users = [
    {"email": "alice@example.com", "username": "alice", "password": "pass123"},
    {"email": "bob@example.com", "username": "bob", "password": "pass123"},
    {"email": "charlie@example.com", "username": "charlie", "password": "pass123"},
]

# Add users
for user_data in test_users:
    # Check if user already exists
    existing = session.query(User).filter(User.email == user_data["email"]).first()
    if existing:
        print(f"✓ User {user_data['email']} already exists (ID: {existing.id})")
    else:
        user = User(
            email=user_data["email"],
            username=user_data["username"],
            password=user_data["password"]
        )
        session.add(user)
        session.commit()
        print(f"✓ Created user {user_data['email']} (ID: {user.id})")

# Display all users
print("\n" + "="*60)
print("All users in buildbuddy.db:")
print("="*60)
all_users = session.query(User).all()
for user in all_users:
    print(f"ID: {user.id} | Email: {user.email} | Username: {user.username} | Password: {user.password}")

print(f"\nTotal users: {len(all_users)}")
session.close()
