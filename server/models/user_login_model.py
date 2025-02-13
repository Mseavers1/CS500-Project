from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserLogin(BaseModel):
    email: Optional[EmailStr] = Field(None, description="User's email")
    username: Optional[str] = Field(None, description="User's username")
    phone: Optional[str] = Field(None, description="User's phone")
    password: str
