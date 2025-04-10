from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from base import Base


class QuestionTypeTable(Base):
    __tablename__ = 'question_types'
    type_id = Column(Integer, primary_key=True)
    type_name = Column(String, nullable=False)

    questions = relationship('QuestionTable', back_populates='question_type')

    def __repr__(self):
        return f"<QuestionTypeTable(id={self.type_id}, name={self.type_name})>"
