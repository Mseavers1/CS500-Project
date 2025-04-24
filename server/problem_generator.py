import math

from cfg import CFG
from database import Database


class QuestionGenerator:

    def __init__(self, db: Database, username: str, topic: str, q_type: str, resp):
        self.db = db
        self.topic = topic
        self.q_type = q_type
        self.resp = resp
        self.username = username
        # [{'rule_id': 20, 'rule_variable': 'T', 'rule_ruleset': 'test', 'rule_cost': 1.0, 'rule_weight': 1.0,
        # 'rule_priority': 1.0}]
        self.cfg = CFG()

        self.wc = 0.9
        self.wa = 0.6
        self.ws = 0.3
        self.wt = 0.2
        self.linear_range = 0.05
        self.alpha = 0.7
        self.scaling_factor = 0.2

        if "message" in self.resp:
            print(self.resp["message"])
            raise Exception(self.resp["message"])

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
    async def create(cls, db: Database, username: str, topic: str, q_type: str):
        resp = await db.get_rules(topic, q_type)
        return cls(db, username, topic, q_type, resp)

    async def generate(self):

        # Step 0: Get user_id
        user_id = await self.db.get_user(username=self.username)
        user_id = user_id['user_id']

        # Step 1: Get the all logs of the user
        logs = await self.db.get_logs_by_user_topic_type(user_id, self.topic, self.q_type)

        # Error handling
        if "message" in logs:
            print(logs["message"])
            raise Exception(f"Error occurred: {logs['message']}")

        logs = logs["matches"]

        # Step 2: If no entries, start difficulty at 1
        if len(logs) <= 0:
            return self.cfg.generate(2), 2

        # Step 3: Calculate the average of time of all logs
        avg_time = 0

        for log in logs:
            avg_time += log.time_taken

        avg_time /= len(logs)

        # Step 4: Get the latest entry & latest difficulty
        latest_log = logs[-1]
        latest_difficulty = latest_log.difficulty

        # Step 5: Calculate score of last entry
        time_penalty = math.log((latest_log.time_taken / avg_time) + 1) if avg_time > 0 else 0

        score = (self.wc * latest_log.is_correct * latest_log.difficulty) - \
            (self.wa * latest_log.attempts) - (self.ws * latest_log.skipped) - (self.wt * time_penalty)

        # Step 6: Calculate smooth score from all logs
        smoothed_score = 0
        for idx, log in enumerate(reversed(logs)):
            time_penalty = math.log((log.time_taken / avg_time) + 1) if avg_time > 0 else 0

            s = (self.wc * log.is_correct * log.difficulty) - (self.wa * log.attempts) - \
                (self.ws * log.skipped) - (self.wt * time_penalty)

            # Decaying weight
            weight = self.alpha ** idx
            smoothed_score += weight * s

        # Step 7: Normalize the smooth score
        total_weight = sum(self.alpha ** i for i in range(len(logs)))
        smoothed_score /= total_weight

        # Step 8: Calculate new difficulty
        new_dif = latest_difficulty
        if score > smoothed_score + self.linear_range * (1 + latest_difficulty * self.scaling_factor):
            new_dif += 1
        elif score < smoothed_score - self.linear_range * (1 + latest_difficulty * self.scaling_factor):
            new_dif -= 1

        print(f"\n\n\n{smoothed_score} - {score} - {self.linear_range * (1 + latest_difficulty * self.scaling_factor)}")

        new_dif = max(new_dif, 2)
        return self.cfg.generate(new_dif), new_dif
