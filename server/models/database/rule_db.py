from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship

from base import Base


class RuleTable(Base):
    __tablename__ = 'rules'
    rule_id = Column(Integer, primary_key=True)
    rule_variable = Column(String, nullable=False)
    rule_ruleset = Column(String, nullable=False)
    rule_cost = Column(Float, nullable=False)
    rule_weight = Column(Float, nullable=False)
    rule_priority = Column(Float, nullable=False)

    questions = relationship('QuestionTable', back_populates='rule')

    def __repr__(self):
        return f"<RuleTable(id={self.rule_id}, variable={self.rule_variable}, ruleset={self.rule_ruleset}, " \
               f"cost={self.rule_cost}, weight={self.rule_weight}, priority={self.rule_priority})>"
