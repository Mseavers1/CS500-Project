from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from base import Base


class UserTable(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, unique=True, nullable=False)
    user_username = Column(String, unique=True, nullable=False)
    user_password = Column(String, nullable=False)
    user_phone = Column(String, unique=True, nullable=True)
    user_type = Column(String, nullable=False)

    transactions = relationship("TransactionLogTable", back_populates="user")

    def __repr__(self):
        return f"<UserTable(user_id={self.user_id} user_email={self.user_email}, user_username={self.user_username}, " \
               f"user_password={self.user_password}, user_phone={self.user_phone}, user_type={self.user_type})>"
