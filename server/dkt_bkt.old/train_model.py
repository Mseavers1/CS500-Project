from collections import defaultdict

import torch
from torch.utils.data import random_split, DataLoader

from database import Database
import asyncio

from dkt_model import DKT, DKTDataset

database = Database()


async def get_data():
    resp = await database.get_all_logged_data()

    if "message" in resp:
        print(resp["message"])
        return

    logs = resp["matches"]

    grouped_logs = defaultdict(list)

    for t in logs:
        grouped_logs[t.user_id].append({
            "id": t.id,
            "user_id": t.user_id,
            "topic_id": t.topic_id,
            "question_type_id": t.question_type_id,
            "difficulty": t.difficulty,
            "is_correct": t.is_correct,
            "time_taken": t.time_taken,
            "attempts": t.attempts,
            "skipped": t.skipped
        })

    return grouped_logs


logs = asyncio.run(get_data())

dataset = DKTDataset(logs, max_seq_length=128)

train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size
train_set, val_set = random_split(dataset, [train_size, val_size])

train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
val_loader = DataLoader(val_set, batch_size=32)

NUM_TOPICS = max(log["topic_id"] for logs_ in logs.values() for log in logs_) + 1
NUM_SUBTOPICS = max(log["question_type_id"] for logs_ in logs.values() for log in logs_) + 1

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = DKT(num_topics=NUM_TOPICS, num_subtopics=NUM_SUBTOPICS, emb_size=128, hidden_size=256).to(device)
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

aucs, losses = model.train_model(
    train_loader=train_loader,
    test_loader=val_loader,
    num_epochs=100,
    opt=optimizer,
    ckpt_path="../checkpoints"
)