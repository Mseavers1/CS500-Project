import os

import numpy as np
import torch
from torch import nn
import torch.nn.functional as F

from torch.nn import Module, Embedding, LSTM, Linear, Dropout
from torch.nn.functional import one_hot, binary_cross_entropy
from sklearn import metrics

from torch.utils.data import Dataset, DataLoader

"""
    Model taken from https://github.com/hcnoh/knowledge-tracing-collection-pytorch/blob/main/models/dkt.py
    Edited to fit my data and application
"""

import torch
from torch.nn.functional import binary_cross_entropy
from torch.nn import Embedding, LSTM, Linear, Dropout


class DKT2(Module):
    def __init__(self, num_question_types, embed_size, hidden_size, dropout=0.2):
        super().__init__()
        self.num_question_types = num_question_types
        self.embed_size = embed_size
        self.hidden_size = hidden_size

        # Embedding for question_type + response (0 = incorrect, 1 = correct)
        self.interaction_embed = Embedding(num_question_types * 2, embed_size)

        self.lstm = LSTM(input_size=embed_size, hidden_size=hidden_size, batch_first=True)
        self.dropout = Dropout(p=dropout)
        self.output_layer = Linear(hidden_size, num_question_types)

    def forward(self, question_types, responses):
        """
        Inputs:
            question_types: [batch, seq_len]
            responses:      [batch, seq_len]
        Returns:
            y:              [batch, seq_len, num_question_types] (sigmoid probabilities)
        """
        device = question_types.device

        # Combine question type and response to form interaction ID
        interaction_id = question_types + self.num_question_types * responses  # [batch, seq_len]
        x = self.interaction_embed(interaction_id)  # [batch, seq_len, embed_size]

        # LSTM processing
        lstm_out, _ = self.lstm(x)  # [batch, seq_len, hidden_size]
        lstm_out = self.dropout(lstm_out)

        # Output layer: predicts probability for each question type
        logits = self.output_layer(lstm_out)  # [batch, seq_len, num_question_types]
        probs = torch.sigmoid(logits)

        return probs

    def train_model(
            self, train_loader, test_loader, num_epochs, opt, ckpt_path
    ):
        """
            Args:
                train_loader: the PyTorch DataLoader instance for training
                test_loader: the PyTorch DataLoader instance for test
                num_epochs: the number of epochs
                opt: the optimization to train this model
                ckpt_path: the path to save this model's parameters
        """
        aucs = []
        loss_means = []

        max_auc = 0

        for i in range(1, num_epochs + 1):
            loss_mean = []

            for data in train_loader:
                q = data["question_types"]
                r = data["responses"]
                qshft = data["question_types_shft"]
                rshft = data["responses_shft"]
                m = data["mask"]

                self.train()

                y = self(q.long(), r.long())
                y = (y * one_hot(qshft.long(), self.num_question_types)).sum(-1)

                y = torch.masked_select(y, m.bool())
                t = torch.masked_select(rshft, m.bool())

                y = y.float()  # Ensure predictions are of type FloatTensor
                t = t.float()  # Ensure targets are of type FloatTensor

                opt.zero_grad()
                loss = binary_cross_entropy(y, t)
                loss.backward()
                opt.step()

                loss_mean.append(loss.detach().cpu().numpy())

            with torch.no_grad():
                for data in test_loader:
                    q = data["question_types"]
                    r = data["responses"]
                    qshft = data["question_types_shft"]
                    rshft = data["responses_shft"]
                    m = data["mask"]

                    self.eval()

                    y = self(q.long(), r.long())
                    y = (y * one_hot(qshft.long(), self.num_question_types)).sum(-1)

                    y = torch.masked_select(y, m.bool()).detach().cpu()
                    t = torch.masked_select(rshft, m.bool()).detach().cpu()

                    auc = metrics.roc_auc_score(
                        y_true=t.numpy(), y_score=y.numpy()
                    )

                    loss_mean = np.mean(loss_mean)

                    print(
                        "Epoch: {},   AUC: {},   Loss Mean: {}"
                        .format(i, auc, loss_mean)
                    )

                    if auc > max_auc:
                        torch.save(
                            self.state_dict(),
                            os.path.join(
                                ckpt_path, "model.ckpt"
                            )
                        )
                        max_auc = auc

                    aucs.append(auc)
                    loss_means.append(loss_mean)

        return aucs, loss_means


