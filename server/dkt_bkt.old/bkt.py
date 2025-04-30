import torch
import torch.nn.functional as F
import numpy as np


def sigmoid(x):
    """Sigmoid function."""
    return 1 / (1 + torch.exp(-x))


# Written using Oracle's ChatGPT
# Edited by Michael to fit model more
class ExtendedBKTModel:
    def __init__(self, a_params, w_params, b_params):
        """
        Initialize the BKT model with the given parameters.

        a_params, w_params, b_params: parameters for the logistic functions (sigmoid)
        for P(T_t), P(S_t), and P(G_t).
        """
        self.a_params = a_params  # Parameters for P(T_t) (learning probability)
        self.w_params = w_params  # Parameters for P(S_t) (slip probability)
        self.b_params = b_params  # Parameters for P(G_t) (guess probability)

    def P_T(self, time, attempts, difficulty, skipped):
        """
        Calculate the learning probability (P(T_t)) as a function of features:
        time_taken, attempts, difficulty, skipped.
        """
        # Logistic function for learning (P(T_t))
        x = self.a_params[0] * time + self.a_params[1] * attempts + self.a_params[2] * difficulty + self.a_params[
            3] * skipped + self.a_params[4]
        return sigmoid(x)

    def P_S(self, time, difficulty, attempts):
        """
        Calculate the slip probability (P(S_t)) as a function of features:
        time_taken, difficulty, attempts.
        """
        # Logistic function for slip probability (P(S_t))
        x = self.w_params[0] * time + self.w_params[1] * difficulty + self.w_params[2] * attempts + self.w_params[3]
        return sigmoid(x)

    def P_G(self, difficulty, skipped):
        """
        Calculate the guess probability (P(G_t)) as a function of features:
        difficulty and skipped.
        """
        # Logistic function for guess probability (P(G_t))
        x = self.b_params[0] * difficulty + self.b_params[1] * skipped + self.b_params[2]
        return sigmoid(x)

    def predict(self, P_L_prev, time_taken, attempts, difficulty, skipped, correct):
        """
        Perform the Bayesian Knowledge Tracing update step for the next question.

        P_L_prev: Probability that the student knows the skill at time t-1 (previous state)
        time_taken: Time taken to answer the current question
        attempts: Number of attempts made by the student
        difficulty: Difficulty level of the current question
        skipped: Whether the student skipped the question (1 if skipped, 0 if not)
        correct: Whether the student answered correctly (1 if correct, 0 if incorrect)

        Returns the updated probability of knowing the skill (P(L_t)).
        """
        # Step 1: Predict P(T_t) - the learning probability (P(T_t))
        P_T_t = self.P_T(time_taken, attempts, difficulty, skipped)

        # Step 2: Calculate P(L_t^-) (prior knowledge estimate for the next question)
        P_L_prev = torch.tensor(P_L_prev, dtype=torch.float)
        P_L_prev = torch.clamp(P_L_prev, 0, 1)  # Ensure it's within [0, 1]

        P_L_minus = P_L_prev + (1 - P_L_prev) * P_T_t

        # Step 3: Calculate P(S_t) (slip probability)
        P_S_t = self.P_S(time_taken, difficulty, attempts)

        # Step 4: Calculate P(G_t) (guess probability)
        P_G_t = self.P_G(difficulty, skipped)

        # Step 5: Compute the likelihood of correctness or incorrectness
        if correct == 1:  # Correct answer
            likelihood_correct = P_L_minus * (1 - P_S_t) + (1 - P_L_minus) * P_G_t
        else:  # Incorrect answer
            likelihood_correct = P_L_minus * P_S_t + (1 - P_L_minus) * (1 - P_G_t)

        # Step 6: Apply Bayes' rule to update the knowledge state (P(L_t))
        if correct == 1:
            P_L_t = (P_L_minus * (1 - P_S_t)) / likelihood_correct
        else:
            P_L_t = (P_L_minus * P_S_t) / likelihood_correct

        # Ensure it's within the [0, 1] range
        P_L_t = torch.clamp(P_L_t, 0, 1)

        return P_L_t.item()
