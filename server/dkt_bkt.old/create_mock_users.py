import random
from datetime import datetime

from database import Database
import asyncio

numUsers = [("quick_learner", 3), ("slow_learner", 3), ("struggler", 3), ("skipper", 2)]
minUse = 25
maxUse = 100

database = Database()

p_init = 0.2  # Initial knowledge
p_transit = 0.1  # Probability of learning (transition)
p_slip = 0.1  # Error when knowing
p_guess = 0.2  # Correct by guessing when not knowing


def update_bkt(p_k_prev, correct, p_transit, p_slip, p_guess):
    if correct:
        num = p_k_prev * (1 - p_slip)
        den = p_k_prev * (1 - p_slip) + (1 - p_k_prev) * p_guess
    else:
        num = p_k_prev * p_slip
        den = p_k_prev * p_slip + (1 - p_k_prev) * (1 - p_guess)

    p_k_t = (num / den) if den != 0 else 0.0
    p_k_t = p_k_t + (1 - p_k_t) * p_transit  # Add transition
    return round(p_k_t, 4)


class UserTypes:

    def __init__(self, user_id: int, acc: (float, float), time_taken: (float, float, float, float, float),
                 skips: (float, float, float)):
        self.accuracy = acc
        self.user_id = user_id
        self.time_taken = time_taken
        self.skips = skips

    async def generate_user_logs(self, generated: int = 20, started_dif: float = 1):

        acc = round(random.uniform(self.accuracy[0], self.accuracy[1]), 2)
        skip_chance = round(random.uniform(self.skips[1], self.skips[2]), 2)

        current_dif = started_dif
        current_dif_attempts = 0

        def calculate_time_taken(addition, att):
            time = round(random.uniform(self.time_taken[2], self.time_taken[3]), 2)

            total = time + addition

            if att > 1:
                for i in range(att):
                    total += round(random.uniform(self.time_taken[2] / self.time_taken[4],
                                                  self.time_taken[3] / self.time_taken[4]), 2)

            return total

        def calculate_new_dif(att, skipped, time_taken, cur_dif_attempts, is_corr, cur_dif):

            # If skipped: chance to lower decreases per current dif attempts
            if skipped:

                chance = ((1 / 3) * 100) * cur_dif_attempts
                r = random.random() * 100

                # Lower (can't go below 1)
                if r >= 100 - chance:
                    return max(cur_dif - 1, 1), 0

                # Leave it
                return cur_dif, cur_dif_attempts + 1

            # If correct: chance to lower based on time taken & attempts
            if is_corr:

                attempt_chance = 0 if att <= 1 else 10 * att
                time_chance = 0 if time_taken <= 20 else max((time_taken - 20) // 10 * 1, 50)

                r = random.random() * 100

                # Stay the same
                if r >= 100 - attempt_chance - time_chance:
                    return cur_dif, cur_dif_attempts + 1

                # Increase it
                return cur_dif + 1, 0

            # If not correct
            if not is_corr:
                # lower by 1
                return max(cur_dif - 1, 1), 0

        p_k_prev = p_init

        for log in range(generated):

            # Get current time range
            current_time_addition = (current_dif // self.time_taken[0]) * self.time_taken[1]

            # Get current skip chance
            current_skip = (current_dif // self.skips[0]) * skip_chance

            attempts = 0
            is_correct = 0
            skip = 0
            current_dif_attempts += 1

            # Student tries to get question right, and keeps retrying for 3 total attempts
            while is_correct == 0 and attempts < 3 and skip == 0:

                # Skip question before answering?
                if (random.random() * 100) >= 100 - current_skip:
                    skip = 1
                    break

                # See if user gets the question correct
                attempts += 1
                is_correct = 1 if (random.random() * 100) >= 100 - acc else 0

                # If attempts is 4, they failed the question (no skips)
                if attempts >= 4:
                    skip = 0
                    break

                skip = 0

            time_taken = calculate_time_taken(current_time_addition, attempts)

            p_k_t = update_bkt(p_k_prev, is_correct, p_transit, p_slip, p_guess)

            # Add user
            resp = await database.log_data(user_id=self.user_id, topic_id=16, question_type_id=11,
                                           timestamp=datetime.now(),
                                           dif=current_dif, is_correct=is_correct,
                                           time_taken=time_taken,
                                           attempts=attempts, skipped=skip, p_l_prev=p_k_prev,
                                           p_l_t=p_k_t)

            # Calculate new dif
            current_dif, current_dif_attempts = calculate_new_dif(attempts, skip, 1, current_dif_attempts, is_correct,
                                                                  current_dif)

            # Set previous
            p_k_prev = p_k_t


class QuickLearner(UserTypes):

    def __init__(self, user_id: int):
        super().__init__(user_id=user_id, acc=(80, 100), time_taken=(10, 10, 30, 60, 2), skips=(10, 0.1, 1))


class SlowLearner(UserTypes):

    def __init__(self, user_id: int):
        super().__init__(user_id=user_id, acc=(50, 80), time_taken=(10, 20, 40, 80, 1.8), skips=(10, 0.5, 1))


class Struggler(UserTypes):

    def __init__(self, user_id: int):
        super().__init__(user_id=user_id, acc=(30, 50), time_taken=(10, 20, 30, 80, 1.5), skips=(10, 1, 1))


class Skipper(UserTypes):

    def __init__(self, user_id: int):
        super().__init__(user_id=user_id, acc=(10, 30), time_taken=(10, 1, 10, 30, 1), skips=(1, 1, 10))


async def create_logs():
    u_id = 1
    for n, num in numUsers:

        for i in range(num):

            if n == "quick_learner":
                u = QuickLearner(u_id)
            elif n == 'struggler':
                u = Struggler(u_id)
            elif n == 'skipper':
                u = Skipper(u_id)
            else:
                u = SlowLearner(u_id)

            await u.generate_user_logs(random.randint(minUse, maxUse))
            u_id += 1


asyncio.run(create_logs())
