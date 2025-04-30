from datetime import datetime

from pydantic import BaseModel, EmailStr, validator, field_validator


class AddLog(BaseModel):
    username: str
    topic_name: str
    type_name: str
    dif: int
    is_correct: bool
    time_taken: float
    attempts: int
    skipped: bool
