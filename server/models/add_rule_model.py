from pydantic import BaseModel, EmailStr


class AddRule(BaseModel):
    variable: str
    cost: float
    weight: float
    rule: str
    priority: float
