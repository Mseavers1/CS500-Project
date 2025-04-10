from sqlalchemy import Column, Integer, String

from base import Base


class UserTable(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, unique=True, nullable=False)
    user_username = Column(String, unique=True, nullable=False)
    user_password = Column(String, nullable=False)
    user_phone = Column(String, unique=True, nullable=True)
    user_type = Column(String, nullable=False)

    def __repr__(self):
        return f"<UserTable(user_email={self.user_email}, user_username={self.user_username}, " \
               f"user_password={self.user_password}, user_phone={self.user_phone}, user_type={self.user_type})>"
