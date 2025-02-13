from pydantic import BaseModel, Field
from typing import Optional


class UserLogin(BaseModel):
    email: Optional[str] = Field(None, description="User's email")
    username: Optional[str] = Field(None, description="User's username")
    phone: Optional[str] = Field(None, description="User's phone")
    password: str
