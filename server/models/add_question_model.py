from pydantic import BaseModel, EmailStr


class AddQuestion(BaseModel):
    topic_name: str
    type_name: str
    rule_id: int
