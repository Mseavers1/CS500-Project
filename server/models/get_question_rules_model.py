from pydantic import BaseModel, EmailStr


class GetQuestionRules(BaseModel):
    type_name: str
    topic_name: str
