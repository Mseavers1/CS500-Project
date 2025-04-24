from pydantic import BaseModel, EmailStr


class ProblemGenerator(BaseModel):
    username: str
    q_type: str
    topic: str
