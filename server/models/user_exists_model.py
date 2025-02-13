from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserExists(BaseModel):
    user_id: Optional[int] = Field(None, description="User's ID")
    email: Optional[EmailStr] = Field(None, description="User's email")
    username: Optional[str] = Field(None, description="User's username")
    phone: Optional[str] = Field(None, description="User's phone")
