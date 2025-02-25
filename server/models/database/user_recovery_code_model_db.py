from sqlalchemy import Column, String, DateTime, func, ForeignKey, Integer

from base import Base


class UserRecoveryCode(Base):
    __tablename__ = 'userRecoveryCodes'

    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    code = Column(String, nullable=False)
    recovery_type = Column(String, nullable=False)
    date_generated = Column(DateTime, nullable=False, default=func.now())

    def __repr__(self):
        return f"<UserRecoveryCode(user_id={self.user_id}, code={self.code}, recovery_type={self.recovery_type}, date_generated={self.date_generated})>"
