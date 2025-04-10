from pydantic import BaseModel, EmailStr


class ProblemGenerator(BaseModel):
    complexity: int
