from pydantic import BaseModel, EmailStr


class ProblemGenerator(BaseModel):
    difficulty: str
    q_type: str
    topic: str
