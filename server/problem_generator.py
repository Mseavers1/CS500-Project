from cfg import CFG
from database import Database


class QuestionGenerator:

    def __init__(self, db: Database, topic: str, q_type: str, resp):
        self.db = db
        self.topic = topic
        self.q_type = q_type
        self.resp = resp
        # [{'rule_id': 20, 'rule_variable': 'T', 'rule_ruleset': 'test', 'rule_cost': 1.0, 'rule_weight': 1.0,
        # 'rule_priority': 1.0}]
        self.cfg = CFG()

        # Loop through rules and add them into cfg
        for rule in sorted(self.resp["matches"], key=lambda r: r["rule_cost"]):
            self.cfg.add_rule(
                rule["rule_variable"],
                rule["rule_ruleset"],
                rule["rule_cost"],
                rule["rule_weight"],
                rule["rule_priority"]
            )

    @classmethod
    async def create(cls, db: Database, topic: str, q_type: str):
        resp = await db.get_rules(topic, q_type)
        return cls(db, topic, q_type, resp)

    def generate(self):
        return self.cfg.generate(10)

