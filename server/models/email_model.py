from pydantic import BaseModel, EmailStr


class EmailSend(BaseModel):
    emailTo: EmailStr
    subject: str
    body: str
