import base64
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from cryptography.fernet import Fernet
import bcrypt
from sqlalchemy.future import select
from contextlib import asynccontextmanager

from base import Base
from models.database.user_model_db import UserTable

load_dotenv()


def hash_data(data: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(data.encode('utf-8'), salt)
    return hashed.decode('utf-8')


class Database:
    def __init__(self):
        # Get the database URL from the environment
        self.DATABASE_URL = os.getenv("DATABASE_URL")

        # Get & Set Encryption Key
        self.ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
        self.fernet = Fernet(self.ENCRYPTION_KEY)

        # Ensure the DATABASE_URL is not None
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL is not set in the environment variables.")

        # Create async engine
        self.engine = create_async_engine(self.DATABASE_URL, echo=True)

        # Create session factory
        self.AsyncSessionLocal = sessionmaker(bind=self.engine, class_=AsyncSession, expire_on_commit=False)

        # Create tables if any
        self.create_tables()

    # Grabs the database for fastapi
    @asynccontextmanager
    async def get_db(self):
        async with self.AsyncSessionLocal() as session:
            yield session

    # Creates all tables that do not exist
    async def create_tables(self):
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        print("Tables created successfully if they didn't exist!")

    def encrypt_data(self, data: str) -> str:
        encrypted = self.fernet.encrypt(data.encode())
        return base64.b64encode(encrypted).decode('utf-8')

    def decrypt_data(self, data: str) -> str:
        encrypted_bytes = base64.b64decode(data.encode('utf-8'))
        decrypted = self.fernet.decrypt(encrypted_bytes)
        return decrypted.decode('utf-8')

    async def validate_login(self, password: str, email: str = "", username: str = "", phone: str = ""):

        # Get user
        user = self.get_user(username=username, phone=phone, email=email)

        # If user was not found
        if user is None:
            return None

        # Hash Password
        password = hash_data(password)

        # Check if passwords match
        c_password = user["user_password"]

        if c_password == password:
            return user
        else:
            return None

    # Gets a user by parameters
    async def get_user(self, user_id: int = -1, email: str = "", phone: str = "", username: str = ""):
        async with self.get_db() as session:
            query = select(UserTable)

            if user_id is not None and user_id > 0:
                query = query.filter(UserTable.id == user_id)

            result = await session.execute(query)
            users = result.scalars().all()  # Fetch all potential matches

            for user in users:
                if email and self.decrypt_data(user.user_email) == email:
                    return user
                if phone and self.decrypt_data(user.user_phone) == phone:
                    return user
                if username and self.decrypt_data(user.user_username) == username:
                    return user

            return None  # No match found

    # Adds a user to the User table
    async def add_user(self, email: str, username: str, password: str, phone: str, u_type: str = 'student'):

        # Encrypt data
        email = self.encrypt_data(email)
        username = self.encrypt_data(username)
        phone = self.encrypt_data(phone)

        # Hash data
        password = hash_data(password)

        # Create a new user instance
        new_user = UserTable(
            user_email=email,
            user_username=username,
            user_password=password,
            user_phone=phone,
            user_type=u_type
        )

        async with self.get_db() as session:
            session.add(new_user)
            await session.commit()