class DKT(nn.Module):
    '''
        Args:
            num_q: the total number of the unique questions (KCs) in the dataset
            num_topics: total number of topics
            num_subtopics: total number of subtopics (question types)
            emb_size: the dimension of the embedding vectors
            hidden_size: the dimension of the LSTM hidden vectors
    '''
    def __init__(self, num_topics, num_subtopics, num_q, emb_size, hidden_size):
        super().__init__()
        self.num_topics = num_topics
        self.num_subtopics = num_subtopics
        self.num_q = num_q
        self.emb_size = emb_size
        self.hidden_size = hidden_size

        # Interaction embedding: (topic, subtopic, response) -> combined feature
        # Size: num_topics * num_subtopics * 2 (for response 0 or 1)
        self.interaction_embedding = nn.Embedding(num_topics * num_subtopics * 2, emb_size)

        # Categorical feature embeddings
        self.topic_embedding = nn.Embedding(num_topics + 1, emb_size, padding_idx=0) # +1 for padding_idx 0
        self.subtopic_embedding = nn.Embedding(num_subtopics + 1, emb_size, padding_idx=0) # +1 for padding_idx 0
        self.skipped_embedding = nn.Embedding(2, emb_size) # 0 or 1

        # Numerical feature MLPs (Simple Linear Layers)
        self.time_fc = nn.Linear(1, emb_size)
        self.attempts_fc = nn.Linear(1, emb_size)
        self.difficulty_fc = nn.Linear(1, emb_size)

        # LSTM input size is sum of all features (7 * emb_size)
        self.lstm_layer = nn.LSTM(input_size=emb_size * 7, hidden_size=hidden_size, batch_first=True)

        # Output layer predicts mastery probability for ALL num_q questions/KCs
        self.out_layer = nn.Linear(hidden_size, num_q)
        self.dropout_layer = nn.Dropout(p=0.5) # Adjust dropout rate as needed

    def forward(self, topic_id, subtopic_id, difficulty, time_taken, attempts, skipped, r):
        """
            Args: sequences of shape [batch_size, seq_len]
                topic_id: the topic sequence
                subtopic_id: the subtopic sequence (question types)
                difficulty: the difficulty sequence
                time_taken: the time taken sequence
                attempts: the attempts sequence
                skipped: the skipped sequence (0 or 1)
                r: the response sequence (0 for incorrect, 1 for correct)

            Returns:
                y: the predicted probability of correctness for all questions(KCs)
                   Shape: [batch_size, seq_len, num_q]
        """
        # Embed categorical features
        # Ensure padding_idx is handled if used (e.g., if 0 is used for padding)
        topic_emb = self.topic_embedding(topic_id)
        subtopic_emb = self.subtopic_embedding(subtopic_id)
        skipped_feat = self.skipped_embedding(skipped) # Input should be Long

        # Process continuous features via linear layers
        # Input needs shape [B, L, 1], output [B, L, emb_size]
        time_feat = self.time_fc(time_taken.unsqueeze(-1))
        attempts_feat = self.attempts_fc(attempts.unsqueeze(-1))
        difficulty_feat = self.difficulty_fc(difficulty.unsqueeze(-1)) # Ensure input is Float

        # Build a unique interaction ID using (topic, subtopic, response)
        # Ensure topic_id, subtopic_id, r are Long and appropriately indexed
        # Assuming r is 0 or 1. Make sure IDs don't exceed Embedding size.
        # Need to handle potential padding_idx if represented as 0 here. Masking later is safer.
        interaction_id = topic_id * self.num_subtopics * 2 + \
                         subtopic_id * 2 + \
                         r
        interaction_emb = self.interaction_embedding(interaction_id)

        # Combine all features
        features = torch.cat([
            topic_emb,         # [B, L, emb_size]
            subtopic_emb,      # [B, L, emb_size]
            difficulty_feat,   # [B, L, emb_size]
            time_feat,         # [B, L, emb_size]
            attempts_feat,     # [B, L, emb_size]
            skipped_feat,      # [B, L, emb_size]
            interaction_emb    # [B, L, emb_size]
        ], dim=-1)  # Result shape: [B, L, 7 * emb_size]

        # LSTM
        h, _ = self.lstm_layer(features) # h shape: [B, L, hidden_size]

        # Output layer
        y = self.out_layer(h)    # y shape: [B, L, num_q]
        y = self.dropout_layer(y) # Apply dropout
        y = torch.sigmoid(y)     # Apply sigmoid to get probabilities

        return y

    def train_model(self, train_loader, test_loader, num_epochs, opt, ckpt_path):
        """
        Trains the DKT model.

        Args:
            train_loader: DataLoader for the training set.
            test_loader: DataLoader for the validation/test set.
            num_epochs: Number of epochs to train for.
            opt: The optimizer (e.g., Adam).
            ckpt_path: Path to save the best model checkpoint.
        """
        aucs = []
        loss_means = []
        max_auc = 0

        if not os.path.exists(ckpt_path):
            os.makedirs(ckpt_path)

        for i in range(1, num_epochs + 1):
            epoch_loss = []

            # --- Training Phase ---
            self.train()  # Set model to training mode (enables dropout)
            for batch_idx, batch in enumerate(train_loader):
                # Unpack batch - ORDER MATTERS - Must match Dataset __getitem__ return order
                (topic_id, subtopic_id, difficulty, time_taken, attempts, skipped,
                 r, qshft, rshft, m,
                 diff_shft, time_shft, attempts_shft, skipped_shft) = batch

                # Move batch to device (CPU or GPU) if necessary
                # Example: device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
                # topic_id = topic_id.to(device) ... etc.

                # Forward pass: Get predictions for the *current* timestep's interactions
                y = self(topic_id, subtopic_id, difficulty, time_taken, attempts, skipped, r)
                # y shape: [batch_size, seq_len, num_q]

                # Get predictions corresponding to the *next* question attempted (qshft)
                # Use torch.gather to extract the prediction for the target question
                y_pred = torch.gather(y, dim=2, index=qshft.unsqueeze(-1)).squeeze(-1)
                # y_pred shape: [batch_size, seq_len]

                # Select the predictions and targets only for non-padded steps using the mask `m`
                y_masked = torch.masked_select(y_pred, m)
                t_masked = torch.masked_select(rshft.float(), m)

                # Loss calculation
                opt.zero_grad()
                loss = F.binary_cross_entropy(y_masked, t_masked)

                # Backpropagation
                loss.backward()
                opt.step()

                epoch_loss.append(loss.item())

                # Optional: Print batch loss periodically
                # if batch_idx % 50 == 0:
                #     print(f"Epoch {i}, Batch {batch_idx}, Batch Loss: {loss.item():.4f}")

            # Calculate average loss for the epoch
            mean_loss = np.mean(epoch_loss)
            loss_means.append(mean_loss)

            # --- Evaluation Phase ---
            self.eval()  # Set model to evaluation mode (disables dropout)
            epoch_auc_preds = []
            epoch_auc_targets = []
            with torch.no_grad():  # Disable gradient calculation
                for batch in test_loader:
                    # Unpack batch - same order as training
                    (topic_id, subtopic_id, difficulty, time_taken, attempts, skipped,
                     r, qshft, rshft, m,
                     diff_shft, time_shft, attempts_shft, skipped_shft) = batch

                    # Move batch to device if necessary

                    # Forward pass
                    y_eval = self(topic_id, subtopic_id, difficulty, time_taken, attempts, skipped, r)

                    # Get predictions for the next question using torch.gather
                    y_pred_eval = torch.gather(y_eval, dim=2, index=qshft.unsqueeze(-1)).squeeze(-1)

                    # Select non-padded predictions and targets
                    y_masked_eval = torch.masked_select(y_pred_eval, m)
                    t_masked_eval = torch.masked_select(rshft.float(), m)  # Target needs to be float

                    # Store predictions and targets for AUC calculation later
                    epoch_auc_preds.append(y_masked_eval.cpu().numpy())
                    epoch_auc_targets.append(t_masked_eval.cpu().numpy())

            # Concatenate all predictions and targets from the epoch
            all_preds = np.concatenate(epoch_auc_preds)
            all_targets = np.concatenate(epoch_auc_targets)

            # Calculate AUC for the entire epoch
            if len(np.unique(all_targets)) > 1:  # Check if there are both classes present
                auc = metrics.roc_auc_score(y_true=all_targets, y_score=all_preds)
            else:
                auc = 0.0  # Or handle as appropriate (e.g., NaN, warning)
                print(f"Warning: Only one class present in targets for epoch {i}. AUC set to 0.")

            aucs.append(auc)
            print(f"Epoch: {i},   AUC: {auc:.4f},   Loss Mean: {mean_loss:.4f}")

            # Save the best model based on AUC
            if auc > max_auc:
                print(f"AUC improved ({max_auc:.4f} -> {auc:.4f}). Saving model...")
                torch.save({
                    'model_state_dict': self.state_dict(),
                    'config': {
                        'NUM_QTYPES': self.num_q,
                        'NUM_TOPICS': self.num_topics,
                        'NUM_SUBTOPICS': self.num_subtopics,
                        'EMB_SIZE': self.emb_size,
                        'HIDDEN_SIZE': self.hidden_size
                    }
                }, os.path.join(ckpt_path, "dkt_model_best.ckpt"))

                max_auc = auc

        print(f"Training finished. Best AUC: {max_auc:.4f}")
        return aucs, loss_means


