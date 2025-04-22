import torch
from torch.utils.data import DataLoader

from dkt_model import DKT, DKTDataset

# --- Load Parameters (must be the same as training) ---
BATCH_SIZE = 1  # For single sequence prediction

checkpoint = torch.load("../checkpoints/dkt_model_best.ckpt")
config = checkpoint['config']

NUM_TOPICS = config['NUM_TOPICS']
NUM_SUBTOPICS = config['NUM_SUBTOPICS']
NUM_QUESTIONS = config['NUM_QTYPES']
EMB_SIZE = config['EMB_SIZE']
HIDDEN_SIZE = config['HIDDEN_SIZE']
MAX_SEQ_LENGTH = 128

loaded_model = DKT(
    num_topics=config['NUM_TOPICS'],
    num_subtopics=config['NUM_SUBTOPICS'],
    num_q=config['NUM_QTYPES'],
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

new_student_history = [
    {'id': 100, 'user_id': 100, 'topic_id': 16, 'question_type_id': 11, 'question_id': 16 * 100 + 11, 'is_correct': False, 'difficulty': 5,
     'time_taken': 108.0, 'attempts': 1, 'skipped': True},
    {'id': 101, 'user_id': 100, 'topic_id': 16, 'question_type_id': 11, 'question_id': 16 * 100 + 11, 'is_correct': True, 'difficulty': 6,
     'time_taken': 280.0, 'attempts': 2, 'skipped': True},
]

# The last interaction's 'is_correct' will be part of the input,
# and we want to predict the probability of correctness for the *next* question.

new_student_logs = {
    'new_student': new_student_history
}

new_dataset = DKTDataset(new_student_logs, num_q=NUM_QUESTIONS, max_seq_length=MAX_SEQ_LENGTH)
new_dataloader = DataLoader(new_dataset, batch_size=1)  # Batch size of 1 for a single sequence

loaded_model.eval()  # Ensure the model is in evaluation mode
with torch.no_grad():
    for batch in new_dataloader:
        (topic_id, subtopic_id, difficulty, time_taken, attempts, skipped,
         r, _, _, _, _, _, _, _) = batch  # We only need the input history

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
        # predictions shape: [batch_size, seq_len, num_q] (here [1, seq_len, NUM_QUESTIONS])

        # The predictions at the last time step of the sequence are what we're interested in
        # for predicting the next question.
        last_prediction = predictions[:, -1, :]  # Shape: [1, NUM_QUESTIONS]
        probabilities = torch.sigmoid(last_prediction).cpu().numpy()

        # 'probabilities' is now a numpy array of shape (1, NUM_QUESTIONS),
        # where each element represents the predicted probability of the student
        # correctly answering that specific question (from 0 to NUM_QUESTIONS - 1)
        print("Predicted probabilities for all questions:", probabilities)

        # To get the probability for a specific *next* question (e.g., question_id = 105):
        next_question_id = 105
        if 0 <= next_question_id < NUM_QUESTIONS:
            probability_of_correctness = probabilities[0, next_question_id]
            print(
                f"Predicted probability of correctness for question {next_question_id}: {probability_of_correctness:.4f}")
        else:
            print(f"Question ID {next_question_id} is out of range.")

        # You can then use these probabilities for various downstream tasks,
        # such as recommending the next question or assessing the student's knowledge state.
