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


class DKT(nn.Module):
    '''
        Args:
            num_q: the total number of the unique questions (KCs) in the dataset
            num_topics: total number of topics
            num_subtopics: total number of subtopics (question types)
            emb_size: the dimension of the embedding vectors
            hidden_size: the dimension of the LSTM hidden vectors
    '''

    def __init__(self, num_topics, num_subtopics, emb_size, hidden_size):
        super().__init__()
        self.num_topics = num_topics
        self.num_subtopics = num_subtopics
        self.emb_size = emb_size
        self.hidden_size = hidden_size

        # Interaction embedding: (topic, subtopic, response) -> combined feature
        # Size: num_topics * num_subtopics * 2 (for response 0 or 1)
        self.interaction_embedding = nn.Embedding(num_topics * num_subtopics * 2, emb_size)

        # Categorical feature embeddings
        self.topic_embedding = nn.Embedding(num_topics + 1, emb_size, padding_idx=0)  # +1 for padding_idx 0
        self.subtopic_embedding = nn.Embedding(num_subtopics + 1, emb_size, padding_idx=0)  # +1 for padding_idx 0
        self.skipped_embedding = nn.Embedding(2, emb_size)  # 0 or 1

        # Numerical feature MLPs (Simple Linear Layers)
        self.time_fc = nn.Linear(1, emb_size)
        self.attempts_fc = nn.Linear(1, emb_size)
        self.difficulty_fc = nn.Linear(1, emb_size)

        # LSTM input size is sum of all features (7 * emb_size)
        self.lstm_layer = nn.LSTM(input_size=emb_size * 7, hidden_size=hidden_size, batch_first=True)

        # Output layer predicts mastery probability for ALL num_q questions/KCs
        self.out_layer = nn.Linear(hidden_size, 1)
        self.dropout_layer = nn.Dropout(p=0.5)  # Adjust dropout rate as needed

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
        topic_emb = self.topic_embedding(topic_id)  # Shape: [B, L, emb_size]
        subtopic_emb = self.subtopic_embedding(subtopic_id)  # Shape: [B, L, emb_size]
        skipped_feat = self.skipped_embedding(skipped)  # Shape: [B, L, emb_size]

        # Process continuous features via linear layers
        time_feat = self.time_fc(time_taken.unsqueeze(-1))  # Shape: [B, L, emb_size]
        attempts_feat = self.attempts_fc(attempts.unsqueeze(-1))  # Shape: [B, L, emb_size]
        difficulty_feat = self.difficulty_fc(difficulty.unsqueeze(-1))  # Shape: [B, L, emb_size]

        # Create a unique interaction ID (topic, subtopic, difficulty)
        interaction_id = (topic_id * self.num_subtopics + difficulty).long()

        # Apply the interaction embedding layer
        interaction_emb = self.interaction_embedding(interaction_id)  # Shape: [B, L, emb_size]

        # Concatenate all features (ensure they are tensors)
        features = torch.cat([
            topic_emb,  # [B, L, emb_size]
            subtopic_emb,  # [B, L, emb_size]
            difficulty_feat,  # [B, L, emb_size]
            time_feat,  # [B, L, emb_size]
            attempts_feat,  # [B, L, emb_size]
            skipped_feat,  # [B, L, emb_size]
            interaction_emb  # [B, L, emb_size]
        ], dim=-1)  # Shape: [B, L, 7 * emb_size]

        # LSTM
        h, _ = self.lstm_layer(features)  # h shape: [B, L, hidden_size]

        # Output layer
        y = self.out_layer(h)  # y shape: [B, L, num_q]
        y = self.dropout_layer(y)  # Apply dropout
        y = torch.sigmoid(y)  # Apply sigmoid to get probabilities

        return y

    def train_model(self, train_loader, test_loader, num_epochs, opt, ckpt_path):
        import os
        import numpy as np
        from sklearn import metrics
        import torch.nn.functional as F

        aucs = []
        loss_means = []
        max_auc = 0

        if not os.path.exists(ckpt_path):
            os.makedirs(ckpt_path)

        for i in range(1, num_epochs + 1):
            epoch_loss = []

            self.train()
            for batch in train_loader:
                (topic_id, subtopic_id, difficulty, time_taken, attempts, skipped,
                 r, rshft, m,
                 diff_shft, time_shft, attempts_shft, skipped_shft) = batch

                y = self(topic_id, subtopic_id, difficulty, time_taken, attempts, skipped, r)
                y_pred = y.squeeze(-1)  # [B, L]

                y_masked = torch.masked_select(y_pred, m)
                t_masked = torch.masked_select(rshft.float(), m)

                opt.zero_grad()
                loss = F.binary_cross_entropy(y_masked, t_masked)
                loss.backward()
                opt.step()

                epoch_loss.append(loss.item())

            mean_loss = np.mean(epoch_loss)
            loss_means.append(mean_loss)

            self.eval()
            epoch_auc_preds = []
            epoch_auc_targets = []

            with torch.no_grad():
                for batch in test_loader:
                    (topic_id, subtopic_id, difficulty, time_taken, attempts, skipped,
                     r, rshft, m,
                     diff_shft, time_shft, attempts_shft, skipped_shft) = batch

                    y_eval = self(topic_id, subtopic_id, difficulty, time_taken, attempts, skipped, r)
                    y_pred_eval = y_eval.squeeze(-1)

                    y_masked_eval = torch.masked_select(y_pred_eval, m)
                    t_masked_eval = torch.masked_select(rshft.float(), m)

                    epoch_auc_preds.append(y_masked_eval.cpu().numpy())
                    epoch_auc_targets.append(t_masked_eval.cpu().numpy())

            all_preds = np.concatenate(epoch_auc_preds)
            all_targets = np.concatenate(epoch_auc_targets)

            if len(np.unique(all_targets)) > 1:
                auc = metrics.roc_auc_score(y_true=all_targets, y_score=all_preds)
            else:
                auc = 0.0
                print(f"Warning: Only one class in targets for epoch {i}. AUC set to 0.")

            aucs.append(auc)
            print(f"Epoch {i} - AUC: {auc:.4f}, Loss: {mean_loss:.4f}")

            if auc > max_auc:
                print(f"AUC improved ({max_auc:.4f} -> {auc:.4f}). Saving model...")
                torch.save({
                    'model_state_dict': self.state_dict(),
                    'config': {
                        'NUM_TOPICS': self.num_topics,
                        'NUM_SUBTOPICS': self.num_subtopics,
                        'EMB_SIZE': self.emb_size,
                        'HIDDEN_SIZE': self.hidden_size
                    }
                }, os.path.join(ckpt_path, "dkt_model_best.ckpt"))
                max_auc = auc

        print(f"Training completed. Best AUC: {max_auc:.4f}")
        return aucs, loss_means


