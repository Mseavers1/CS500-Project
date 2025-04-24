import torch
from torch.utils.data import DataLoader

from dkt_model import DKT, DKTDataset

# --- Load Parameters (must be the same as training) ---
BATCH_SIZE = 1  # For single sequence prediction

checkpoint = torch.load("../checkpoints/dkt_model_best.ckpt")
config = checkpoint['config']

NUM_TOPICS = config['NUM_TOPICS']
NUM_SUBTOPICS = config['NUM_SUBTOPICS']
EMB_SIZE = config['EMB_SIZE']
HIDDEN_SIZE = config['HIDDEN_SIZE']
MAX_SEQ_LENGTH = 128

loaded_model = DKT(
    num_topics=config['NUM_TOPICS'],
    num_subtopics=config['NUM_SUBTOPICS'],
    emb_size=config['EMB_SIZE'],
    hidden_size=config['HIDDEN_SIZE']
)

# --- Load the State Dictionary ---
loaded_model.load_state_dict(checkpoint['model_state_dict'])
loaded_model.eval()  # Set the model to evaluation mode (important for dropout)

# Optional: Move model to the device you want to use for inference
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
loaded_model.to(device)

print("Trained model loaded successfully.")

# New student's history data
new_student_history = [
    {'id': 100, 'user_id': 100, 'topic_id': 16, 'question_type_id': 11, 'question_id': 16 * 100 + 11,
     'is_correct': False, 'difficulty': 5,
     'time_taken': 108.0, 'attempts': 1, 'skipped': False},
    {'id': 101, 'user_id': 100, 'topic_id': 16, 'question_type_id': 11, 'question_id': 16 * 100 + 11,
     'is_correct': True, 'difficulty': 6,
     'time_taken': 280.0, 'attempts': 3, 'skipped': False},
]

# The last interaction's 'is_correct' will be part of the input,
# and we want to predict the probability of correctness for the *next* question.

new_student_logs = {
    'new_student': new_student_history
}

new_dataset = DKTDataset(new_student_logs, max_seq_length=MAX_SEQ_LENGTH)
new_dataloader = DataLoader(new_dataset, batch_size=1)  # Batch size of 1 for a single sequence

loaded_model.eval()  # Ensure the model is in evaluation mode
with torch.no_grad():
    for batch in new_dataloader:
        (topic_id, subtopic_id, difficulty, time_taken, attempts, skipped,
         r, _, _, _, _, _, _) = batch  # We only need the input history

        # Move the batch to the same device as the model
        topic_id = topic_id.to(device)
        subtopic_id = subtopic_id.to(device)
        difficulty = difficulty.to(device)
        time_taken = time_taken.to(device)
        attempts = attempts.to(device)
        skipped = skipped.to(device)
        r = r.to(device)

        # Forward pass to get predictions for the *next* question
        predictions = loaded_model(topic_id, subtopic_id, difficulty, time_taken, attempts, skipped, r)

        # Verify the shape of predictions
        print("Predictions shape:", predictions.shape)  # Check the shape of the predictions tensor

        # If the predictions shape is [1, 1] (1 question), then only 1 probability is predicted
        probabilities = torch.sigmoid(predictions[:, -1, :]).cpu().numpy()

        # Check the predicted probabilities
        print("Predicted probabilities for all questions:", probabilities)

        # Since only one prediction is made (e.g., next question), use that:
        probability_of_correctness = probabilities[0, 0]
        print(f"Predicted probability of correctness for next question: {probability_of_correctness:.4f}")

        # No need to reference question IDs. The model predicts a probability of correctness for the next step
        print(f"Predicted probability of correctness for the next question: {probability_of_correctness:.4f}")
