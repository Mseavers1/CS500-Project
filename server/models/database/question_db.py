from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from base import Base


class QuestionTable(Base):
    __tablename__ = 'questions'
    topic_id = Column(Integer, ForeignKey('topics.topic_id'), primary_key=True)
    question_type_id = Column(Integer, ForeignKey('question_types.type_id'), primary_key=True)
    rule_id = Column(Integer, ForeignKey('rules.rule_id'), primary_key=True)

    # Create relationships
    topic = relationship('TopicTable', back_populates='questions')
    question_type = relationship('QuestionTypeTable', back_populates='questions')
    rule = relationship('RuleTable', back_populates='questions')

    def __repr__(self):
        return f"<RuleTable(id={self.rule_id}, variable={self.rule_variable}, ruleset={self.rule_ruleset}, " \
               f"cost={self.rule_cost}, weight={self.rule_weight}, priority={self.rule_priority})>"
