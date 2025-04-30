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

        # Step 3: Get the latest entry & latest difficulty
        latest_log = logs[-1]
        latest_difficulty = latest_log.difficulty

        # Step 4: Get all logs that have the same difficulty
        logs_same_difficulty = [log for log in logs if log['difficulty'] == latest_difficulty]

        # Step 4.5: If there are not 5 entries, keep difficulty
        if len(logs_same_difficulty) < 5:
            return self.cfg.generate(latest_difficulty), latest_difficulty

        # Step 5: Calculate the average time excluding the latest entry
        average_time = 0
        for log in logs_same_difficulty[:-1]:
            average_time += log["time_taken"]
        average_time /= (len(logs_same_difficulty) - 1)

        def calculate_time_factor(time_difference, scaling_factor=0.02, min_factor=0.5, max_factor=2.0):
            """Calculates a time factor based on the time difference from the average. (generated in Gemini)"""
            adjustment = time_difference * scaling_factor
            time_factor = 1 - adjustment
            # Clamp the time factor to a reasonable range
            return max(min_factor, min(max_factor, time_factor))

        def calc_cost(log, avg_time):

            points = 0

            # Time costs
            time = log["time_taken"] - avg_time
            factor = calculate_time_factor(time)

            # Positive cost
            if log["is_correct"]:
                points += (10 * factor)

            # Attempt cost
            points -= (1.5 * log["attempts"])

            # Skip Costs
            if not log["skipped"]:
                points += 5

            return points

        # Step 6: Calculate the average score excluding the latest entry
        avg_costs = 0
        for log in logs_same_difficulty[:-1]:
            avg_costs += calc_cost(log, average_time)
        avg_costs /= (len(logs_same_difficulty) - 1)

        # Step 7: Calculate the score of the latest entry
        latest_cost = calc_cost(latest_log, average_time)

        # Step 8: Set new difficulty
        new_dif = latest_difficulty
        differ = latest_cost - avg_costs

        if differ < -1:
            new_dif -= 1
        elif differ > 1:
            new_dif += 1

        new_dif = max(new_dif, 2)
        return self.cfg.generate(new_dif), new_dif
