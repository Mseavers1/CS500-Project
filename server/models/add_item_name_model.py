from pydantic import BaseModel, EmailStr


class AddItemName(BaseModel):
    itemName: str
