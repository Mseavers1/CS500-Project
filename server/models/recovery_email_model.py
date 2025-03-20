from pydantic import BaseModel, EmailStr


class RecoveryEmail(BaseModel):
    emailTo: EmailStr
    recoveryType: str
