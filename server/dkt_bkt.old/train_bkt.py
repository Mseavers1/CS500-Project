import asyncio
import torch
import torch.optim as optim
import torch.nn.functional as F
from bkt import ExtendedBKTModel
from database import Database

# Initialize parameters for the logistic functions
a_params = torch.tensor([0.1, 0.2, 0.3, 0.4, -2.0], requires_grad=True)  # P(T_t)
w_params = torch.tensor([0.1, 0.3, -0.2, -1.0], requires_grad=True)  # P(S_t)
b_params = torch.tensor([0.5, -0.3, -1.5], requires_grad=True)  # P(G_t)

# Create model
model = ExtendedBKTModel(a_params, w_params, b_params)

# Initialize optimizer
optimizer = optim.Adam([a_params, w_params, b_params], lr=0.01)

# Get all student's data
database = Database()

async def get_logs():
    return await database.get_all_logged_data()


logs = asyncio.run(get_logs())
all_students_data = {}

for transaction in logs['matches']:
    # Extract the required values
    user_id = f"user{transaction.user_id}"
    P_L_prev = transaction.p_l_prev
    time_taken = transaction.time_taken
    attempts = transaction.attempts
    difficulty = transaction.difficulty
    skipped = 1 if transaction.skipped else 0
    correct = 1 if transaction.is_correct else 0

    # If the user is not already in the dictionary, initialize their entry
    if user_id not in all_students_data:
        all_students_data[user_id] = []

    # Append the current transaction as a tuple to the user's list
    all_students_data[user_id].append((P_L_prev, time_taken, attempts, difficulty, skipped, correct))

# Now all_students_data will look like this:
for user_id, records in all_students_data.items():
    print(f"{user_id}: {records}")

# Training loop
num_epochs = 1000
for epoch in range(num_epochs):
    total_loss = 0.0
    count = 0

    for user_data in all_students_data.values():
        for P_L_prev, time_taken, attempts, difficulty, skipped, correct in user_data:
            optimizer.zero_grad()

            # Predict the probability of knowledge (P_L_t)
            P_L_t = model.predict(P_L_prev, time_taken, attempts, difficulty, skipped, correct)

            # Ensure P_L_t is within a reasonable range before applying sigmoid
            print(f"P_L_t before sigmoid: {P_L_t}")  # Debugging line

            # Apply sigmoid to ensure the prediction is between 0 and 1
            P_L_t_tensor = torch.tensor([P_L_t], dtype=torch.float, requires_grad=True)

            # Ensure target is a 1-element tensor
            target = torch.tensor([correct], dtype=torch.float)

            # Calculate the binary cross-entropy loss
            try:
                loss = F.binary_cross_entropy(P_L_t_tensor, target)
            except RuntimeError as e:
                print(f"Error in binary_cross_entropy: {e}")  # Debugging line
                print(f"P_L_t_tensor: {P_L_t_tensor}")
                print(f"Target: {target}")
                continue  # Skip the current iteration if an error occurs

            # Backpropagate and update parameters
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            count += 1

    if epoch % 100 == 0:
        print(f"Epoch {epoch}, Loss: {total_loss / count:.4f}")

# After training, the parameters should have learned to predict the probability of knowledge (P(L_t))
print("Trained Parameters:")
print("a_params:", a_params)
print("w_params:", w_params)
print("b_params:", b_params)
