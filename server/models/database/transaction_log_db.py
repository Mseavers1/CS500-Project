from sqlalchemy import Column, Integer, Float, Boolean, DATETIME, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship

from base import Base


class TransactionLogTable(Base):
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    topic_id = Column(Integer, ForeignKey('topics.topic_id'), nullable=False)
    question_type_id = Column(Integer, ForeignKey('question_types.type_id'), nullable=False)
    timestamp = Column(TIMESTAMP, nullable=False)
    difficulty = Column(Float, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    time_taken = Column(Float, nullable=False)
    attempts = Column(Integer, nullable=False)
    skipped = Column(Boolean, nullable=False)

    user = relationship("UserTable", back_populates="transactions")
    topic = relationship("TopicTable", back_populates="transactions")
    question_type = relationship("QuestionTypeTable", back_populates="transactions")

    def __repr__(self):
        return f"<TransactionTable(id={self.id}, user_id={self.user_id}, " \
               f"topic_id={self.topic_id}, question_type_id={self.question_type_id}, timestamp={self.timestamp}, " \
               f"difficulty={self.difficulty}, is_correct={self.is_correct}, time_taken={self.time_taken}, " \
               f"attempts={self.attempts}, skipped={self.skipped}>"