# --- Dataset Class ---
class DKTDataset(Dataset):
    """
    Prepares sequences of student interaction data for DKT.
    Assumes logs contain: 'topic_id', 'question_type_id', 'is_correct',
                         'difficulty', 'time_taken', 'attempts', 'skipped',
                         'question_id' (Unique ID for question/KC from 0 to num_q-1).
    Pads sequences to a fixed max_seq_length.
    """
    def __init__(self, grouped_logs, num_q, max_seq_length=100):
        """
        Args:
            grouped_logs (dict): {user_id: [list of log dicts]}
            num_q (int): Total number of unique questions/KCs.
            max_seq_length (int): Fixed length to pad/truncate sequences.
        """
        self.data = []
        self.max_seq_length = max_seq_length
        self.num_q = num_q # Needed for validation, maybe

        # Use 0 as the padding index. Ensure 0 is not a valid ID for topics, subtopics, questions.
        # If 0 IS a valid ID, choose a different padding index and adjust Embedding layers.
        PADDING_VALUE = 0

        for user_id, user_logs in grouped_logs.items():
            if not user_logs: continue # Skip empty logs

            # Prepare sequences for each feature
            topic_ids, subtopic_ids, question_ids, responses = [], [], [], []
            difficulties, time_taken, attempts, skipped_flags = [], [], [], []

            for log in user_logs:
                # --- Check if keys exist ---
                if 'question_id' not in log:
                     raise ValueError(f"Log for user {user_id} missing 'question_id'")
                if log['question_id'] < PADDING_VALUE or log['question_id'] >= self.num_q :
                     print(f"Warning: User {user_id}, question_id {log['question_id']} out of range [0, {self.num_q-1}]")
                     # Decide how to handle: skip log, cap id, raise error? Skipping for now.
                     continue
                if 'topic_id' not in log or 'question_type_id' not in log:
                     print(f"Warning: Log for user {user_id} missing topic/subtopic ID. Using PADDING_VALUE.")
                     # Handle missing categorical IDs if necessary

                # --- Append data ---
                topic_ids.append(log.get('topic_id', PADDING_VALUE)) # Use get for safety
                subtopic_ids.append(log.get('question_type_id', PADDING_VALUE))
                question_ids.append(log['question_id']) # Must exist
                responses.append(1 if log.get('is_correct', False) else 0)
                difficulties.append(log.get('difficulty', 0.0))
                time_taken.append(log.get('time_taken', 0.0))
                attempts.append(log.get('attempts', 1.0)) # Default to 1 attempt if missing
                skipped_flags.append(1 if log.get('skipped', False) else 0)

            # Truncate long sequences (from the beginning)
            if len(question_ids) > self.max_seq_length:
                start_idx = len(question_ids) - self.max_seq_length
                topic_ids = topic_ids[start_idx:]
                subtopic_ids = subtopic_ids[start_idx:]
                question_ids = question_ids[start_idx:]
                responses = responses[start_idx:]
                difficulties = difficulties[start_idx:]
                time_taken = time_taken[start_idx:]
                attempts = attempts[start_idx:]
                skipped_flags = skipped_flags[start_idx:]


            seq_len = len(question_ids)
            if seq_len < 1: continue # Skip if sequence becomes too short after filtering/truncation

            # Create shifted sequences for predicting the *next* interaction
            # Append padding value to the end of shifted sequences
            topic_ids_shft = topic_ids[1:] + [PADDING_VALUE]
            subtopic_ids_shft = subtopic_ids[1:] + [PADDING_VALUE]
            question_ids_shft = question_ids[1:] + [PADDING_VALUE] # This is the target question_id (qshft)
            responses_shft = responses[1:] + [PADDING_VALUE]      # This is the target response (rshft)
            difficulties_shft = difficulties[1:] + [0.0] # Pad continuous with 0.0
            time_taken_shft = time_taken[1:] + [0.0]
            attempts_shft = attempts[1:] + [0.0]
            skipped_shft = skipped_flags[1:] + [PADDING_VALUE]

            # Create mask: 1 for real interactions, 0 for padding (use boolean)
            # Mask should apply to the *target* interaction, so it has length seq_len
            mask = [True] * seq_len + [False] * (self.max_seq_length - seq_len)
            mask = mask[:self.max_seq_length] # Ensure mask is not too long if seq_len > max_seq_length initially

             # Padding: Add padding values to the end of original sequences
            pad_len = self.max_seq_length - seq_len
            if pad_len > 0:
                topic_ids += [PADDING_VALUE] * pad_len
                subtopic_ids += [PADDING_VALUE] * pad_len
                question_ids += [PADDING_VALUE] * pad_len
                responses += [PADDING_VALUE] * pad_len # Note: Padding response doesn't matter much as it's masked
                difficulties += [0.0] * pad_len
                time_taken += [0.0] * pad_len
                attempts += [0.0] * pad_len
                skipped_flags += [PADDING_VALUE] * pad_len

                # Also pad the shifted sequences to max_seq_length
                topic_ids_shft += [PADDING_VALUE] * pad_len
                subtopic_ids_shft += [PADDING_VALUE] * pad_len
                question_ids_shft += [PADDING_VALUE] * pad_len
                responses_shft += [PADDING_VALUE] * pad_len
                difficulties_shft += [0.0] * pad_len
                time_taken_shft += [0.0] * pad_len
                attempts_shft += [0.0] * pad_len
                skipped_shft += [PADDING_VALUE] * pad_len


            # Append data tuple - ORDER MATTERS - MUST MATCH train_model UNPACKING
            self.data.append((
                torch.tensor(topic_ids),           # Current topic_id
                torch.tensor(subtopic_ids),        # Current subtopic_id
                torch.tensor(difficulties),        # Current difficulty
                torch.tensor(time_taken),          # Current time_taken
                torch.tensor(attempts),            # Current attempts
                torch.tensor(skipped_flags),       # Current skipped flag
                torch.tensor(responses),           # Current response (r)
                torch.tensor(question_ids_shft),   # Target question_id (qshft)
                torch.tensor(responses_shft),      # Target response (rshft)
                torch.tensor(mask),                # Mask (m) for targets
                torch.tensor(difficulties_shft),   # Target difficulty (diff_shft) - not used by model?
                torch.tensor(time_taken_shft),     # Target time (time_shft) - not used by model?
                torch.tensor(attempts_shft),       # Target attempts (attempts_shft) - not used by model?
                torch.tensor(skipped_shft),        # Target skipped (skipped_shft) - not used by model?
            ))

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        # Retrieve pre-processed data tuple
        (topic_ids, subtopic_ids, difficulties, time_taken, attempts, skipped_flags,
         responses, question_ids_shft, responses_shft, mask,
         difficulties_shft, time_taken_shft, attempts_shft, skipped_shft) = self.data[idx]

        # Apply correct data types right before returning
        # ORDER HERE MUST MATCH APPEND ORDER AND train_model UNPACKING ORDER
        return (
            topic_ids.long(),           # topic_id
            subtopic_ids.long(),        # subtopic_id
            difficulties.float(),       # difficulty
            time_taken.float(),         # time_taken
            attempts.float(),           # attempts
            skipped_flags.long(),       # skipped
            responses.long(),           # r
            question_ids_shft.long(),   # qshft (index for one_hot)
            responses_shft.long(),      # rshft (target label, convert to float later for loss)
            mask.bool(),                # m (mask for loss/metrics)
            difficulties_shft.float(),  # diff_shft (optional feature)
            time_taken_shft.float(),    # time_shft (optional feature)
            attempts_shft.float(),      # attempts_shft (optional feature)
            skipped_shft.long()         # skipped_shft (optional feature)
        )