# --- Dataset Class ---
from torch.utils.data import Dataset
import torch


class DKTDataset(Dataset):
    """
    Prepares sequences of student interaction data for DKT without question_id.
    Pads sequences to a fixed max_seq_length.
    """

    def __init__(self, grouped_logs, max_seq_length=100):
        """
        Args:
            grouped_logs (dict): {user_id: [list of log dicts]}
            max_seq_length (int): Fixed length to pad/truncate sequences.
        """
        self.data = []
        self.max_seq_length = max_seq_length
        PADDING_VALUE = 0

        for user_id, user_logs in grouped_logs.items():
            if not user_logs:
                continue

            topic_ids, subtopic_ids, responses = [], [], []
            difficulties, time_taken, attempts, skipped_flags = [], [], [], []

            for log in user_logs:
                topic_ids.append(log['topic_id'])
                subtopic_ids.append(log['question_type_id'])
                responses.append(log['is_correct'])
                difficulties.append(log['difficulty'])
                time_taken.append(log['time_taken'])
                attempts.append(log['attempts'])
                skipped_flags.append(log['skipped'])

            seq_len = len(topic_ids)
            if seq_len > self.max_seq_length:
                topic_ids = topic_ids[-self.max_seq_length:]
                subtopic_ids = subtopic_ids[-self.max_seq_length:]
                responses = responses[-self.max_seq_length:]
                difficulties = difficulties[-self.max_seq_length:]
                time_taken = time_taken[-self.max_seq_length:]
                attempts = attempts[-self.max_seq_length:]
                skipped_flags = skipped_flags[-self.max_seq_length:]

            # Shifted sequences (target is next time step)
            topic_shft = topic_ids[1:] + [PADDING_VALUE]
            subtopic_shft = subtopic_ids[1:] + [PADDING_VALUE]
            response_shft = responses[1:] + [PADDING_VALUE]
            difficulty_shft = difficulties[1:] + [PADDING_VALUE]
            time_shft = time_taken[1:] + [0.0]
            attempts_shft = attempts[1:] + [0.0]
            skipped_shft = skipped_flags[1:] + [0]

            # Padding
            pad_len = self.max_seq_length - len(topic_ids)

            def pad(seq, pad_value):
                return seq + [pad_value] * pad_len

            item = {
                'topic_id': torch.LongTensor(pad(topic_ids, PADDING_VALUE)),
                'subtopic_id': torch.LongTensor(pad(subtopic_ids, PADDING_VALUE)),
                'difficulty': torch.FloatTensor(pad(difficulties, 0.0)),
                'time_taken': torch.FloatTensor(pad(time_taken, 0.0)),
                'attempts': torch.FloatTensor(pad(attempts, 0.0)),
                'skipped': torch.LongTensor(pad(skipped_flags, 0)),

                'response': torch.LongTensor(pad(responses, PADDING_VALUE)),
                'response_shft': torch.LongTensor(pad(response_shft, PADDING_VALUE)),

                'difficulty_shft': torch.FloatTensor(pad(difficulty_shft, 0.0)),
                'time_shft': torch.FloatTensor(pad(time_shft, 0.0)),
                'attempts_shft': torch.FloatTensor(pad(attempts_shft, 0.0)),
                'skipped_shft': torch.LongTensor(pad(skipped_shft, 0)),

                'mask': torch.BoolTensor([1] * seq_len + [0] * pad_len)
            }

            self.data.append(item)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        return (
            item['topic_id'],
            item['subtopic_id'],
            item['difficulty'],
            item['time_taken'],
            item['attempts'],
            item['skipped'],
            item['response'],
            item['response_shft'],
            item['mask'],
            item['difficulty_shft'],
            item['time_shft'],
            item['attempts_shft'],
            item['skipped_shft']
        )
