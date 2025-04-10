from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from base import Base


class TopicTable(Base):
    __tablename__ = 'topics'
    topic_id = Column(Integer, primary_key=True)
    topic_name = Column(String, nullable=False)

    questions = relationship('QuestionTable', back_populates='topic')

    def __repr__(self):
        return f"<TopicTable(topic_id={self.topic_id}, topic_name={self.topic_name})>"
