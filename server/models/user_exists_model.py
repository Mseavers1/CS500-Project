from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserExists(BaseModel):
    user_id: Optional[int] = Field(None, description="User's ID")
    email: Optional[EmailStr] = Field(None, description="User's email")
    username: Optional[str] = Field(None, description="User's username")
    password: Optional[str] = Field(None, description="User's password")
    phone: Optional[str] = Field(None, description="User's phone")
    user_type: Optional[str] = Field(None, description="Type of user")
